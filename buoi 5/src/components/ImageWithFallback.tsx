import React, { useState } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Text, StyleProp, ImageStyle, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface Props {
  uri?: string;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  fallbackIcon?: string;
}

export const ImageWithFallback: React.FC<Props> = ({ uri, style, containerStyle, fallbackIcon = '📚' }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isValidUri = uri && uri.trim().length > 0 && !uri.includes('example.com');

  if (!isValidUri || error) {
    return (
      <View style={[styles.fallbackContainer, containerStyle, style as ViewStyle]}>
        <Text style={styles.fallbackIcon}>{fallbackIcon}</Text>
        <Text style={styles.fallbackText}>Không có ảnh</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      <Image
        source={{ uri }}
        style={style}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
        resizeMode="cover"
      />
      {loading && (
        <View style={[StyleSheet.absoluteFill, styles.loadingContainer]}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  loadingContainer: {
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackContainer: {
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  fallbackIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  fallbackText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});
