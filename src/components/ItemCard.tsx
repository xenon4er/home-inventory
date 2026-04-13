import { useState, useEffect, useCallback } from "react";
import { type Item } from "../db/db";
import { useInventoryStore } from "../store/inventoryStore";
import { loadPhoto, deletePhoto } from "../utils/imageStorage";
import { EditItemModal } from "./EditItemModal";
import toast from "react-hot-toast";
import "./ItemCard.css";

interface Props {
  item: Item;
}

export const ItemCard = ({ item }: Props) => {
  const { deleteItem } = useInventoryStore();
  const [showFullPhoto, setShowFullPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const loadPhotoAsync = useCallback(async () => {
    if (!item.photoId) {
      setPhotoUrl(null);
      setIsLoadingPhoto(false);
      return;
    }

    setIsLoadingPhoto(true);
    try {
      const photo = await loadPhoto(item.photoId);
      setPhotoUrl(photo);
    } catch (error) {
      console.error("Error loading photo:", error);
      setPhotoUrl(null);
    } finally {
      setIsLoadingPhoto(false);
    }
  }, [item.photoId]);

  useEffect(() => {
    loadPhotoAsync();
  }, [loadPhotoAsync]);

  const handleDelete = async () => {
    if (confirm(`Удалить "${item.name}"?`)) {
      if (item.photoId) {
        await deletePhoto(item.photoId);
      }
      await deleteItem(item.id!);
      toast.success("Предмет удален");
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleEditClose = () => {
    setShowEditModal(false);
  };

  return (
    <>
      <div className="item-card">
        {isLoadingPhoto ? (
          <div className="item-photo-placeholder">⏳ Загрузка...</div>
        ) : photoUrl ? (
          <div className="item-photo" onClick={() => setShowFullPhoto(true)}>
            <img src={photoUrl} alt={item.name} />
          </div>
        ) : (
          <div className="item-photo-placeholder">📦 Нет фото</div>
        )}

        <div className="item-info">
          <h3>{item.name}</h3>

          <div className="item-details">
            <div className="item-detail">
              <span>📍</span>
              <span>{item.location}</span>
            </div>
            <div className="item-detail">
              <span>🏷️</span>
              <span className="item-category">{item.category}</span>
            </div>
            <div className="item-date">
              Добавлен: {new Date(item.createdAt).toLocaleDateString("ru-RU")}
            </div>
          </div>

          <div className="item-actions">
            <button className="btn btn-secondary" onClick={handleEdit}>
              ✏️ Редактировать
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              🗑️ Удалить
            </button>
          </div>
        </div>
      </div>

      {showFullPhoto && photoUrl && (
        <div className="modal-overlay" onClick={() => setShowFullPhoto(false)}>
          <div className="modal-content">
            <img src={photoUrl} alt={item.name} />
            <button
              className="modal-close"
              onClick={() => setShowFullPhoto(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <EditItemModal
        isOpen={showEditModal}
        onClose={handleEditClose}
        item={item}
      />
    </>
  );
};
