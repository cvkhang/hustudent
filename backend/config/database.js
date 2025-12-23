import { Sequelize } from 'sequelize';
import env from './env.js';

const sequelize = new Sequelize(env.DATABASE_URL, {
  dialect: 'postgres',
  logging: env.NODE_ENV === 'development' ? console.log : false,
  dialectOptions: {
    ssl: env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
    connectTimeout: 60000 // 60 seconds
  },
  pool: {
    max: 10,
    min: 2,
    acquire: 60000, // 60 seconds
    idle: 10000,
    evict: 1000
  },
  retry: {
    max: 5
  }
});

export default sequelize;
