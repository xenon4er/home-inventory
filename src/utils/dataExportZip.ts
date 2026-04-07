import JSZip from "jszip";
import { saveAs } from "file-saver";
import { db } from "../db/db";
import toast from "react-hot-toast";

export async function exportToZip(): Promise<void> {
  try {
    const zip = new JSZip();
    const items = await db.items.toArray();
    const photos = await db.photos.toArray();

    // Подготавливаем данные без Blob
    const exportData = items.map((item) => ({
      id: item.id,
      name: item.name,
      location: item.location,
      category: item.category,
      photoId: item.photoId || null,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }));

    // Сохраняем JSON
    zip.file("inventory.json", JSON.stringify(exportData, null, 2));

    // Сохраняем фото как отдельные файлы в папке images
    const imagesFolder = zip.folder("images");
    for (const photo of photos) {
      imagesFolder?.file(`${photo.id}.jpg`, photo.data);
    }

    const content = await zip.generateAsync({ type: "blob" });
    saveAs(
      content,
      `home-inventory-backup-${new Date().toISOString().split("T")[0]}.zip`,
    );

    toast.success(
      `Экспортировано ${items.length} предметов и ${photos.length} фото`,
    );
  } catch (error) {
    console.error("ZIP Export error:", error);
    toast.error("Ошибка при создании архива");
  }
}

/**
 * Импорт из ZIP архива
 */
export async function importFromZip(file: File): Promise<void> {
  try {
    const zip = await JSZip.loadAsync(file);

    // Читаем JSON
    const jsonFile = zip.file("inventory.json");
    if (!jsonFile) throw new Error("inventory.json не найден");

    const jsonContent = await jsonFile.async("string");
    const items = JSON.parse(jsonContent);

    // Читаем изображения из папки images
    const photoMap = new Map();

    // Получаем все файлы из папки images
    const imageFiles = Object.keys(zip.files).filter(
      (filename) => filename.startsWith("images/") && !zip.files[filename].dir,
    );

    for (const imagePath of imageFiles) {
      const imageFile = zip.files[imagePath];
      const blob = await imageFile.async("blob");
      // Извлекаем имя файла без пути images/
      const filename = imagePath.replace("images/", "");
      const photoId = filename.replace(".jpg", "");
      photoMap.set(photoId, blob);
    }

    // Импортируем данные
    let importedCount = 0;
    let photosImported = 0;

    for (const item of items) {
      const existing = await db.items.where("name").equals(item.name).first();

      if (!existing) {
        let photoId = item.photoId;

        // Если есть фото, восстанавливаем его
        if (photoId && photoMap.has(photoId)) {
          const blob = photoMap.get(photoId);
          await db.photos.add({
            id: photoId,
            data: blob,
            mimeType: "image/jpeg",
            size: blob.size,
            createdAt: new Date(),
          });
          photosImported++;
        } else if (photoId) {
          // Фото не найдено, удаляем ссылку
          photoId = undefined;
        }

        await db.items.add({
          ...item,
          photoId,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        importedCount++;
      }
    }

    toast.success(
      `Импортировано ${importedCount} предметов и ${photosImported} фото`,
    );
  } catch (error) {
    console.error("ZIP Import error:", error);
    throw new Error("Ошибка при импорте архива");
  }
}
