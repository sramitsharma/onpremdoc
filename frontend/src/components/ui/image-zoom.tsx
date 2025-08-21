import React from "react";
import { X } from "lucide-react";
import { KEYBOARD_KEYS } from "../../constants";

interface CloseButtonProps {
  onClick: () => void;
}

interface ZoomedImageProps {
  src: string;
  alt: string;
  onClose: () => void;
  onOverlayClick: (e: React.MouseEvent) => void;
}

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

const useImageZoom = () => {
  const [isZoomed, setIsZoomed] = React.useState(false);

  const handleImageClick = React.useCallback(() => {
    setIsZoomed(true);
    document.body.style.overflow = 'hidden';
  }, []);

  const handleClose = React.useCallback(() => {
    setIsZoomed(false);
    document.body.style.overflow = 'unset';
  }, []);

  const handleOverlayClick = React.useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }, [handleClose]);

  React.useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === KEYBOARD_KEYS.ESCAPE && isZoomed) {
        handleClose();
      }
    };

    if (isZoomed) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isZoomed, handleClose]);

  React.useEffect(() => {
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return {
    isZoomed,
    handleImageClick,
    handleClose,
    handleOverlayClick,
  };
};

const CloseButton = React.memo<CloseButtonProps>(({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors duration-200 p-2"
    aria-label="Close image"
  >
    <X className="h-6 w-6" />
  </button>
));

const ZoomedImage = React.memo<ZoomedImageProps>(({ src, alt, onClose, onOverlayClick }) => (
  <div
    className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
    onClick={onOverlayClick}
  >
    <div className="relative max-w-full max-h-full">
      <CloseButton onClick={onClose} />
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
      />
    </div>
  </div>
));

const ImageZoom: React.FC<ImageZoomProps> = ({ src, alt, className = "" }) => {
  const { isZoomed, handleImageClick, handleClose, handleOverlayClick } = useImageZoom();

  return (
    <>
      <img
        src={src}
        alt={alt}
        className={`cursor-pointer transition-all duration-300 hover:scale-105 ${className}`}
        onClick={handleImageClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === KEYBOARD_KEYS.ENTER || e.key === KEYBOARD_KEYS.SPACE) {
            e.preventDefault();
            handleImageClick();
          }
        }}
        aria-label="Click to zoom image"
      />
      
      {isZoomed && (
        <ZoomedImage
          src={src}
          alt={alt}
          onClose={handleClose}
          onOverlayClick={handleOverlayClick}
        />
      )}
    </>
  );
};

export default ImageZoom;
