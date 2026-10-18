import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Platform,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ApiService } from '@/services/api';
import { Course, Category } from '@/types';
import { Colors } from '@/constants/colors';
import { CourseCard } from '@/components/CourseCard';
import { CategoryPills } from '@/components/CategoryPills';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorView } from '@/components/ErrorView';
import { EmptyState } from '@/components/EmptyState';

export default function CourseListScreen() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const coursesRef = useRef<Course[]>([]);

  // Load courses and categories from MockAPI
  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else if (coursesRef.current.length === 0) setLoading(true);
      setError(null);

      const [courseData, categoryData] = await Promise.all([
        ApiService.getCourses(),
        ApiService.getCategories(),
      ]);

      coursesRef.current = courseData;
      setCourses(courseData);
      setCategories(categoryData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi kết nối tới máy chủ MockAPI';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // Map categoryId to Category Name for fast O(1) lookup
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => map.set(cat.id, cat.name));
    return map;
  }, [categories]);

  // Filtered courses based on search text and selected category
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchesCategory = selectedCategoryId ? course.categoryId === selectedCategoryId : true;
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchQuery, selectedCategoryId]);

  if (loading && !refreshing) {
    return <LoadingIndicator message="Đang tải danh sách khóa học..." />;
  }

  if (error && courses.length === 0) {
    return <ErrorView message={error} onRetry={() => fetchData()} />;
  }

  return (
    <View style={styles.container}>
      {/* Top Action Header Bar */}
      <View style={styles.topBar}>
        <View style={[styles.searchWrapper, isSearchFocused && styles.searchWrapperFocused]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm khóa học theo tên..."
            placeholderTextColor={Colors.textSubtle}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn} activeOpacity={0.7}>
              <Text style={styles.clearBtnText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.categoryManageBtn}
          onPress={() => router.push('/categories')}
          activeOpacity={0.8}
        >
          <Text style={styles.categoryManageText}>📁 Danh mục</Text>
        </TouchableOpacity>
      </View>

      {/* Category Pills Filter */}
      <View style={styles.filterSection}>
        <CategoryPills
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={setSelectedCategoryId}
          totalCoursesCount={courses.length}
        />
      </View>

      {/* Course Count Summary */}
      <View style={styles.summaryBar}>
        <Text style={styles.summaryText}>
          {filteredCourses.length === courses.length
            ? `Tất cả (${courses.length} khóa học)`
            : `Tìm thấy ${filteredCourses.length} trên ${courses.length} khóa học`}
        </Text>
        {(searchQuery || selectedCategoryId) && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setSelectedCategoryId(null);
            }}
          >
            <Text style={styles.resetFilterText}>Đặt lại bộ lọc</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Course List */}
      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CourseCard
            course={item}
            categoryName={categoryMap.get(item.categoryId)}
            onPress={() =>
              router.push({
                pathname: '/course/[id]',
                params: { id: item.id },
              })
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchData(true)}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={searchQuery || selectedCategoryId ? '🔍' : '📚'}
            title={
              searchQuery || selectedCategoryId
                ? 'Không tìm thấy khóa học nào'
                : 'Chưa có khóa học nào'
            }
            message={
              searchQuery || selectedCategoryId
                ? 'Vui lòng thử tìm kiếm với từ khóa khác hoặc bỏ chọn bộ lọc danh mục.'
                : 'Hãy bắt đầu thêm khóa học đầu tiên vào hệ thống.'
            }
            actionLabel={
              searchQuery || selectedCategoryId ? 'Xem tất cả khóa học' : '➕ Thêm khóa học mới'
            }
            onAction={
              searchQuery || selectedCategoryId
                ? () => {
                    setSearchQuery('');
                    setSelectedCategoryId(null);
                  }
                : () => router.push('/course/form')
            }
          />
        }
      />

      {/* Floating Action Button (Add Course) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/course/form')}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  searchWrapperFocused: {
    borderColor: Colors.primary,
    backgroundColor: '#FFFFFF',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
    height: '100%',
    paddingVertical: 0,
    ...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {}),
  },
  clearBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  clearBtnText: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  categoryManageBtn: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
  },
  categoryManageText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  summaryBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  resetFilterText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '300',
  },
});
