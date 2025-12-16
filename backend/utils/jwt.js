
export const verifyToken = (token) => {
  // Mock verification
  // In real app, verify with jsonwebtoken
  if (token === 'invalid') return null;
  return { userId: '11111111-1111-1111-1111-111111111111' };
};
