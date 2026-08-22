import {mongoose} from "mongoose"

const chatSession = new mongoose.Schema ({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
        index: true,
      },
      title: {
        type: String,
        default: 'New Chat',
        trim: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
},{timestamp :true})

export default mongoose.model ("chatSession", chatSession)