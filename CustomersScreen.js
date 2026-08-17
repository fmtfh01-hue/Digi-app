import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import * as Contacts from 'expo-contacts';
import { Header, Card, PrimaryButton, OutlineButton, Field } from '../components/UI';
import { THEME, money } from '../utils/theme';
import { getCustomersWithBalance, addCustomer } from '../db';

export default function CustomersScreen({ push, pop }) {
  const [customers, setCustomers] = useState([]);
  const [addModal, setAddModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [contactList, setContactList] = useState([]);

  const load = useCallback(async () => {
    const list = await getCustomersWithBalance();
    setCustomers(list);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openContactPicker = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission chahiye', 'Contacts se customer add karne ke liye permission dein.');
      return;
    }
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
    });
    const withPhone = data.filter((c) => c.phoneNumbers && c.phoneNumbers.length > 0);
    setContactList(withPhone);
    setAddModal(false);
    setPickerVisible(true);
  };

  const pickContact = async (contact) => {
    const phone = contact.phoneNumbers?.[0]?.number || '';
    await addCustomer(contact.name || 'Unknown', phone);
    setPickerVisible(false);
    load();
  };

  const saveManual = async () => {
    if (!manualName.trim()) {
      Alert.alert('Naam dalein', 'Customer ka naam zaroori hai.');
      return;
    }
    await addCustomer(manualName.trim(), manualPhone.trim());
    setManualName('');
    setManualPhone('');
    setAddModal(false);
    load();
  };

  return (
    <View style={styles.screen}>
      <Header title="Customers" onBack={pop} right={
        <TouchableOpacity onPress={() => setAddModal(true)}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      } />
      <FlatList
        data={customers}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>Koi customer nahi hai. + se add karein.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => push('customerDetail', { customerId: item.id })}>
            <Card style={styles.row}>
              <View>
                <Text style={styles.name}>{item.name}</Text>
                {item.phone ? <Text style={styles.phone}>{item.phone}</Text> : null}
              </View>
              <Text style={[styles.balance, item.balance > 0 ? { color: THEME.accent } : { color: THEME.success }]}>
                {money(item.balance)}
              </Text>
            </Card>
          </TouchableOpacity>
        )}
      />

      <Modal visible={addModal} transparent animationType="slide" onRequestClose={() => setAddModal(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Naya customer</Text>
            <OutlineButton title="Contacts se select karein" onPress={openContactPicker} style={{ marginBottom: 14 }} />
            <Text style={styles.orText}>ya khud likhein</Text>
            <Field label="Naam" value={manualName} onChangeText={setManualName} placeholder="Customer ka naam" />
            <Field label="Phone (optional)" value={manualPhone} onChangeText={setManualPhone} placeholder="03xx-xxxxxxx" keyboardType="phone-pad" />
            <PrimaryButton title="Add karein" onPress={saveManual} style={{ marginBottom: 8 }} />
            <OutlineButton title="Cancel" onPress={() => setAddModal(false)} />
          </View>
        </View>
      </Modal>

      <Modal visible={pickerVisible} animationType="slide" onRequestClose={() => setPickerVisible(false)}>
        <View style={styles.screen}>
          <Header title="Contact select karein" onBack={() => setPickerVisible(false)} />
          <FlatList
            data={contactList}
            keyExtractor={(c, i) => c.id || String(i)}
            contentContainerStyle={{ padding: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => pickContact(item)}>
                <Card style={{ marginBottom: 8 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.phone}>{item.phoneNumbers?.[0]?.number}</Text>
                </Card>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: THEME.bg },
  addIcon: { color: THEME.accent, fontSize: 24, fontWeight: '700' },
  empty: { color: THEME.textMuted, fontSize: 13, textAlign: 'center', marginTop: 30 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  name: { color: THEME.text, fontSize: 15, fontWeight: '600' },
  phone: { color: THEME.textMuted, fontSize: 12, marginTop: 2 },
  balance: { fontSize: 15, fontWeight: '700' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: THEME.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, paddingBottom: 40 },
  modalTitle: { color: THEME.text, fontSize: 17, fontWeight: '700', marginBottom: 14 },
  orText: { color: THEME.textMuted, fontSize: 12, textAlign: 'center', marginBottom: 14 },
});
