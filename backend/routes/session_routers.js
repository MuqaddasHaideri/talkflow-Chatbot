import { Router } from 'express';
import { isAuthenticated } from '../middleware/isAuthenticated.js';
import {
  getSessions,
  createSession,
  getSessionMessages,
  deleteSession,
} from '../controller/session_Controller.js';

const router = Router();

router.use(isAuthenticated); //   authenticated user Protect all session routes

router.get('/', getSessions);
router.post('/', createSession);
router.get('/:id/messages', getSessionMessages);
router.delete('/:id', deleteSession);

export default router;