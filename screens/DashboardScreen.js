import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Card, PrimaryButton, OutlineButton } from '../components/UI';
import { THEME, money } from '../utils/theme';
import { getCustomersWithBalance, getTotalOutstanding } from '../db';

export default function DashboardScreen({ push }) {
  const [total, setTotal] = useState(0);
  const [topCustomers, setTopCustomers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const t = await getTotalOutstanding();
    const list = await getCustomersWithBalance();
    setTotal(t);
    setTopCustomers(list.filter((c) => c.balance > 0).sort((a, b) => b.balance - a.balance).slice(0, 5));
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: 16, paddingTop: 60 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.accent} />}
    >
      <Text style={styles.title}>Khata</Text>
      <Text style={styles.subtitle}>Apna hisaab, ek jagah</Text>

      <Card style={{ marginTop: 20, marginBottom: 14 }}>
        <Text style={styles.label}>Total udhar (outstanding)</Text>
        <Text style={styles.bigNumber}>{money(total)}</Text>
      </Card>

      <View style={styles.grid}>
        <PrimaryButton title="+ Nayi slip" onPress={() => push('newSlip')} style={{ flex: 1, marginRight: 8 }} />
        <OutlineButton title="Customers" onPress={() => push('customers')} style={{ flex: 1 }} />
      </View>
      <View style={[styles.grid, { marginTop: 10 }]}>
        <OutlineButton title="Items / Price list" onPress={() => push('items')} style={{ flex: 1 }} />
      </View>

      <Text style={styles.sectionTitle}>Sabse zyada udhar wale</Text>
      {topCustomers.length === 0 && (
        <Text style={styles.empty}>Abhi koi udhar nahi hai.</Text>
      )}
      {topCustomers.map((c) => (
        <Card key={c.id} style={{ marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.customerName}>{c.name}</Text>
          <Text style={styles.customerBalance}>{money(c.balance)}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: THEME.bg },
  title: { color: THEME.text, fontSize: 24, fontWeight: '700' },
  subtitle: { color: THEME.textMuted, fontSize: 13, marginTop: 2 },
  label: { color: THEME.textMuted, fontSize: 12, marginBottom: 6 },
  bigNumber: { color: THEME.accent, fontSize: 28, fontWeight: '700' },
  grid: { flexDirection: 'row' },
  sectionTitle: { color: THEME.text, fontSize: 15, fontWeight: '700', marginTop: 22, marginBottom: 10 },
  empty: { color: THEME.textMuted, fontSize: 13 },
  customerName: { color: THEME.text, fontSize: 14 },
  customerBalance: { color: THEME.accent, fontSize: 14, fontWeight: '700' },
});
