import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import ProButton from './ProButton';

export default function ImageModal({ isOpen, onClose, imageUrl, imageName }) {
  const [scale, setScale] = React.useState(1);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = imageName || 'image';
    link.click();
  };

  React.useEffect(() => {
    if (isOpen) {
      setScale(1);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Controls */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <ProButton
            variant="ghost"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
          >
            <ZoomOut size={20} />
          </ProButton>
          <ProButton
            variant="ghost"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
          >
            <ZoomIn size={20} />
          </ProButton>
          <ProButton
            variant="ghost"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            onClick={(e) => { e.stopPropagation(); handleDownload(); }}
          >
            <Download size={20} />
          </ProButton>
          <ProButton
            variant="ghost"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            onClick={onClose}
          >
            <X size={20} />
          </ProButton>
        </div>

        {/* Image Name */}
        {imageName && (
          <div className="absolute top-4 left-4 z-10 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-white font-medium">
            {imageName}
          </div>
        )}

        {/* Image */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 20 }}
          className="relative max-w-7xl max-h-[90vh] p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <motion.img
            src={imageUrl}
            alt={imageName}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            style={{ scale }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        </motion.div>

        {/* Zoom indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-sm font-medium">
          {Math.round(scale * 100)}%
        </div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
