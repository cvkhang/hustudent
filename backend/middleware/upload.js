
export const uploadChatAttachments = (req, res, next) => {
  // Mock middleware: does not process files but allows request to proceed
  // In real implementation, this would use multer
  req.files = [];
  next();
};
