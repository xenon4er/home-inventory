import { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import toast from "react-hot-toast";
import "./CameraModal.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export const CameraModal = ({ isOpen, onClose, onCapture }: Props) => {
  const webcamRef = useRef<Webcam>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">(
    "environment",
  );
  const [hasCamera, setHasCamera] = useState(true);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setIsLoading(true);
      // Конвертируем base64 в File
      fetch(imageSrc)
        .then((res) => res.blob())
        .then((blob) => {
          const file = new File([blob], `photo-${Date.now()}.jpg`, {
            type: "image/jpeg",
          });
          onCapture(file);
          onClose();
        })
        .catch(() => {
          toast.error("Ошибка при сохранении фото");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      toast.error("Не удалось сделать фото");
    }
  }, [webcamRef, onCapture, onClose]);

  const switchCamera = useCallback(() => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  }, []);

  const handleUserMediaError = useCallback((error: string | DOMException) => {
    setHasCamera(false);

    let errorMessage = "Не удалось получить доступ к камере";

    if (typeof error === "string") {
      errorMessage = error;
    } else if (error.name === "NotAllowedError") {
      errorMessage =
        "Доступ к камере запрещен. Разрешите доступ в настройках браузера.";
    } else if (error.name === "NotFoundError") {
      errorMessage = "Камера не найдена. Проверьте подключение камеры.";
    } else if (error.name === "NotReadableError") {
      errorMessage = "Камера уже используется другим приложением.";
    } else if (error.name === "OverconstrainedError") {
      errorMessage = "Не удалось найти камеру с указанными параметрами.";
    }

    toast.error(errorMessage);
    console.error("Camera error:", error);
  }, []);

  // Если модальное окно закрыто, не рендерим содержимое
  if (!isOpen) return null;

  return (
    <div className="camera-overlay" onClick={onClose}>
      <div className="camera-container" onClick={(e) => e.stopPropagation()}>
        <div className="camera-header">
          <h3>Сделать фото</h3>
          <button className="camera-close" onClick={onClose}>
            ×
          </button>
        </div>

        {hasCamera ? (
          <>
            <div className="camera-preview">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                screenshotQuality={0.8}
                onUserMediaError={handleUserMediaError}
                videoConstraints={{
                  facingMode: facingMode,
                  width: { ideal: 1280 },
                  height: { ideal: 720 },
                }}
                className="webcam"
              />
            </div>

            <div className="camera-actions">
              <button
                className="camera-switch"
                onClick={switchCamera}
                disabled={isLoading}
              >
                🔄 Переключить камеру
              </button>
              <button
                className="camera-capture"
                onClick={capture}
                disabled={isLoading}
              >
                {isLoading ? "⏳ Обработка..." : "📸 Снять"}
              </button>
            </div>
          </>
        ) : (
          <div className="camera-error">
            <p>❌ Не удалось получить доступ к камере</p>
            <p className="camera-error-hint">
              Убедитесь, что вы разрешили доступ к камере
              <br />
              или используйте загрузку файла
            </p>
            <button className="btn btn-primary" onClick={onClose}>
              Понятно
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
