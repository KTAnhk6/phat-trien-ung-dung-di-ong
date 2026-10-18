import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { ApiService } from '@/services/api';
import { Course, Category } from '@/types';
import { Colors, getCategoryColor } from '@/constants/colors';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { VideoPlayerModal } from '@/components/VideoPlayerModal';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorView } from '@/components/ErrorView';
import { formatPrice } from '@/components/CourseCard';

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trailerModalVisible, setTrailerModalVisible] = useState(false);

  const courseRef = useRef<Course | null>(null);

  const fetchCourseDetail = useCallback(async () => {
    if (!id) return;
    try {
      if (!courseRef.current) {
        setLoading(true);
      }
      setError(null);

      const courseData = await ApiService.getCourseById(id);
      courseRef.current = courseData;
      setCourse(courseData);

      // Fetch category by categoryId from API (strictly not hardcoded)
      try {
        const catData = await ApiService.getCategoryById(courseData.categoryId);
        setCategory(catData);
      } catch {
        // If single category endpoint fails, fallback to categories list
        const allCats = await ApiService.getCategories();
        const matched = allCats.find((c) => c.id === courseData.categoryId);
        if (matched) setCategory(matched);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải thông tin khóa học.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchCourseDetail();
    }, [fetchCourseDetail])
  );

  const handleDelete = () => {
    if (!course) return;

    const performDelete = async () => {
      try {
        setDeleting(true);
        await ApiService.deleteCourse(course.id);
        if (Platform.OS === 'web') {
          window.alert('Đã xóa khóa học thành công!');
        } else {
          Alert.alert('Thành công', 'Đã xóa khóa học thành công!');
        }
        router.replace('/');
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Không thể xóa khóa học.';
        if (Platform.OS === 'web') {
          window.alert(msg);
        } else {
          Alert.alert('Lỗi', msg);
        }
      } finally {
        setDeleting(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Bạn có chắc chắn muốn xóa khóa học "${course.title}" không?`)) {
        performDelete();
      }
    } else {
      Alert.alert(
        'Xác nhận xóa',
        `Bạn có chắc chắn muốn xóa khóa học "${course.title}" không? Hành động này không thể hoàn tác.`,
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Xóa khóa học', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  };

  if (loading) {
    return <LoadingIndicator message="Đang tải chi tiết khóa học..." />;
  }

  if (error || !course) {
    return (
      <ErrorView
        message={error || 'Không tìm thấy thông tin khóa học.'}
        onRetry={fetchCourseDetail}
      />
    );
  }

  const categoryTheme = getCategoryColor(course.categoryId);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Image & Trailer Overlay */}
        <View style={styles.heroWrapper}>
          <ImageWithFallback uri={course.thumbnail} style={styles.heroImage} />
          
          {/* Overlay Trailer Button */}
          <TouchableOpacity
            style={styles.trailerPlayButton}
            onPress={() => setTrailerModalVisible(true)}
            activeOpacity={0.85}
          >
            <View style={styles.playIconCircle}>
              <Text style={styles.playIconText}>▶</Text>
            </View>
            <Text style={styles.trailerButtonText}>Xem Video Trailer</Text>
          </TouchableOpacity>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {/* Category Badge & Price Row */}
          <View style={styles.topInfoRow}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: categoryTheme.bg, borderColor: categoryTheme.border },
              ]}
            >
              <Text style={[styles.categoryBadgeText, { color: categoryTheme.text }]}>
                🏷️ {category?.name || `Danh mục #${course.categoryId}`}
              </Text>
            </View>

            <Text style={styles.priceTag}>{formatPrice(course.price)}</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{course.title}</Text>

          {/* Metadata Grid */}
          <View style={styles.metaGrid}>
            <View style={styles.metaCard}>
              <Text style={styles.metaIcon}>👨‍🏫</Text>
              <View>
                <Text style={styles.metaLabel}>Giảng viên</Text>
                <Text style={styles.metaValue}>{course.instructor}</Text>
              </View>
            </View>

            <View style={styles.metaCard}>
              <Text style={styles.metaIcon}>⏱️</Text>
              <View>
                <Text style={styles.metaLabel}>Thời lượng</Text>
                <Text style={styles.metaValue}>{course.duration} giờ học</Text>
              </View>
            </View>

            <View style={styles.metaCard}>
              <Text style={styles.metaIcon}>📅</Text>
              <View>
                <Text style={styles.metaLabel}>Ngày tạo</Text>
                <Text style={styles.metaValue}>{course.createdAt || 'N/A'}</Text>
              </View>
            </View>

            <View style={styles.metaCard}>
              <Text style={styles.metaIcon}>🆔</Text>
              <View>
                <Text style={styles.metaLabel}>Mã khóa học</Text>
                <Text style={styles.metaValue}>#{course.id}</Text>
              </View>
            </View>
          </View>

          {/* Description Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mô tả khóa học</Text>
            <Text style={styles.description}>{course.description}</Text>
          </View>

          {/* Category Info Box */}
          {category && (
            <View style={styles.categoryInfoBox}>
              <Text style={styles.categoryInfoTitle}>Về danh mục "{category.name}"</Text>
              <Text style={styles.categoryInfoDesc}>{category.description}</Text>
            </View>
          )}

          {/* Trailer Link Info */}
          <View style={styles.trailerInfoBox}>
            <Text style={styles.trailerInfoLabel}>🎬 Link video trailer:</Text>
            <Text style={styles.trailerInfoUrl} numberOfLines={1}>
              {course.trailerUrl}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          disabled={deleting}
          activeOpacity={0.8}
        >
          {deleting ? (
            <ActivityIndicator size="small" color={Colors.danger} />
          ) : (
            <Text style={styles.deleteButtonText}>🗑️ Xóa</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() =>
            router.push({
              pathname: '/course/form',
              params: { id: course.id },
            })
          }
          activeOpacity={0.85}
        >
          <Text style={styles.editButtonText}>✏️ Chỉnh sửa khóa học</Text>
        </TouchableOpacity>
      </View>

      {/* Video Player Modal */}
      <VideoPlayerModal
        visible={trailerModalVisible}
        videoUrl={course.trailerUrl}
        courseTitle={course.title}
        onClose={() => setTrailerModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroWrapper: {
    width: '100%',
    height: 240,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  heroImage: {
    width: '100%',
    height: 240,
  },
  trailerPlayButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  playIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  playIconText: {
    color: '#FFFFFF',
    fontSize: 10,
    marginLeft: 2,
  },
  trailerButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -16,
  },
  topInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  priceTag: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.primary,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 30,
    marginBottom: 18,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    width: '48%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metaIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  metaLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#334155',
  },
  categoryInfoBox: {
    backgroundColor: Colors.primaryLight,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  categoryInfoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primaryDark,
    marginBottom: 4,
  },
  categoryInfoDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  trailerInfoBox: {
    backgroundColor: '#F1F5F9',
    padding: 12,
    borderRadius: 10,
  },
  trailerInfoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 2,
  },
  trailerInfoUrl: {
    fontSize: 12,
    color: Colors.primary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  deleteButton: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: Colors.danger,
    fontWeight: '700',
    fontSize: 14,
  },
  editButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  editButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
