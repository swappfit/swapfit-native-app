const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  resolver: {
    // Enable case-insensitive file resolution
    resolveRequest: (context, moduleName, platform) => {
      // Handle case-insensitive imports for context files
      if (moduleName.includes('context/')) {
        const possibleNames = [
          moduleName,
          moduleName.replace(/[A-Z]/g, (match) => match.toLowerCase()),
          moduleName.replace(/[a-z]/g, (match) => match.toUpperCase()),
        ];
        
        for (const name of possibleNames) {
          try {
            const resolved = context.resolveRequest(context, name, platform);
            if (resolved) {
              return resolved;
            }
          } catch (e) {
            // Continue to next possible name
          }
        }
      }
      
      // Default resolution
      return context.resolveRequest(context, moduleName, platform);
    },
    // Add source extensions to resolve
    sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx'],
    // Add platform extensions
    platforms: ['ios', 'android', 'native', 'web'],
  },
  // Improve watchman configuration
  watchFolders: [],
  // Add transformer configuration
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
