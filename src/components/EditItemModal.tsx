import React, { useState, useEffect, useRef } from "react";
import { type Item } from "../db/db";
import { useInventoryStore } from "../store/inventoryStore";
import { savePhoto, loadPhoto, deletePhoto } from "../utils/imageStorage";
import toast from "react-hot-toast";
import "./EditItemModal.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: Item | null;
}

export const EditItemModal = ({ isOpen, onClose, item }: Props) => {
  const { updateItem, categories } = useInventoryStore();
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    category: "",
    photoId: "",
  });
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [newCategory, setNewCategory] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Загружаем данные предмета при открытии
  useEffect(() => {
    if (item && isOpen) {
      setIsLoading(true);
      setFormData({
        name: item.name,
        location: item.location,
        category: item.category,
        photoId: item.photoId || "",
      });

      // Загружаем фото для превью
      if (item.photoId) {
        loadPhoto(item.photoId).then((photo) => {
          setPhotoPreview(photo || "");
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Пожалуйста, выберите изображение");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Файл слишком большой. Максимум 10MB");
      return;
    }

    setIsCompressing(true);
    const loadingToast = toast.loading("Сжатие фото...");

    try {
      // Если было старое фото, удаляем его
      if (formData.photoId) {
        await deletePhoto(formData.photoId);
      }

      // Сохраняем новое фото
      const photoId = await savePhoto(file);
      const preview = await loadPhoto(photoId);

      setFormData((prev) => ({ ...prev, photoId }));
      setPhotoPreview(preview || "");

      toast.success("Фото обновлено", { id: loadingToast });
    } catch (error) {
      console.error("Ошибка:", error);
      toast.error("Ошибка при обработке фото", { id: loadingToast });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (formData.photoId) {
      await deletePhoto(formData.photoId);
      setFormData((prev) => ({ ...prev, photoId: "" }));
      setPhotoPreview("");
      toast.success("Фото удалено");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Введите название предмета");
      return;
    }

    if (!formData.location.trim()) {
      toast.error("Укажите место хранения");
      return;
    }

    const category = newCategory.trim() || formData.category;
    if (!category) {
      toast.error("Выберите или введите категорию");
      return;
    }

    await updateItem(item.id!, {
      name: formData.name.trim(),
      location: formData.location.trim(),
      category,
      photoId: formData.photoId || undefined,
    });

    toast.success("Изменения сохранены");
    onClose();
  };

  const existingCategories = categories.filter((c) => c !== "all");

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Редактировать предмет</h2>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="modal-loading">Загрузка...</div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label>Название *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Например: Дрель Makita"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Где лежит? *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder="Например: Красный ящик в гараже"
              />
            </div>

            <div className="form-group">
              <label>Категория *</label>
              {existingCategories.length > 0 && (
                <select
                  value={formData.category}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }));
                    setNewCategory("");
                  }}
                >
                  <option value="">Выберите категорию</option>
                  {existingCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}

              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Или введите новую категорию"
                className="mt-2"
              />
            </div>

            <div className="form-group">
              <label>Фото</label>
              <div className="photo-upload-area">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  ref={fileInputRef}
                  disabled={isCompressing}
                  className="photo-input"
                />
                {isCompressing && (
                  <div className="compressing-indicator">
                    <span className="spinner"></span>
                    <span>Сжатие фото...</span>
                  </div>
                )}
              </div>

              {photoPreview && (
                <div className="photo-preview">
                  <img src={photoPreview} alt="Preview" />
                  <div className="photo-info">
                    <span className="photo-size">Фото</span>
                    <button
                      type="button"
                      className="photo-remove"
                      onClick={handleRemovePhoto}
                    >
                      Удалить фото
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Отмена
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isCompressing}
              >
                Сохранить
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
