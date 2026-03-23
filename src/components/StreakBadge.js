// Streak badge component with pulse animation when streak > 0
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../constants/colors';

export default function StreakBadge({ count }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (count > 0) {
      // Gentle pulse animation repeating indefinitely
      scale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // infinite
        false
      );
    } else {
      scale.value = withTiming(1, { duration: 300 });
    }
  }, [count]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.flame}>🔥</Text>
      <Text style={styles.count}>{count}</Text>
      <Text style={styles.label}> gün ardıcıl</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.goldDim,
    alignSelf: 'flex-start',
  },
  flame: {
    fontSize: 16,
  },
  count: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gold,
    marginLeft: 4,
  },
  label: {
    fontSize: 13,
    color: colors.creamDim,
    fontWeight: '400',
  },
});
