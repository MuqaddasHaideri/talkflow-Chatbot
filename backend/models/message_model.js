import { mongoose } from mongoose;

const message = new mongoose.Schema({
    sessionID: {
        type: mongoose.Schema.Type.objectId,
        ref: "chatSession",
        default: null
    },
    sender: {
        type: String,
        default: ""
    },
    text: {
        type: String,
        default: ""
    }
}, { timestamp: true })

export default mongoose.model('users', users);