import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// based on standard screen (iPhone X)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

// scale width
export const scale = (size: number) =>
  (width / guidelineBaseWidth) * size;

// scale height
export const verticalScale = (size: number) =>
  (height / guidelineBaseHeight) * size;

// balanced scale
export const moderateScale = (size: number, factor = 0.5) =>
  size + (scale(size) - size) * factor;