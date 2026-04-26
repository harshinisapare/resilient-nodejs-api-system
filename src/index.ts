import express from 'express';
import cors from 'cors';
import path from 'path';
import orderRoutes from './routes/orderRoutes';
import adminRoutes from './routes/adminRoutes';
import healthRoutes from './routes/healthRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', orderRoutes);
app.use('/admin', adminRoutes);
app.use('/', healthRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Resilient Node.js API System running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});