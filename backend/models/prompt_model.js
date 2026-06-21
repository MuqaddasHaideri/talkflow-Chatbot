import mongoose, { Schema } from "mongoose";

const prompt = new mongoose.Schema({
    // username :{
    //     type : String,
    //     default : "guest"
    // },
    // generatedText:{
    //     type: String,
    //     required : true,
    // }
//time

}, { timestamps : true });
export default mongoose.model('generatedText', prompt);