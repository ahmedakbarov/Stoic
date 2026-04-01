// Metro config for Expo SDK 51 — must use expo/metro-config, not @react-native/metro-config
// Expo's Gradle task (createBundleReleaseJsAndAssets) calls expo export:embed which
// requires the Expo serializer to be registered via expo/metro-config.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;
