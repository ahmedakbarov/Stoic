// QuoteCard component — displays a single Stoic quote with favorite + share
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
} from 'react-native';
import { colors } from '../constants/colors';
import OrnamentalDivider from './OrnamentalDivider';

export default function QuoteCard({ quote, isFavorite, onFavorite, onLongPress, index }) {
  const handleShare = async () => {
    try {
      await Share.share({
        message: `"${quote.text}"\n\n— ${quote.author}\n\n📿 Stoic Companion`,
      });
    } catch (error) {
      // Share cancelled or failed — no action needed
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onLongPress={onLongPress || handleShare}
      delayLongPress={400}
      activeOpacity={0.85}
    >
      {/* Gold top accent line */}
      <View style={styles.topAccent} />

      {/* Author name in Cinzel-inspired uppercase */}
      <Text style={styles.author}>{quote.author}</Text>

      <OrnamentalDivider style={styles.divider} />

      {/* Quote body */}
      <Text style={styles.quoteText}>{quote.text}</Text>

      {/* Footer: heart favorite button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.favoriteBtn}
          onPress={() => onFavorite && onFavorite(index)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.heartIcon, isFavorite && styles.heartActive]}>
            {isFavorite ? '❤️' : '🤍'}
          </Text>
          <Text style={[styles.favoriteLabel, isFavorite && styles.favoriteLabelActive]}>
            {isFavorite ? 'Favoritdə' : 'Favorit et'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareLabel}>Paylaş</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.stoneLight,
  },
  topAccent: {
    height: 2,
    backgroundColor: colors.gold,
    opacity: 0.8,
  },
  author: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    color: colors.gold,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 20,
    marginHorizontal: 20,
  },
  divider: {
    marginHorizontal: 20,
  },
  quoteText: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 26,
    fontStyle: 'italic',
    color: colors.cream,
    textAlign: 'center',
    marginHorizontal: 24,
    marginBottom: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.stoneLight,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  favoriteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heartIcon: {
    fontSize: 16,
  },
  heartActive: {
    // emoji handles color — no extra style needed
  },
  favoriteLabel: {
    fontSize: 12,
    color: colors.stone,
    marginLeft: 6,
  },
  favoriteLabelActive: {
    color: colors.gold,
  },
  shareBtn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.goldDim,
  },
  shareLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.goldDim,
    textTransform: 'uppercase',
  },
});
