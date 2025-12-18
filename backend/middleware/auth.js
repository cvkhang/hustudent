// Auth middleware
export const requireAuth = (req, res, next) => {
  // Mock auth
  req.user = { id: 1 }; // Mock user
  next();
};

export const requireAdmin = (req, res, next) => {
  const { groupId } = req.params;
  const userId = req.user?.id || 1;
  const { GroupMember } = await import('../models/GroupMember.js');
  if (!GroupMember.isAdmin(parseInt(groupId), userId)) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};