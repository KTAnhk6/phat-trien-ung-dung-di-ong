/**
 * MSSV: BIT240023
 * Dish Form Screen (Create & Edit Dish)
 * - Category selection from stored categories
 * - Strict validations:
 *   + Name not empty
 *   + Price > 0
 *   + PreparationTime > 0
 *   + DishCategoryId valid
 *   + Dish name unique in the same category
 * - Multiple Image URLs management with single Thumbnail selector
 * - Availability toggle
 */

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { SafeImage } from '../components/SafeImage';
import { colors } from '../theme/colors';
import { BIT240023_Dish, BIT240023_DishImage } from '../types';

interface DishFormScreenProps {
  dishId?: string; // If provided, edit mode; otherwise, create mode
}

export const DishFormScreen: React.FC<DishFormScreenProps> = ({ dishId }) => {
  const { dishes, categories, addDish, updateDish, validateDish, goBack, t } = useApp();

  const isEditMode = !!dishId;
  const existingDish = isEditMode ? dishes.find(d => d.BIT240023_Id === dishId) : null;

  // Form Fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<BIT240023_DishImage[]>([]);

  // Category Picker Modal
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);

  // Add Image URL Input
  const [newImageUrl, setNewImageUrl] = useState('');
  const [addImageInputVisible, setAddImageInputVisible] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Form errors
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Populate data when editing
  useEffect(() => {
    if (existingDish) {
      setName(existingDish.BIT240023_Name);
      setPrice(existingDish.BIT240023_Price.toString());
      setPrepTime(existingDish.BIT240023_PreparationTime.toString());
      setCategoryId(existingDish.BIT240023_DishCategoryId);
      setIsAvailable(existingDish.BIT240023_IsAvailable);
      setDescription(existingDish.BIT240023_Description);
      setImages(existingDish.BIT240023_DishImage || []);
    } else {
      // Create mode: select first category by default if available
      if (categories.length > 0) {
        setCategoryId(categories[0].BIT240023_Id);
      }
    }
  }, [existingDish, categories]);

  const handleAddImageUrl = () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setImageError(t('invalidImageUrl'));
      return;
    }

    const hasThumbnail = images.some(img => img.BIT240023_IsThumbnail);
    const newImage: BIT240023_DishImage = {
      BIT240023_ImageUrl: trimmed,
      BIT240023_IsThumbnail: !hasThumbnail, // First added image becomes thumbnail
    };

    setImages(prev => [...prev, newImage]);
    setNewImageUrl('');
    setImageError(null);
    setAddImageInputVisible(false);
  };

  const handleSetThumbnail = (targetUrl: string) => {
    setImages(prev =>
      prev.map(img => ({
        ...img,
        BIT240023_IsThumbnail: img.BIT240023_ImageUrl === targetUrl,
      }))
    );
  };

  const handleRemoveImage = (targetUrl: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.BIT240023_ImageUrl !== targetUrl);
      if (filtered.length > 0 && !filtered.some(img => img.BIT240023_IsThumbnail)) {
        filtered[0].BIT240023_IsThumbnail = true;
      }
      return filtered;
    });
  };

  const handleSubmit = async () => {
    const parsedPrice = parseFloat(price);
    const parsedPrepTime = parseInt(prepTime, 10);

    const draftDish: Partial<BIT240023_Dish> = {
      BIT240023_Name: name.trim(),
      BIT240023_Price: parsedPrice,
      BIT240023_PreparationTime: parsedPrepTime,
      BIT240023_DishCategoryId: categoryId,
      BIT240023_IsAvailable: isAvailable,
      BIT240023_Description: description.trim(),
      BIT240023_DishImage: images,
    };

    // Run business validations
    const validationResult = validateDish(draftDish, existingDish?.BIT240023_Id);

    if (!validationResult.valid) {
      setFormErrors(validationResult.errors);
      return;
    }

    setFormErrors([]);

    try {
      if (isEditMode && existingDish) {
        await updateDish({
          ...existingDish,
          BIT240023_Name: name.trim(),
          BIT240023_Price: parsedPrice,
          BIT240023_PreparationTime: parsedPrepTime,
          BIT240023_DishCategoryId: categoryId,
          BIT240023_IsAvailable: isAvailable,
          BIT240023_Description: description.trim(),
          BIT240023_DishImage: images,
        });
      } else {
        await addDish({
          BIT240023_Name: name.trim(),
          BIT240023_Price: parsedPrice,
          BIT240023_PreparationTime: parsedPrepTime,
          BIT240023_DishCategoryId: categoryId,
          BIT240023_IsAvailable: isAvailable,
          BIT240023_Description: description.trim(),
          BIT240023_DishImage: images,
        });
      }

      goBack();
    } catch {
      Alert.alert('Error', 'Failed to save dish. Please try again.');
    }
  };

  const selectedCategory = categories.find(c => c.BIT240023_Id === categoryId);

  return (
    <View style={styles.container}>
      <Header
        showBack
        title={isEditMode ? t('editDishTitle') : t('createDishTitle')}
      />

      <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
        {/* Error Messages Box */}
        {formErrors.length > 0 && (
          <View style={styles.errorBox}>
            <Text style={styles.errorBoxTitle}>⚠️ Validation Errors:</Text>
            {formErrors.map((err, idx) => (
              <Text key={idx} style={styles.errorBoxItem}>
                • {err}
              </Text>
            ))}
          </View>
        )}

        {/* Dish Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t('dishNameLabel')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('dishNamePlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={val => {
              setName(val);
              if (formErrors.length > 0) setFormErrors([]);
            }}
          />
        </View>

        {/* Price & Prep Time Row */}
        <View style={styles.twoColumnRow}>
          <View style={styles.fieldGroupFlex}>
            <Text style={styles.label}>{t('dishPriceLabel')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('dishPricePlaceholder')}
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={price}
              onChangeText={val => {
                setPrice(val.replace(/[^0-9]/g, ''));
                if (formErrors.length > 0) setFormErrors([]);
              }}
            />
          </View>

          <View style={styles.fieldGroupFlex}>
            <Text style={styles.label}>{t('dishPrepTimeLabel')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('dishPrepTimePlaceholder')}
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={prepTime}
              onChangeText={val => {
                setPrepTime(val.replace(/[^0-9]/g, ''));
                if (formErrors.length > 0) setFormErrors([]);
              }}
            />
          </View>
        </View>

        {/* Category Selector */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t('dishCategorySelectLabel')}</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setCategoryPickerVisible(true)}
            activeOpacity={0.8}>
            <Text
              style={[
                styles.selectButtonText,
                !selectedCategory && styles.selectPlaceholderText,
              ]}>
              {selectedCategory
                ? selectedCategory.BIT240023_Name
                : t('dishSelectCategoryPlaceholder')}
            </Text>
            <Text style={styles.selectArrow}>▾</Text>
          </TouchableOpacity>
        </View>

        {/* Availability Switch */}
        <View style={styles.switchGroup}>
          <View style={styles.switchTextCol}>
            <Text style={styles.switchLabel}>{t('dishAvailabilityLabel')}</Text>
            <Text style={styles.switchSubLabel}>
              {isAvailable ? t('badgeAvailable') : t('badgeUnavailable')}
            </Text>
          </View>
          <Switch
            value={isAvailable}
            onValueChange={setIsAvailable}
            trackColor={{ false: '#CCC', true: colors.primaryLight }}
            thumbColor={isAvailable ? colors.primary : '#F4F3F4'}
          />
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t('dishDescriptionLabel')}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t('dishDescriptionPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Images Section */}
        <View style={styles.imagesSection}>
          <View style={styles.imageSectionHeader}>
            <Text style={styles.label}>{t('imagesSectionTitle')}</Text>
            <TouchableOpacity
              style={styles.addImageBtn}
              onPress={() => setAddImageInputVisible(true)}>
              <Text style={styles.addImageBtnText}>{t('addImageBtn')}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.tipText}>{t('atLeastOneImageTip')}</Text>

          {/* Add Image URL Box */}
          {addImageInputVisible && (
            <View style={styles.addUrlBox}>
              <TextInput
                style={styles.urlInputField}
                placeholder={t('imageUrlPlaceholder')}
                placeholderTextColor={colors.textMuted}
                value={newImageUrl}
                onChangeText={val => {
                  setNewImageUrl(val);
                  setImageError(null);
                }}
                autoCapitalize="none"
              />
              {imageError && <Text style={styles.imageErrorText}>{imageError}</Text>}
              <View style={styles.addUrlActions}>
                <TouchableOpacity
                  style={styles.cancelUrlBtn}
                  onPress={() => {
                    setAddImageInputVisible(false);
                    setImageError(null);
                    setNewImageUrl('');
                  }}>
                  <Text style={styles.cancelUrlText}>{t('cancel')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.confirmUrlBtn}
                  onPress={handleAddImageUrl}>
                  <Text style={styles.confirmUrlText}>{t('create')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Images preview list */}
          {images.length > 0 ? (
            <View style={styles.imageListContainer}>
              {images.map((img, index) => (
                <View key={index} style={styles.imageItemRow}>
                  <SafeImage uri={img.BIT240023_ImageUrl} style={styles.itemImgThumb} />

                  <View style={styles.itemImgInfo}>
                    <Text style={styles.itemImgUrl} numberOfLines={1}>
                      {img.BIT240023_ImageUrl}
                    </Text>

                    <View style={styles.itemImgBottom}>
                      {img.BIT240023_IsThumbnail ? (
                        <View style={styles.thumbActivePill}>
                          <Text style={styles.thumbActivePillText}>
                            ★ {t('isThumbnailBadge')}
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.setAsThumbBtn}
                          onPress={() => handleSetThumbnail(img.BIT240023_ImageUrl)}>
                          <Text style={styles.setAsThumbBtnText}>
                            {t('setAsThumbnail')}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.deleteImgBtn}
                    onPress={() => handleRemoveImage(img.BIT240023_ImageUrl)}>
                    <Text style={styles.deleteImgBtnText}>🗑</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyImagesBox}>
              <Text style={styles.emptyImagesText}>📷 No images added yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Save Button Bar */}
      <View style={styles.saveButtonBar}>
        <TouchableOpacity style={styles.cancelBtn} onPress={goBack}>
          <Text style={styles.cancelBtnText}>{t('cancel')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
          <Text style={styles.submitBtnText}>
            {isEditMode ? t('update') : t('create')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Picker Modal */}
      <Modal
        visible={categoryPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryPickerVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.categoryModalCard}>
            <Text style={styles.categoryModalTitle}>{t('dishCategorySelectLabel')}</Text>
            <ScrollView style={styles.categoryScrollList}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.BIT240023_Id}
                  style={[
                    styles.categoryOptionItem,
                    categoryId === cat.BIT240023_Id && styles.categoryOptionItemSelected,
                  ]}
                  onPress={() => {
                    setCategoryId(cat.BIT240023_Id);
                    setCategoryPickerVisible(false);
                    if (formErrors.length > 0) setFormErrors([]);
                  }}>
                  <Text
                    style={[
                      styles.categoryOptionText,
                      categoryId === cat.BIT240023_Id &&
                        styles.categoryOptionTextSelected,
                    ]}>
                    {cat.BIT240023_Name}
                  </Text>
                  {categoryId === cat.BIT240023_Id && (
                    <Text style={styles.categoryCheckmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.categoryModalCloseBtn}
              onPress={() => setCategoryPickerVisible(false)}>
              <Text style={styles.categoryModalCloseText}>{t('close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  formScroll: {
    flex: 1,
    padding: 16,
  },
  errorBox: {
    backgroundColor: colors.dangerLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
    marginBottom: 4,
  },
  errorBoxItem: {
    fontSize: 12,
    color: colors.danger,
    marginLeft: 6,
    lineHeight: 18,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  fieldGroupFlex: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    height: 46,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.text,
  },
  textArea: {
    height: 90,
    paddingTop: 10,
  },
  selectButton: {
    height: 46,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectButtonText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  selectPlaceholderText: {
    color: colors.textMuted,
  },
  selectArrow: {
    fontSize: 16,
    color: colors.textMuted,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  switchTextCol: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  switchSubLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  imagesSection: {
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 40,
  },
  imageSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  addImageBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  addImageBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  tipText: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 12,
  },
  addUrlBox: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 14,
  },
  urlInputField: {
    height: 40,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 13,
    color: colors.text,
  },
  imageErrorText: {
    color: colors.danger,
    fontSize: 11,
    marginTop: 4,
  },
  addUrlActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
  },
  cancelUrlBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#EEE',
  },
  cancelUrlText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  confirmUrlBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  confirmUrlText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '700',
  },
  imageListContainer: {
    gap: 10,
  },
  imageItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  itemImgThumb: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  itemImgInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  itemImgUrl: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 4,
  },
  itemImgBottom: {
    flexDirection: 'row',
  },
  thumbActivePill: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  thumbActivePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  setAsThumbBtn: {
    backgroundColor: '#EAEAEA',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  setAsThumbBtnText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  deleteImgBtn: {
    padding: 8,
  },
  deleteImgBtnText: {
    fontSize: 16,
  },
  emptyImagesBox: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyImagesText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  saveButtonBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  submitBtn: {
    flex: 2,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  categoryModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 18,
  },
  categoryModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  categoryScrollList: {
    maxHeight: 300,
  },
  categoryOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  categoryOptionItemSelected: {
    backgroundColor: colors.primaryLight,
    borderRadius: 6,
  },
  categoryOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  categoryOptionTextSelected: {
    fontWeight: '700',
    color: colors.primaryDark,
  },
  categoryCheckmark: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  categoryModalCloseBtn: {
    marginTop: 14,
    alignItems: 'center',
    paddingVertical: 8,
  },
  categoryModalCloseText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
});
