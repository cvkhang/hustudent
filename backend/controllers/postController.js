import postService from '../services/postService.js';
import uploadService from '../services/uploadService.js';
import { AppError, ErrorCodes } from '../utils/errors.js';

const createPost = async (req, res, next) => {
  try {
    let uploadData = {};
    if (req.file) {
      console.log('📎 File received:', req.file.originalname, req.file.mimetype, `${(req.file.size / 1024).toFixed(2)} KB`);

      const isImage = req.file.mimetype.startsWith('image/');
      try {
        const uploaded = isImage
          ? await uploadService.uploadPostImage(req.file, req.userId)
          : await uploadService.uploadAttachment(req.file, req.userId);

        if (isImage) {
          uploadData.image_url = uploaded.url;
        } else {
          uploadData.attachment_url = uploaded.url;
        }
        uploadData.attachment_name = req.file.originalname;
        console.log('File uploaded successfully:', uploaded.url);
      } catch (uploadError) {
        console.error('Upload error:', uploadError.message);
        throw new AppError(ErrorCodes.INTERNAL_ERROR, `Không thể tải file lên: ${uploadError.message}`);
      }
    }

    const post = await postService.createPost(req.userId, { ...req.body, ...uploadData });
    res.status(201).json({ data: post });
  } catch (error) {
    console.error('Create post error:', error);
    next(error);
  }
};

const getPosts = async (req, res, next) => {
  try {
    const result = await postService.getFeed(req.userId, req.query);
    res.json({ data: result.posts, meta: result.meta });
  } catch (error) { next(error); }
};

const getPost = async (req, res, next) => {
  try {
    const post = await postService.getPostById(req.params.postId, req.userId);
    res.json({ data: post });
  } catch (error) { next(error); }
};

const updatePost = async (req, res, next) => {
  try {
    const post = await postService.updatePost(req.userId, req.params.postId, req.body);
    res.json({ data: post });
  } catch (error) { next(error); }
};

const deletePost = async (req, res, next) => {
  try {
    const result = await postService.deletePost(req.userId, req.params.postId);
    res.json({ data: result });
  } catch (error) { next(error); }
};

const likePost = async (req, res, next) => {
  try {
    const result = await postService.toggleLike(req.userId, req.params.postId, 'like');
    res.json({ data: result });
  } catch (error) { next(error); }
};

const unlikePost = async (req, res, next) => {
  try {
    const result = await postService.toggleLike(req.userId, req.params.postId, 'unlike');
    res.json({ data: result });
  } catch (error) { next(error); }
};

const bookmarkPost = async (req, res, next) => {
  try {
    const result = await postService.toggleBookmark(req.userId, req.params.postId, 'bookmark');
    res.json({ data: result });
  } catch (error) { next(error); }
};

const unbookmarkPost = async (req, res, next) => {
  try {
    const result = await postService.toggleBookmark(req.userId, req.params.postId, 'unbookmark');
    res.json({ data: result });
  } catch (error) { next(error); }
};

const getBookmarks = async (req, res, next) => {
  try {
    const result = await postService.getBookmarks(req.userId, req.query);
    res.json({ data: result.posts, meta: result.meta });
  } catch (error) { next(error); }
};

const getComments = async (req, res, next) => {
  try {
    const comments = await postService.getComments(req.params.postId);
    res.json({ data: comments });
  } catch (error) { next(error); }
};

const addComment = async (req, res, next) => {
  try {
    let commentData = { content: req.body.content };
    if (req.file) {
      const uploaded = await uploadService.uploadAttachment(req.file, req.userId);
      commentData.attachment_url = uploaded.url;
      commentData.attachment_name = req.file.originalname;
    }

    const comment = await postService.addComment(req.userId, req.params.postId, commentData);
    res.status(201).json({ data: comment });
  } catch (error) { next(error); }
};

const deleteComment = async (req, res, next) => {
  try {
    const result = await postService.deleteComment(req.userId, req.params.commentId);
    res.json({ data: result });
  } catch (error) { next(error); }
};

export default {
  createPost, getPosts, getPost, updatePost, deletePost,
  likePost, unlikePost, bookmarkPost, unbookmarkPost, getBookmarks,
  getComments, addComment, deleteComment
};
