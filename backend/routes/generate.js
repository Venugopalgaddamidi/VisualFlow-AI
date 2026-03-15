import express from 'express';
import { generateDiagram } from '../controllers/generateController.js';

const router = express.Router();

// Wrapper to handle async errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post('/generate', asyncHandler(generateDiagram));

export default router;
