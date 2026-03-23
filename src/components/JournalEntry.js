// JournalEntry component — a single labeled question + TextInput pair
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export default function JournalEntry({
  questionNumber,
  question,
  value,
  onChangeText,
  editable = true,
  placeholder = 'Düşüncələrinizi yazın...',
}) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberText}>{questionNumber}</Text>
        </View>
        <Text style={styles.question}>{question}</Text>
      </View>

      <TextInput
        style={[styles.input, !editable && styles.inputReadOnly]}
        value={value}
        onChangeText={onChangeText}
        placeholder={editable ? placeholder : '—'}
        placeholderTextColor={colors.stone}
        multiline
        editable={editable}
        textAlignVertical="top"
        selectionColor={colors.gold}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  numberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 2,
    flexShrink: 0,
  },
  numberText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.ink,
  },
  question: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: colors.cream,
    lineHeight: 22,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.stoneLight,
    padding: 14,
    fontSize: 15,
    color: colors.cream,
    lineHeight: 22,
    minHeight: 80,
  },
  inputReadOnly: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
    color: colors.creamDim,
  },
});
