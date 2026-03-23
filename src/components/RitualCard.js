// RitualCard component — renders morning, midday, or evening ritual
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/colors';
import StreakBadge from './StreakBadge';

// Map ritual type to header emoji and label
const RITUAL_META = {
  morning: { emoji: '🌅', label: 'SƏHƏR RİTUALI' },
  midday: { emoji: '☀️', label: 'GÜNORTA RİTUALI' },
  evening: { emoji: '🌙', label: 'AXŞAM RİTUALI' },
};

export default function RitualCard({
  title,
  subtitle,
  prompt,
  type,        // 'morning' | 'midday' | 'evening'
  completed,
  completionTime,
  onComplete,
  // Input props — supplied differently per type
  answer,
  onAnswerChange,
  answer1,
  onAnswer1Change,
  answer2,
  onAnswer2Change,
  answer3,
  onAnswer3Change,
  streak = 0,
}) {
  const meta = RITUAL_META[type] || RITUAL_META.morning;

  // Border glow animation on completion
  const glowOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    if (completed) {
      // Animate checkmark in with a spring bounce
      checkScale.value = withSpring(1, { damping: 8, stiffness: 120 });
      // Pulse the glow border
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.4, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      checkScale.value = withTiming(0, { duration: 200 });
      glowOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [completed]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  // Render the appropriate input section based on ritual type
  const renderInputSection = () => {
    if (completed) return null;

    if (type === 'morning') {
      return (
        <TextInput
          style={styles.input}
          value={answer}
          onChangeText={onAnswerChange}
          placeholder="Cavabınızı yazın..."
          placeholderTextColor={colors.stone}
          multiline
          textAlignVertical="top"
          selectionColor={colors.gold}
        />
      );
    }

    if (type === 'midday') {
      // No text input — just a confirm button
      return null;
    }

    if (type === 'evening') {
      return (
        <View>
          <Text style={styles.subPrompt}>1. Bu gün nəyi yaxşı etdim?</Text>
          <TextInput
            style={styles.input}
            value={answer1}
            onChangeText={onAnswer1Change}
            placeholder="Cavabınızı yazın..."
            placeholderTextColor={colors.stone}
            multiline
            textAlignVertical="top"
            selectionColor={colors.gold}
          />
          <Text style={styles.subPrompt}>2. Harada daha yaxşı edə bilərdim?</Text>
          <TextInput
            style={styles.input}
            value={answer2}
            onChangeText={onAnswer2Change}
            placeholder="Cavabınızı yazın..."
            placeholderTextColor={colors.stone}
            multiline
            textAlignVertical="top"
            selectionColor={colors.gold}
          />
          <Text style={styles.subPrompt}>3. Sabah necə bir insan olmaq istəyirəm?</Text>
          <TextInput
            style={styles.input}
            value={answer3}
            onChangeText={onAnswer3Change}
            placeholder="Cavabınızı yazın..."
            placeholderTextColor={colors.stone}
            multiline
            textAlignVertical="top"
            selectionColor={colors.gold}
          />
        </View>
      );
    }

    return null;
  };

  // Choose button label per type
  const buttonLabel =
    type === 'morning'
      ? 'RİTUALU TAMAMLA'
      : type === 'midday'
      ? 'BƏLİ, ETDİM'
      : 'GÜNÜ TAMAMLA';

  return (
    <View style={styles.wrapper}>
      {/* Animated glow border overlay */}
      <Animated.View style={[styles.glowBorder, glowStyle]} pointerEvents="none" />

      <LinearGradient
        colors={
          completed
            ? ['rgba(201,168,76,0.08)', colors.surface]
            : [colors.surface, colors.surface]
        }
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>{meta.emoji}</Text>
          <View style={styles.headerText}>
            <Text style={styles.ritualLabel}>{meta.label}</Text>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>

          {/* Animated checkmark shown on completion */}
          {completed && (
            <Animated.View style={[styles.checkContainer, checkStyle]}>
              <Text style={styles.checkmark}>✓</Text>
            </Animated.View>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Prompt text or completion state */}
        {completed ? (
          <View style={styles.completedState}>
            <Text style={styles.completedText}>
              ✓ Tamamlandı{completionTime ? ` — saat ${completionTime}` : ''}
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.prompt}>{prompt}</Text>
            {renderInputSection()}

            <TouchableOpacity style={styles.button} onPress={onComplete} activeOpacity={0.8}>
              <LinearGradient
                colors={[colors.gold, colors.goldDim]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>{buttonLabel}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </>
        )}

        {/* Streak badge below card */}
        <View style={styles.streakRow}>
          <StreakBadge count={streak} />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 14,
    overflow: 'hidden',
  },
  glowBorder: {
    position: 'absolute',
    inset: 0,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.gold,
    zIndex: 10,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.stoneLight,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  headerEmoji: {
    fontSize: 28,
    marginRight: 12,
    marginTop: 2,
  },
  headerText: {
    flex: 1,
  },
  ritualLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: colors.gold,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.cream,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: colors.stone,
    marginTop: 2,
  },
  checkContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.ink,
  },
  divider: {
    height: 1,
    backgroundColor: colors.stoneLight,
    marginVertical: 16,
  },
  prompt: {
    fontSize: 15,
    color: colors.creamDim,
    lineHeight: 23,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  subPrompt: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gold,
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    backgroundColor: colors.ink,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.stoneLight,
    padding: 12,
    fontSize: 15,
    color: colors.cream,
    lineHeight: 22,
    minHeight: 72,
    marginBottom: 12,
  },
  button: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 4,
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.ink,
    textTransform: 'uppercase',
  },
  completedState: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  completedText: {
    fontSize: 14,
    color: colors.goldDim,
    fontStyle: 'italic',
  },
  streakRow: {
    marginTop: 14,
  },
});
