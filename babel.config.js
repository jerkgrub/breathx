module.exports = (api) => {
  api.cache(true);
  const isWeb = api.caller((caller) => caller && caller.name === 'next-babel-loader'); // Checks if running on web

  return {
    presets: [['babel-preset-expo', { jsxRuntime: 'automatic' }]],
    plugins: [
      [
        '@tamagui/babel-plugin',
        {
          components: ['tamagui'],
          config: './tamagui.config.ts',
          logTimings: true,
          disableExtraction: process.env.NODE_ENV === 'development',
        },
      ],
      // Only add Next.js's Babel config when running in the web environment
      isWeb && require.resolve('next/babel'),
      
      // NOTE: this is only necessary if you are using reanimated for animations
      'react-native-reanimated/plugin',
    ].filter(Boolean), // Filter out any 'false' plugins (e.g., when `isWeb` is false)
  };
};
