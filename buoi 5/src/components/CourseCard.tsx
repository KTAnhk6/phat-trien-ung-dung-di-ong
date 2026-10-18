import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Course } from '@/types';
import { Colors, getCategoryColor } from '@/constants/colors';
import { ImageWithFallback } from './ImageWithFallback';

interface Props {
  course: Course;
  categoryName?: string;
  onPress: () => void;
}

export const formatPrice = (price: number): string => {
  if (price === 0) return 'Miễn phí';
  return price.toLocaleString('vi-VN') + ' ₫';
};

export const CourseCard: React.FC<Props> = ({ course, categoryName, onPress }) => {
  const categoryTheme = getCategoryColor(course.categoryId);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.thumbnailWrapper}>
        <ImageWithFallback uri={course.thumbnail} style={styles.thumbnail} />
        <View
          style={[
            styles.categoryBadge,
            { backgroundColor: categoryTheme.bg, borderColor: categoryTheme.border },
          ]}
        >
          <Text style={[styles.categoryBadgeText, { color: categoryTheme.text }]}>
            {categoryName || `Danh mục #${course.categoryId}`}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText} numberOfLines={1}>
            👨‍🏫 {course.instructor}
          </Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>⏱️ {course.duration}h</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.priceLabel}>Học phí:</Text>
          <Text style={styles.price}>{formatPrice(course.price)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  thumbnailWrapper: {
    width: '100%',
    height: 160,
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  thumbnail: {
    width: '100%',
    height: 160,
  },
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    padding: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  metaDot: {
    marginHorizontal: 8,
    color: Colors.textSubtle,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
});
