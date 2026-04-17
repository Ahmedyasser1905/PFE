const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const config = getDefaultConfig(__dirname);
config.resolver.extraNodeModules = {
    'hoist-non-react-statics': path.resolve(__dirname, 'node_modules/hoist-non-react-statics'),
    'react-is': path.resolve(__dirname, 'node_modules/react-is'),
};
module.exports = config;
