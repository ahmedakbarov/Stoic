// HomeScreen — main dashboard with greeting, daily quote, ritual summary, and challenge preview
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/colors';
import OrnamentalDivider from '../components/OrnamentalDivider';
import { quotes } from '../data/quotes';
import { challenges } from '../data/challenges';
import { getRituals, getChallenge, getStreak } from '../utils/storage';
import {
  getTodayKey,
  getAzerbaijaniDateString,
  getTimeGreeting,
  getDayOfYear,
} from '../utils/dateHelper';

// Pick a "daily" item seeded by day-of-year so it stays constant all day
function getDailyItem(array) {
  const seed = getDayOfYear();
  return array[seed % array.length];
}

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ritualsCompleted, setRitualsCompleted] = useState(0);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [streak, setStreak] = useState(0);

  const todayKey = getTodayKey();
  const greeting = getTimeGreeting();
  const dateString = getAzerbaijaniDateString();
  const dailyQuote = getDailyItem(quotes);
  const dailyChallenge = getDailyItem(challenges);

  const loadData = useCallback(async () => {
    try {
      const [rituals, challenge, streakData] = await Promise.all([
        getRituals(todayKey),
        getChallenge(todayKey),
        getStreak(),
      ]);

      // Count how many of the 3 rituals are done
      const count =
        (rituals.morning.completed ? 1 : 0) +
        (rituals.midday.completed ? 1 : 0) +
        (rituals.evening.completed ? 1 : 0);

      setRitualsCompleted(count);
      setChallengeCompleted(challenge.completed);
      setStreak(streakData.current);
    } catch (error) {
      console.error('HomeScreen loadData error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [todayKey]);

  // Reload whenever this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      </SafeAreaView>
    );
  }

  // Circular progress: fill ratio out of 3
  const progressRatio = ritualsCompleted / 3;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.gold}
            colors={[colors.gold]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header section */}
        <LinearGradient
          colors={['#2E2618', colors.background]}
          style={styles.headerGradient}
        >
          <Text style={styles.greeting}>{greeting}</Text>
          <Text style={styles.dateText}>{dateString}</Text>

          {streak > 0 && (
            <View style={styles.streakRow}>
              <Text style={styles.streakText}>🔥 {streak} gün ardıcıl</Text>
            </View>
          )}
        </LinearGradient>

        <OrnamentalDivider style={styles.topDivider} />

        {/* Daily quote card */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>GÜNÜN SİTATI</Text>
        </View>

        <View style={styles.quoteCard}>
          <View style={styles.quoteAccent} />
          <Text style={styles.quoteAuthor}>{dailyQuote.author}</Text>
          <OrnamentalDivider />
          <Text style={styles.quoteText}>{dailyQuote.text}</Text>
        </View>

        {/* Ritual progress card */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>GÜNÜN RİTUALLARI</Text>
        </View>

        <TouchableOpacity
          style={styles.ritualSummaryCard}
          onPress={() => navigation.navigate('Rituallar')}
          activeOpacity={0.85}
        >
          <View style={styles.ritualSummaryLeft}>
            <Text style={styles.ritualCount}>
              {ritualsCompleted}/3
            </Text>
            <Text style={styles.ritualSubtitle}>
              {ritualsCompleted === 0
                ? 'Hələ başlanmayıb'
                : ritualsCompleted === 3
                ? 'Hamısı tamamlandı!'
                : 'davam edir...'}
            </Text>
          </View>

          {/* Simple circular progress indicator */}
          <View style={styles.circleContainer}>
            <View style={styles.circleTrack}>
              {/* Filled arc approximated via a colored ring */}
              <View
                style={[
                  styles.circleProgress,
                  {
                    borderColor:
                      ritualsCompleted === 3 ? colors.gold : colors.goldDim,
                    opacity: ritualsCompleted === 0 ? 0.3 : 1,
                  },
                ]}
              />
              <Text style={styles.circleLabel}>
                {Math.round(progressRatio * 100)}%
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Daily challenge preview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>GÜNÜN TAPŞIRIĞI</Text>
        </View>

        <View style={styles.challengeCard}>
          <LinearGradient
            colors={[colors.surface, '#3A3020']}
            style={styles.challengeGradient}
          >
            {challengeCompleted && (
              <View style={styles.challengeCompletedBadge}>
                <Text style={styles.challengeCompletedText}>✓ Tamamlandı</Text>
              </View>
            )}
            <Text style={styles.challengeText}>{dailyChallenge.text}</Text>
            <Text style={styles.challengeWhy} numberOfLines={2}>
              {dailyChallenge.why}
            </Text>

            <TouchableOpacity
              style={[
                styles.challengeButton,
                challengeCompleted && styles.challengeButtonDone,
              ]}
              onPress={() => navigation.navigate('Tapşırıq')}
              activeOpacity={0.8}
            >
              <Text style={styles.challengeButtonText}>
                {challengeCompleted ? 'Göstər' : 'Başla →'}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Bottom spacer */}
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

  // Header
  headerGradient: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 28,
  },
  greeting: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.cream,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  dateText: {
    fontSize: 14,
    color: colors.stone,
    letterSpacing: 0.3,
  },
  streakRow: {
    marginTop: 12,
  },
  streakText: {
    fontSize: 14,
    color: colors.gold,
    fontWeight: '600',
  },

  topDivider: {
    marginHorizontal: 24,
  },

  // Section labels
  sectionHeader: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    color: colors.goldDim,
    textTransform: 'uppercase',
  },

  // Quote card
  quoteCard: {
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.stoneLight,
    overflow: 'hidden',
  },
  quoteAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.gold,
  },
  quoteAuthor: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
    color: colors.gold,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 4,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: colors.cream,
    lineHeight: 26,
    textAlign: 'center',
  },

  // Ritual summary card
  ritualSummaryCard: {
    marginHorizontal: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.stoneLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ritualSummaryLeft: {
    flex: 1,
  },
  ritualCount: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.gold,
    lineHeight: 48,
  },
  ritualSubtitle: {
    fontSize: 14,
    color: colors.stone,
    marginTop: 4,
  },
  circleContainer: {
    width: 64,
    height: 64,
    marginLeft: 16,
  },
  circleTrack: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 5,
    borderColor: colors.stoneLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  circleProgress: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 5,
  },
  circleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.cream,
  },

  // Challenge card
  challengeCard: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.goldFaint,
  },
  challengeGradient: {
    padding: 20,
  },
  challengeCompletedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(201,168,76,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 10,
  },
  challengeCompletedText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gold,
    letterSpacing: 1,
  },
  challengeText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.cream,
    marginBottom: 10,
    lineHeight: 26,
  },
  challengeWhy: {
    fontSize: 13,
    color: colors.stone,
    lineHeight: 20,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  challengeButton: {
    backgroundColor: colors.gold,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  challengeButtonDone: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.goldDim,
  },
  challengeButtonText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.ink,
    textTransform: 'uppercase',
  },

  bottomSpacer: {
    height: 20,
  },
});
