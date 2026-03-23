// RitualsScreen — morning, midday, and evening ritual cards with persistence
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../constants/colors';
import RitualCard from '../components/RitualCard';
import OrnamentalDivider from '../components/OrnamentalDivider';
import { getRituals, saveRituals, getStreak, updateStreak } from '../utils/storage';
import { getTodayKey } from '../utils/dateHelper';

// Format current time as HH:MM
function getCurrentTime() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export default function RitualsScreen() {
  const [loading, setLoading] = useState(true);
  const [rituals, setRituals] = useState(null);
  const [streak, setStreak] = useState(0);

  const todayKey = getTodayKey();

  const loadData = useCallback(async () => {
    try {
      const [ritualsData, streakData] = await Promise.all([
        getRituals(todayKey),
        getStreak(),
      ]);
      setRituals(ritualsData);
      setStreak(streakData.current);
    } catch (error) {
      console.error('RitualsScreen loadData error:', error);
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

  // Persist updated ritual data and update streak
  const persistRituals = async (updated) => {
    await saveRituals(todayKey, updated);
    const updatedStreak = await updateStreak();
    setStreak(updatedStreak.current);
  };

  // --- Morning handlers ---
  const handleMorningAnswerChange = (text) => {
    setRituals((prev) => ({
      ...prev,
      morning: { ...prev.morning, answer: text },
    }));
  };

  const handleMorningComplete = async () => {
    const time = getCurrentTime();
    const updated = {
      ...rituals,
      morning: { ...rituals.morning, completed: true, completionTime: time },
    };
    setRituals(updated);
    await persistRituals(updated);
  };

  // --- Midday handlers ---
  const handleMiddayComplete = async () => {
    const time = getCurrentTime();
    const updated = {
      ...rituals,
      midday: { ...rituals.midday, completed: true, completionTime: time },
    };
    setRituals(updated);
    await persistRituals(updated);
  };

  // --- Evening handlers ---
  const handleEveningAnswer1Change = (text) => {
    setRituals((prev) => ({
      ...prev,
      evening: { ...prev.evening, answer1: text },
    }));
  };

  const handleEveningAnswer2Change = (text) => {
    setRituals((prev) => ({
      ...prev,
      evening: { ...prev.evening, answer2: text },
    }));
  };

  const handleEveningAnswer3Change = (text) => {
    setRituals((prev) => ({
      ...prev,
      evening: { ...prev.evening, answer3: text },
    }));
  };

  const handleEveningComplete = async () => {
    const time = getCurrentTime();
    const updated = {
      ...rituals,
      evening: { ...rituals.evening, completed: true, completionTime: time },
    };
    setRituals(updated);
    await persistRituals(updated);
  };

  if (loading || !rituals) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Screen header */}
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Günlük Rituallar</Text>
          <Text style={styles.screenSubtitle}>
            {(rituals.morning.completed ? 1 : 0) +
              (rituals.midday.completed ? 1 : 0) +
              (rituals.evening.completed ? 1 : 0)}
            /3 tamamlandı
          </Text>
        </View>

        <OrnamentalDivider style={styles.headerDivider} />

        {/* Morning ritual */}
        <RitualCard
          title="Premeditatio"
          subtitle="Sabah rituali"
          prompt="Bu gün nə çətin ola bilər? Necə cavab verəcəksən?"
          type="morning"
          completed={rituals.morning.completed}
          completionTime={rituals.morning.completionTime}
          answer={rituals.morning.answer || ''}
          onAnswerChange={handleMorningAnswerChange}
          onComplete={handleMorningComplete}
          streak={streak}
        />

        {/* Midday ritual */}
        <RitualCard
          title="Pause Anı"
          subtitle="Günorta rituali"
          prompt="Bu gün bir reaksiyanı şüurlu seçdim."
          type="midday"
          completed={rituals.midday.completed}
          completionTime={rituals.midday.completionTime}
          onComplete={handleMiddayComplete}
          streak={streak}
        />

        {/* Evening ritual */}
        <RitualCard
          title="Examen"
          subtitle="Axşam rituali"
          prompt="Günü nəzərdən keçir — dürüstlüklə."
          type="evening"
          completed={rituals.evening.completed}
          completionTime={rituals.evening.completionTime}
          answer1={rituals.evening.answer1 || ''}
          onAnswer1Change={handleEveningAnswer1Change}
          answer2={rituals.evening.answer2 || ''}
          onAnswer2Change={handleEveningAnswer2Change}
          answer3={rituals.evening.answer3 || ''}
          onAnswer3Change={handleEveningAnswer3Change}
          onComplete={handleEveningComplete}
          streak={streak}
        />

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
  screenSubtitle: {
    fontSize: 14,
    color: colors.stone,
    marginTop: 4,
  },
  headerDivider: {
    marginHorizontal: 24,
    marginBottom: 8,
  },
  bottomSpacer: {
    height: 24,
  },
});
