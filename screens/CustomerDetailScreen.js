import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, Alert, Linking } from 'react-native';
import * as SMS from 'expo-sms';
import { Header, Card, PrimaryButton, OutlineButton, Field } from '../components/UI';
import { THEME, money, fmtDate } from '../utils/theme';
import { getCustomer, getCustomerBalance, getCustomerTransactions, addTransaction, deleteCustomer } from '../db';

export default function CustomerDetailScreen({ params, push, pop }) {
  const { customerId } = params;
  const [customer, setCustomer] = useState(null);
  const [balance, setBalance] = useState(0);
  const [txns, setTxns] = useState([]);
  const [paymentModal, setPaymentModal] = useState(false);
  const [amount, setAmount] = useState('');

  const load = useCallback(async () => {
    const c = await getCustomer(customerId);
    const b = await getCustomerBalance(customerId);
    const t = await getCustomerTransactions(customerId);
    setCustomer(c);
    setBalance(b);
    setTxns(t);
  }, [customerId]);

  useEffect(() => { load(); }, [load]);

  const savePayment = async () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('Amount check karein', 'Sahi amount dalein.');
      return;
    }
    await addTransaction(customerId, 'payment', amt, 'Payment wasool hui', []);
    setAmount('');
    setPaymentModal(false);
    load();
  };

  const sendSmsReminder = async () => {
    if (!customer?.phone) {
      Alert.alert('Phone number nahi hai', 'Is customer ka number add nahi hai.');
      return;
    }
    const available = await SMS.isAvailableAsync();
    const message = `Assalam-o-Alaikum ${customer.name}, aapka hamare paas ${money(balance)} udhar hai. Barah-e-karam jald ada karein. Shukriya.`;
    if (available) {
      await SMS.sendSMSAsync([customer.phone], message);
    } else {
      Linking.openURL(`sms:${customer.phone}?body=${encodeURIComponent(message)}`);
    }
  };

  const removeCustomer = () => {
    Alert.alert('Customer delete karein?', 'Is ka pura record mit jayega.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteCustomer(customerId); pop(); } },
    ]);
  };

  if (!customer) return null;

  return (
    <View style={styles.screen}>
      <Header title={customer.name} onBack={pop} />
      <View style={{ padding: 16 }}>
        <Card style={{ marginBottom: 14 }}>
          <Text style={styles.label}>Balance (udhar)</Text>
          <Text style={[styles.bigNumber, balance > 0 ? { color: THEME.accent } : { color: THEME.success }]}>
            {money(balance)}
          </Text>
          {customer.phone ? <Text style={styles.phone}>{customer.phone}</Text> : null}
        </Card>

        <View style={styles.actionsRow}>
          <PrimaryButton title="+ Nayi slip" onPress={() => push('newSlip', { customerId })} style={{ flex: 1, marginRight: 8 }} />
          <OutlineButton title="Payment mili" onPress={() => setPaymentModal(true)} style={{ flex: 1 }} />
        </View>
        <View style={[styles.actionsRow, { marginTop: 8 }]}>
          <OutlineButton title="SMS reminder bhejein" onPress={sendSmsReminder} style={{ flex: 1, marginRight: 8 }} />
          <OutlineButton title="Delete" danger onPress={removeCustomer} style={{ flex: 1 }} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>History</Text>
      <FlatList
        data={txns}
        keyExtractor={(t) => String(t.id)}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        ListEmptyComponent={<Text style={styles.empty}>Abhi koi entry nahi hai.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            disabled={item.type !== 'udhar'}
            onPress={() => push('slipPreview', { transactionId: item.id, customer, total: item.total, type: item.type, date: item.created_at, note: item.note, viewOnly: true })}
          >
            <Card style={styles.txnRow}>
              <View>
                <Text style={styles.txnType}>{item.type === 'payment' ? 'Payment' : 'Udhar / Sale'}</Text>
                <Text style={styles.txnDate}>{fmtDate(item.created_at)}</Text>
              </View>
              <Text style={[styles.txnAmount, item.type === 'payment' ? { color: THEME.success } : { color: THEME.accent }]}>
                {item.type === 'payment' ? '-' : '+'}{money(item.total)}
              </Text>
            </Card>
          </TouchableOpacity>
        )}
      />

      <Modal visible={paymentModal} transparent animationType="slide" onRequestClose={() => setPaymentModal(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Payment record karein</Text>
            <Field label="Amount" value={amount} onChangeText={setAmount} placeholder="0" keyboardType="numeric" />
            <PrimaryButton title="Save karein" onPress={savePayment} style={{ marginBottom: 8 }} />
            <OutlineButton title="Cancel" onPress={() => setPaymentModal(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: THEME.bg },
  label: { color: THEME.textMuted, fontSize: 12, marginBottom: 4 },
  bigNumber: { fontSize: 24, fontWeight: '700' },
  phone: { color: THEME.textMuted, fontSize: 12, marginTop: 6 },
  actionsRow: { flexDirection: 'row' },
  sectionTitle: { color: THEME.text, fontSize: 15, fontWeight: '700', paddingHorizontal: 16, marginBottom: 8 },
  empty: { color: THEME.textMuted, fontSize: 13, textAlign: 'center', marginTop: 20 },
  txnRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  txnType: { color: THEME.text, fontSize: 14, fontWeight: '600' },
  txnDate: { color: THEME.textMuted, fontSize: 11, marginTop: 2 },
  txnAmount: { fontSize: 15, fontWeight: '700' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: THEME.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, paddingBottom: 40 },
  modalTitle: { color: THEME.text, fontSize: 17, fontWeight: '700', marginBottom: 14 },
});
