import { create } from "zustand";
import { db, type Item } from "../db/db";
import { cleanupOrphanedPhotos } from "../utils/imageStorage";

interface InventoryStore {
  items: Item[];
  isLoading: boolean;
  searchQuery: string;
  selectedCategory: string;
  categories: string[];

  loadItems: () => Promise<void>;
  addItem: (
    item: Omit<Item, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  updateItem: (id: string, updates: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  items: [],
  isLoading: false,
  searchQuery: "",
  selectedCategory: "all",
  categories: [],

  loadItems: async () => {
    set({ isLoading: true });
    const items = await db.items.toArray();
    const categories = ["all", ...new Set(items.map((item) => item.category))];
    set({ items, categories, isLoading: false });

    cleanupOrphanedPhotos().catch(console.error);
  },

  addItem: async (item) => {
    const newItem: Item = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db.items.add(newItem);
    const items = await db.items.toArray();
    const categories = ["all", ...new Set(items.map((item) => item.category))];
    set({ items, categories });
  },

  updateItem: async (id, updates) => {
    await db.items.update(id, { ...updates, updatedAt: new Date() });
    const items = await db.items.toArray();
    set({ items });
  },

  deleteItem: async (id) => {
    await db.items.delete(id);
    const items = await db.items.toArray();
    const categories = ["all", ...new Set(items.map((item) => item.category))];
    set({ items, categories });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
}));
