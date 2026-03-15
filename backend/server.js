import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import generateRoutes from './routes/generate.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', generateRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Text to Diagram AI Backend is running.');
});

// Global error handler (must be last)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected error occurred on the server.'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
