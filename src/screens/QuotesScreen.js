// QuotesScreen — filterable Stoic quotes with favorites and share
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
import { colors } from '../constants/colors';
import QuoteCard from '../components/QuoteCard';
import OrnamentalDivider from '../components/OrnamentalDivider';
import { quotes, authors } from '../data/quotes';
import { getFavorites, toggleFavorite } from '../utils/storage';

export default function QuotesScreen() {
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [activeFilter, setActiveFilter] = useState('Hamısı');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const loadFavorites = useCallback(async () => {
    try {
      const favs = await getFavorites();
      setFavorites(favs);
    } catch (error) {
      console.error('QuotesScreen loadFavorites error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadFavorites();
    }, [loadFavorites])
  );

  const handleFavorite = async (index) => {
    const updated = await toggleFavorite(index);
    setFavorites(updated);
  };

  // Filter quotes by author (from filter pills) and optionally by favorites
  const getFilteredQuotes = () => {
    let filtered = quotes.map((q, i) => ({ ...q, originalIndex: i }));

    if (showFavoritesOnly) {
      filtered = filtered.filter((q) => favorites.includes(q.originalIndex));
    }

    if (activeFilter !== 'Hamısı') {
      filtered = filtered.filter((q) =>
        q.author.toLowerCase().includes(activeFilter.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredQuotes = getFilteredQuotes();

  if (loading) {
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
      >
        {/* Screen header */}
        <View style={styles.screenHeader}>
          <Text style={styles.screenTitle}>Stoik Sitatlar</Text>
          <Text style={styles.screenSubtitle}>{quotes.length} sitat</Text>
        </View>

        {/* Favorites tab row */}
        <View style={styles.favTabRow}>
          <TouchableOpacity
            style={[styles.favTab, !showFavoritesOnly && styles.favTabActive]}
            onPress={() => setShowFavoritesOnly(false)}
          >
            <Text style={[styles.favTabText, !showFavoritesOnly && styles.favTabTextActive]}>
              Hamısı
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.favTab, showFavoritesOnly && styles.favTabActive]}
            onPress={() => setShowFavoritesOnly(true)}
          >
            <Text style={[styles.favTabText, showFavoritesOnly && styles.favTabTextActive]}>
              ❤️ Favoritlər ({favorites.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Author filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {authors.map((author) => (
            <TouchableOpacity
              key={author}
              style={[
                styles.filterPill,
                activeFilter === author && styles.filterPillActive,
              ]}
              onPress={() => setActiveFilter(author)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  activeFilter === author && styles.filterPillTextActive,
                ]}
              >
                {author}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <OrnamentalDivider style={styles.divider} />

        {/* Quote list */}
        {filteredQuotes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📿</Text>
            <Text style={styles.emptyTitle}>
              {showFavoritesOnly ? 'Heç bir favorit yoxdur' : 'Nəticə tapılmadı'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {showFavoritesOnly
                ? 'Sitatları sevmək üçün ürək ikonuna vurun'
                : 'Başqa bir filtr seçin'}
            </Text>
          </View>
        ) : (
          filteredQuotes.map((quote) => (
            <QuoteCard
              key={quote.originalIndex}
              quote={quote}
              index={quote.originalIndex}
              isFavorite={favorites.includes(quote.originalIndex)}
              onFavorite={handleFavorite}
            />
          ))
        )}

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

  // Favorites tabs
  favTabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 4,
  },
  favTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  favTabActive: {
    backgroundColor: colors.gold,
  },
  favTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.stone,
  },
  favTabTextActive: {
    color: colors.ink,
  },

  // Author filter pills
  filterRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.stoneLight,
    marginRight: 8,
  },
  filterPillActive: {
    backgroundColor: colors.goldFaint,
    borderColor: colors.gold,
  },
  filterPillText: {
    fontSize: 13,
    color: colors.stone,
    fontWeight: '500',
  },
  filterPillTextActive: {
    color: colors.gold,
    fontWeight: '700',
  },

  divider: {
    marginHorizontal: 24,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.cream,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.stone,
    textAlign: 'center',
    lineHeight: 22,
  },

  bottomSpacer: {
    height: 24,
  },
});
