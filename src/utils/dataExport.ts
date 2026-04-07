import { db } from "../db/db";
import toast from "react-hot-toast";

/**
 * Экспорт в CSV (для открытия в Excel)
 */
export async function exportToCSV(): Promise<void> {
  try {
    const items = await db.items.toArray();

    // Заголовки CSV
    const headers = [
      "Название",
      "Место",
      "Категория",
      "Дата добавления",
      "Дата обновления",
    ];

    // Данные
    const rows = items.map((item) => [
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.location.replace(/"/g, '""')}"`,
      `"${item.category.replace(/"/g, '""')}"`,
      new Date(item.createdAt).toLocaleDateString("ru-RU"),
      new Date(item.updatedAt).toLocaleDateString("ru-RU"),
    ]);

    // Формируем CSV
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Добавляем BOM для поддержки UTF-8 в Excel
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `home-inventory-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Экспортировано ${items.length} предметов в CSV`);
  } catch (error) {
    console.error("CSV Export error:", error);
    toast.error("Ошибка при экспорте в CSV");
  }
}

/**
 * Очистка всех данных
 */
export async function clearAllData(): Promise<void> {
  const confirmed = window.confirm(
    "⚠️ ВНИМАНИЕ! Это действие удалит ВСЕ предметы из инвентаря. Данные нельзя будет восстановить без резервной копии. Вы уверены?",
  );

  if (!confirmed) return;

  try {
    // Очищаем таблицы
    await db.items.clear();
    await db.photos.clear();

    toast.success("Все данные удалены");

    // Возвращаем Promise, чтобы компонент мог обновить состояние
    return Promise.resolve();
  } catch (error) {
    console.error("Clear data error:", error);
    toast.error("Ошибка при удалении данных");
    throw error;
  }
}
