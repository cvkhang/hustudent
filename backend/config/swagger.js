import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'HUSTUDENT API',
      version: '1.0.0',
      description: 'API documentation for HUSTUDENT - Learning Social Network',
      contact: { name: 'HUSTUDENT Team' }
    },
    servers: [
      { url: `http://localhost:${env.PORT}/api`, description: 'Development' }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT token stored in HTTP-only cookie'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            full_name: { type: 'string' },
            avatar_url: { type: 'string' },
            university: { type: 'string' },
            major: { type: 'string' },
            academic_year: { type: 'string' }
          }
        },
        Subject: {
          type: 'object',
          properties: {
            code: { type: 'string', example: 'IT4785' },
            name: { type: 'string' },
            department: { type: 'string' },
            credits: { type: 'integer' }
          }
        },
        Group: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            visibility: { type: 'string', enum: ['public', 'private'] }
          }
        },
        Post: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            content: { type: 'string' },
            visibility: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' }
              }
            }
          }
        }
      }
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User profile operations' },
      { name: 'Friends', description: 'Friend requests and list' },
      { name: 'Chats', description: 'Direct messaging' },
      { name: 'Groups', description: 'Study groups' },
      { name: 'Sessions', description: 'Study sessions' },
      { name: 'Posts', description: 'Social posts and feed' },
      { name: 'Q&A', description: 'Questions and answers' },
      { name: 'Matching', description: 'Social matching features' }
    ]
  },
  apis: ['./src/docs/*.yaml']
};

module.exports = swaggerJsdoc(options);
