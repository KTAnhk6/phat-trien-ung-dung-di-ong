/**
 * MSSV: BIT240023
 * Sync & Offline Management Service
 * Implements Section 5 of the Exam:
 * - Offline data persistence in local storage
 * - Automatic background synchronization when network is restored
 * - No duplicate records & consistency assurance
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { BIT240023_Dish, BIT240023_DishCategory } from '../types';
import { mockApiService } from './mockApiService';
import { storageService } from './storageService';
import { INITIAL_CATEGORIES, INITIAL_DISHES } from './initialData';

export const SYNC_QUEUE_KEY = 'BIT240023_SyncQueue';

export type SyncActionType =
  | 'CREATE_DISH'
  | 'UPDATE_DISH'
  | 'DELETE_DISH'
  | 'CREATE_CATEGORY'
  | 'DELETE_CATEGORY';

export interface SyncQueueItem {
  id: string;
  action: SyncActionType;
  payload: any;
  tempId?: string;
  timestamp: number;
}

type SyncListener = (status: {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime?: Date;
}) => void;

class SyncService {
  private isOnline: boolean = true;
  private isSimulatedOffline: boolean = false;
  private isSyncing: boolean = false;
  private listeners: SyncListener[] = [];
  private lastSyncTime?: Date;

  constructor() {
    this.initNetworkListener();
  }

  private initNetworkListener() {
    // Web event listeners
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
      this.isOnline = navigator.onLine;
    }

    // Periodic heartbeat check every 6 seconds to ensure connection detection
    if (typeof process === 'undefined' || process.env?.NODE_ENV !== 'test') {
      const timer = setInterval(async () => {
        if (this.isSimulatedOffline) return;
        const connected = await mockApiService.checkConnection();
        if (connected !== this.isOnline) {
          this.handleNetworkChange(connected);
        }
      }, 6000);
      if (timer && typeof (timer as any).unref === 'function') {
        (timer as any).unref();
      }
    }
  }

  private async handleNetworkChange(online: boolean) {
    if (this.isSimulatedOffline) {
      this.isOnline = false;
      this.notifyListeners();
      return;
    }

    const wasOffline = !this.isOnline;
    this.isOnline = online;
    this.notifyListeners();

    // Auto-sync when transitioning from offline -> online
    if (online && wasOffline) {
      console.log('[SyncService] Network restored. Triggering auto-sync...');
      await this.syncOfflineChanges();
    }
  }

  // Toggle offline simulation for demo video
  setSimulatedOffline(offline: boolean) {
    this.isSimulatedOffline = offline;
    this.handleNetworkChange(!offline);
  }

  getSimulatedOffline(): boolean {
    return this.isSimulatedOffline;
  }

  getStatus() {
    return {
      isOnline: this.isOnline && !this.isSimulatedOffline,
      isSyncing: this.isSyncing,
      pendingCount: 0,
      lastSyncTime: this.lastSyncTime,
    };
  }

  subscribe(listener: SyncListener) {
    this.listeners.push(listener);
    this.getQueueCount().then(count => {
      listener({
        isOnline: this.isOnline && !this.isSimulatedOffline,
        isSyncing: this.isSyncing,
        pendingCount: count,
        lastSyncTime: this.lastSyncTime,
      });
    });
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private async notifyListeners() {
    const count = await this.getQueueCount();
    const status = {
      isOnline: this.isOnline && !this.isSimulatedOffline,
      isSyncing: this.isSyncing,
      pendingCount: count,
      lastSyncTime: this.lastSyncTime,
    };
    this.listeners.forEach(l => l(status));
  }

  // ================= QUEUE MANAGEMENT =================

  async getQueue(): Promise<SyncQueueItem[]> {
    try {
      const json = await AsyncStorage.getItem(SYNC_QUEUE_KEY);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  }

  async getQueueCount(): Promise<number> {
    const q = await this.getQueue();
    return q.length;
  }

  private async saveQueue(queue: SyncQueueItem[]): Promise<void> {
    await AsyncStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    this.notifyListeners();
  }

  async enqueue(action: SyncActionType, payload: any, tempId?: string): Promise<void> {
    const queue = await this.getQueue();
    const newItem: SyncQueueItem = {
      id: `SYNC_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      action,
      payload,
      tempId,
      timestamp: Date.now(),
    };
    queue.push(newItem);
    await this.saveQueue(queue);
  }

  // ================= INITIAL SEED & SYNC =================

  /**
   * Initializes MockAPI if it is completely empty
   */
  async initialMockApiSync(): Promise<void> {
    if (!this.isOnline || this.isSimulatedOffline) return;

    try {
      this.isSyncing = true;
      this.notifyListeners();

      const [onlineCats, _onlineDishes] = await Promise.all([
        mockApiService.getCategories().catch(() => []),
        mockApiService.getDishes().catch(() => []),
      ]);

      // If MockAPI is empty, seed initial data to MockAPI
      if (onlineCats.length === 0) {
        console.log('[SyncService] Seeding initial categories to MockAPI...');
        const createdCatMap: Record<string, string> = {}; // oldId -> newId

        for (const cat of INITIAL_CATEGORIES) {
          const created = await mockApiService.createCategory(cat);
          createdCatMap[cat.BIT240023_Id] = created.BIT240023_Id;
        }

        // Seed dishes
        for (const dish of INITIAL_DISHES) {
          const newCatId = createdCatMap[dish.BIT240023_DishCategoryId] || dish.BIT240023_DishCategoryId;
          await mockApiService.createDish({
            ...dish,
            BIT240023_DishCategoryId: newCatId,
          });
        }
      }

      // Pull latest from MockAPI down to local storage
      await this.pullFromMockApi();
      this.lastSyncTime = new Date();
    } catch (e) {
      console.warn('[SyncService] Initial seed/sync failed, using local fallback:', e);
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }

  async pullFromMockApi(): Promise<{ categories: BIT240023_DishCategory[]; dishes: BIT240023_Dish[] }> {
    const [onlineCats, onlineDishes] = await Promise.all([
      mockApiService.getCategories(),
      mockApiService.getDishes(),
    ]);

    if (onlineCats.length > 0) {
      await storageService.saveCategories(onlineCats);
    }
    if (onlineDishes.length > 0) {
      await storageService.saveDishes(onlineDishes);
    }

    return { categories: onlineCats, dishes: onlineDishes };
  }

  // ================= AUTOMATIC OFFLINE SYNC =================

  /**
   * Drains the offline queue up to MockAPI when connection is restored
   */
  async syncOfflineChanges(): Promise<boolean> {
    if (this.isSyncing || !this.isOnline || this.isSimulatedOffline) {
      return false;
    }

    const queue = await this.getQueue();
    if (queue.length === 0) return true;

    try {
      this.isSyncing = true;
      this.notifyListeners();
      console.log(`[SyncService] Draining ${queue.length} offline changes to MockAPI...`);

      const remainingQueue: SyncQueueItem[] = [];

      for (const item of queue) {
        try {
          switch (item.action) {
            case 'CREATE_DISH': {
              const created = await mockApiService.createDish(item.payload);
              // Replace temporary local ID with the new MockAPI ID to prevent duplicate
              if (item.tempId) {
                const localDishes = await storageService.getDishes();
                const idx = localDishes.findIndex(d => d.BIT240023_Id === item.tempId);
                if (idx !== -1) {
                  localDishes[idx].BIT240023_Id = created.BIT240023_Id;
                  await storageService.saveDishes(localDishes);
                }
              }
              break;
            }
            case 'UPDATE_DISH': {
              await mockApiService.updateDish(item.payload);
              break;
            }
            case 'DELETE_DISH': {
              await mockApiService.deleteDish(item.payload.id);
              break;
            }
            case 'CREATE_CATEGORY': {
              const createdCat = await mockApiService.createCategory(item.payload);
              if (item.tempId) {
                const localCats = await storageService.getCategories();
                const idx = localCats.findIndex(c => c.BIT240023_Id === item.tempId);
                if (idx !== -1) {
                  localCats[idx].BIT240023_Id = createdCat.BIT240023_Id;
                  await storageService.saveCategories(localCats);
                }
              }
              break;
            }
            case 'DELETE_CATEGORY': {
              await mockApiService.deleteCategory(item.payload.id);
              break;
            }
          }
        } catch (itemErr) {
          console.error(`[SyncService] Failed to sync item ${item.id}:`, itemErr);
          remainingQueue.push(item); // Keep in queue to retry later
        }
      }

      await this.saveQueue(remainingQueue);

      // Refresh local storage with latest unified data from MockAPI
      await this.pullFromMockApi().catch(() => {});
      this.lastSyncTime = new Date();
      return remainingQueue.length === 0;
    } catch (e) {
      console.error('[SyncService] Global sync failed:', e);
      return false;
    } finally {
      this.isSyncing = false;
      this.notifyListeners();
    }
  }
}

export const syncService = new SyncService();
