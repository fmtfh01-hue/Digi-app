import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Header, Card, PrimaryButton, OutlineButton, Field } from '../components/UI';
import { THEME, money } from '../utils/theme';
import { getItems, getCustomers, addTransaction } from '../db';

export default function NewSlipScreen({ params, push, pop, replace }) {
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState(params?.customerId || null);
  const [qtyMap, setQtyMap] = useState({});
  const [note, setNote] = useState('');
  const [showCustomerPicker, setShowCustomerPicker] = useState(!params?.customerId);

  const load = useCallback(async () => {
    setItems(await getItems());
    setCustomers(await getCustomers());
  }, []);
  useEffect(() => { load(); }, [load]);

  const changeQty = (item, delta) => {
    setQtyMap((prev) => {
      const current = prev[item.id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [item.id]: next };
    });
  };

  const selectedLines = items
    .filter((it) => (qtyMap[it.id] || 0) > 0)
    .map((it) => ({ id: it.id, name: it.name, price: it.price, qty: qtyMap[it.id] }));

  const total = selectedLines.reduce((s, l) => s + l.price * l.qty, 0);
  const customer = customers.find((c) => c.id === customerId);

  const save = async () => {
    if (!customerId) {
      Alert.alert('Customer select karein', 'Slip banane ke liye customer chahiye.');
      return;
    }
    if (selectedLines.length === 0) {
      Alert.alert('Item select karein', 'Kam se kam ek item add karein.');
      return;
    }
    const txId = await addTransaction(customerId, 'udhar', total, note, selectedLines);
    replace('slipPreview', {
      transactionId: txId,
      customer,
      items: selectedLines,
      total,
      type: 'udhar',
      note,
    });
  };

  if (showCustomerPicker) {
    return (
      <View style={styles.screen}>
        <Header title="Customer select karein" onBack={pop} />
        <FlatList
          data={customers}
          keyExtractor={(c) => String(c.id)}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Text style={styles.empty}>Pehle Customers mein se ek add karein.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => { setCustomerId(item.id); setShowCustomerPicker(false); }}>
              <Card style={{ marginBottom: 8 }}>
                <Text style={styles.name}>{item.name}</Text>
                {item.phone ? <Text style={styles.phone}>{item.phone}</Text> : null}
              </Card>
            </TouchableOpacity>
          )}
        />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header title="Nayi slip" onBack={pop} />
      <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
        <TouchableOpacity onPress={() => setShowCustomerPicker(true)}>
          <Card style={{ marginBottom: 12 }}>
            <Text style={styles.label}>Customer</Text>
            <Text style={styles.customerName}>{customer?.name || 'Select karein'}</Text>
          </Card>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        ListEmptyComponent={<Text style={styles.empty}>Pehle Items mein price list add karein.</Text>}
        renderItem={({ item }) => (
          <Card style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.phone}>{money(item.price)}</Text>
            </View>
            <View style={styles.qtyBox}>
              <TouchableOpacity onPress={() => changeQty(item, -1)} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{qtyMap[item.id] || 0}</Text>
              <TouchableOpacity onPress={() => changeQty(item, 1)} style={styles.qtyBtn}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
        ListFooterComponent={
          <View style={{ marginTop: 8 }}>
            <Field label="Note (optional)" value={note} onChangeText={setNote} placeholder="e.g. adhi payment nagad" />
          </View>
        }
      />

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{money(total)}</Text>
        </View>
        <PrimaryButton title="Slip save karein" onPress={save} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: THEME.bg },
  empty: { color: THEME.textMuted, fontSize: 13, textAlign: 'center', marginTop: 30 },
  label: { color: THEME.textMuted, fontSize: 11, marginBottom: 3 },
  customerName: { color: THEME.text, fontSize: 15, fontWeight: '700' },
  name: { color: THEME.text, fontSize: 14, fontWeight: '600' },
  phone: { color: THEME.textMuted, fontSize: 12, marginTop: 2 },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  qtyBox: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { width: 30, height: 30, borderRadius: 6, borderWidth: 1, borderColor: THEME.border, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: THEME.accent, fontSize: 16, fontWeight: '700' },
  qtyValue: { color: THEME.text, fontSize: 15, minWidth: 30, textAlign: 'center' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: THEME.border, backgroundColor: THEME.bg },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  totalLabel: { color: THEME.text, fontSize: 16, fontWeight: '700' },
  totalValue: { color: THEME.accent, fontSize: 16, fontWeight: '700' },
});
