import Fastify from 'fastify'
 
const fastify = Fastify({ logger: true });
 
fastify.get('/', async (request, reply) => {
  return { hi: 'What are you looking for?' }
});
 
fastify.listen({ port: 3000 });