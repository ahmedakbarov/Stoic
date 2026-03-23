// Decorative ornamental divider component
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

export default function OrnamentalDivider({ style }) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.line} />
      <Text style={styles.ornament}>✦</Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.goldDim,
    opacity: 0.6,
  },
  ornament: {
    color: colors.gold,
    fontSize: 12,
    marginHorizontal: 10,
  },
});
