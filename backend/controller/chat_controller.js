import { ai } from '../config/gemini.js';
import chatSession_model from '../models/chatSession_model.js';
import message_model from '../models/message_model.js';

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

    // Save user's message
    await message_model.create({
      sessionId: session._id,
      sender: 'user',
      text: text.trim(),
    });

    // Retrieve last 10 messages for conversational memory
    const history = await message_model.find({ sessionId: session._id })
      .sort({ createdAt: -1 })
      .limit(10);

    const formattedContents = history.reverse().map((msg) => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));

    // Server-Sent Events headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    const streamResult = await ai.models.generateContentStream({
      model: 'gemini-3.6-flash',
      contents: formattedContents,
    });

    let fullAiResponse = '';

    for await (const chunk of streamResult) {
      const chunkText = chunk.text || '';
      fullAiResponse += chunkText;
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }

    // Save generated AI response
    await message_model.create({
      sessionId: session._id,
      sender: 'ai',
      text: fullAiResponse,
    });

    res.write(`data: [DONE]\n\n`);
    res.end();
  } catch (error) {
    console.error('Streaming error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to stream response.' });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'Stream interrupted.' })}\n\n`);
      res.end();
    }
  }
};