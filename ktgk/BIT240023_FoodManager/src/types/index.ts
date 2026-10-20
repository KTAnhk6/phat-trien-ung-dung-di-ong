/**
 * MSSV: BIT240023
 * Project: BIT240023_FoodManager
 * Models & Types definition with mandatory prefix BIT240023_
 */

export interface BIT240023_DishImage {
  BIT240023_ImageUrl: string;
  BIT240023_IsThumbnail: boolean;
}

export interface BIT240023_DishCategory {
  BIT240023_Id: string;
  BIT240023_Name: string;
  BIT240023_Description: string;
}

export interface BIT240023_Dish {
  BIT240023_Id: string;
  BIT240023_Name: string;
  BIT240023_Price: number;
  BIT240023_PreparationTime: number; // In minutes
  BIT240023_IsAvailable: boolean;
  BIT240023_Description: string;
  BIT240023_DishCategoryId: string;
  BIT240023_DishImage: BIT240023_DishImage[];
}

export type BIT240023_Language = 'en' | 'vi';

export type BIT240023_SortOption = 
  | 'default'
  | 'price_asc'
  | 'price_desc'
  | 'prep_time_asc';

export type BIT240023_StatusFilter = 'all' | 'available' | 'unavailable';

export interface BIT240023_FilterState {
  searchQuery: string;
  categoryId: string; // 'all' or specific category ID
  status: BIT240023_StatusFilter;
  minPrice: string; // string input to handle empty state
  maxPrice: string;
  sortBy: BIT240023_SortOption;
}

export type BIT240023_Screen = 
  | { name: 'LIST' }
  | { name: 'DETAIL'; dishId: string }
  | { name: 'CREATE' }
  | { name: 'EDIT'; dishId: string }
  | { name: 'CATEGORIES' };
