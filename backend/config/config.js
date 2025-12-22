export const config = {
<<<<<<< HEAD
  port: process.env.PORT || 5000,
=======
  port: process.env.PORT || 3000,
>>>>>>> 462527b96fc15095c276acdd1a184feb484472e6
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOptions: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
  }
};
