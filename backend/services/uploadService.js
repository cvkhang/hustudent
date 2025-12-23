import { createClient } from '@supabase/supabase-js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials missing. Falling back to local storage.');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const BUCKETS = {
  avatars: 'avatars',
  attachments: 'attachments',
  posts: 'attachments'
};

// Ensure upload dir exists for local fallback
const UPLOAD_DIR = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Generate unique filename
 */
const generateFilename = (originalName) => {
  const ext = path.extname(originalName);
  const hash = crypto.randomBytes(16).toString('hex');
  return `${Date.now()}-${hash}${ext}`;
};

/**
 * Upload file to Supabase Storage
 */
export const uploadFile = async (bucket, file, folder = '') => {
  if (!supabase) {
    throw new AppError(ErrorCodes.INTERNAL_ERROR, 'Storage not configured. Check SUPABASE variables in .env');
  }

  const filename = generateFilename(file.originalname);
  const filePath = folder ? `${folder}/${filename}` : filename;

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) {
    console.error('Supabase Upload Error:', error);
    // Suggest solution if bucket missing
    if (error.statusCode === '404' || error.message.includes('not found')) {
      throw new AppError(ErrorCodes.INTERNAL_ERROR, `Bucket '${bucket}' not found on Supabase. Please create it and set public access.`);
    }
    throw new AppError(ErrorCodes.INTERNAL_ERROR, 'Failed to upload file to Supabase');
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return {
    path: filePath,
    url: publicUrl,
    filename,
    contentType: file.mimetype,
    size: file.size
  };
};

/**
 * Delete file from Supabase Storage
 */
export const deleteFile = async (bucket, filePath) => {
  if (supabase) {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
    if (error) console.error('Delete error:', error);
  } else {
    // Local delete fallback
    const localPath = path.join(UPLOAD_DIR, path.basename(filePath));
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
  }
};

// Specific upload functions
export const uploadAvatar = async (file, userId) => {
  return uploadFile(BUCKETS.avatars, file, userId);
};

export const uploadCover = async (file, userId) => {
  return uploadFile(BUCKETS.avatars, file, 'covers');
};

export const uploadAttachment = async (file, chatId) => {
  return uploadFile(BUCKETS.attachments, file, chatId);
};

export const uploadPostImage = async (file, userId) => {
  return uploadFile(BUCKETS.posts, file, userId);
};

export { BUCKETS };

export default {
  uploadFile,
  deleteFile,
  uploadAvatar,
  uploadCover,
  uploadAttachment,
  uploadPostImage,
  BUCKETS
};
