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

// Upload middlewares (raw multer instances)
const multerAvatar = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single('avatar');

const multerImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
}).array('images', 5);

const multerAttachment = multer({
  storage,
  fileFilter: attachmentFilter,
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
}).single('file');

const multerCover = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
}).single('cover');

const multerChatAttachments = multer({
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

// Wrapped middlewares
export const uploadAvatar = handleUpload(multerAvatar);
export const uploadCover = handleUpload(multerCover);
export const uploadImages = handleUpload(multerImages);
export const uploadAttachment = handleUpload(multerAttachment);
export const uploadChatAttachments = handleUpload(multerChatAttachments);

export default {
  uploadAvatar,
  uploadCover,
  uploadImages,
  uploadAttachment,
  uploadChatAttachments
};
