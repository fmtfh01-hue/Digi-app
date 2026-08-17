import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { THEME } from './utils/theme';
import { initDB } from './db';

import DashboardScreen from './screens/DashboardScreen';
import CustomersScreen from './screens/CustomersScreen';
import CustomerDetailScreen from './screens/CustomerDetailScreen';
import ItemsScreen from './screens/ItemsScreen';
import NewSlipScreen from './screens/NewSlipScreen';
import SlipPreviewScreen from './screens/SlipPreviewScreen';

const SCREENS = {
  dashboard: DashboardScreen,
  customers: CustomersScreen,
  customerDetail: CustomerDetailScreen,
  items: ItemsScreen,
  newSlip: NewSlipScreen,
  slipPreview: SlipPreviewScreen,
};

export default function App() {
  const [ready, setReady] = useState(false);
  const [stack, setStack] = useState([{ screen: 'dashboard', params: {} }]);

  useEffect(() => {
    (async () => {
      await initDB();
      setReady(true);
    })();
  }, []);

  const push = useCallback((screen, params = {}) => {
    setStack((s) => [...s, { screen, params }]);
  }, []);

  const replace = useCallback((screen, params = {}) => {
    setStack((s) => [...s.slice(0, -1), { screen, params }]);
  }, []);

  const pop = useCallback(() => {
    setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));
  }, []);

  const popToRoot = useCallback(() => {
    setStack((s) => [s[0]]);
  }, []);

  if (!ready) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={THEME.accent} size="large" />
      </View>
    );
  }

  const top = stack[stack.length - 1];
  const Screen = SCREENS[top.screen];

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Screen params={top.params} push={push} pop={pop} replace={replace} popToRoot={popToRoot} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.bg },
  loading: { flex: 1, backgroundColor: THEME.bg, alignItems: 'center', justifyContent: 'center' },
});
