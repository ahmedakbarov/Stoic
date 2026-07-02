// JournalScreen — morning/evening journal tabs with history and auto-save
import React, { useState, useCallback, useRef } from 'react';
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
import { colors } from '../constants/colors';
import JournalEntry from '../components/JournalEntry';
import OrnamentalDivider from '../components/OrnamentalDivider';
import { getJournal, saveJournal } from '../utils/storage';
import {
  getTodayKey,
  getLastNDays,
  formatShortDate,
  isToday,
} from '../utils/dateHelper';

const MORNING_QUESTIONS = [
  'Bu gün nə çətin ola bilər?',
  'Hansı şeylər mənim əlimdədir?',
  'Bu gün kim üçün faydalı ola bilərəm?',
];

const EVENING_QUESTIONS = [
  'Bu gün nəyi yaxşı etdim?',
  'Harada daha yaxşı edə bilərdim?',
  'Sabah necə bir insan olmaq istəyirəm?',
];

export default function JournalScreen() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('morning'); // 'morning' | 'evening'
  const [selectedDate, setSelectedDate] = useState(getTodayKey());
  const [journalData, setJournalData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const autoSaveTimerRef = useRef(null);
  const latestJournalRef = useRef(null);

  const weekDays = getLastNDays(7);
  const isSelectedToday = isToday(selectedDate);

  const loadJournal = useCallback(async (dateKey) => {
    setLoading(true);
    try {
      const data = await getJournal(dateKey);
      setJournalData(data);
      latestJournalRef.current = data;
    } catch (error) {
      console.error('JournalScreen loadJournal error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadJournal(selectedDate);
      return () => {
        // Flush any pending auto-save on blur
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
          autoSaveTimerRef.current = null;
          if (latestJournalRef.current && isToday(selectedDate)) {
            saveJournal(selectedDate, latestJournalRef.current).catch(() => {});
          }
        }
      };
    }, [selectedDate, loadJournal])
  );

  // Debounced auto-save — only for today's journal
  const scheduleAutoSave = (updatedData) => {
    if (!isSelectedToday) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        await saveJournal(selectedDate, updatedData);
      } catch (error) {
        console.error('Auto-save error:', error);
      }
    }, 1000);
  };

  // Generic field change handler
  const handleChange = (section, field, text) => {
    const updated = {
      ...journalData,
      [section]: {
        ...journalData[section],
        [field]: text,
      },
    };
    setJournalData(updated);
    latestJournalRef.current = updated;
    scheduleAutoSave(updated);
  };

  // Manual save
  const handleSave = async () => {
    if (!journalData || !isSelectedToday) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    setIsSaving(true);
    try {
      await saveJournal(selectedDate, journalData);
    } catch (error) {
      console.error('Manual save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Switch selected date from calendar row
  const handleDateSelect = (dateKey) => {
    setSelectedDate(dateKey);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      </SafeAreaView>
    );
  }

  const isReadOnly = !isSelectedToday;

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
          <Text style={styles.screenTitle}>Gündəlik Jurnal</Text>
          <Text style={styles.screenSubtitle}>
            {isReadOnly ? `${formatShortDate(selectedDate)} — Yalnız oxuma` : 'Bu gün'}
          </Text>
        </View>

        {/* Tab selector: Səhər / Axşam */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'morning' && styles.tabActive]}
            onPress={() => setActiveTab('morning')}
          >
            <Text style={[styles.tabText, activeTab === 'morning' && styles.tabTextActive]}>
              🌅 Səhər
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'evening' && styles.tabActive]}
            onPress={() => setActiveTab('evening')}
          >
            <Text style={[styles.tabText, activeTab === 'evening' && styles.tabTextActive]}>
              🌙 Axşam
            </Text>
          </TouchableOpacity>
        </View>

        <OrnamentalDivider style={styles.divider} />

        {/* Journal questions */}
        <View style={styles.questionsContainer}>
          {activeTab === 'morning'
            ? MORNING_QUESTIONS.map((q, i) => (
                <JournalEntry
                  key={`morning-${i}`}
                  questionNumber={i + 1}
                  question={q}
                  value={journalData?.morning?.[`q${i + 1}`] || ''}
                  onChangeText={(text) =>
                    handleChange('morning', `q${i + 1}`, text)
                  }
                  editable={!isReadOnly}
                />
              ))
            : EVENING_QUESTIONS.map((q, i) => (
                <JournalEntry
                  key={`evening-${i}`}
                  questionNumber={i + 1}
                  question={q}
                  value={journalData?.evening?.[`q${i + 1}`] || ''}
                  onChangeText={(text) =>
                    handleChange('evening', `q${i + 1}`, text)
                  }
                  editable={!isReadOnly}
                />
              ))}
        </View>

        {/* Save button — only shown for today */}
        {!isReadOnly && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saxlanılır...' : 'SAXLA'}
            </Text>
          </TouchableOpacity>
        )}

        <OrnamentalDivider style={styles.calendarDivider} />

        {/* Calendar-style date row — last 7 days */}
        <Text style={styles.calendarLabel}>Son 7 Gün</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateRow}
        >
          {weekDays.map((dateKey) => {
            const isSelected = dateKey === selectedDate;
            const isTodayDate = isToday(dateKey);
            return (
              <TouchableOpacity
                key={dateKey}
                style={[
                  styles.datePill,
                  isSelected && styles.datePillSelected,
                  isTodayDate && styles.datePillToday,
                ]}
                onPress={() => handleDateSelect(dateKey)}
              >
                <Text
                  style={[
                    styles.datePillText,
                    isSelected && styles.datePillTextSelected,
                  ]}
                >
                  {formatShortDate(dateKey)}
                </Text>
                {isTodayDate && <View style={styles.todayDot} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

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
    fontSize: 13,
    color: colors.stone,
    marginTop: 4,
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: colors.gold,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.stone,
  },
  tabTextActive: {
    color: colors.ink,
  },

  divider: {
    marginHorizontal: 24,
  },

  // Questions
  questionsContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // Save button
  saveButton: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: colors.gold,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.ink,
  },

  // Calendar row
  calendarDivider: {
    marginHorizontal: 24,
    marginTop: 28,
  },
  calendarLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 3,
    color: colors.goldDim,
    textTransform: 'uppercase',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  dateRow: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  datePill: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.stoneLight,
    minWidth: 64,
  },
  datePillSelected: {
    backgroundColor: colors.goldFaint,
    borderColor: colors.gold,
  },
  datePillToday: {
    borderColor: colors.goldDim,
  },
  datePillText: {
    fontSize: 13,
    color: colors.stone,
    fontWeight: '500',
  },
  datePillTextSelected: {
    color: colors.gold,
    fontWeight: '700',
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.gold,
    marginTop: 4,
  },

  bottomSpacer: {
    height: 24,
  },
});
