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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
