import imageCompression from "browser-image-compression";
import { db } from "../db/db";

/**
 * Сохранение фото в отдельное хранилище
 */
export async function savePhoto(file: File): Promise<string> {
  // Сжатие
  const compressedFile = await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 1024,
    useWebWorker: true,
  });

  // Генерация ID
  const photoId = crypto.randomUUID();

  // Сохранение как Blob
  await db.photos.add({
    id: photoId,
    data: compressedFile,
    mimeType: compressedFile.type,
    size: compressedFile.size,
    createdAt: new Date(),
  });

  return photoId;
}

/**
 * Загрузка фото по ID для отображения
 */
export async function loadPhoto(photoId: string): Promise<string | null> {
  const photo = await db.photos.get(photoId);
  if (!photo) return null;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(photo.data);
  });
}

/**
 * Удаление фото
 */
export async function deletePhoto(photoId: string): Promise<void> {
  await db.photos.delete(photoId);
}

/**
 * Очистка неиспользуемых фото
 */
export async function cleanupOrphanedPhotos(): Promise<void> {
  const items = await db.items.toArray();
  const usedPhotoIds = new Set(
    items.map((item) => item.photoId).filter(Boolean),
  );

  const allPhotos = await db.photos.toArray();
  const orphanedPhotos = allPhotos.filter(
    (photo) => !usedPhotoIds.has(photo.id),
  );

  if (orphanedPhotos.length > 0) {
    await db.photos.bulkDelete(orphanedPhotos.map((p) => p.id));
    console.log(`Удалено ${orphanedPhotos.length} неиспользуемых фото`);
  }
}
