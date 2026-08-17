import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as SMS from 'expo-sms';
import { Header, PrimaryButton, OutlineButton } from '../components/UI';
import { THEME, money } from '../utils/theme';
import SlipView from '../components/SlipView';
import { getTransactionItems } from '../db';

export default function SlipPreviewScreen({ params, pop, popToRoot }) {
  const { transactionId, customer, total, type, date, note, viewOnly } = params;
  const [items, setItems] = useState(params.items || null);
  const slipRef = useRef(null);

  useEffect(() => {
    (async () => {
      if (!items && transactionId) {
        const rows = await getTransactionItems(transactionId);
        setItems(rows.map((r) => ({ name: r.item_name, price: r.price, qty: r.qty })));
      }
    })();
  }, [transactionId]);

  const shareImage = async () => {
    try {
      const uri = await captureRef(slipRef, { format: 'png', quality: 0.95 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { dialogTitle: 'Slip share karein' });
      } else {
        Alert.alert('Sharing available nahi hai is device par.');
      }
    } catch (e) {
      Alert.alert('Slip share nahi ho saki', String(e?.message || e));
    }
  };

  const sendSms = async () => {
    if (!customer?.phone) {
      Alert.alert('Phone number nahi hai', 'Is customer ka number add nahi hai.');
      return;
    }
    const available = await SMS.isAvailableAsync();
    const lines = (items || []).map((it) => `${it.name} x${it.qty} = ${money(it.price * it.qty)}`).join('\n');
    const message = `${customer.name}, aapki slip:\n${lines}\nTotal: ${money(total)}`;
    if (available) {
      await SMS.sendSMSAsync([customer.phone], message);
    }
  };

  return (
    <View style={styles.screen}>
      <Header title="Slip" onBack={pop} />
      <ScrollView contentContainerStyle={{ padding: 16, alignItems: 'center' }}>
        <View style={styles.slipWrap}>
          <SlipView
            ref={slipRef}
            customer={customer}
            items={items || []}
            total={total}
            type={type}
            date={date}
            note={note}
          />
        </View>

        <View style={{ width: '100%', marginTop: 20 }}>
          <PrimaryButton title="WhatsApp / Share karein" onPress={shareImage} style={{ marginBottom: 10 }} />
          <OutlineButton title="SMS bhejein" onPress={sendSms} style={{ marginBottom: 10 }} />
          {!viewOnly && (
            <OutlineButton title="Done" onPress={popToRoot} />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: THEME.bg },
  slipWrap: { borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: THEME.border },
});
