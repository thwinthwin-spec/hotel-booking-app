// Expo/Metro uses babel-preset-expo to transpile JSX and modern JavaScript.
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
