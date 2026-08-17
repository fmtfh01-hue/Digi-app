import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { money, fmtDate } from '../utils/theme';

const SlipView = forwardRef(({ shopName, customer, items, total, type, date, note }, ref) => {
  return (
    <View ref={ref} collapsable={false} style={styles.wrap}>
      <Text style={styles.shop}>{shopName || 'My Shop'}</Text>
      <View style={styles.divider} />
      <View style={styles.row}>
        <Text style={styles.label}>Customer</Text>
        <Text style={styles.value}>{customer?.name}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>{fmtDate(date || new Date().toISOString())}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Type</Text>
        <Text style={styles.value}>{type === 'payment' ? 'Payment received' : 'Udhar / Sale'}</Text>
      </View>
      <View style={styles.divider} />
      {items && items.length > 0 && (
        <>
          <View style={styles.itemHeaderRow}>
            <Text style={[styles.itemCol, { flex: 2 }]}>Item</Text>
            <Text style={styles.itemCol}>Qty</Text>
            <Text style={styles.itemCol}>Price</Text>
            <Text style={[styles.itemCol, { textAlign: 'right' }]}>Amount</Text>
          </View>
          {items.map((it, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={[styles.itemText, { flex: 2 }]}>{it.name}</Text>
              <Text style={styles.itemText}>{it.qty}</Text>
              <Text style={styles.itemText}>{it.price}</Text>
              <Text style={[styles.itemText, { textAlign: 'right' }]}>{money(it.price * it.qty)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
        </>
      )}
      {note ? <Text style={styles.note}>{note}</Text> : null}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{money(total)}</Text>
      </View>
      <Text style={styles.footer}>Generated with Khata app</Text>
    </View>
  );
});

export default SlipView;

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#ffffff',
    padding: 20,
    width: 320,
  },
  shop: { fontSize: 18, fontWeight: '700', color: '#171b22', textAlign: 'center' },
  divider: { height: 1, backgroundColor: '#e2e2e2', marginVertical: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { color: '#6b7280', fontSize: 13 },
  value: { color: '#171b22', fontSize: 13, fontWeight: '600' },
  itemHeaderRow: { flexDirection: 'row', marginBottom: 4 },
  itemCol: { flex: 1, color: '#6b7280', fontSize: 11, textTransform: 'uppercase' },
  itemRow: { flexDirection: 'row', marginBottom: 3 },
  itemText: { flex: 1, color: '#171b22', fontSize: 13 },
  note: { color: '#6b7280', fontSize: 12, marginBottom: 8, fontStyle: 'italic' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#171b22' },
  totalValue: { fontSize: 15, fontWeight: '700', color: '#171b22' },
  footer: { marginTop: 14, textAlign: 'center', fontSize: 10, color: '#9ca3af' },
});
