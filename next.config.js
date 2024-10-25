const { withExpo } = require('@expo/next-adapter');
const withTM = require('next-transpile-modules')(['react-native-web']);

module.exports = withExpo(
  withTM({
    projectRoot: __dirname,
  })
);
