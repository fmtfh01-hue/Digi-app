import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { Header, Card, PrimaryButton, OutlineButton, Field } from '../components/UI';
import { THEME, money } from '../utils/theme';
import { getItems, addItem, deleteItem } from '../db';

export default function ItemsScreen({ pop }) {
  const [items, setItems] = useState([]);
  const [modal, setModal] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const load = useCallback(async () => {
    setItems(await getItems());
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const p = parseFloat(price);
    if (!name.trim() || isNaN(p)) {
      Alert.alert('Check karein', 'Item ka naam aur price dono dalein.');
      return;
    }
    await addItem(name.trim(), p);
    setName('');
    setPrice('');
    setModal(false);
    load();
  };

  const remove = (item) => {
    Alert.alert('Delete karein?', `${item.name} ko list se hataana hai?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteItem(item.id); load(); } },
    ]);
  };

  return (
    <View style={styles.screen}>
      <Header title="Items / Price list" onBack={pop} right={
        <TouchableOpacity onPress={() => setModal(true)}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      } />
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={styles.empty}>Koi item nahi hai. + se add karein.</Text>}
        renderItem={({ item }) => (
          <Card style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.price}>{money(item.price)}</Text>
              <TouchableOpacity onPress={() => remove(item)} style={{ marginLeft: 14 }}>
                <Text style={styles.deleteText}>Hatayein</Text>
              </TouchableOpacity>
            </View>
          </Card>
        )}
      />

      <Modal visible={modal} transparent animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Naya item</Text>
            <Field label="Item ka naam" value={name} onChangeText={setName} placeholder="e.g. Chawal 1kg" />
            <Field label="Price" value={price} onChangeText={setPrice} placeholder="0" keyboardType="numeric" />
            <PrimaryButton title="Add karein" onPress={save} style={{ marginBottom: 8 }} />
            <OutlineButton title="Cancel" onPress={() => setModal(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: THEME.bg },
  addIcon: { color: THEME.accent, fontSize: 24, fontWeight: '700' },
  empty: { color: THEME.textMuted, fontSize: 13, textAlign: 'center', marginTop: 30 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  name: { color: THEME.text, fontSize: 15 },
  price: { color: THEME.accent, fontSize: 15, fontWeight: '700' },
  deleteText: { color: THEME.danger, fontSize: 12 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: THEME.surface, borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 20, paddingBottom: 40 },
  modalTitle: { color: THEME.text, fontSize: 17, fontWeight: '700', marginBottom: 14 },
});
