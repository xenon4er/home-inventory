import React, { useState, useEffect, useRef } from "react";
import { type Item } from "../db/db";
import { useInventoryStore } from "../store/inventoryStore";
import { savePhoto, loadPhoto, deletePhoto } from "../utils/imageStorage";
import { CameraModal } from "./CameraModal";
import { Dialog } from "./Dialog";
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
  const [showCamera, setShowCamera] = useState(false);
  const [newPhotoId, setNewPhotoId] = useState<string | null>(null); // временное новое фото
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
      setNewPhotoId(null); // сбрасываем временное фото

      // Загружаем фото для превью
      if (item.photoId) {
        loadPhoto(item.photoId).then((photo) => {
          setPhotoPreview(photo || "");
          setIsLoading(false);
        });
      } else {
        setPhotoPreview("");
        setIsLoading(false);
      }
    }
  }, [item, isOpen]);

  // При закрытии модалки удаляем временное фото, если оно было создано
  useEffect(() => {
    if (!isOpen && newPhotoId) {
      deletePhoto(newPhotoId).catch(console.error);
      setNewPhotoId(null);
    }
  }, [isOpen, newPhotoId]);

  if (!item) return null;

  const handlePhotoUpload = async (file: File) => {
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
      // Сохраняем новое фото (не удаляя старое)
      const photoId = await savePhoto(file);
      const preview = await loadPhoto(photoId);
      setNewPhotoId(photoId);
      setPhotoPreview(preview || "");
      toast.success("Фото загружено", { id: loadingToast });
    } catch (error) {
      console.error("Ошибка:", error);
      toast.error("Ошибка при обработке фото", { id: loadingToast });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePhotoUpload(file);
  };

  const handleCameraCapture = (file: File) => {
    handlePhotoUpload(file);
  };

  const handleRemovePhoto = () => {
    // Удаляем временное фото, если оно есть
    if (newPhotoId) {
      deletePhoto(newPhotoId).catch(console.error);
      setNewPhotoId(null);
    }
    setPhotoPreview("");
    // formData.photoId не трогаем — оно остаётся старым
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

    let finalPhotoId = formData.photoId;

    // Если было загружено новое фото
    if (newPhotoId) {
      // Удаляем старое фото, если оно было
      if (formData.photoId) {
        await deletePhoto(formData.photoId);
      }
      finalPhotoId = newPhotoId;
    }

    await updateItem(item.id!, {
      name: formData.name.trim(),
      location: formData.location.trim(),
      category,
      photoId: finalPhotoId || undefined,
    });

    toast.success("Изменения сохранены");
    onClose();
  };

  const existingCategories = categories.filter((c) => c !== "all");

  return (
    <>
      <Dialog
        isOpen={isOpen}
        onClose={onClose}
        title="✏️ Редактировать предмет"
      >
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
              <div className="photo-options">
                <button
                  type="button"
                  className="photo-option-btn"
                  onClick={() => setShowCamera(true)}
                >
                  📸 Сделать фото
                </button>
                <button
                  type="button"
                  className="photo-option-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  📁 Выбрать файл
                </button>
              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                ref={fileInputRef}
                style={{ display: "none" }}
              />

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
      </Dialog>

      <CameraModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCameraCapture}
      />
    </>
  );
};
