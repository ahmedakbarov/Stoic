// ChallengeScreen — daily Stoic challenge with completion and history
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { colors } from '../constants/colors';
import OrnamentalDivider from '../components/OrnamentalDivider';
import { challenges } from '../data/challenges';
import {
  getChallenge,
  saveChallenge,
  getTotalCompletedChallenges,
} from '../utils/storage';
import {
  getTodayKey,
  getDayOfYear,
  getLastNDays,
  formatShortDate,
  isToday,
  parseDateKey,
} from '../utils/dateHelper';

// Select today's challenge by day-of-year seed
function getTodaysChallenge() {
  const seed = getDayOfYear();
  return challenges[seed % challenges.length];
}

// Format current time as HH:MM
function getCurrentTime() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export default function ChallengeScreen() {
  const [loading, setLoading] = useState(true);
  const [todayChallenge, setTodayChallenge] = useState(null);
  const [history, setHistory] = useState([]);
  const [totalCompleted, setTotalCompleted] = useState(0);

  // Ripple animation state
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const completedScale = useSharedValue(1);

  const todayKey = getTodayKey();
  const todaysChallenge = getTodaysChallenge();
  const weekDays = getLastNDays(7);

  const loadData = useCallback(async () => {
    try {
      // Load today's state
      const todayChallengeData = await getChallenge(todayKey);
      setTodayChallenge(todayChallengeData);

      // Load last 7 days history
      const historyPromises = weekDays.map(async (dateKey) => {
        const parsed = parseDateKey(dateKey);
        const dayOfYear = getDayOfYear(parsed);
        const challenge = challenges[dayOfYear % challenges.length];
        const challengeData = await getChallenge(dateKey);
        return {
          dateKey,
          challenge,
          completed: challengeData.completed,
          isToday: isToday(dateKey),
        };
      });

      const historyData = await Promise.all(historyPromises);
      setHistory(historyData);

      const total = await getTotalCompletedChallenges();
      setTotalCompleted(total);
    } catch (error) {
      console.error('ChallengeScreen loadData error:', error);
    } finally {
      setLoading(false);
    }
  }, [todayKey]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData])
  );

  // Mark today's challenge as complete
  const handleComplete = async () => {
    if (!todayChallenge || todayChallenge.completed) return;

    const time = getCurrentTime();
    const updated = { completed: true, completionTime: time };
    setTodayChallenge(updated);
    await saveChallenge(todayKey, updated);

    // Gold ripple animation
    rippleScale.value = 0;
    rippleOpacity.value = 0.8;
    rippleScale.value = withTiming(4, { duration: 700 });
    rippleOpacity.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withTiming(0, { duration: 600 })
    );

    // Scale bounce on button
    completedScale.value = withSpring(1.1, { damping: 8 });
    setTimeout(() => {
      completedScale.value = withSpring(1, { damping: 8 });
    }, 300);

    // Refresh totals
    const total = await getTotalCompletedChallenges();
    setTotalCompleted(total);
  };

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const buttonScale = useAnimatedStyle(() => ({
    transform: [{ scale: completedScale.value }],
  }));

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      </SafeAreaView>
    );
  }

  const isCompleted = todayChallenge?.completed || false;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen header */}
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Günün Tapşırığı</Text>
          <View style={styles.badgeRow}>
            <View style={styles.totalBadge}>
              <Text style={styles.totalBadgeText}>
                {totalCompleted} tapşırıq tamamlandı
              </Text>
            </View>
          </View>
        </View>

        <OrnamentalDivider style={styles.headerDivider} />

        {/* Today's challenge card */}
        <View style={styles.challengeWrapper}>
          {/* Ripple overlay */}
          <Animated.View style={[styles.ripple, rippleStyle]} pointerEvents="none" />

          <View style={[styles.challengeCard, isCompleted && styles.challengeCardCompleted]}>
            {/* Challenge index label */}
            <Text style={styles.challengeLabel}>⚡ STOIK TAPŞIRIQ</Text>

            {/* Completion badge */}
            {isCompleted && (
              <View style={styles.completedBadge}>
                <Text style={styles.completedBadgeText}>
                  ✓ Tamamlandı — saat {todayChallenge.completionTime}
                </Text>
              </View>
            )}

            {/* Challenge text */}
            <Text style={styles.challengeText}>{todaysChallenge.text}</Text>

            <OrnamentalDivider style={styles.cardDivider} />

            {/* Stoic "why" explanation */}
            <Text style={styles.whyLabel}>Niyə?</Text>
            <Text style={styles.whyText}>{todaysChallenge.why}</Text>

            {/* Complete button */}
            <Animated.View style={buttonScale}>
              <TouchableOpacity
                style={[styles.completeButton, isCompleted && styles.completeButtonDone]}
                onPress={handleComplete}
                disabled={isCompleted}
                activeOpacity={0.85}
              >
                <Text
                  style={[
                    styles.completeButtonText,
                    isCompleted && styles.completeButtonTextDone,
                  ]}
                >
                  {isCompleted ? 'Tamamlandı ✓' : 'TAMAMLANDI ✓'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* History section */}
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>Keçmiş Tapşırıqlar</Text>
        </View>

        <View style={styles.historyList}>
          {history.map((item) => (
            <View key={item.dateKey} style={styles.historyRow}>
              <View style={styles.historyDateCol}>
                <Text style={styles.historyDate}>
                  {item.isToday ? 'Bu gün' : formatShortDate(item.dateKey)}
                </Text>
              </View>

              <View style={styles.historyChallenge}>
                <Text style={styles.historyChallengeText} numberOfLines={2}>
                  {item.challenge.text}
                </Text>
              </View>

              <View style={styles.historyStatus}>
                <Text
                  style={[
                    styles.historyStatusText,
                    item.completed ? styles.statusCompleted : styles.statusMissed,
                  ]}
                >
                  {item.completed ? '✓' : '—'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  screenHeader: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 8,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.cream,
    letterSpacing: 0.5,
  },
  badgeRow: {
    marginTop: 10,
  },
  totalBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(201,168,76,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.goldDim,
  },
  totalBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gold,
  },
  headerDivider: {
    marginHorizontal: 24,
  },

  // Today's challenge card
  challengeWrapper: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 14,
    overflow: 'hidden',
  },
  ripple: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gold,
    alignSelf: 'center',
    top: '40%',
    zIndex: 10,
  },
  challengeCard: {
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.stoneLight,
    backgroundColor: colors.surface,
  },
  challengeCardCompleted: {
    backgroundColor: '#2A2210',
  },
  challengeLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    color: colors.goldDim,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  completedBadge: {
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 14,
    alignSelf: 'flex-start',
  },
  completedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gold,
  },
  challengeText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.cream,
    lineHeight: 32,
    marginBottom: 4,
  },
  cardDivider: {
    marginVertical: 16,
  },
  whyLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2.5,
    color: colors.gold,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  whyText: {
    fontSize: 14,
    color: colors.creamDim,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 24,
  },
  completeButton: {
    backgroundColor: colors.gold,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  completeButtonDone: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.goldDim,
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.ink,
    textTransform: 'uppercase',
  },
  completeButtonTextDone: {
    color: colors.goldDim,
  },

  // History
  historyHeader: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 10,
  },
  historyTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    color: colors.goldDim,
    textTransform: 'uppercase',
  },
  historyList: {
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.stoneLight,
    overflow: 'hidden',
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.stoneLight,
  },
  historyDateCol: {
    width: 56,
    marginRight: 10,
  },
  historyDate: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.stone,
    letterSpacing: 0.3,
  },
  historyChallenge: {
    flex: 1,
  },
  historyChallengeText: {
    fontSize: 13,
    color: colors.creamDim,
    lineHeight: 19,
  },
  historyStatus: {
    width: 28,
    alignItems: 'center',
  },
  historyStatusText: {
    fontSize: 18,
    fontWeight: '700',
  },
  statusCompleted: {
    color: colors.gold,
  },
  statusMissed: {
    color: colors.stone,
  },

  bottomSpacer: {
    height: 24,
  },
});
