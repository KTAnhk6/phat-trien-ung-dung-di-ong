/**
 * MSSV: BIT240023
 * Application Context & State Management with Offline Sync
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  BIT240023_Dish,
  BIT240023_DishCategory,
  BIT240023_FilterState,
  BIT240023_Language,
  BIT240023_Screen,
} from '../types';
import { storageService } from '../services/storageService';
import { mockApiService } from '../services/mockApiService';
import { syncService } from '../services/syncService';
import { translations, TranslationKey } from '../i18n/translations';

interface AppContextType {
  // Data
  dishes: BIT240023_Dish[];
  categories: BIT240023_DishCategory[];
  isLoading: boolean;

  // Language
  language: BIT240023_Language;
  setLanguage: (lang: BIT240023_Language) => Promise<void>;
  toggleLanguage: () => Promise<void>;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;

  // Navigation Stack
  currentScreen: BIT240023_Screen;
  navigateToList: () => void;
  navigateToDetail: (dishId: string) => void;
  navigateToCreate: () => void;
  navigateToEdit: (dishId: string) => void;
  navigateToCategories: () => void;
  goBack: () => void;

  // Filter & Search State (Preserved when navigating)
  filterState: BIT240023_FilterState;
  setFilterState: React.Dispatch<React.SetStateAction<BIT240023_FilterState>>;
  resetFilterState: () => void;

  // Sync & Offline State (Section 5)
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncCount: number;
  isSimulatedOffline: boolean;
  toggleSimulatedOffline: () => void;

  // Actions
  refreshData: () => Promise<void>;
  addDish: (dishData: Omit<BIT240023_Dish, 'BIT240023_Id'>) => Promise<BIT240023_Dish>;
  updateDish: (dish: BIT240023_Dish) => Promise<void>;
  deleteDish: (dishId: string) => Promise<void>;
  addCategory: (name: string, description: string) => Promise<BIT240023_DishCategory>;
  deleteCategory: (categoryId: string) => Promise<{ success: boolean; inUseCount?: number }>;
  
  // Image operations
  setThumbnailImage: (dishId: string, imageUrl: string) => Promise<void>;
  addImageToDish: (dishId: string, imageUrl: string) => Promise<void>;
  removeImageFromDish: (dishId: string, imageUrl: string) => Promise<void>;

  // Validation
  validateDish: (
    dish: Partial<BIT240023_Dish>,
    editingDishId?: string
  ) => { valid: boolean; errors: string[] };

  // Utilities
  getCategoryName: (categoryId: string) => string;
}

const defaultFilterState: BIT240023_FilterState = {
  searchQuery: '',
  categoryId: 'all',
  status: 'all',
  minPrice: '',
  maxPrice: '',
  sortBy: 'default',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dishes, setDishes] = useState<BIT240023_Dish[]>([]);
  const [categories, setCategories] = useState<BIT240023_DishCategory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [language, setLanguageState] = useState<BIT240023_Language>('en');

  // Sync State
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);

  // Screen stack
  const [screenStack, setScreenStack] = useState<BIT240023_Screen[]>([{ name: 'LIST' }]);
  const currentScreen = screenStack[screenStack.length - 1] || { name: 'LIST' };

  // Filter state preserved across navigation
  const [filterState, setFilterState] = useState<BIT240023_FilterState>(defaultFilterState);

  // Initialize storage & sync on app start
  useEffect(() => {
    let unsubscribeSync: (() => void) | undefined;

    const init = async () => {
      try {
        await storageService.initializeStorage();
        const savedLang = await storageService.getSavedLanguage();
        setLanguageState(savedLang);
        await refreshData();

        // Subscribe to sync service events
        unsubscribeSync = syncService.subscribe(status => {
          setIsOnline(status.isOnline);
          setIsSyncing(status.isSyncing);
          setPendingSyncCount(status.pendingCount);
          if (!status.isSyncing) {
            refreshData();
          }
        });

        // Trigger initial MockAPI sync / seed
        await syncService.initialMockApiSync();
        await refreshData();
      } catch (e) {
        console.error('Initialization error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    init();

    return () => {
      if (unsubscribeSync) unsubscribeSync();
    };
  }, []);

  const refreshData = async () => {
    const [loadedCats, loadedDishes] = await Promise.all([
      storageService.getCategories(),
      storageService.getDishes(),
    ]);
    setCategories(loadedCats);
    setDishes(loadedDishes);
  };

  const toggleSimulatedOffline = () => {
    const nextState = !isSimulatedOffline;
    setIsSimulatedOffline(nextState);
    syncService.setSimulatedOffline(nextState);
  };

  const setLanguage = async (lang: BIT240023_Language) => {
    setLanguageState(lang);
    await storageService.saveLanguage(lang);
  };

  const toggleLanguage = async () => {
    const nextLang = language === 'en' ? 'vi' : 'en';
    await setLanguage(nextLang);
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const dict = translations[language] || translations.en;
    let text = dict[key] || translations.en[key] || (key as string);
    if (params) {
      Object.keys(params).forEach(pKey => {
        text = text.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(params[pKey]));
      });
    }
    return text;
  };

  // Navigation handlers
  const pushScreen = (screen: BIT240023_Screen) => {
    setScreenStack(prev => [...prev, screen]);
  };

  const navigateToList = () => {
    setScreenStack([{ name: 'LIST' }]);
  };

  const navigateToDetail = (dishId: string) => {
    pushScreen({ name: 'DETAIL', dishId });
  };

  const navigateToCreate = () => {
    pushScreen({ name: 'CREATE' });
  };

  const navigateToEdit = (dishId: string) => {
    pushScreen({ name: 'EDIT', dishId });
  };

  const navigateToCategories = () => {
    pushScreen({ name: 'CATEGORIES' });
  };

  const goBack = () => {
    setScreenStack(prev => (prev.length > 1 ? prev.slice(0, prev.length - 1) : prev));
  };

  const resetFilterState = () => {
    setFilterState(defaultFilterState);
  };

  // Validation
  const validateDish = (
    dish: Partial<BIT240023_Dish>,
    editingDishId?: string
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!dish.BIT240023_Name || dish.BIT240023_Name.trim().length === 0) {
      errors.push(t('errNameRequired'));
    }

    if (dish.BIT240023_Price === undefined || isNaN(dish.BIT240023_Price) || dish.BIT240023_Price <= 0) {
      errors.push(t('errPriceInvalid'));
    }

    if (
      dish.BIT240023_PreparationTime === undefined ||
      isNaN(dish.BIT240023_PreparationTime) ||
      dish.BIT240023_PreparationTime <= 0
    ) {
      errors.push(t('errPrepTimeInvalid'));
    }

    const categoryExists = categories.some(c => c.BIT240023_Id === dish.BIT240023_DishCategoryId);
    if (!dish.BIT240023_DishCategoryId || !categoryExists) {
      errors.push(t('errCategoryRequired'));
    }

    if (dish.BIT240023_Name && dish.BIT240023_DishCategoryId) {
      const normalizedName = dish.BIT240023_Name.trim().toLowerCase();
      const duplicate = dishes.some(
        d =>
          d.BIT240023_Id !== editingDishId &&
          d.BIT240023_DishCategoryId === dish.BIT240023_DishCategoryId &&
          d.BIT240023_Name.trim().toLowerCase() === normalizedName
      );
      if (duplicate) {
        errors.push(t('errNameDuplicateInCategory'));
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  };

  // ================= CRUD WITH OFFLINE QUEUE SUPPORT =================

  const addDish = async (dishData: Omit<BIT240023_Dish, 'BIT240023_Id'>): Promise<BIT240023_Dish> => {
    // 1. Save locally first (instant UI update)
    const newLocalDish = await storageService.addDish(dishData);
    await refreshData();

    // 2. Check online status
    if (isOnline && !isSimulatedOffline) {
      try {
        const createdOnApi = await mockApiService.createDish(dishData);
        // Update local dish ID with the real MockAPI ID
        newLocalDish.BIT240023_Id = createdOnApi.BIT240023_Id;
        const currentDishes = await storageService.getDishes();
        const idx = currentDishes.findIndex(d => d.BIT240023_Id === newLocalDish.BIT240023_Id);
        if (idx !== -1) {
          currentDishes[idx] = createdOnApi;
          await storageService.saveDishes(currentDishes);
          await refreshData();
        }
      } catch {
        // Fallback: enqueue to offline queue if API request fails
        await syncService.enqueue('CREATE_DISH', dishData, newLocalDish.BIT240023_Id);
      }
    } else {
      // Offline mode: enqueue
      await syncService.enqueue('CREATE_DISH', dishData, newLocalDish.BIT240023_Id);
    }

    return newLocalDish;
  };

  const updateDish = async (dish: BIT240023_Dish): Promise<void> => {
    // 1. Save locally
    await storageService.updateDish(dish);
    await refreshData();

    // 2. Online or enqueue
    if (isOnline && !isSimulatedOffline) {
      try {
        await mockApiService.updateDish(dish);
      } catch {
        await syncService.enqueue('UPDATE_DISH', dish);
      }
    } else {
      await syncService.enqueue('UPDATE_DISH', dish);
    }
  };

  const deleteDish = async (dishId: string): Promise<void> => {
    await storageService.deleteDish(dishId);
    await refreshData();

    if (isOnline && !isSimulatedOffline) {
      try {
        await mockApiService.deleteDish(dishId);
      } catch {
        await syncService.enqueue('DELETE_DISH', { id: dishId });
      }
    } else {
      await syncService.enqueue('DELETE_DISH', { id: dishId });
    }
  };

  const addCategory = async (name: string, description: string): Promise<BIT240023_DishCategory> => {
    const newCat = await storageService.addCategory(name, description);
    await refreshData();

    const catPayload = { BIT240023_Name: name, BIT240023_Description: description };
    if (isOnline && !isSimulatedOffline) {
      try {
        const createdOnApi = await mockApiService.createCategory(catPayload);
        const currentCats = await storageService.getCategories();
        const idx = currentCats.findIndex(c => c.BIT240023_Id === newCat.BIT240023_Id);
        if (idx !== -1) {
          currentCats[idx] = createdOnApi;
          await storageService.saveCategories(currentCats);
          await refreshData();
        }
      } catch {
        await syncService.enqueue('CREATE_CATEGORY', catPayload, newCat.BIT240023_Id);
      }
    } else {
      await syncService.enqueue('CREATE_CATEGORY', catPayload, newCat.BIT240023_Id);
    }

    return newCat;
  };

  const deleteCategory = async (
    categoryId: string
  ): Promise<{ success: boolean; inUseCount?: number }> => {
    const result = await storageService.deleteCategory(categoryId);
    if (result.success) {
      await refreshData();
      if (isOnline && !isSimulatedOffline) {
        try {
          await mockApiService.deleteCategory(categoryId);
        } catch {
          await syncService.enqueue('DELETE_CATEGORY', { id: categoryId });
        }
      } else {
        await syncService.enqueue('DELETE_CATEGORY', { id: categoryId });
      }
    }
    return result;
  };

  // Thumbnail & image helpers
  const setThumbnailImage = async (dishId: string, imageUrl: string): Promise<void> => {
    const dish = dishes.find(d => d.BIT240023_Id === dishId);
    if (!dish) return;

    const updatedImages = dish.BIT240023_DishImage.map(img => ({
      ...img,
      BIT240023_IsThumbnail: img.BIT240023_ImageUrl === imageUrl,
    }));

    await updateDish({
      ...dish,
      BIT240023_DishImage: updatedImages,
    });
  };

  const addImageToDish = async (dishId: string, imageUrl: string): Promise<void> => {
    const dish = dishes.find(d => d.BIT240023_Id === dishId);
    if (!dish) return;

    const hasThumbnail = dish.BIT240023_DishImage.some(img => img.BIT240023_IsThumbnail);
    const newImage = {
      BIT240023_ImageUrl: imageUrl.trim(),
      BIT240023_IsThumbnail: !hasThumbnail,
    };

    await updateDish({
      ...dish,
      BIT240023_DishImage: [...dish.BIT240023_DishImage, newImage],
    });
  };

  const removeImageFromDish = async (dishId: string, imageUrl: string): Promise<void> => {
    const dish = dishes.find(d => d.BIT240023_Id === dishId);
    if (!dish) return;

    let updatedImages = dish.BIT240023_DishImage.filter(img => img.BIT240023_ImageUrl !== imageUrl);
    if (updatedImages.length > 0 && !updatedImages.some(img => img.BIT240023_IsThumbnail)) {
      updatedImages[0].BIT240023_IsThumbnail = true;
    }

    await updateDish({
      ...dish,
      BIT240023_DishImage: updatedImages,
    });
  };

  const getCategoryName = (categoryId: string): string => {
    const cat = categories.find(c => c.BIT240023_Id === categoryId);
    return cat ? cat.BIT240023_Name : categoryId;
  };

  return (
    <AppContext.Provider
      value={{
        dishes,
        categories,
        isLoading,
        language,
        setLanguage,
        toggleLanguage,
        t,
        currentScreen,
        navigateToList,
        navigateToDetail,
        navigateToCreate,
        navigateToEdit,
        navigateToCategories,
        goBack,
        filterState,
        setFilterState,
        resetFilterState,
        isOnline,
        isSyncing,
        pendingSyncCount,
        isSimulatedOffline,
        toggleSimulatedOffline,
        refreshData,
        addDish,
        updateDish,
        deleteDish,
        addCategory,
        deleteCategory,
        setThumbnailImage,
        addImageToDish,
        removeImageFromDish,
        validateDish,
        getCategoryName,
      }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
