/**
 * MSSV: BIT240023
 * Category Management Screen
 * - List all dish categories
 * - Display dish count per category
 * - Add new category
 * - Delete category with strict constraint enforcement:
 *   "Không cho xóa loại món đang được sử dụng" (Requirement 4.4)
 */

import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { ConfirmModal } from '../components/ConfirmModal';
import { colors } from '../theme/colors';
import { BIT240023_DishCategory } from '../types';

export const CategoryManageScreen: React.FC = () => {
  const { categories, dishes, addCategory, deleteCategory, t } = useApp();

  // Add Category Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [addCatError, setAddCatError] = useState<string | null>(null);

  // Delete Category Confirmation
  const [catToDelete, setCatToDelete] = useState<BIT240023_DishCategory | null>(null);

  const handleAddCategory = async () => {
    if (!newCatName.trim()) {
      setAddCatError(t('errCategoryNameRequired'));
      return;
    }

    await addCategory(newCatName.trim(), newCatDesc.trim());
    setNewCatName('');
    setNewCatDesc('');
    setAddCatError(null);
    setShowAddModal(false);
  };

  const handleDeletePress = (category: BIT240023_DishCategory) => {
    // Constraint check
    const inUseCount = dishes.filter(d => d.BIT240023_DishCategoryId === category.BIT240023_Id).length;
    if (inUseCount > 0) {
      Alert.alert(
        '⚠️ ' + t('categoryDeleteConfirmTitle'),
        t('errCategoryInUse', { count: inUseCount }),
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    setCatToDelete(category);
  };

  const handleConfirmDelete = async () => {
    if (catToDelete) {
      const result = await deleteCategory(catToDelete.BIT240023_Id);
      if (!result.success) {
        Alert.alert(
          'Error',
          t('errCategoryInUse', { count: result.inUseCount || 1 })
        );
      }
      setCatToDelete(null);
    }
  };

  const renderCategoryItem = ({ item }: { item: BIT240023_DishCategory }) => {
    const dishCount = dishes.filter(d => d.BIT240023_DishCategoryId === item.BIT240023_Id).length;

    return (
      <View style={styles.catCard}>
        <View style={styles.catInfo}>
          <Text style={styles.catName}>{item.BIT240023_Name}</Text>
          {item.BIT240023_Description ? (
            <Text style={styles.catDesc}>{item.BIT240023_Description}</Text>
          ) : null}
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{t('dishCount', { count: dishCount })}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.deleteCatBtn}
          onPress={() => handleDeletePress(item)}
          activeOpacity={0.7}>
          <Text style={styles.deleteCatBtnText}>🗑</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header showBack title={t('categoryManagementTitle')} />

      <View style={styles.topBar}>
        <Text style={styles.headerSubtitle}>
          {t('totalItems')} {categories.length}
        </Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}>
          <Text style={styles.addBtnText}>+ {t('addCategory')}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={item => item.BIT240023_Id}
        renderItem={renderCategoryItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Add Category Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('addCategory')}</Text>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>{t('categoryName')} *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder={t('categoryNamePlaceholder')}
                value={newCatName}
                onChangeText={val => {
                  setNewCatName(val);
                  setAddCatError(null);
                }}
              />
              {addCatError && <Text style={styles.errorText}>{addCatError}</Text>}
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>{t('categoryDesc')}</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder={t('categoryDescPlaceholder')}
                value={newCatDesc}
                onChangeText={setNewCatDesc}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => {
                  setShowAddModal(false);
                  setNewCatName('');
                  setNewCatDesc('');
                  setAddCatError(null);
                }}>
                <Text style={styles.modalCancelBtnText}>{t('cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleAddCategory}>
                <Text style={styles.modalConfirmBtnText}>{t('create')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        visible={catToDelete !== null}
        title={t('categoryDeleteConfirmTitle')}
        message={t('categoryDeleteConfirmDesc', { name: catToDelete?.BIT240023_Name || '' })}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        isDanger={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setCatToDelete(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  catCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  catInfo: {
    flex: 1,
  },
  catName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  catDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  countBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  deleteCatBtn: {
    padding: 10,
    backgroundColor: colors.dangerLight,
    borderRadius: 8,
    marginLeft: 10,
  },
  deleteCatBtnText: {
    fontSize: 16,
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
    marginBottom: 16,
  },
  modalField: {
    marginBottom: 14,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
  },
  modalInput: {
    height: 44,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.text,
  },
  modalTextArea: {
    height: 70,
    paddingTop: 8,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
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
  modalConfirmBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  modalConfirmBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
});
