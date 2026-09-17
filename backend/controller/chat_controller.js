import { ai } from '../config/gemini.js';
import chatSession_model from '../models/chatSession_model.js';
import message_model from '../models/message_model.js';

// Helper with exponential backoff for transient 503 errors
const generateStreamWithRetry = async (params, retries = 3, delay = 1500) => {
  try {
    return await ai.models.generateContentStream(params);
  } catch (error) {
    const isServiceUnavailable =
      error?.status === 503 ||
      error?.error?.code === 503 ||
      error?.message?.includes('503');

    if (isServiceUnavailable && retries > 0) {
      console.warn(`[Gemini 503] Model busy. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return generateStreamWithRetry(params, retries - 1, delay * 2);
    }

    throw error;
  }
};

export const streamChatMessage = async (req, res) => {
  const { sessionId } = req.params;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Message text is required.' });
  }

  try {
    const session = await chatSession_model.findOne({ _id: sessionId, userId: req.user.userId });
    if (!session) {
      return res.status(404).json({ error: 'Chat session not found.' });
    }

    // 1. Save user's message
    await message_model.create({
      sessionId: session._id,
      sender: 'user',
      text: text.trim(),
    });

    // 2. Fetch recent conversation context
    const history = await message_model.find({ sessionId: session._id })
      .sort({ createdAt: -1 })
      .limit(10);

    const formattedContents = history.reverse().map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // 3. Request stream with verified model name and retry wrapper
    const streamResult = await generateStreamWithRetry({
      model: 'gemini-3.6-flash',
      contents: formattedContents,
    });

    // 4. Send SSE headers only after successfully opening the stream
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let fullAiResponse = '';

    for await (const chunk of streamResult) {
      const chunkText = chunk.text || '';
      fullAiResponse += chunkText;
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }

    // 5. Save generated response to DB
    await message_model.create({
      sessionId: session._id,
      sender: 'ai',
      text: fullAiResponse,
    });

    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (error) {
    console.error('Streaming error:', error);

    const is503 = error?.status === 503 || error?.error?.code === 503;

    if (!res.headersSent) {
      if (is503) {
        return res.status(503).json({
          error: 'Model servers are currently experiencing high demand. Please try again shortly.',
        });
      }
      return res.status(error?.status || 500).json({
        error: error?.message || 'Failed to stream response.',
      });
    }

    res.write(`data: ${JSON.stringify({ error: is503 ? 'Service overloaded midway through generation.' : 'Stream interrupted.' })}\n\n`);
    res.end();
  }
};