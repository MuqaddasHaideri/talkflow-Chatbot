//routes 
import { Router } from 'express';
import { isAuthenticated } from '../middleware/isAuthenticated.js';
import {
  getSessions,
  createSession,
  getSessionMessages,
  deleteSession,
  updateSessionTitle,
} from '../controller/session_Controller.js';

const router = Router();
router.use(isAuthenticated); 

router.get('/', getSessions);
router.post('/', createSession);
router.get('/:id/messages', getSessionMessages);
router.delete('/:id', deleteSession);

export default router;