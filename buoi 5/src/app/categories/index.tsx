import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ApiService } from '@/services/api';
import { Category, Course, CategoryFormData } from '@/types';
import { Colors } from '@/constants/colors';
import { CategoryModal } from '@/components/CategoryModal';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { ErrorView } from '@/components/ErrorView';
import { EmptyState } from '@/components/EmptyState';

export default function CategoryManagementScreen() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const catData = await ApiService.getCategories();
      setCategories(catData);

      try {
        const courseData = await ApiService.getCourses();
        setCourses(courseData);
      } catch (courseErr) {
        console.warn('Lỗi khi tải số lượng khóa học:', courseErr);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách danh mục.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Calculate course count per category to enforce delete constraint
  const courseCountPerCategory = useMemo(() => {
    const map: Record<string, number> = {};
    courses.forEach((course) => {
      map[course.categoryId] = (map[course.categoryId] || 0) + 1;
    });
    return map;
  }, [courses]);

  // Delete Category with Strict Constraint Checking (Assignment requirement 3.5)
  const handleDeleteCategory = (cat: Category) => {
    const assignedCoursesCount = courseCountPerCategory[cat.id] || 0;

    // Ràng buộc kiểm tra phía client: Không cho xóa nếu danh mục đang có khóa học
    if (assignedCoursesCount > 0) {
      const warningMessage = `Không thể xóa danh mục "${cat.name}" vì hiện đang có ${assignedCoursesCount} khóa học thuộc danh mục này!\n\nVui lòng xóa hoặc chuyển danh mục các khóa học đó trước khi xóa danh mục.`;
      if (Platform.OS === 'web') {
        window.alert(warningMessage);
      } else {
        Alert.alert('Không thể xóa danh mục', warningMessage, [{ text: 'Đã hiểu' }]);
      }
      return;
    }

    const executeDelete = async () => {
      try {
        setDeletingId(cat.id);
        await ApiService.deleteCategory(cat.id);
        if (Platform.OS === 'web') {
          window.alert(`Đã xóa danh mục "${cat.name}" thành công!`);
        } else {
          Alert.alert('Thành công', `Đã xóa danh mục "${cat.name}" thành công!`);
        }
        loadData(true);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi khi xóa danh mục.';
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Lỗi', msg);
      } finally {
        setDeletingId(null);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${cat.name}" không?`)) {
        executeDelete();
      }
    } else {
      Alert.alert(
        'Xác nhận xóa danh mục',
        `Bạn có chắc chắn muốn xóa danh mục "${cat.name}" không?`,
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Xóa danh mục', style: 'destructive', onPress: executeDelete },
        ]
      );
    }
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setModalVisible(true);
  };

  const handleSaveCategory = async (data: CategoryFormData) => {
    if (editingCategory) {
      await ApiService.updateCategory(editingCategory.id, data);
      if (Platform.OS === 'web') window.alert('Cập nhật danh mục thành công!');
      else Alert.alert('Thành công', 'Cập nhật danh mục thành công!');
    } else {
      await ApiService.createCategory(data);
      if (Platform.OS === 'web') window.alert('Thêm danh mục mới thành công!');
      else Alert.alert('Thành công', 'Thêm danh mục mới thành công!');
    }
    loadData(true);
  };

  if (loading && !refreshing) {
    return <LoadingIndicator message="Đang tải danh sách danh mục..." />;
  }

  if (error && categories.length === 0) {
    return <ErrorView message={error} onRetry={() => loadData()} />;
  }

  return (
    <View style={styles.container}>
      {/* Top Action Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.headerTitle}>Danh mục khóa học</Text>
          <Text style={styles.headerSubtitle}>
            Tổng cộng: {categories.length} danh mục | {courses.length} khóa học
          </Text>
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd} activeOpacity={0.85}>
          <Text style={styles.addBtnText}>➕ Thêm mới</Text>
        </TouchableOpacity>
      </View>

      {/* Info notice about delete constraint */}
      <View style={styles.noticeBox}>
        <Text style={styles.noticeIcon}>ℹ️</Text>
        <Text style={styles.noticeText}>
          Theo quy định, danh mục có chứa khóa học sẽ được bảo vệ và không thể xóa để đảm bảo toàn vẹn dữ liệu.
        </Text>
      </View>

      {/* Category List */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const count = courseCountPerCategory[item.id] || 0;
          const isDeleting = deletingId === item.id;

          return (
            <View style={styles.categoryCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardTitleWrapper}>
                  <Text style={styles.categoryName}>{item.name}</Text>
                  <View style={[styles.countBadge, count > 0 ? styles.countBadgeActive : null]}>
                    <Text
                      style={[
                        styles.countBadgeText,
                        count > 0 ? styles.countBadgeTextActive : null,
                      ]}
                    >
                      {count} khóa học
                    </Text>
                  </View>
                </View>
              </View>

              <Text style={styles.categoryDesc}>{item.description}</Text>

              {/* Action Buttons */}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => handleOpenEdit(item)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.editBtnText}>✏️ Chỉnh sửa</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.deleteBtn,
                    count > 0 ? styles.deleteBtnProtected : null,
                  ]}
                  onPress={() => handleDeleteCategory(item)}
                  disabled={isDeleting}
                  activeOpacity={0.7}
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color={Colors.danger} />
                  ) : (
                    <Text
                      style={[
                        styles.deleteBtnText,
                        count > 0 ? styles.deleteBtnTextProtected : null,
                      ]}
                    >
                      {count > 0 ? '🔒 Đang có khóa học' : '🗑️ Xóa danh mục'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="📁"
            title="Chưa có danh mục nào"
            message="Hãy thêm danh mục đầu tiên để phân loại các khóa học."
            actionLabel="➕ Thêm danh mục mới"
            onAction={handleOpenAdd}
          />
        }
      />

      {/* Modal for Add / Edit Category */}
      <CategoryModal
        visible={modalVisible}
        category={editingCategory}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveCategory}
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  noticeBox: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
  },
  noticeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: '#1E40AF',
    lineHeight: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  categoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardTitleWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  countBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countBadgeActive: {
    backgroundColor: Colors.primaryLight,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  countBadgeTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  categoryDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
    marginBottom: 14,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    paddingTop: 12,
  },
  editBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
  },
  deleteBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: Colors.dangerLight,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteBtnProtected: {
    backgroundColor: '#F8FAFC',
    borderColor: Colors.border,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.danger,
  },
  deleteBtnTextProtected: {
    color: Colors.textSubtle,
  },
});
