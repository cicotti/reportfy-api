import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';

// Routes
import authRoutes from './routes/auth.routes';
import companiesRoutes from './routes/companies.routes';
import clientsRoutes from './routes/clients.routes';
import usersRoutes from './routes/users.routes';
import projectsRoutes from './routes/projects.routes';
import weatherRoutes from './routes/weather.routes';
import photosRoutes from './routes/photos.routes';

const PORT = parseInt(process.env.PORT || '3000', 10);
 
const fastify = Fastify({
  logger: { level: process.env.LOG_LEVEL || 'info' }
});

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

    // Health check
    fastify.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    fastify.get('/', async (request, reply) => {
      //return { hello: 'What are you looking for?' }
      return { hi: 'Fastify enable CORS' };
    });

    // Register routes
    await fastify.register(authRoutes, { prefix: '/api/auth' });
    await fastify.register(companiesRoutes, { prefix: '/api/companies' });
    await fastify.register(clientsRoutes, { prefix: '/api/clients' });
    await fastify.register(usersRoutes, { prefix: '/api/users' });
    await fastify.register(projectsRoutes, { prefix: '/api/projects' });
    await fastify.register(weatherRoutes, { prefix: '/api/weather' });
    await fastify.register(photosRoutes, { prefix: '/api/photos' });

    // Start server
    await fastify.listen({ port: PORT }).then(() => {
      console.log(`🚀 Server is running`);
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();