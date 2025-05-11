import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'md',
}) => {
  if (!isOpen) return null;
  
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      onClick={onClose}
    >
      {/* Overlay semi-transparente */}
      <div className="fixed inset-0 bg-black/50"></div>
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* Contenido del modal con fondo completamente opaco */}
        <div 
  onClick={(e) => e.stopPropagation()}
  className={clsx(
    "w-full transform overflow-hidden rounded-lg border border-secondary-700 shadow-xl transition-all bg-[#0f172a]", // Añadido bg-[#0f172a] en lugar del estilo inline
    maxWidthClasses[maxWidth]
  )}
>
          {/* Header del modal */}
          <div className="border-b border-secondary-700 bg-secondary-900 px-4 py-3 flex justify-between items-center">
            <h3 className="text-base font-medium text-white">
              {title}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-secondary-400 hover:text-white transition-colors focus:outline-none"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Cuerpo del modal con fondo completamente opaco */}
          <div className="p-5 bg-secondary-950">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};