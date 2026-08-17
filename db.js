import * as SQLite from 'expo-sqlite/legacy';

const db = SQLite.openDatabase('khata.db');

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        sql,
        params,
        (_, result) => resolve(result),
        (_, error) => { reject(error); return false; }
      );
    });
  });
}

export function initDB() {
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, price REAL NOT NULL);'
        );
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT);'
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            total REAL NOT NULL,
            note TEXT,
            created_at TEXT NOT NULL
          );`
        );
        tx.executeSql(
          `CREATE TABLE IF NOT EXISTS transaction_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transaction_id INTEGER NOT NULL,
            item_name TEXT NOT NULL,
            price REAL NOT NULL,
            qty REAL NOT NULL
          );`
        );
      },
      (error) => reject(error),
      () => resolve(true)
    );
  });
}

// ---- Items ----
export async function addItem(name, price) {
  return run('INSERT INTO items (name, price) VALUES (?, ?)', [name, price]);
}
export async function getItems() {
  const r = await run('SELECT * FROM items ORDER BY name ASC');
  return r.rows._array;
}
export async function deleteItem(id) {
  return run('DELETE FROM items WHERE id = ?', [id]);
}
export async function updateItemPrice(id, price) {
  return run('UPDATE items SET price = ? WHERE id = ?', [price, id]);
}

// ---- Customers ----
export async function addCustomer(name, phone) {
  const r = await run('INSERT INTO customers (name, phone) VALUES (?, ?)', [name, phone || '']);
  return r.insertId;
}
export async function getCustomers() {
  const r = await run('SELECT * FROM customers ORDER BY name ASC');
  return r.rows._array;
}
export async function getCustomer(id) {
  const r = await run('SELECT * FROM customers WHERE id = ?', [id]);
  return r.rows._array[0];
}
export async function deleteCustomer(id) {
  await run('DELETE FROM transaction_items WHERE transaction_id IN (SELECT id FROM transactions WHERE customer_id = ?)', [id]);
  await run('DELETE FROM transactions WHERE customer_id = ?', [id]);
  return run('DELETE FROM customers WHERE id = ?', [id]);
}

// ---- Balances ----
export async function getCustomerBalance(customerId) {
  const r = await run(
    `SELECT
      COALESCE(SUM(CASE WHEN type='udhar' THEN total ELSE 0 END),0) -
      COALESCE(SUM(CASE WHEN type='payment' THEN total ELSE 0 END),0) AS balance
     FROM transactions WHERE customer_id = ?`,
    [customerId]
  );
  return r.rows._array[0].balance;
}
export async function getCustomersWithBalance() {
  const customers = await getCustomers();
  const withBalance = [];
  for (const c of customers) {
    const balance = await getCustomerBalance(c.id);
    withBalance.push({ ...c, balance });
  }
  return withBalance;
}
export async function getTotalOutstanding() {
  const list = await getCustomersWithBalance();
  return list.reduce((sum, c) => sum + Math.max(0, c.balance), 0);
}

// ---- Transactions ----
export async function addTransaction(customerId, type, total, note, items) {
  const r = await run(
    'INSERT INTO transactions (customer_id, type, total, note, created_at) VALUES (?, ?, ?, ?, ?)',
    [customerId, type, total, note || '', new Date().toISOString()]
  );
  const txId = r.insertId;
  for (const it of items || []) {
    await run(
      'INSERT INTO transaction_items (transaction_id, item_name, price, qty) VALUES (?, ?, ?, ?)',
      [txId, it.name, it.price, it.qty]
    );
  }
  return txId;
}
export async function getCustomerTransactions(customerId) {
  const r = await run(
    'SELECT * FROM transactions WHERE customer_id = ? ORDER BY created_at DESC',
    [customerId]
  );
  return r.rows._array;
}
export async function getTransactionItems(transactionId) {
  const r = await run('SELECT * FROM transaction_items WHERE transaction_id = ?', [transactionId]);
  return r.rows._array;
}
export async function deleteTransaction(transactionId) {
  await run('DELETE FROM transaction_items WHERE transaction_id = ?', [transactionId]);
  return run('DELETE FROM transactions WHERE id = ?', [transactionId]);
}
