import express from 'express';
import postController from '../controllers/postController.js';
import { uploadAttachment } from '../middleware/upload.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Posts CRUD
router.post('/', uploadAttachment, postController.createPost);
router.get('/bookmarks', postController.getBookmarks); // Must be before /:postId
router.get('/', postController.getPosts);
router.get('/:postId', postController.getPost);
router.patch('/:postId', postController.updatePost);
router.delete('/:postId', postController.deletePost);

// Likes
router.post('/:postId/like', postController.likePost);
router.delete('/:postId/like', postController.unlikePost);

// Bookmarks
router.post('/:postId/bookmark', postController.bookmarkPost);
router.delete('/:postId/bookmark', postController.unbookmarkPost);

// Comments
router.get('/:postId/comments', postController.getComments);
router.post('/:postId/comments', uploadAttachment, postController.addComment);

export default router;
