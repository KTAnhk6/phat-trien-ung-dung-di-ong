/**
 * MSSV: BIT240023
 * Multi-criteria Filter & Sort Modal
 */

import React, { useState, useEffect } from 'react';
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
import { colors } from '../theme/colors';
import { BIT240023_FilterState, BIT240023_SortOption, BIT240023_StatusFilter } from '../types';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose }) => {
  const { categories, filterState, setFilterState, t } = useApp();

  // Local draft state so user can change values and either Apply or Cancel
  const [draftState, setDraftState] = useState<BIT240023_FilterState>(filterState);
  const [priceError, setPriceError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setDraftState(filterState);
      setPriceError(null);
    }
  }, [visible, filterState]);

  const handleApply = () => {
    // Validate price range if both entered
    const min = draftState.minPrice ? parseFloat(draftState.minPrice) : null;
    const max = draftState.maxPrice ? parseFloat(draftState.maxPrice) : null;

    if (min !== null && isNaN(min)) {
      setPriceError(t('errInvalidNumber'));
      return;
    }
    if (max !== null && isNaN(max)) {
      setPriceError(t('errInvalidNumber'));
      return;
    }
    if (min !== null && min < 0) {
      setPriceError(t('errInvalidNumber'));
      return;
    }
    if (min !== null && max !== null && min > max) {
      setPriceError(t('errPriceRangeInvalid'));
      return;
    }

    setPriceError(null);
    setFilterState(draftState);
    onClose();
  };

  const handleReset = () => {
    const resetValues: BIT240023_FilterState = {
      searchQuery: draftState.searchQuery, // Preserve search query or reset all
      categoryId: 'all',
      status: 'all',
      minPrice: '',
      maxPrice: '',
      sortBy: 'default',
    };
    setDraftState(resetValues);
    setPriceError(null);
  };

  const sortOptions: { key: BIT240023_SortOption; label: string }[] = [
    { key: 'default', label: t('sortDefault') },
    { key: 'price_asc', label: t('sortPriceAsc') },
    { key: 'price_desc', label: t('sortPriceDesc') },
    { key: 'prep_time_asc', label: t('sortPrepTimeAsc') },
  ];

  const statusOptions: { key: BIT240023_StatusFilter; label: string }[] = [
    { key: 'all', label: t('statusAll') },
    { key: 'available', label: t('statusAvailable') },
    { key: 'unavailable', label: t('statusUnavailable') },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('filterAndSort')}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Category Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('categoryFilter')}</Text>
              <View style={styles.chipsContainer}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    draftState.categoryId === 'all' && styles.chipActive,
                  ]}
                  onPress={() => setDraftState(prev => ({ ...prev, categoryId: 'all' }))}>
                  <Text
                    style={[
                      styles.chipText,
                      draftState.categoryId === 'all' && styles.chipTextActive,
                    ]}>
                    {t('allCategories')}
                  </Text>
                </TouchableOpacity>

                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.BIT240023_Id}
                    style={[
                      styles.chip,
                      draftState.categoryId === cat.BIT240023_Id && styles.chipActive,
                    ]}
                    onPress={() =>
                      setDraftState(prev => ({ ...prev, categoryId: cat.BIT240023_Id }))
                    }>
                    <Text
                      style={[
                        styles.chipText,
                        draftState.categoryId === cat.BIT240023_Id && styles.chipTextActive,
                      ]}>
                      {cat.BIT240023_Name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('statusFilter')}</Text>
              <View style={styles.chipsContainer}>
                {statusOptions.map(opt => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.chip,
                      draftState.status === opt.key && styles.chipActive,
                    ]}
                    onPress={() => setDraftState(prev => ({ ...prev, status: opt.key }))}>
                    <Text
                      style={[
                        styles.chipText,
                        draftState.status === opt.key && styles.chipTextActive,
                      ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price Range Filter */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('priceRange')}</Text>
              <View style={styles.priceRow}>
                <View style={styles.priceInputWrapper}>
                  <Text style={styles.inputLabel}>{t('minPrice')}</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="0"
                    keyboardType="numeric"
                    value={draftState.minPrice}
                    onChangeText={val =>
                      setDraftState(prev => ({
                        ...prev,
                        minPrice: val.replace(/[^0-9]/g, ''),
                      }))
                    }
                  />
                </View>

                <Text style={styles.priceSeparator}>—</Text>

                <View style={styles.priceInputWrapper}>
                  <Text style={styles.inputLabel}>{t('maxPrice')}</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="100000"
                    keyboardType="numeric"
                    value={draftState.maxPrice}
                    onChangeText={val =>
                      setDraftState(prev => ({
                        ...prev,
                        maxPrice: val.replace(/[^0-9]/g, ''),
                      }))
                    }
                  />
                </View>
              </View>
              {priceError && <Text style={styles.errorText}>{priceError}</Text>}
            </View>

            {/* Sort By */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('sortBy')}</Text>
              <View style={styles.sortList}>
                {sortOptions.map(opt => (
                  <TouchableOpacity
                    key={opt.key}
                    style={[
                      styles.sortOption,
                      draftState.sortBy === opt.key && styles.sortOptionActive,
                    ]}
                    onPress={() => setDraftState(prev => ({ ...prev, sortBy: opt.key }))}>
                    <View
                      style={[
                        styles.radioCircle,
                        draftState.sortBy === opt.key && styles.radioCircleActive,
                      ]}>
                      {draftState.sortBy === opt.key && <View style={styles.radioDot} />}
                    </View>
                    <Text
                      style={[
                        styles.sortOptionText,
                        draftState.sortBy === opt.key && styles.sortOptionTextActive,
                      ]}>
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              activeOpacity={0.7}>
              <Text style={styles.resetButtonText}>{t('clearFilters')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={handleApply}
              activeOpacity={0.8}>
              <Text style={styles.applyButtonText}>{t('apply')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  closeBtn: {
    padding: 6,
  },
  closeBtnText: {
    fontSize: 18,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInputWrapper: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 4,
  },
  priceInput: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
    color: colors.text,
  },
  priceSeparator: {
    fontSize: 16,
    color: colors.textMuted,
    marginTop: 18,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 6,
  },
  sortList: {
    gap: 10,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  sortOptionActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioCircleActive: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  sortOptionText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  sortOptionTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  resetButton: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  applyButton: {
    flex: 2,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
