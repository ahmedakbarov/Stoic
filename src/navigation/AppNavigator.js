// AppNavigator — bottom tab navigation for Stoic Companion
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../constants/colors';

import HomeScreen from '../screens/HomeScreen';
import RitualsScreen from '../screens/RitualsScreen';
import JournalScreen from '../screens/JournalScreen';
import ChallengeScreen from '../screens/ChallengeScreen';
import QuotesScreen from '../screens/QuotesScreen';

const Tab = createBottomTabNavigator();

// Tab icon component — renders emoji label
function TabIcon({ emoji, focused }) {
  return (
    <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
      {emoji}
    </Text>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: colors.gold,
          tabBarInactiveTintColor: colors.stone,
          tabBarLabelStyle: styles.tabLabel,
          tabBarItemStyle: styles.tabItem,
        }}
      >
        <Tab.Screen
          name="Ana"
          component={HomeScreen}
          options={{
            tabBarLabel: 'Ana',
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="🏠" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Rituallar"
          component={RitualsScreen}
          options={{
            tabBarLabel: 'Rituallar',
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="📿" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Jurnal"
          component={JournalScreen}
          options={{
            tabBarLabel: 'Jurnal',
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="📖" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Tapşırıq"
          component={ChallengeScreen}
          options={{
            tabBarLabel: 'Tapşırıq',
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="⚡" focused={focused} />
            ),
          }}
        />
        <Tab.Screen
          name="Sitatlar"
          component={QuotesScreen}
          options={{
            tabBarLabel: 'Sitatlar',
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji="💬" focused={focused} />
            ),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background,
    borderTopColor: colors.tabBorder,
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabItem: {
    paddingTop: 2,
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  tabIconFocused: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
