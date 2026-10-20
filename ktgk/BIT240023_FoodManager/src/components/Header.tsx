/**
 * MSSV: BIT240023
 * App Header with Student Badge, Network Status & Language Switcher
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, showBack = false }) => {
  const {
    language,
    toggleLanguage,
    goBack,
    isOnline,
    isSyncing,
    pendingSyncCount,
    isSimulatedOffline,
    toggleSimulatedOffline,
    t,
  } = useApp();

  return (
    <View style={styles.container}>
      <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={goBack}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.backIcon}>‹</Text>
            <Text style={styles.backText}>{t('back')}</Text>
          </TouchableOpacity>
        ) : (
          <View>
            <Text style={styles.appTitle}>{title || t('appTitle')}</Text>
            <View style={styles.badgeRow}>
              <View style={styles.mssvBadge}>
                <Text style={styles.mssvText}>{t('studentBadge')}</Text>
              </View>

              {/* Network Status Badge (Click to toggle simulated offline for video demo) */}
              <TouchableOpacity
                style={[
                  styles.networkBadge,
                  isSyncing
                    ? styles.networkBadgeSyncing
                    : isOnline
                    ? styles.networkBadgeOnline
                    : styles.networkBadgeOffline,
                ]}
                onPress={toggleSimulatedOffline}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.networkDot}>
                  {isSyncing ? '⚡' : isOnline ? '●' : '●'}
                </Text>
                <Text
                  style={[
                    styles.networkText,
                    isSyncing
                      ? styles.networkTextSyncing
                      : isOnline
                      ? styles.networkTextOnline
                      : styles.networkTextOffline,
                  ]}>
                  {isSyncing
                    ? t('syncingStatus')
                    : isOnline
                    ? t('onlineStatus')
                    : t('offlineStatus')}
                  {pendingSyncCount > 0 ? ` (${pendingSyncCount})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {showBack && title && (
        <View style={styles.centerContainer}>
          <Text style={styles.centerTitle} numberOfLines={1}>
            {title}
          </Text>
        </View>
      )}

      <View style={styles.rightContainer}>
        {/* Toggle Simulated Network button for easy Video demo */}
        <TouchableOpacity
          style={[
            styles.simNetBtn,
            isSimulatedOffline ? styles.simNetBtnOffline : styles.simNetBtnOnline,
          ]}
          onPress={toggleSimulatedOffline}
          activeOpacity={0.8}>
          <Text style={styles.simNetText}>
            {isSimulatedOffline ? '📶 Turn Online' : '📡 Cut Net'}
          </Text>
        </TouchableOpacity>

        {/* Language Switcher */}
        <TouchableOpacity
          style={styles.langToggle}
          onPress={toggleLanguage}
          activeOpacity={0.8}>
          <View style={[styles.langBadge, language === 'en' && styles.langActive]}>
            <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>
              EN
            </Text>
          </View>
          <View style={[styles.langBadge, language === 'vi' && styles.langActive]}>
            <Text style={[styles.langText, language === 'vi' && styles.langTextActive]}>
              VI
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 70,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  centerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  appTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  mssvBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  mssvText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    borderWidth: 1,
  },
  networkBadgeOnline: {
    backgroundColor: colors.availableBg,
    borderColor: '#A5D6A7',
  },
  networkBadgeOffline: {
    backgroundColor: colors.unavailableBg,
    borderColor: '#FFCDD2',
  },
  networkBadgeSyncing: {
    backgroundColor: colors.warningLight,
    borderColor: '#FFE082',
  },
  networkDot: {
    fontSize: 8,
    marginRight: 3,
  },
  networkText: {
    fontSize: 10,
    fontWeight: '700',
  },
  networkTextOnline: {
    color: colors.available,
  },
  networkTextOffline: {
    color: colors.unavailable,
  },
  networkTextSyncing: {
    color: colors.warning,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingRight: 8,
  },
  backIcon: {
    fontSize: 26,
    color: colors.primary,
    fontWeight: '600',
    marginTop: -2,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  simNetBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  simNetBtnOnline: {
    backgroundColor: '#F3F4F6',
    borderColor: colors.border,
  },
  simNetBtnOffline: {
    backgroundColor: '#FFEBEE',
    borderColor: colors.danger,
  },
  simNetText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 14,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  langBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
  },
  langActive: {
    backgroundColor: colors.primary,
  },
  langText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  langTextActive: {
    color: '#FFFFFF',
  },
});
