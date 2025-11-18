import { FC } from "react";

type Props = {
  isOpen: boolean;
  title?: string;
  message: string;
  onClose: () => void;
};

export const SuccessModal: FC<Props> = ({
  isOpen,
  title = "Sucesso!",
  message,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box text-center">
        <div className="mb-4 flex justify-center">
          <svg
            className="h-16 w-16 text-success"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-bold sm:text-xl">{title}</h3>
        <p className="py-4 text-sm sm:text-base">{message}</p>
        <div className="modal-action justify-center">
          <button
            className="btn btn-success btn-sm sm:btn-md"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/50" onClick={onClose}></div>
    </div>
  );
};

export default SuccessModal;
