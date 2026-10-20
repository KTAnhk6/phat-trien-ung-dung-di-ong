/**
 * MSSV: BIT240023
 * Dish Detail Screen
 * - Multi-image gallery with thumbnail indicator
 * - Set / change thumbnail image directly
 * - Add image URL to dish
 * - Quick (<= 15 mins) / Regular (> 15 mins) badge
 * - Edit and Delete actions
 */

import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { SafeImage } from '../components/SafeImage';
import { ConfirmModal } from '../components/ConfirmModal';
import { colors } from '../theme/colors';

interface DishDetailScreenProps {
  dishId: string;
}

export const DishDetailScreen: React.FC<DishDetailScreenProps> = ({ dishId }) => {
  const {
    dishes,
    navigateToEdit,
    deleteDish,
    setThumbnailImage,
    addImageToDish,
    removeImageFromDish,
    getCategoryName,
    goBack,
    t,
  } = useApp();

  const dish = dishes.find(d => d.BIT240023_Id === dishId);

  // States
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAddImageModal, setShowAddImageModal] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imageUrlError, setImageUrlError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // If dish not found (e.g. deleted or invalid id)
  if (!dish) {
    return (
      <View style={styles.container}>
        <Header showBack title={t('dishDetailTitle')} />
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundEmoji}>⚠️</Text>
          <Text style={styles.notFoundText}>{t('dishNotFound')}</Text>
          <TouchableOpacity style={styles.backHomeBtn} onPress={goBack}>
            <Text style={styles.backHomeBtnText}>{t('back')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const isQuick = dish.BIT240023_PreparationTime <= 15;
  const images = dish.BIT240023_DishImage || [];
  const currentPreviewImage = images[selectedImageIndex]?.BIT240023_ImageUrl || '';

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' đ';
  };

  const handleAddImage = async () => {
    const trimmed = newImageUrl.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setImageUrlError(t('invalidImageUrl'));
      return;
    }

    await addImageToDish(dish.BIT240023_Id, trimmed);
    setNewImageUrl('');
    setImageUrlError(null);
    setShowAddImageModal(false);
    setSelectedImageIndex(images.length); // Select new image
  };

  const handleDeleteDish = async () => {
    await deleteDish(dish.BIT240023_Id);
    setShowDeleteConfirm(false);
    goBack();
  };

  return (
    <View style={styles.container}>
      <Header showBack title={t('dishDetailTitle')} />

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Preview Image */}
        <View style={styles.mainImageContainer}>
          <SafeImage uri={currentPreviewImage} style={styles.mainImage} />

          {/* Availability Floating Badge */}
          <View
            style={[
              styles.floatingStatusBadge,
              dish.BIT240023_IsAvailable
                ? styles.statusAvailable
                : styles.statusUnavailable,
            ]}>
            <Text
              style={[
                styles.floatingStatusText,
                dish.BIT240023_IsAvailable
                  ? styles.statusTextAvailable
                  : styles.statusTextUnavailable,
              ]}>
              {dish.BIT240023_IsAvailable ? t('badgeAvailable') : t('badgeUnavailable')}
            </Text>
          </View>
        </View>

        {/* Thumbnail Selector Strip (Multi-image Requirement 4.3) */}
        <View style={styles.imageGallerySection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>
              {t('imagesGalleryLabel')} ({images.length})
            </Text>
            <TouchableOpacity
              style={styles.addImageBtnSmall}
              onPress={() => setShowAddImageModal(true)}>
              <Text style={styles.addImageBtnSmallText}>+ {t('addImageUrl')}</Text>
            </TouchableOpacity>
          </View>

          {images.length === 0 ? (
            <Text style={styles.noImagesText}>{t('noImagesAvailable')}</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailStrip}>
              {images.map((img, idx) => (
                <View key={idx} style={styles.thumbnailCard}>
                  <TouchableOpacity
                    style={[
                      styles.thumbnailWrapper,
                      selectedImageIndex === idx && styles.thumbnailWrapperSelected,
                    ]}
                    onPress={() => setSelectedImageIndex(idx)}>
                    <SafeImage uri={img.BIT240023_ImageUrl} style={styles.thumbnailImg} />
                    {img.BIT240023_IsThumbnail && (
                      <View style={styles.thumbnailMarker}>
                        <Text style={styles.thumbnailMarkerText}>★</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Thumbnail action buttons */}
                  <View style={styles.thumbActionBtns}>
                    {!img.BIT240023_IsThumbnail ? (
                      <TouchableOpacity
                        style={styles.setThumbBtn}
                        onPress={() =>
                          setThumbnailImage(dish.BIT240023_Id, img.BIT240023_ImageUrl)
                        }>
                        <Text style={styles.setThumbText}>{t('setAsThumbnail')}</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.activeThumbBadge}>
                        <Text style={styles.activeThumbText}>{t('isThumbnailBadge')}</Text>
                      </View>
                    )}

                    {images.length > 1 && (
                      <TouchableOpacity
                        style={styles.removeImgBtn}
                        onPress={() =>
                          removeImageFromDish(dish.BIT240023_Id, img.BIT240023_ImageUrl)
                        }>
                        <Text style={styles.removeImgText}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Dish Information Card */}
        <View style={styles.detailsCard}>
          {/* Category */}
          <Text style={styles.categoryName}>
            {getCategoryName(dish.BIT240023_DishCategoryId)}
          </Text>

          {/* Dish Name */}
          <Text style={styles.dishTitle}>{dish.BIT240023_Name}</Text>

          {/* Price & Prep time badges */}
          <View style={styles.infoPillsRow}>
            <View style={styles.pricePill}>
              <Text style={styles.pricePillLabel}>{t('priceLabel')}</Text>
              <Text style={styles.pricePillValue}>{formatPrice(dish.BIT240023_Price)}</Text>
            </View>

            <View
              style={[
                styles.timePill,
                isQuick ? styles.quickPillBg : styles.regularPillBg,
              ]}>
              <Text style={styles.timePillLabel}>{t('prepTimeLabel')}</Text>
              <Text
                style={[
                  styles.timePillValue,
                  isQuick ? styles.quickText : styles.regularText,
                ]}>
                ⏱ {isQuick ? t('prepTimeQuick') : t('prepTimeRegular')} (
                {dish.BIT240023_PreparationTime} {t('minutesUnit')})
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>{t('descriptionLabel')}</Text>
            <Text style={styles.descriptionText}>
              {dish.BIT240023_Description || '—'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.deleteBarBtn}
          onPress={() => setShowDeleteConfirm(true)}
          activeOpacity={0.8}>
          <Text style={styles.deleteBarBtnText}>🗑 {t('delete')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editBarBtn}
          onPress={() => navigateToEdit(dish.BIT240023_Id)}
          activeOpacity={0.8}>
          <Text style={styles.editBarBtnText}>✏️ {t('edit')}</Text>
        </TouchableOpacity>
      </View>

      {/* Add Image URL Modal */}
      <Modal
        visible={showAddImageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddImageModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('addImageUrl')}</Text>
            <Text style={styles.modalPrompt}>{t('enterImageUrlPrompt')}</Text>

            <TextInput
              style={styles.urlInput}
              placeholder="https://images.unsplash.com/..."
              value={newImageUrl}
              onChangeText={val => {
                setNewImageUrl(val);
                setImageUrlError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {imageUrlError && <Text style={styles.modalError}>{imageUrlError}</Text>}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setShowAddImageModal(false);
                  setImageUrlError(null);
                  setNewImageUrl('');
                }}>
                <Text style={styles.modalCancelBtnText}>{t('cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalAddBtn} onPress={handleAddImage}>
                <Text style={styles.modalAddBtnText}>{t('create')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={showDeleteConfirm}
        title={t('deleteDishPromptTitle')}
        message={`${t('deleteDishPromptDesc')}\n(${dish.BIT240023_Name})`}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        isDanger={true}
        onConfirm={handleDeleteDish}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flex: 1,
  },
  mainImageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#000',
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  floatingStatusBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    elevation: 3,
  },
  statusAvailable: {
    backgroundColor: colors.availableBg,
  },
  statusUnavailable: {
    backgroundColor: colors.unavailableBg,
  },
  floatingStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusTextAvailable: {
    color: colors.available,
  },
  statusTextUnavailable: {
    color: colors.unavailable,
  },
  imageGallerySection: {
    backgroundColor: colors.surface,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  addImageBtnSmall: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  addImageBtnSmallText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  thumbnailStrip: {
    paddingHorizontal: 16,
    gap: 12,
  },
  thumbnailCard: {
    alignItems: 'center',
    width: 84,
  },
  thumbnailWrapper: {
    width: 80,
    height: 80,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  thumbnailWrapperSelected: {
    borderColor: colors.primary,
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  thumbnailMarker: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailMarkerText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
  },
  thumbActionBtns: {
    marginTop: 4,
    alignItems: 'center',
    width: '100%',
  },
  setThumbBtn: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  setThumbText: {
    fontSize: 9,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  activeThumbBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeThumbText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  removeImgBtn: {
    marginTop: 2,
    padding: 2,
  },
  removeImgText: {
    fontSize: 10,
    color: colors.danger,
    fontWeight: '700',
  },
  noImagesText: {
    fontSize: 13,
    color: colors.textMuted,
    paddingHorizontal: 16,
    fontStyle: 'italic',
  },
  detailsCard: {
    backgroundColor: colors.surface,
    padding: 18,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 14,
    marginHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  dishTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 28,
    marginBottom: 16,
  },
  infoPillsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  pricePill: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  pricePillLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  pricePillValue: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primary,
  },
  timePill: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  quickPillBg: {
    backgroundColor: colors.quickBg,
  },
  regularPillBg: {
    backgroundColor: colors.regularBg,
  },
  timePillLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
  },
  timePillValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  quickText: {
    color: colors.quick,
  },
  regularText: {
    color: colors.regular,
  },
  descriptionSection: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 14,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 12,
  },
  deleteBarBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBarBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.danger,
  },
  editBarBtn: {
    flex: 2,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBarBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  notFoundEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  notFoundText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  backHomeBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backHomeBtnText: {
    color: '#FFF',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  modalPrompt: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  urlInput: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
    color: colors.text,
  },
  modalError: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 6,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  modalCancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  modalAddBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  modalAddBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
});
