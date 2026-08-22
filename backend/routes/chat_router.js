import { Router } from 'express';
import { isAuthenticated } from '../middleware/isAuthenticated.js';
import { streamChatMessage } from '../controller/chat_controller.js';  

const router = Router();

router.post('/:sessionId/stream', isAuthenticated, streamChatMessage);

export default router;