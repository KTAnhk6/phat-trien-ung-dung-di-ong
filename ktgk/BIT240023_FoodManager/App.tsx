/**
 * MSSV: BIT240023
 * Project: BIT240023_FoodManager
 * Main Application Component
 */

import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { AppProvider, useApp } from './src/context/AppContext';
import { DishListScreen } from './src/screens/DishListScreen';
import { DishDetailScreen } from './src/screens/DishDetailScreen';
import { DishFormScreen } from './src/screens/DishFormScreen';
import { CategoryManageScreen } from './src/screens/CategoryManageScreen';
import { colors } from './src/theme/colors';

const MainNavigator: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { currentScreen, goBack, isLoading } = useApp();

  // Handle hardware Android back button
  useEffect(() => {
    const onBackPress = () => {
      if (currentScreen.name !== 'LIST') {
        goBack();
        return true; // prevent exit app
      }
      return false; // allow default Android exit on home
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [currentScreen, goBack]);

  if (isLoading) {
    return (
      <View style={[styles.centerContainer, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const renderScreen = () => {
    switch (currentScreen.name) {
      case 'DETAIL':
        return <DishDetailScreen dishId={currentScreen.dishId} />;
      case 'CREATE':
        return <DishFormScreen />;
      case 'EDIT':
        return <DishFormScreen dishId={currentScreen.dishId} />;
      case 'CATEGORIES':
        return <CategoryManageScreen />;
      case 'LIST':
      default:
        return <DishListScreen />;
    }
  };

  return (
    <View style={[styles.rootContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {renderScreen()}
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <AppProvider>
        <MainNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
