import { FC } from "react";

type Props = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  variant?: "danger" | "warning" | "info";
};

export const ConfirmDialog: FC<Props> = ({
  isOpen,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  isLoading = false,
  variant = "warning",
}) => {
  if (!isOpen) return null;

  const variantClasses = {
    danger: "btn-error",
    warning: "btn-warning",
    info: "btn-info",
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="text-lg font-bold sm:text-xl">{title}</h3>
        <p className="py-4 text-sm sm:text-base">{message}</p>
        <div className="modal-action">
          <button
            className="btn btn-outline btn-sm sm:btn-md"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </button>
          <button
            className={`btn btn-sm sm:btn-md ${variantClasses[variant]}`}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="loading loading-spinner loading-xs sm:loading-sm"></span>
                <span className="text-xs sm:text-sm">Processando...</span>
              </span>
            ) : (
              <span className="text-xs sm:text-sm">{confirmLabel}</span>
            )}
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/50" onClick={onCancel}></div>
    </div>
  );
};

export default ConfirmDialog;
