// src/components/Dialog.tsx
import React, { useEffect, useRef } from "react";
import "./Dialog.css";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Эффект для открытия модального окна после монтирования
  useEffect(() => {
    if (isOpen) {
      // Показываем диалог
      dialogRef.current?.showModal();
    } else {
      // Если закрыт, то ничего не делаем, компонент исчезнет
      // Но на всякий случай закроем, если вдруг открыт
      dialogRef.current?.close();
    }
  }, [isOpen]);

  // Обработчики событий
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    const handleClick = (e: MouseEvent) => {
      if (e.target === dialog) {
        onClose();
      }
    };

    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("click", handleClick);

    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("click", handleClick);
    };
  }, [onClose]);

  // Если диалог закрыт, не рендерим ничего
  if (!isOpen) return null;

  return (
    <dialog ref={dialogRef} className="app-dialog">
      <div className="dialog-header">
        <h2>{title}</h2>
        <button className="dialog-close" onClick={onClose} aria-label="Закрыть">
          ×
        </button>
      </div>
      <div className="dialog-content">{children}</div>
    </dialog>
  );
};
