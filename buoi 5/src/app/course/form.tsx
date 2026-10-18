import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ApiService } from '@/services/api';
import { Category, CourseFormData } from '@/types';
import { Colors } from '@/constants/colors';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { SAMPLE_IMAGES, SAMPLE_TRAILERS } from '@/constants/sampleMedia';

export default function CourseFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const isEditing = !!id;

  const [loadingInitial, setLoadingInitial] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    categoryId: '',
    instructor: '',
    price: '',
    duration: '',
    thumbnail: '',
    trailerUrl: '',
  });

  // Load categories and existing course if editing
  useEffect(() => {
    async function loadData() {
      try {
        const catList = await ApiService.getCategories();
        setCategories(catList);

        if (isEditing && id) {
          const course = await ApiService.getCourseById(id);
          setFormData({
            title: course.title,
            description: course.description,
            categoryId: course.categoryId,
            instructor: course.instructor,
            price: course.price.toString(),
            duration: course.duration.toString(),
            thumbnail: course.thumbnail,
            trailerUrl: course.trailerUrl,
          });
        } else if (catList.length > 0) {
          // Default to first category if creating
          setFormData((prev) => ({ ...prev, categoryId: catList[0].id }));
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu ban đầu.';
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Lỗi', msg);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadData();
  }, [id, isEditing]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Vui lòng nhập tên khóa học.';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Vui lòng chọn danh mục khóa học.';
    } else {
      const exists = categories.some((c) => c.id === formData.categoryId);
      if (!exists) {
        newErrors.categoryId = 'Danh mục đã chọn không tồn tại trong hệ thống.';
      }
    }

    if (!formData.instructor.trim()) {
      newErrors.instructor = 'Vui lòng nhập tên giảng viên.';
    }

    const priceNum = parseFloat(formData.price);
    if (!formData.price.trim() || isNaN(priceNum) || priceNum < 0) {
      newErrors.price = 'Học phí phải là số không âm (>= 0 VNĐ).';
    }

    const durationNum = parseFloat(formData.duration);
    if (!formData.duration.trim() || isNaN(durationNum) || durationNum <= 0) {
      newErrors.duration = 'Thời lượng phải là số lớn hơn 0 (giờ).';
    }

    if (!formData.thumbnail.trim()) {
      newErrors.thumbnail = 'Vui lòng nhập URL ảnh bìa.';
    } else if (!formData.thumbnail.startsWith('http')) {
      newErrors.thumbnail = 'URL ảnh bìa phải bắt đầu bằng http:// hoặc https://';
    }

    if (!formData.trailerUrl.trim()) {
      newErrors.trailerUrl = 'Vui lòng nhập URL video trailer.';
    } else if (!formData.trailerUrl.startsWith('http')) {
      newErrors.trailerUrl = 'URL trailer phải bắt đầu bằng http:// hoặc https://';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Vui lòng nhập mô tả khóa học.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      const alertMsg = 'Vui lòng kiểm tra lại các trường thông tin có đánh dấu đỏ.';
      if (Platform.OS === 'web') window.alert(alertMsg);
      else Alert.alert('Thông tin chưa hợp lệ', alertMsg);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        instructor: formData.instructor.trim(),
        price: parseFloat(formData.price),
        duration: parseFloat(formData.duration),
        thumbnail: formData.thumbnail.trim(),
        trailerUrl: formData.trailerUrl.trim(),
      };

      if (isEditing && id) {
        await ApiService.updateCourse(id, payload);
        if (Platform.OS === 'web') {
          window.alert('Cập nhật khóa học thành công!');
        } else {
          Alert.alert('Thành công', 'Cập nhật khóa học thành công!');
        }
        router.replace({
          pathname: '/course/[id]',
          params: { id },
        });
      } else {
        const todayStr = new Date().toISOString().split('T')[0];
        await ApiService.createCourse({
          ...payload,
          createdAt: todayStr,
        });
        if (Platform.OS === 'web') {
          window.alert('Thêm khóa học mới thành công!');
        } else {
          Alert.alert('Thành công', 'Thêm khóa học mới thành công!');
        }
        router.replace('/');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Có lỗi xảy ra khi lưu dữ liệu.';
      if (Platform.OS === 'web') window.alert(msg);
      else Alert.alert('Lỗi', msg);
    } finally {
      setSaving(false);
    }
  };

  if (loadingInitial) {
    return <LoadingIndicator message="Đang tải form khóa học..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Form Header Info */}
        <View style={styles.headerBox}>
          <Text style={styles.headerTitle}>
            {isEditing ? '✏️ Chỉnh sửa thông tin khóa học' : '➕ Thêm khóa học mới'}
          </Text>
          <Text style={styles.headerSubtitle}>
            Các trường có dấu <Text style={styles.required}>*</Text> là bắt buộc.
          </Text>
        </View>

        {/* Course Title */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Tên khóa học <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.title ? styles.inputError : null]}
            placeholder="VD: Lập trình Android với Kotlin"
            placeholderTextColor={Colors.textSubtle}
            value={formData.title}
            onChangeText={(text) => {
              setFormData({ ...formData, title: text });
              if (errors.title) setErrors({ ...errors, title: '' });
            }}
          />
          {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}
        </View>

        {/* Category Dropdown/Selector */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Danh mục khóa học <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.categorySelectorContainer}>
            {categories.map((cat) => {
              const isSelected = formData.categoryId === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryOption,
                    isSelected && styles.categoryOptionSelected,
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, categoryId: cat.id });
                    if (errors.categoryId) setErrors({ ...errors, categoryId: '' });
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      isSelected && styles.categoryOptionTextSelected,
                    ]}
                  >
                    {isSelected ? '✓ ' : ''}{cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.categoryId ? <Text style={styles.errorText}>{errors.categoryId}</Text> : null}
        </View>

        {/* Instructor */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Giảng viên phụ trách <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.instructor ? styles.inputError : null]}
            placeholder="VD: Nguyễn Văn A"
            placeholderTextColor={Colors.textSubtle}
            value={formData.instructor}
            onChangeText={(text) => {
              setFormData({ ...formData, instructor: text });
              if (errors.instructor) setErrors({ ...errors, instructor: '' });
            }}
          />
          {errors.instructor ? <Text style={styles.errorText}>{errors.instructor}</Text> : null}
        </View>

        {/* Price & Duration Row */}
        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>
              Học phí (VNĐ) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.price ? styles.inputError : null]}
              placeholder="VD: 500000"
              placeholderTextColor={Colors.textSubtle}
              value={formData.price}
              keyboardType="numeric"
              onChangeText={(text) => {
                setFormData({ ...formData, price: text });
                if (errors.price) setErrors({ ...errors, price: '' });
              }}
            />
            {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
          </View>

          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>
              Thời lượng (giờ) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, errors.duration ? styles.inputError : null]}
              placeholder="VD: 30"
              placeholderTextColor={Colors.textSubtle}
              value={formData.duration}
              keyboardType="numeric"
              onChangeText={(text) => {
                setFormData({ ...formData, duration: text });
                if (errors.duration) setErrors({ ...errors, duration: '' });
              }}
            />
            {errors.duration ? <Text style={styles.errorText}>{errors.duration}</Text> : null}
          </View>
        </View>

        {/* Thumbnail URL with live preview */}
        <View style={styles.field}>
          <Text style={styles.label}>
            URL ảnh bìa (Thumbnail) <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.thumbnail ? styles.inputError : null]}
            placeholder="https://images.unsplash.com/..."
            placeholderTextColor={Colors.textSubtle}
            value={formData.thumbnail}
            onChangeText={(text) => {
              setFormData({ ...formData, thumbnail: text });
              if (errors.thumbnail) setErrors({ ...errors, thumbnail: '' });
            }}
          />
          {errors.thumbnail ? <Text style={styles.errorText}>{errors.thumbnail}</Text> : null}

          {/* Quick sample image buttons */}
          <View style={styles.sampleRow}>
            <Text style={styles.sampleTitle}>Ảnh mẫu tham khảo:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {SAMPLE_IMAGES.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.sampleChip}
                  onPress={() => {
                    setFormData({ ...formData, thumbnail: item.url });
                    if (errors.thumbnail) setErrors({ ...errors, thumbnail: '' });
                  }}
                >
                  <Text style={styles.sampleChipText}>📷 {item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Live Thumbnail Preview */}
          {formData.thumbnail.trim().length > 0 && (
            <View style={styles.previewBox}>
              <Text style={styles.previewLabel}>Xem trước ảnh bìa:</Text>
              <ImageWithFallback uri={formData.thumbnail} style={styles.previewImage} />
            </View>
          )}
        </View>

        {/* Trailer URL */}
        <View style={styles.field}>
          <Text style={styles.label}>
            URL video trailer (MP4 hoặc YouTube) <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.trailerUrl ? styles.inputError : null]}
            placeholder="https://.../video.mp4 hoặc YouTube"
            placeholderTextColor={Colors.textSubtle}
            value={formData.trailerUrl}
            onChangeText={(text) => {
              setFormData({ ...formData, trailerUrl: text });
              if (errors.trailerUrl) setErrors({ ...errors, trailerUrl: '' });
            }}
          />
          {errors.trailerUrl ? <Text style={styles.errorText}>{errors.trailerUrl}</Text> : null}

          {/* Quick sample trailer buttons */}
          <View style={styles.sampleRow}>
            <Text style={styles.sampleTitle}>Trailer mẫu tham khảo:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {SAMPLE_TRAILERS.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.sampleChip}
                  onPress={() => {
                    setFormData({ ...formData, trailerUrl: item.url });
                    if (errors.trailerUrl) setErrors({ ...errors, trailerUrl: '' });
                  }}
                >
                  <Text style={styles.sampleChipText}>🎬 {item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>
            Mô tả khóa học <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea, errors.description ? styles.inputError : null]}
            placeholder="Nhập nội dung, lộ trình chi tiết của khóa học..."
            placeholderTextColor={Colors.textSubtle}
            value={formData.description}
            onChangeText={(text) => {
              setFormData({ ...formData, description: text });
              if (errors.description) setErrors({ ...errors, description: '' });
            }}
            multiline
            numberOfLines={4}
          />
          {errors.description ? (
            <Text style={styles.errorText}>{errors.description}</Text>
          ) : null}
        </View>

        {/* Save & Cancel Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
            disabled={saving}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelBtnText}>Hủy bỏ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveBtnText}>
                {isEditing ? '💾 Cập nhật khóa học' : '🚀 Thêm khóa học'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
  headerBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  field: {
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  required: {
    color: Colors.danger,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text,
  },
  inputError: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerLight,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  categorySelectorContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
  },
  categoryOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  categoryOptionTextSelected: {
    color: '#FFFFFF',
  },
  sampleRow: {
    marginTop: 8,
  },
  sampleTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 4,
  },
  sampleChip: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    marginRight: 8,
  },
  sampleChipText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '500',
  },
  previewBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 6,
  },
  previewImage: {
    width: '100%',
    height: 140,
    borderRadius: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: Colors.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});
