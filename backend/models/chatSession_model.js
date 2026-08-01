import {mongoose} from "mongoose"

const chatSession = new mongoose.Schema ({

userId :{
    type: mongoose.Schema.Types.ObjectId,
    ref : "users",
    default: null,
},
title : {
    type: String,
    default : ""
}
},{timestamp :true})

export default mongoose.model ("chatSession", chatSession)