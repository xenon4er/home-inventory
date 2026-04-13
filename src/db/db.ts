import Dexie, { type Table } from "dexie";

export interface Item {
  id?: string;
  name: string;
  location: string;
  category: string;
  photoId?: string; // ← Ссылка на файл, а не само фото
  createdAt: Date;
  updatedAt: Date;
}

export interface PhotoFile {
  id: string; // ← photoId
  data: Blob; // ← Бинарные данные
  mimeType: string;
  size: number;
  createdAt: Date;
}

export class InventoryDB extends Dexie {
  items!: Table<Item, string>;
  photos!: Table<PhotoFile, string>;

  constructor() {
    super("InventoryDB");
    this.version(2).stores({
      items: "id, name, location, category, createdAt, updatedAt",
      photos: "id, size, createdAt",
    });
  }
}

export const db = new InventoryDB();
