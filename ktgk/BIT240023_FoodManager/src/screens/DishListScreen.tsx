/**
 * MSSV: BIT240023
 * Dish List Screen with Multi-criteria Filter, Search, Sort & Operations
 */

import React, { useMemo, useState } from 'react';
import {
  FlatList,
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
import { FilterModal } from '../components/FilterModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { colors } from '../theme/colors';
import { BIT240023_Dish } from '../types';

export const DishListScreen: React.FC = () => {
  const {
    dishes,
    categories,
    filterState,
    setFilterState,
    resetFilterState,
    navigateToDetail,
    navigateToCreate,
    navigateToEdit,
    navigateToCategories,
    deleteDish,
    getCategoryName,
    t,
  } = useApp();

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [dishToDelete, setDishToDelete] = useState<BIT240023_Dish | null>(null);

  // Multi-criteria Filtering & Sorting Logic
  const filteredAndSortedDishes = useMemo(() => {
    let result = [...dishes];

    // 1. Search by name (partial match, case-insensitive)
    if (filterState.searchQuery.trim().length > 0) {
      const q = filterState.searchQuery.trim().toLowerCase();
      result = result.filter(d => d.BIT240023_Name.toLowerCase().includes(q));
    }

    // 2. Filter by Category
    if (filterState.categoryId && filterState.categoryId !== 'all') {
      result = result.filter(d => d.BIT240023_DishCategoryId === filterState.categoryId);
    }

    // 3. Filter by Status (Available / Unavailable / All)
    // Requirement 4.4: "món ngừng bán vẫn xuất hiện trong danh sách quản lý, nhưng không xuất hiện khi lọc trạng thái đang bán."
    if (filterState.status === 'available') {
      result = result.filter(d => d.BIT240023_IsAvailable === true);
    } else if (filterState.status === 'unavailable') {
      result = result.filter(d => d.BIT240023_IsAvailable === false);
    }

    // 4. Filter by Price Range
    const minP = filterState.minPrice ? parseFloat(filterState.minPrice) : null;
    const maxP = filterState.maxPrice ? parseFloat(filterState.maxPrice) : null;
    if (minP !== null && !isNaN(minP)) {
      result = result.filter(d => d.BIT240023_Price >= minP);
    }
    if (maxP !== null && !isNaN(maxP)) {
      result = result.filter(d => d.BIT240023_Price <= maxP);
    }

    // 5. Sorting
    if (filterState.sortBy === 'price_asc') {
      result.sort((a, b) => a.BIT240023_Price - b.BIT240023_Price);
    } else if (filterState.sortBy === 'price_desc') {
      result.sort((a, b) => b.BIT240023_Price - a.BIT240023_Price);
    } else if (filterState.sortBy === 'prep_time_asc') {
      result.sort((a, b) => a.BIT240023_PreparationTime - b.BIT240023_PreparationTime);
    }

    return result;
  }, [dishes, filterState]);

  // Check if any filter is active
  const hasActiveFilters =
    filterState.categoryId !== 'all' ||
    filterState.status !== 'all' ||
    filterState.minPrice !== '' ||
    filterState.maxPrice !== '' ||
    filterState.sortBy !== 'default';

  const handleDeleteConfirm = async () => {
    if (dishToDelete) {
      await deleteDish(dishToDelete.BIT240023_Id);
      setDishToDelete(null);
    }
  };

  // Format currency
  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' đ';
  };

  // Get primary thumbnail
  const getThumbnailUri = (dish: BIT240023_Dish): string => {
    if (!dish.BIT240023_DishImage || dish.BIT240023_DishImage.length === 0) {
      return '';
    }
    const thumb = dish.BIT240023_DishImage.find(img => img.BIT240023_IsThumbnail);
    return thumb ? thumb.BIT240023_ImageUrl : dish.BIT240023_DishImage[0].BIT240023_ImageUrl;
  };

  const renderDishItem = ({ item }: { item: BIT240023_Dish }) => {
    const isQuick = item.BIT240023_PreparationTime <= 15;
    const thumbnailUri = getThumbnailUri(item);

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.85}
        onPress={() => navigateToDetail(item.BIT240023_Id)}>
        {/* Dish Thumbnail */}
        <SafeImage uri={thumbnailUri} style={styles.cardImage} />

        {/* Content */}
        <View style={styles.cardContent}>
          <View style={styles.cardTopRow}>
            {/* Category tag */}
            <Text style={styles.cardCategory} numberOfLines={1}>
              {getCategoryName(item.BIT240023_DishCategoryId)}
            </Text>

            {/* Availability status badge */}
            <View
              style={[
                styles.statusBadge,
                item.BIT240023_IsAvailable
                  ? styles.statusAvailable
                  : styles.statusUnavailable,
              ]}>
              <Text
                style={[
                  styles.statusText,
                  item.BIT240023_IsAvailable
                    ? styles.statusTextAvailable
                    : styles.statusTextUnavailable,
                ]}>
                {item.BIT240023_IsAvailable ? t('badgeAvailable') : t('badgeUnavailable')}
              </Text>
            </View>
          </View>

          {/* Dish Name */}
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.BIT240023_Name}
          </Text>

          {/* Price & Prep time row */}
          <View style={styles.cardInfoRow}>
            <Text style={styles.cardPrice}>{formatPrice(item.BIT240023_Price)}</Text>

            {/* Quick / Regular badge (Requirement 4.3) */}
            <View
              style={[
                styles.prepTimeBadge,
                isQuick ? styles.quickBadge : styles.regularBadge,
              ]}>
              <Text
                style={[
                  styles.prepTimeText,
                  isQuick ? styles.quickText : styles.regularText,
                ]}>
                ⏱ {isQuick ? t('prepTimeQuick') : t('prepTimeRegular')} ({item.BIT240023_PreparationTime} {t('minutesUnit')})
              </Text>
            </View>
          </View>

          {/* Bottom Actions */}
          <View style={styles.cardActionsRow}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigateToEdit(item.BIT240023_Id)}>
              <Text style={styles.editBtnText}>✏️ {t('edit')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => setDishToDelete(item)}>
              <Text style={styles.deleteBtnText}>🗑 {t('delete')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Header />

      {/* Top Search & Filter Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={t('searchPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={filterState.searchQuery}
            onChangeText={text =>
              setFilterState(prev => ({ ...prev, searchQuery: text }))
            }
          />
          {filterState.searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setFilterState(prev => ({ ...prev, searchQuery: '' }))}
              style={styles.clearSearchBtn}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter & Sort Button */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            hasActiveFilters && styles.filterButtonActive,
          ]}
          onPress={() => setFilterModalVisible(true)}
          activeOpacity={0.8}>
          <Text
            style={[
              styles.filterButtonText,
              hasActiveFilters && styles.filterButtonTextActive,
            ]}>
            ⚙️ {t('filters')}
          </Text>
          {hasActiveFilters && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* Quick Category Scroll */}
      <View style={styles.categoryScrollWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContent}>
          <TouchableOpacity
            style={[
              styles.quickCategoryChip,
              filterState.categoryId === 'all' && styles.quickCategoryChipActive,
            ]}
            onPress={() => setFilterState(prev => ({ ...prev, categoryId: 'all' }))}>
            <Text
              style={[
                styles.quickCategoryText,
                filterState.categoryId === 'all' && styles.quickCategoryTextActive,
              ]}>
              {t('allCategories')}
            </Text>
          </TouchableOpacity>

          {categories.map(cat => (
            <TouchableOpacity
              key={cat.BIT240023_Id}
              style={[
                styles.quickCategoryChip,
                filterState.categoryId === cat.BIT240023_Id &&
                  styles.quickCategoryChipActive,
              ]}
              onPress={() =>
                setFilterState(prev => ({
                  ...prev,
                  categoryId: cat.BIT240023_Id,
                }))
              }>
              <Text
                style={[
                  styles.quickCategoryText,
                  filterState.categoryId === cat.BIT240023_Id &&
                    styles.quickCategoryTextActive,
                ]}>
                {cat.BIT240023_Name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Action shortcuts row (Total count + Add Dish + Categories) */}
      <View style={styles.actionBar}>
        <Text style={styles.totalCountText}>
          {t('totalItems')} {filteredAndSortedDishes.length}
        </Text>

        <View style={styles.topButtonsRow}>
          <TouchableOpacity
            style={styles.categoryManageBtn}
            onPress={navigateToCategories}
            activeOpacity={0.8}>
            <Text style={styles.categoryManageBtnText}>🏷 {t('manageCategories')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addDishBtn}
            onPress={navigateToCreate}
            activeOpacity={0.8}>
            <Text style={styles.addDishBtnText}>+ {t('addNewDish')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Dish List */}
      <FlatList
        data={filteredAndSortedDishes}
        keyExtractor={item => item.BIT240023_Id}
        renderItem={renderDishItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🍽</Text>
            <Text style={styles.emptyTitle}>{t('noDishesFound')}</Text>
            <Text style={styles.emptyDesc}>{t('noDishesDesc')}</Text>
            {hasActiveFilters && (
              <TouchableOpacity
                style={styles.resetFilterBtn}
                onPress={resetFilterState}>
                <Text style={styles.resetFilterText}>{t('clearFilters')}</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Filter Modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        visible={dishToDelete !== null}
        title={t('deleteDishPromptTitle')}
        message={`${t('deleteDishPromptDesc')}\n(${dishToDelete?.BIT240023_Name})`}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        isDanger={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDishToDelete(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
    backgroundColor: colors.surface,
  },
  searchBar: {
    flex: 1,
    height: 42,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },
  clearSearchText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '700',
  },
  filterButton: {
    height: 42,
    paddingHorizontal: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterButtonActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterButtonTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginLeft: 4,
  },
  categoryScrollWrapper: {
    backgroundColor: colors.surface,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickCategoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  quickCategoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  quickCategoryTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  totalCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  topButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryManageBtn: {
    backgroundColor: '#EFEFEF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  categoryManageBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  addDishBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addDishBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  cardContent: {
    padding: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primaryDark,
    flex: 1,
    marginRight: 8,
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusAvailable: {
    backgroundColor: colors.availableBg,
  },
  statusUnavailable: {
    backgroundColor: colors.unavailableBg,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextAvailable: {
    color: colors.available,
  },
  statusTextUnavailable: {
    color: colors.unavailable,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 22,
  },
  cardInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  prepTimeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  quickBadge: {
    backgroundColor: colors.quickBg,
  },
  regularBadge: {
    backgroundColor: colors.regularBg,
  },
  prepTimeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  quickText: {
    color: colors.quick,
  },
  regularText: {
    color: colors.regular,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 10,
  },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.dangerLight,
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.danger,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  resetFilterBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  resetFilterText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },
});
