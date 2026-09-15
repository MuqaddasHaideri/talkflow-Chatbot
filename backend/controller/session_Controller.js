import chatSession_model from '../models/chatSession_model.js';
import message_model from '../models/message_model.js';

export const getSessions = async (req, res) => {
  try {
    const sessions = await chatSession_model.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sessions.' });
  }
};

export const createSession = async (req, res) => {
  try {
    const { title } = req.body;
    const session = await chatSession_model.create({
      userId: req.user.userId,
      title: title || 'New Conversation',
    });
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create session.' });
  }
};

export const getSessionMessages = async (req, res) => {
  try {
    const session = await chatSession_model.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!session) return res.status(404).json({ error: 'Session not found.' });

    const messages = await message_model.find({ sessionId: session._id }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages.' });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const session = await chatSession_model.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!session) return res.status(404).json({ error: 'Session not found.' });

      await message_model.deleteMany({ sessionId: session._id });
    res.json({ message: 'Session deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete session.' });
  }
};

export const updateSessionTitle = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        error: 'Title is required.',
      });
    }

    const session = await chatSession_model.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.userId,
      },
      {
        title: title.trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!session) {
      return res.status(404).json({
        error: 'Session not found.',
      });
    }

    res.json(session);
  } catch (error) {
    console.error('Update session title error:', error);

    res.status(500).json({
      error: 'Failed to update session title.',
    });
  }
};