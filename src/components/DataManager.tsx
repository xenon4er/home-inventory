import React, { useRef, useState } from "react";
import { exportToCSV, clearAllData } from "../utils/dataExport";
import toast from "react-hot-toast";
import "./DataManager.css";
import { exportToZip, importFromZip } from "../utils/dataExportZip";

interface Props {
  onDataImported?: () => void;
  onDataCleared?: () => void;
}

export const DataManager = ({ onDataImported, onDataCleared }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".zip")) {
      toast.error("Пожалуйста, выберите ZIP файл");
      return;
    }

    setIsImporting(true);

    try {
      await importFromZip(file);

      onDataImported?.();
      setIsOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllData();
      setIsOpen(false);
      onDataCleared?.();
    } catch (error) {
      console.error("Clear error:", error);
    }
  };

  return (
    <>
      {/* Кнопка открытия меню управления данными */}
      <button
        className="data-manager-btn"
        onClick={() => setIsOpen(true)}
        title="Управление данными"
      >
        ⚙️
      </button>

      {/* Модальное окно */}
      {isOpen && (
        <div className="data-manager-overlay" onClick={() => setIsOpen(false)}>
          <div
            className="data-manager-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="data-manager-header">
              <h2>Управление данными</h2>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                ×
              </button>
            </div>

            <div className="data-manager-content">
              {/* Экспорт */}
              <div className="data-section">
                <h3>📤 Экспорт</h3>
                <p className="section-description">
                  Сохраните резервную копию всех ваших предметов
                </p>
                <div className="button-group">
                  <button className="btn btn-primary" onClick={exportToZip}>
                    💾 Экспорт в ZIP
                  </button>
                  <button className="btn btn-secondary" onClick={exportToCSV}>
                    📊 Экспорт в CSV
                  </button>
                </div>
              </div>

              {/* Импорт */}
              <div className="data-section">
                <h3>📥 Импорт</h3>
                <p className="section-description">
                  Восстановите данные из резервной копии (ZIP)
                </p>
                <input
                  type="file"
                  accept=".zip"
                  onChange={handleImport}
                  ref={fileInputRef}
                  disabled={isImporting}
                  className="file-input"
                />
                {isImporting && (
                  <div className="importing-status">
                    <span className="spinner-small"></span>
                    <span>Импорт...</span>
                  </div>
                )}
              </div>

              {/* Очистка данных */}
              <div className="data-section danger">
                <h3>⚠️ Опасная зона</h3>
                <p className="section-description">
                  Удалить все данные без возможности восстановления
                </p>
                <button className="btn btn-danger" onClick={handleClearAll}>
                  🗑️ Очистить все данные
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
