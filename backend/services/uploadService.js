
export const uploadAttachment = async (file, prefix) => {
  console.warn('Upload service is mocked. File not actually uploaded.');
  return {
    filename: file?.originalname || 'mock-file',
    url: 'https://placehold.co/600x400',
    size: file?.size || 0,
    contentType: file?.mimetype || 'application/octet-stream'
  };
};

export default { uploadAttachment };
