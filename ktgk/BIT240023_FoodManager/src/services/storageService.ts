/**
 * MSSV: BIT240023
 * Project: BIT240023_FoodManager
 * Storage Service using @react-native-async-storage/async-storage
 * MANDATORY REQUIREMENT:
 * - Table / Storage Key names MUST have prefix {MSSV}_:
 *   + BIT240023_DishCategory
 *   + BIT240023_Dish
 * - All record fields also have prefix BIT240023_
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { BIT240023_Dish, BIT240023_DishCategory, BIT240023_Language } from '../types';
import { INITIAL_CATEGORIES, INITIAL_DISHES } from './initialData';

// Storage Table Keys with mandatory MSSV prefix
export const STORAGE_KEYS = {
  TABLE_DISH_CATEGORY: 'BIT240023_DishCategory',
  TABLE_DISH: 'BIT240023_Dish',
  APP_LANGUAGE: 'BIT240023_Language',
};

class StorageService {
  /**
   * Initialize local storage with seed data if not yet created
   */
  async initializeStorage(): Promise<void> {
    try {
      const categoriesJson = await AsyncStorage.getItem(STORAGE_KEYS.TABLE_DISH_CATEGORY);
      if (!categoriesJson) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.TABLE_DISH_CATEGORY,
          JSON.stringify(INITIAL_CATEGORIES)
        );
      }

      const dishesJson = await AsyncStorage.getItem(STORAGE_KEYS.TABLE_DISH);
      if (!dishesJson) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.TABLE_DISH,
          JSON.stringify(INITIAL_DISHES)
        );
      }
    } catch (error) {
      console.error('Failed to initialize local storage:', error);
    }
  }

  // ================= CATEGORIES CRUD =================

  async getCategories(): Promise<BIT240023_DishCategory[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.TABLE_DISH_CATEGORY);
      if (!json) {
        return INITIAL_CATEGORIES;
      }
      return JSON.parse(json) as BIT240023_DishCategory[];
    } catch (error) {
      console.error('Error reading BIT240023_DishCategory:', error);
      return [];
    }
  }

  async saveCategories(categories: BIT240023_DishCategory[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.TABLE_DISH_CATEGORY,
        JSON.stringify(categories)
      );
    } catch (error) {
      console.error('Error saving BIT240023_DishCategory:', error);
      throw error;
    }
  }

  async addCategory(name: string, description: string): Promise<BIT240023_DishCategory> {
    const categories = await this.getCategories();
    const newId = `CAT_${Date.now()}`;
    const newCategory: BIT240023_DishCategory = {
      BIT240023_Id: newId,
      BIT240023_Name: name.trim(),
      BIT240023_Description: description.trim(),
    };
    categories.push(newCategory);
    await this.saveCategories(categories);
    return newCategory;
  }

  async deleteCategory(categoryId: string): Promise<{ success: boolean; inUseCount?: number }> {
    // Constraint check: "Không cho xóa loại món đang được sử dụng"
    const dishes = await this.getDishes();
    const inUseDishes = dishes.filter(d => d.BIT240023_DishCategoryId === categoryId);
    if (inUseDishes.length > 0) {
      return { success: false, inUseCount: inUseDishes.length };
    }

    const categories = await this.getCategories();
    const updated = categories.filter(c => c.BIT240023_Id !== categoryId);
    await this.saveCategories(updated);
    return { success: true };
  }

  // ================= DISHES CRUD =================

  async getDishes(): Promise<BIT240023_Dish[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.TABLE_DISH);
      if (!json) {
        return INITIAL_DISHES;
      }
      return JSON.parse(json) as BIT240023_Dish[];
    } catch (error) {
      console.error('Error reading BIT240023_Dish:', error);
      return [];
    }
  }

  async saveDishes(dishes: BIT240023_Dish[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TABLE_DISH, JSON.stringify(dishes));
    } catch (error) {
      console.error('Error saving BIT240023_Dish:', error);
      throw error;
    }
  }

  async getDishById(dishId: string): Promise<BIT240023_Dish | null> {
    const dishes = await this.getDishes();
    return dishes.find(d => d.BIT240023_Id === dishId) || null;
  }

  async addDish(dishData: Omit<BIT240023_Dish, 'BIT240023_Id'>): Promise<BIT240023_Dish> {
    const dishes = await this.getDishes();
    const newId = `DISH_${Date.now()}`;
    const newDish: BIT240023_Dish = {
      ...dishData,
      BIT240023_Id: newId,
    };
    dishes.push(newDish);
    await this.saveDishes(dishes);
    return newDish;
  }

  async updateDish(updatedDish: BIT240023_Dish): Promise<void> {
    const dishes = await this.getDishes();
    const index = dishes.findIndex(d => d.BIT240023_Id === updatedDish.BIT240023_Id);
    if (index !== -1) {
      dishes[index] = updatedDish;
      await this.saveDishes(dishes);
    }
  }

  async deleteDish(dishId: string): Promise<void> {
    const dishes = await this.getDishes();
    const filtered = dishes.filter(d => d.BIT240023_Id !== dishId);
    await this.saveDishes(filtered);
  }

  // ================= LANGUAGE PERSISTENCE =================

  async getSavedLanguage(): Promise<BIT240023_Language> {
    try {
      const lang = await AsyncStorage.getItem(STORAGE_KEYS.APP_LANGUAGE);
      return (lang === 'vi' || lang === 'en') ? lang : 'en';
    } catch {
      return 'en';
    }
  }

  async saveLanguage(language: BIT240023_Language): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_LANGUAGE, language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  }

  // Reset to initial seed data for testing
  async resetToSeedData(): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.TABLE_DISH_CATEGORY, JSON.stringify(INITIAL_CATEGORIES));
    await AsyncStorage.setItem(STORAGE_KEYS.TABLE_DISH, JSON.stringify(INITIAL_DISHES));
  }
}

export const storageService = new StorageService();
