import { mongoose } from 'mongoose';

const message = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'chatSession',
        required: true,
        index: true,
      },
      sender: {
        type: String,
        enum: ['user', 'ai'],
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
})

export default mongoose.model('message', message);