import { createClient } from '@supabase/supabase-js';
import { AppError, ErrorCodes } from '../utils/errors.js';
import path from 'path';
import crypto from 'crypto';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase credentials missing. Please check .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKETS = {
  avatars: 'avatars',
  attachments: 'attachments',
  posts: 'attachments'
};



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
  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);
  if (error) console.error('Delete error:', error);
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
