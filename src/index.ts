import 'dotenv/config';
import Fastify from 'fastify';
import fs from 'fs';
import path from 'path';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';

// Tools Routes
import toolsRoutes from './routes/tools.routes';
import realtimeRoutes from './routes/realtime.routes';
// SaaS Routes
import authRoutes from './routes/saas/auth.routes';
import companiesRoutes from './routes/saas/companies.routes';
import usersRoutes from './routes/saas/users.routes';
import clientsRoutes from './routes/saas/clients.routes';
// Specific Routes
import informativeTypesRoutes from './routes/informative-types.routes';
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
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      exposedHeaders: ['Content-Length', 'Content-Type'],
      maxAge: 86400, // 24 hours
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
          // Tools Tags
          //{ name: 'tools', description: 'Ferramentas auxiliares' },
          { name: 'realtime', description: 'Eventos em tempo real via SSE' },
          // SaaS Tags
          { name: 'auth', description: 'Autenticação e gerenciamento de usuários' },
          { name: 'companies', description: 'Gerenciamento de empresas' },
          { name: 'users', description: 'Gerenciamento de usuários' },
          { name: 'clients', description: 'Gerenciamento de clientes' },
          // Specific Tags
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

    fastify.get('/', { schema: { hide: true } }, async () => { return { status: 'Reportfy API is accessible.' } });

    fastify.get('/favicon.ico', async (request, reply) => {
      /*const publicPath = path.join(process.cwd(), 'public', 'favicon.ico');
      const rootPath = path.join(process.cwd(), 'favicon.ico');
      let filePath = '';

      if (fs.existsSync(publicPath)) filePath = publicPath;
      else if (fs.existsSync(rootPath)) filePath = rootPath;

      if (!filePath) {
        // No favicon provided — return no content so browsers stop requesting
        return reply.code(204).send();
      }

      const stat = fs.statSync(filePath);
      reply.header('Content-Type', 'image/x-icon');
      reply.header('Content-Length', String(stat.size));
      const stream = fs.createReadStream(filePath);
      return reply.code(200).send(stream);
      */
      
      const filePath = path.join(process.cwd(), 'public', 'favicon.ico');
      if (!filePath) {
        return reply.code(204).send();
      }
      const stat = fs.statSync(filePath);
      reply.header('Content-Type', 'image/x-icon');
      reply.header('Content-Length', String(stat.size));
      const stream = fs.createReadStream(filePath);
      return reply.code(200).send(stream);
    });

    // Register tools routes
    await fastify.register(toolsRoutes, { prefix: '/api/tools' });
    await fastify.register(realtimeRoutes, { prefix: '/api/realtime' });
    // Register SaaS routes
    await fastify.register(authRoutes, { prefix: '/api/auth' });
    await fastify.register(companiesRoutes, { prefix: '/api/companies' });
    await fastify.register(usersRoutes, { prefix: '/api/users' });
    await fastify.register(clientsRoutes, { prefix: '/api/clients' });
    // Register specific routes
    await fastify.register(informativeTypesRoutes, { prefix: '/api/informative-types' });
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