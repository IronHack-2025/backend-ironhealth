import serverless from 'serverless-http';
import app from './app.js';

// Configurar serverless-http para manejar el prefijo /prod
export const handler = serverless(app, {
  basePath: '/prod',
  request(request, event, _context) {
    console.log('Lambda event:', JSON.stringify(event, null, 2));
    console.log('Request path:', request.path);
    console.log('Request method:', request.method);
  },
  response(response, _event, _context) {
    console.log('Response status:', response.statusCode);
  },
});
