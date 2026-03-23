// Typography constants for Stoic Companion app
import { colors } from './colors';

export const typography = {
  // Display / hero text
  displayLarge: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.cream,
    lineHeight: 40,
  },
  displayMedium: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: colors.cream,
    lineHeight: 32,
  },

  // Author / label style (Cinzel-inspired)
  authorName: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    color: colors.gold,
    textTransform: 'uppercase',
  },

  // Heading
  heading: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.cream,
  },
  subheading: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: colors.gold,
    textTransform: 'uppercase',
  },

  // Body
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 26,
    color: colors.cream,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
    color: colors.creamDim,
  },

  // Quote text
  quote: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 28,
    fontStyle: 'italic',
    color: colors.cream,
  },

  // Caption / meta
  caption: {
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 0.5,
    color: colors.stone,
  },

  // Button text
  button: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
};
