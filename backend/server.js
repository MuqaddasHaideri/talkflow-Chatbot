import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { start } from './config/dbStart.js';
import authRoutes from './routes/auth_routers.js';
import session_routers from './routes/session_routers.js';
import chatRoutes from './routes/chat_router.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
    start();
// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', session_routers);
app.use('/api/chat', chatRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'TalkFlow API' }));

// Connect Database & Start Server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server & TalkFlow API running on port = ${PORT}`);
  });