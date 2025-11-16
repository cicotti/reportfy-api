import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

// Routes
import authRoutes from './routes/saas/auth.routes';
import companiesRoutes from './routes/saas/companies.routes';
import clientsRoutes from './routes/saas/clients.routes';
import usersRoutes from './routes/saas/users.routes';
import informativeTypes from './routes/informative-types.routes';
import projectsRoutes from './routes/projects.routes';
import projectTasksRoutes from './routes/project-tasks.routes';
import projectWeatherRoutes from './routes/project-weather.routes';
import projectPhotosRoutes from './routes/project-photos.routes';
import projectInformativesRoutes from './routes/project-informatives.routes';

const PORT = parseInt(process.env.PORT || '5173', 10); // Default to 5173 for Vite compatibility
 
const fastify = Fastify({
  logger: { 
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
      }
    } : undefined
  }
}).withTypeProvider<TypeBoxTypeProvider>();

async function start() {
  try {
    // Register CORS
    await fastify.register(cors, {
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      credentials: true,
    });

    // Register multipart for file uploads
    await fastify.register(multipart, {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    });

    // Register Swagger
    await fastify.register(swagger, {
      openapi: {
        info: {
          title: 'Reportfy API',
          description: 'API de gerenciamento de projetos',
          version: '1.0.0',
        },
        servers: [
          {
            url: 'http://localhost:3000',
            description: 'Servidor de desenvolvimento',
          },
          {
            url: 'https://reportfy-api.vercel.app',
            description: 'Servidor de produção',
          },
        ],
        tags: [
          { name: 'auth', description: 'Autenticação e gerenciamento de usuários' },
          { name: 'companies', description: 'Gerenciamento de empresas' },
          { name: 'clients', description: 'Gerenciamento de clientes' },
          { name: 'users', description: 'Gerenciamento de usuários' },
          { name: 'informative-types', description: 'Gerenciamento de tipos de informativos' },
          { name: 'projects', description: 'Gerenciamento de projetos' },
          { name: 'project-tasks', description: 'Gerenciamento de tarefas de projetos' },
          { name: 'project-weathers', description: 'Informações meteorológicas' },
          { name: 'project-photos', description: 'Upload e gerenciamento de fotos' },          
          { name: 'project-informatives', description: 'Gerenciamento de informativos de projetos' },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
    });

    // Register Swagger UI
    await fastify.register(swaggerUi, {
      routePrefix: '/docs',
      uiConfig: { docExpansion: 'list', deepLinking: false },
      staticCSP: true,
      transformStaticCSP: (header) => header,
    });

    fastify.get('/', async () => {
      return { status: 'Reportfy API is accessible', timestamp: new Date().toISOString() };
    });

    // Register routes
    await fastify.register(authRoutes, { prefix: '/api/auth' });
    await fastify.register(companiesRoutes, { prefix: '/api/companies' });
    await fastify.register(clientsRoutes, { prefix: '/api/clients' });
    await fastify.register(usersRoutes, { prefix: '/api/users' });
    await fastify.register(informativeTypes, { prefix: '/api/informative-types' });
    await fastify.register(projectsRoutes, { prefix: '/api/projects' });
    await fastify.register(projectTasksRoutes, { prefix: '/api/project-tasks' });    
    await fastify.register(projectWeatherRoutes, { prefix: '/api/project-weather' });
    await fastify.register(projectPhotosRoutes, { prefix: '/api/project-photos' });    
    await fastify.register(projectInformativesRoutes, { prefix: '/api/project-informatives' });

    // Start server
    await fastify.listen({ port: PORT }).then(() => {
      console.log(`🚀 Server is running!`);
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();