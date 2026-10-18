import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

interface Props {
  message?: string;
}

export const LoadingIndicator: React.FC<Props> = ({ message = 'Đang tải dữ liệu...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  text: {
    marginTop: 14,
    fontSize: 15,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});
