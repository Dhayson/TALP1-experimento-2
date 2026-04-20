import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import studentRoutes from './routes/students';
import classRoutes from './routes/classes';
import testRoutes from './routes/tests';
import { checkAndSendDailyEmail } from './services/emailService';

const app = express();
const PORT = process.env.PORT || 3001;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Classroom Management API',
      version: '1.0.0',
      description: 'API for managing students, classes, and test results',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
      },
    ],
  },
  apis: ['./server/src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/students', studentRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/classes', testRoutes);

cron.schedule('0 12 * * *', async () => {
  console.log('Running daily email job...');
  await checkAndSendDailyEmail();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});