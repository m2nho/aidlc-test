import { useEffect } from 'react';
import { UI_CONSTANTS } from '@/utility/constants';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type,
  onClose,
  duration = UI_CONSTANTS.TOAST_DURATION_MS,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeClasses = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
  };

  return (
    <div
      className={`fixed bottom-8 left-1/2 z-50 -translate-x-1/2 transform rounded-lg px-6 py-4 shadow-lg ${typeClasses[type]}`}
      role="alert"
    >
      <div className="flex items-center space-x-3">
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200"
          aria-label="닫기"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
