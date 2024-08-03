const mongoose = require("mongoose");
const messageSchema=new mongoose.Schema({
    message:{
        type:String,
        required:true
    },
    sender:{
        type: Boolean,
        required:true,
        default:true
    },
    sender_name:{
        type:String,
        required:true
    },
    created_at:{
        type:Date,
        default:Date.now
    }
})
const chatSchema= new mongoose.Schema(
    {
        sender_id:{
            type: mongoose.Schema.ObjectId,
            ref:'user',
            required:true
        },
        receiver_id:{
            type: mongoose.Schema.ObjectId,
            ref:'user',
            required:true
        },
        messages:{
            type:[messageSchema],
            default:[]
        }
    }
)
const chatModel=mongoose.model('chat',chatSchema);
module.exports={
    chatModel
};