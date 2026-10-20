/**
 * MSSV: BIT240023
 * Safe Image component with fallback placeholder for broken or invalid URLs
 */

import React, { useState } from 'react';
import { Image, ImageStyle, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

interface SafeImageProps {
  uri?: string;
  style?: ImageStyle;
  placeholderText?: string;
}

export const SafeImage: React.FC<SafeImageProps> = ({ uri, style, placeholderText = '🍜' }) => {
  const [hasError, setHasError] = useState(false);

  if (!uri || hasError) {
    return (
      <View style={[styles.placeholder, style]}>
        <Text style={styles.placeholderIcon}>{placeholderText}</Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={style}
      resizeMode="cover"
      onError={() => setHasError(true)}
    />
  );
};

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: '#EAEAEA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 32,
    color: colors.textMuted,
  },
});
