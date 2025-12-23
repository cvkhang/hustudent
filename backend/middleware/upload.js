import multer from 'multer';
import { AppError, ErrorCodes } from '../utils/errors.js';

// Memory storage for Supabase upload
const storage = multer.memoryStorage();

// File filter
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(ErrorCodes.VALIDATION_FAILED, 'Only image files allowed'), false);
  }
};

const attachmentFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(ErrorCodes.VALIDATION_FAILED, 'File type not allowed'), false);
  }
};

// Upload middlewares
const uploadAvatar = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single('avatar');

const uploadImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
}).array('images', 5);

const uploadAttachment = multer({
  storage,
  fileFilter: attachmentFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
}).single('file');

const uploadCover = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single('cover');

const uploadChatAttachments = multer({
  storage,
  fileFilter: attachmentFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB per file
}).array('files', 5);

// Error handler wrapper
const handleUpload = (uploadMiddleware) => (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError(ErrorCodes.VALIDATION_FAILED, 'File too large'));
      }
      return next(new AppError(ErrorCodes.VALIDATION_FAILED, err.message));
    }
    if (err) return next(err);
    next();
  });
};

export {
  handleUpload as uploadAvatar,
  handleUpload as uploadCover,
  handleUpload as uploadImages,
  handleUpload as uploadAttachment,
  handleUpload as uploadChatAttachments
};

// Named exports with wrapped handlers
export const avatar = handleUpload(uploadAvatar);
export const cover = handleUpload(uploadCover);
export const images = handleUpload(uploadImages);
export const attachment = handleUpload(uploadAttachment);
export const chatAttachments = handleUpload(uploadChatAttachments);

export default {
  uploadAvatar: handleUpload(uploadAvatar),
  uploadCover: handleUpload(uploadCover),
  uploadImages: handleUpload(uploadImages),
  uploadAttachment: handleUpload(uploadAttachment),
  uploadChatAttachments: handleUpload(uploadChatAttachments)
};
