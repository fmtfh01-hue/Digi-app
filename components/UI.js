import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { THEME } from '../utils/theme';

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function PrimaryButton({ title, onPress, style, textStyle, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.primaryBtn, disabled && { opacity: 0.5 }, style]}
    >
      <Text style={[styles.primaryBtnText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function OutlineButton({ title, onPress, style, textStyle, danger }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.outlineBtn, danger && { borderColor: THEME.danger }, style]}
    >
      <Text style={[styles.outlineBtnText, danger && { color: THEME.danger }, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

export function Field({ label, ...props }) {
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput placeholderTextColor={THEME.textMuted} style={styles.input} {...props} />
    </View>
  );
}

export function Header({ title, onBack, right }) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>{'<'}</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 30 }} />
      )}
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ minWidth: 30, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    padding: 14,
  },
  primaryBtn: {
    backgroundColor: THEME.accent,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  primaryBtnText: { color: THEME.accentDark, fontWeight: '700', fontSize: 15 },
  outlineBtn: {
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  outlineBtnText: { color: THEME.text, fontWeight: '600', fontSize: 14 },
  label: { color: THEME.textMuted, fontSize: 12, marginBottom: 5 },
  input: {
    backgroundColor: THEME.surface2,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: THEME.text,
    fontSize: 15,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 54,
    paddingBottom: 14,
    backgroundColor: THEME.bg,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  backBtn: { width: 30, height: 30, justifyContent: 'center' },
  backBtnText: { color: THEME.accent, fontSize: 20, fontWeight: '700' },
  headerTitle: { color: THEME.text, fontSize: 17, fontWeight: '700' },
});
