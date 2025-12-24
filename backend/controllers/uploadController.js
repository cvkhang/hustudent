import uploadService from '../services/uploadService.js';
import { User } from '../models/index.js';

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'No file uploaded' } });
    }

    const result = await uploadService.uploadAvatar(req.file, req.userId);

    // Update user avatar
    await User.update(
      { avatar_url: result.url },
      { where: { id: req.userId } }
    );

    res.json({ data: { avatarUrl: result.url } });
  } catch (e) { next(e); }
};

const uploadPostImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: { message: 'No files uploaded' } });
    }

    const results = await Promise.all(
      req.files.map(file => uploadService.uploadPostImage(file, req.userId))
    );

    res.json({ data: { images: results.map(r => r.url) } });
  } catch (e) { next(e); }
};

const uploadCover = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'No file uploaded' } });
    }

    const result = await uploadService.uploadCover(req.file, req.userId);

    // Update user cover photo
    await User.update(
      { cover_photo_url: result.url },
      { where: { id: req.userId } }
    );

    res.json({ data: { coverUrl: result.url } });
  } catch (e) { next(e); }
};

const uploadAttachment = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'No file uploaded' } });
    }

    const chatId = req.params.chatId || 'general';
    const result = await uploadService.uploadAttachment(req.file, chatId);

    res.json({ data: result });
  } catch (e) { next(e); }
};

export default { uploadAvatar, uploadCover, uploadPostImages, uploadAttachment };
