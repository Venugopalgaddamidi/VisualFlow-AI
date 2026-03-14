import express from 'express';
import { generateDiagram } from '../controllers/generateController.js';

const router = express.Router();

router.post('/generate', generateDiagram);

export default router;
