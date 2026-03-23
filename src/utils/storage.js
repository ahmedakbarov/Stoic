// AsyncStorage utility functions for Stoic Companion app
// Key format: @stoic_{type}_{YYYY-MM-DD}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayKey, daysBetween } from './dateHelper';

// ---------------------------------------------------------------------------
// Default data shapes
// ---------------------------------------------------------------------------

const defaultRituals = () => ({
  morning: { completed: false, completionTime: null, answer: '' },
  midday: { completed: false, completionTime: null },
  evening: {
    completed: false,
    completionTime: null,
    answer1: '',
    answer2: '',
    answer3: '',
  },
});

const defaultJournal = () => ({
  morning: { q1: '', q2: '', q3: '' },
  evening: { q1: '', q2: '', q3: '' },
});

const defaultChallenge = () => ({
  completed: false,
  completionTime: null,
});

const defaultStreak = () => ({
  current: 0,
  longest: 0,
  lastDate: null,
});

// ---------------------------------------------------------------------------
// Rituals
// ---------------------------------------------------------------------------

/**
 * Load rituals for a given date key.
 * Returns default shape if nothing is stored yet.
 */
export async function getRituals(dateStr) {
  try {
    const key = `@stoic_rituals_${dateStr}`;
    const raw = await AsyncStorage.getItem(key);
    if (raw !== null) {
      return JSON.parse(raw);
    }
    return defaultRituals();
  } catch (error) {
    console.error('getRituals error:', error);
    return defaultRituals();
  }
}

/**
 * Persist rituals for a given date key.
 */
export async function saveRituals(dateStr, data) {
  try {
    const key = `@stoic_rituals_${dateStr}`;
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('saveRituals error:', error);
  }
}

// ---------------------------------------------------------------------------
// Journal
// ---------------------------------------------------------------------------

/**
 * Load journal for a given date key.
 * Returns default shape if nothing is stored yet.
 */
export async function getJournal(dateStr) {
  try {
    const key = `@stoic_journal_${dateStr}`;
    const raw = await AsyncStorage.getItem(key);
    if (raw !== null) {
      return JSON.parse(raw);
    }
    return defaultJournal();
  } catch (error) {
    console.error('getJournal error:', error);
    return defaultJournal();
  }
}

/**
 * Persist journal for a given date key.
 */
export async function saveJournal(dateStr, data) {
  try {
    const key = `@stoic_journal_${dateStr}`;
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('saveJournal error:', error);
  }
}

// ---------------------------------------------------------------------------
// Challenge
// ---------------------------------------------------------------------------

/**
 * Load challenge completion state for a given date key.
 */
export async function getChallenge(dateStr) {
  try {
    const key = `@stoic_challenge_${dateStr}`;
    const raw = await AsyncStorage.getItem(key);
    if (raw !== null) {
      return JSON.parse(raw);
    }
    return defaultChallenge();
  } catch (error) {
    console.error('getChallenge error:', error);
    return defaultChallenge();
  }
}

/**
 * Persist challenge state for a given date key.
 */
export async function saveChallenge(dateStr, data) {
  try {
    const key = `@stoic_challenge_${dateStr}`;
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('saveChallenge error:', error);
  }
}

// ---------------------------------------------------------------------------
// Favorites
// ---------------------------------------------------------------------------

const FAVORITES_KEY = '@stoic_favorites';

/**
 * Load favorited quote indices.
 * Returns an array of numbers (indices into the quotes array).
 */
export async function getFavorites() {
  try {
    const raw = await AsyncStorage.getItem(FAVORITES_KEY);
    if (raw !== null) {
      return JSON.parse(raw);
    }
    return [];
  } catch (error) {
    console.error('getFavorites error:', error);
    return [];
  }
}

/**
 * Toggle a quote index in/out of favorites and persist the result.
 * Returns the updated favorites array.
 */
export async function toggleFavorite(index) {
  try {
    const current = await getFavorites();
    let updated;
    if (current.includes(index)) {
      updated = current.filter((i) => i !== index);
    } else {
      updated = [...current, index];
    }
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('toggleFavorite error:', error);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Streak
// ---------------------------------------------------------------------------

const STREAK_KEY = '@stoic_streak';

/**
 * Load the current streak object.
 * Shape: { current: number, longest: number, lastDate: string|null }
 */
export async function getStreak() {
  try {
    const raw = await AsyncStorage.getItem(STREAK_KEY);
    if (raw !== null) {
      return JSON.parse(raw);
    }
    return defaultStreak();
  } catch (error) {
    console.error('getStreak error:', error);
    return defaultStreak();
  }
}

/**
 * Call after any ritual completion to keep streak data up to date.
 * Increments streak if the last activity was yesterday or today,
 * resets to 1 if more than 1 day has passed.
 */
export async function updateStreak() {
  try {
    const streak = await getStreak();
    const today = getTodayKey();

    if (streak.lastDate === today) {
      // Already counted today — no change needed
      return streak;
    }

    let newCurrent;
    if (streak.lastDate === null) {
      // First ever activity
      newCurrent = 1;
    } else {
      const diff = daysBetween(streak.lastDate, today);
      if (diff === 1) {
        // Consecutive day
        newCurrent = streak.current + 1;
      } else {
        // Streak broken
        newCurrent = 1;
      }
    }

    const updated = {
      current: newCurrent,
      longest: Math.max(newCurrent, streak.longest),
      lastDate: today,
    };

    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('updateStreak error:', error);
    return defaultStreak();
  }
}

// ---------------------------------------------------------------------------
// Helper: count total completed challenges across all stored keys
// ---------------------------------------------------------------------------

/**
 * Returns the total number of challenges marked as completed.
 */
export async function getTotalCompletedChallenges() {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const challengeKeys = allKeys.filter((k) => k.startsWith('@stoic_challenge_'));
    if (challengeKeys.length === 0) return 0;

    const pairs = await AsyncStorage.multiGet(challengeKeys);
    let count = 0;
    for (const [, value] of pairs) {
      if (value) {
        const parsed = JSON.parse(value);
        if (parsed.completed) count++;
      }
    }
    return count;
  } catch (error) {
    console.error('getTotalCompletedChallenges error:', error);
    return 0;
  }
}
