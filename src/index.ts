import 'dotenv/config';
import Fastify from 'fastify';
//import cors from '@fastify/cors';
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
 
fastify.get('/', async (request, reply) => {
  return { hi: 'Fastfy log' }
});
 
fastify.listen({ port: PORT });