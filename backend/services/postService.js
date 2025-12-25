import { Op } from 'sequelize';
import { User, Post, PostLike, PostBookmark, PostComment, Group, Friendship, sequelize } from '../models/index.js';
import { AppError, ErrorCodes } from '../utils/errors.js';

/**
 * Create a new post
 */
const createPost = async (userId, { content, title, type = 'share', tags, visibility = 'public', groupId, attachments = [], image_url, attachment_url, attachment_name, subject_tag }) => {
  if (!content && !attachment_url && type === 'share') {
    throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Content or file is required for sharing');
  }

  if (visibility === 'group' && !groupId) {
    throw new AppError(ErrorCodes.VALIDATION_ERROR, 'groupId is required for group visibility');
  }

  console.log('📝 Creating post with data:', {
    userId,
    title,
    type,
    has_content: !!content,
    has_attachment: !!attachment_url,
    attachment_name,
    subject_tag
  });

  const post = await Post.create({
    author_id: userId,
    group_id: groupId || null,
    visibility,
    content,
    title,
    type,
    tags: tags || [],
    image_url,
    attachment_url,
    attachment_name,
    subject_tag
  });

  console.log('✅ Post created with ID:', post.id);
  return getPostById(post.id, userId);
};

/**
 * Get post by ID with author and counts
 */
const getPostById = async (postId, userId = null) => {
  const post = await Post.findByPk(postId, {
    include: [
      { model: User, as: 'author', attributes: ['id', 'full_name', 'avatar_url'] },
      { model: Group, as: 'group', attributes: ['id', 'name'], required: false }
    ]
  });

  if (!post || post.deleted_at) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'Post not found');
  }

  const [likeCount, commentCount] = await Promise.all([
    PostLike.count({ where: { post_id: postId } }),
    PostComment.count({ where: { post_id: postId, deleted_at: null } })
  ]);

  let isLiked = false, isBookmarked = false;
  if (userId) {
    const [like, bookmark] = await Promise.all([
      PostLike.findOne({ where: { post_id: postId, user_id: userId } }),
      PostBookmark.findOne({ where: { post_id: postId, user_id: userId } })
    ]);
    isLiked = !!like;
    isBookmarked = !!bookmark;
  }

  return { ...post.toJSON(), likeCount, commentCount, isLiked, isBookmarked };
};

/**
 * Get feed posts
 */
const getFeed = async (userId, { scope = 'public', groupId, tag, q, subject, author_id, page = 1, limit = 20 }) => {
  const where = { deleted_at: null };

  if (scope === 'group' && groupId) {
    where.group_id = groupId;
  } else if (scope === 'public') {
    where.visibility = 'public';
  }

  if (tag) {
    where.tags = { [Op.contains]: [tag] };
  }

  if (subject) {
    where.subject_tag = subject;
  }

  if (q) {
    where.content = { [Op.iLike]: `%${q}%` };
  }

  // Support filtering by author (My Documents)
  if (author_id) {
    where.author_id = author_id;
  }

  const offset = (page - 1) * limit;

  const { rows, count } = await Post.findAndCountAll({
    where,
    include: [
      { model: User, as: 'author', attributes: ['id', 'full_name', 'avatar_url'] }
    ],
    limit,
    offset,
    order: [['created_at', 'DESC']]
  });

  // Add counts and user interactions
  const postsWithCounts = await Promise.all(
    rows.map(async (post) => {
      const [likeCount, commentCount] = await Promise.all([
        PostLike.count({ where: { post_id: post.id } }),
        PostComment.count({ where: { post_id: post.id, deleted_at: null } })
      ]);

      let isLiked = false, isBookmarked = false;
      if (userId) {
        const [like, bookmark] = await Promise.all([
          PostLike.findOne({ where: { post_id: post.id, user_id: userId } }),
          PostBookmark.findOne({ where: { post_id: post.id, user_id: userId } })
        ]);
        isLiked = !!like;
        isBookmarked = !!bookmark;
      }

      return { ...post.toJSON(), likeCount, commentCount, isLiked, isBookmarked };
    })
  );

  return {
    posts: postsWithCounts,
    meta: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) }
  };
};

/**
 * Update post
 */
const updatePost = async (userId, postId, updates) => {
  const post = await Post.findByPk(postId);
  if (!post || post.deleted_at) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'Post not found');
  }

  if (post.author_id !== userId) {
    throw new AppError(ErrorCodes.FORBIDDEN, 'Only author can edit post');
  }

  const allowedFields = ['content', 'tags', 'visibility'];
  const filteredUpdates = {};
  for (const field of allowedFields) {
    if (updates[field] !== undefined) filteredUpdates[field] = updates[field];
  }

  await post.update(filteredUpdates);
  return getPostById(postId, userId);
};

/**
 * Delete post (soft delete)
 */
const deletePost = async (userId, postId) => {
  const post = await Post.findByPk(postId);
  if (!post || post.deleted_at) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'Post not found');
  }

  if (post.author_id !== userId) {
    throw new AppError(ErrorCodes.FORBIDDEN, 'Only author can delete post');
  }

  await post.update({ deleted_at: new Date() });
  return { message: 'Post deleted' };
};

/**
 * Like/unlike post
 */
const toggleLike = async (userId, postId, action) => {
  const post = await Post.findByPk(postId);
  if (!post || post.deleted_at) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'Post not found');
  }

  if (action === 'like') {
    await PostLike.findOrCreate({
      where: { post_id: postId, user_id: userId },
      defaults: { post_id: postId, user_id: userId }
    });
    return { liked: true };
  } else {
    await PostLike.destroy({ where: { post_id: postId, user_id: userId } });
    return { liked: false };
  }
};

/**
 * Bookmark/unbookmark post
 */
const toggleBookmark = async (userId, postId, action) => {
  const post = await Post.findByPk(postId);
  if (!post || post.deleted_at) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'Post not found');
  }

  if (action === 'bookmark') {
    await PostBookmark.findOrCreate({
      where: { post_id: postId, user_id: userId },
      defaults: { post_id: postId, user_id: userId }
    });
    return { bookmarked: true };
  } else {
    await PostBookmark.destroy({ where: { post_id: postId, user_id: userId } });
    return { bookmarked: false };
  }
};

/**
 * Get user's bookmarked posts
 */
const getBookmarks = async (userId, { page = 1, limit = 20 }) => {
  const bookmarks = await PostBookmark.findAll({
    where: { user_id: userId },
    attributes: ['post_id'],
    order: [['created_at', 'DESC']]
  });

  const postIds = bookmarks.map(b => b.post_id);
  if (postIds.length === 0) {
    return { posts: [], meta: { page, limit, total: 0, totalPages: 0 } };
  }

  const offset = (page - 1) * limit;
  const { rows, count } = await Post.findAndCountAll({
    where: { id: { [Op.in]: postIds }, deleted_at: null },
    include: [{ model: User, as: 'author', attributes: ['id', 'full_name', 'avatar_url'] }],
    limit,
    offset
  });

  // Add counts and flags
  const postsWithCounts = await Promise.all(
    rows.map(async (post) => {
      const [likeCount, commentCount] = await Promise.all([
        PostLike.count({ where: { post_id: post.id } }),
        PostComment.count({ where: { post_id: post.id, deleted_at: null } })
      ]);

      const isLiked = userId ? await PostLike.findOne({ where: { post_id: post.id, user_id: userId } }) !== null : false;

      return { ...post.toJSON(), likeCount, commentCount, isLiked, isBookmarked: true };
    })
  );

  return {
    posts: postsWithCounts,
    meta: { page: parseInt(page), limit: parseInt(limit), total: count, totalPages: Math.ceil(count / limit) }
  };
};

/**
 * Get post comments
 */
const getComments = async (postId) => {
  const comments = await PostComment.findAll({
    where: { post_id: postId, deleted_at: null },
    include: [{ model: User, as: 'author', attributes: ['id', 'full_name', 'avatar_url'] }],
    order: [['created_at', 'ASC']]
  });
  return comments;
};

/**
 * Add comment
 */
const addComment = async (userId, postId, { content, attachment_url, attachment_name }) => {
  const post = await Post.findByPk(postId);
  if (!post || post.deleted_at) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'Post not found');
  }

  if (!content && !attachment_url) {
    throw new AppError(ErrorCodes.VALIDATION_ERROR, 'Content or attachment is required');
  }

  const comment = await PostComment.create({
    post_id: postId,
    author_id: userId,
    content: content || '',
    attachment_url,
    attachment_name
  });

  return PostComment.findByPk(comment.id, {
    include: [{ model: User, as: 'author', attributes: ['id', 'full_name', 'avatar_url'] }]
  });
};

/**
 * Delete comment
 */
const deleteComment = async (userId, commentId) => {
  const comment = await PostComment.findByPk(commentId);
  if (!comment || comment.deleted_at) {
    throw new AppError(ErrorCodes.NOT_FOUND, 'Comment not found');
  }

  if (comment.author_id !== userId) {
    throw new AppError(ErrorCodes.FORBIDDEN, 'Only author can delete comment');
  }

  await comment.update({ deleted_at: new Date() });
  return { message: 'Comment deleted' };
};

export default {
  createPost,
  getPostById,
  getFeed,
  updatePost,
  deletePost,
  toggleLike,
  toggleBookmark,
  getBookmarks,
  getComments,
  addComment,
  deleteComment
};
