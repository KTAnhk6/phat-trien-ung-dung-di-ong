/**
 * MSSV: BIT240023
 * MockAPI Service
 * Base URL: https://6ad72199f71f154ac487d56c.mockapi.io/ai/v1
 * Resources: BIT240023_DishCategory & BIT240023_Dish
 */

import { BIT240023_Dish, BIT240023_DishCategory } from '../types';

export const MOCK_API_BASE_URL = 'https://6ad72199f71f154ac487d56c.mockapi.io/ai/v1';

class MockApiService {
  private categoryUrl = `${MOCK_API_BASE_URL}/BIT240023_DishCategory`;
  private dishUrl = `${MOCK_API_BASE_URL}/BIT240023_Dish`;

  // ================= CATEGORIES =================

  async getCategories(): Promise<BIT240023_DishCategory[]> {
    const res = await fetch(this.categoryUrl, { method: 'GET' });
    if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
    const data = await res.json();
    return data.map((item: any) => ({
      BIT240023_Id: String(item.id || item.BIT240023_Id),
      BIT240023_Name: item.BIT240023_Name || '',
      BIT240023_Description: item.BIT240023_Description || '',
    }));
  }

  async createCategory(category: Omit<BIT240023_DishCategory, 'BIT240023_Id'>): Promise<BIT240023_DishCategory> {
    const res = await fetch(this.categoryUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        BIT240023_Name: category.BIT240023_Name,
        BIT240023_Description: category.BIT240023_Description,
      }),
    });
    if (!res.ok) throw new Error(`Failed to create category: ${res.status}`);
    const created = await res.json();
    return {
      BIT240023_Id: String(created.id),
      BIT240023_Name: created.BIT240023_Name,
      BIT240023_Description: created.BIT240023_Description,
    };
  }

  async deleteCategory(id: string): Promise<void> {
    const res = await fetch(`${this.categoryUrl}/${id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 404) {
      throw new Error(`Failed to delete category: ${res.status}`);
    }
  }

  // ================= DISHES =================

  async getDishes(): Promise<BIT240023_Dish[]> {
    const res = await fetch(this.dishUrl, { method: 'GET' });
    if (!res.ok) throw new Error(`Failed to fetch dishes: ${res.status}`);
    const data = await res.json();
    return data.map((item: any) => ({
      BIT240023_Id: String(item.id || item.BIT240023_Id),
      BIT240023_Name: item.BIT240023_Name || '',
      BIT240023_Price: Number(item.BIT240023_Price) || 0,
      BIT240023_PreparationTime: Number(item.BIT240023_PreparationTime) || 0,
      BIT240023_IsAvailable: Boolean(item.BIT240023_IsAvailable),
      BIT240023_Description: item.BIT240023_Description || '',
      BIT240023_DishCategoryId: String(item.BIT240023_DishCategoryId || ''),
      BIT240023_DishImage: Array.isArray(item.BIT240023_DishImage) ? item.BIT240023_DishImage : [],
    }));
  }

  async createDish(dish: Omit<BIT240023_Dish, 'BIT240023_Id'>): Promise<BIT240023_Dish> {
    const res = await fetch(this.dishUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        BIT240023_Name: dish.BIT240023_Name,
        BIT240023_Price: dish.BIT240023_Price,
        BIT240023_PreparationTime: dish.BIT240023_PreparationTime,
        BIT240023_IsAvailable: dish.BIT240023_IsAvailable,
        BIT240023_Description: dish.BIT240023_Description,
        BIT240023_DishCategoryId: dish.BIT240023_DishCategoryId,
        BIT240023_DishImage: dish.BIT240023_DishImage,
      }),
    });
    if (!res.ok) throw new Error(`Failed to create dish: ${res.status}`);
    const created = await res.json();
    return {
      BIT240023_Id: String(created.id),
      BIT240023_Name: created.BIT240023_Name,
      BIT240023_Price: Number(created.BIT240023_Price),
      BIT240023_PreparationTime: Number(created.BIT240023_PreparationTime),
      BIT240023_IsAvailable: Boolean(created.BIT240023_IsAvailable),
      BIT240023_Description: created.BIT240023_Description,
      BIT240023_DishCategoryId: String(created.BIT240023_DishCategoryId),
      BIT240023_DishImage: created.BIT240023_DishImage || [],
    };
  }

  async updateDish(dish: BIT240023_Dish): Promise<void> {
    const res = await fetch(`${this.dishUrl}/${dish.BIT240023_Id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        BIT240023_Name: dish.BIT240023_Name,
        BIT240023_Price: dish.BIT240023_Price,
        BIT240023_PreparationTime: dish.BIT240023_PreparationTime,
        BIT240023_IsAvailable: dish.BIT240023_IsAvailable,
        BIT240023_Description: dish.BIT240023_Description,
        BIT240023_DishCategoryId: dish.BIT240023_DishCategoryId,
        BIT240023_DishImage: dish.BIT240023_DishImage,
      }),
    });
    if (!res.ok) throw new Error(`Failed to update dish: ${res.status}`);
  }

  async deleteDish(id: string): Promise<void> {
    const res = await fetch(`${this.dishUrl}/${id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 404) {
      throw new Error(`Failed to delete dish: ${res.status}`);
    }
  }

  // Health check to verify connection
  async checkConnection(): Promise<boolean> {
    try {
      const res = await fetch(this.categoryUrl, { method: 'HEAD', cache: 'no-cache' });
      return res.ok || res.status === 200;
    } catch {
      return false;
    }
  }
}

export const mockApiService = new MockApiService();
