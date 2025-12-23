import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import env from './env.js';

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
      { url: `http://localhost:${env.PORT}/api`, description: 'Development server' },
      { url: 'https://hustudent.onrender.com/api', description: 'Production server' }
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token',
          description: 'JWT token stored in HTTP-only cookie'
        },
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT token in Authorization header'
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
            visibility: { type: 'string', enum: ['public', 'private'] },
            subject_tag: { type: 'string' }
          }
        },
        Quiz: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            description: { type: 'string' },
            visibility: { type: 'string', enum: ['public', 'private'] },
            tags: { type: 'array', items: { type: 'string' } },
            question_count: { type: 'integer' },
            attempt_count: { type: 'integer' }
          }
        },
        Chat: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['direct', 'group'] },
            last_message: { type: 'string' },
            unread_count: { type: 'integer' }
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
                message: { type: 'string' },
                details: { type: 'object' }
              }
            }
          }
        }
      }
    },
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User profile operations' },
      { name: 'Friends', description: 'Friend requests and list' },
      { name: 'Chats', description: 'Direct messaging and chat rooms' },
      { name: 'Groups', description: 'Study groups and sessions' },
      { name: 'Quiz', description: 'Quiz creation and attempts' },
      { name: 'Posts', description: 'Social posts and feed' },
      { name: 'Q&A', description: 'Questions and answers' },
      { name: 'Matching', description: 'Smart matching and study buddies' },
      { name: 'Subjects', description: 'Subject catalog and user subjects' }
    ],
    security: [
      { cookieAuth: [] },
      { bearerAuth: [] }
    ]
  },
  // Scan route files for JSDoc annotations
  apis: [
    './routes/*.js',
    './controllers/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
export default swaggerSpec;
