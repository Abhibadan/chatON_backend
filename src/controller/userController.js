const {userModel}=require('../model/userModel');
const {chatModel}=require('../model/chatModel');

const alluser=async(req,res)=>{
    const page=parseInt(req.query.page)||1;
    const search=req.query.search||'';
    const perpage=2;
    const limit=perpage*(page-1);
    const user=await userModel.aggregate([
        {
            $match:{
                $or:[
                    {first_name:{$regex:new RegExp(search),$options:'i'}},
                    {last_name:{$regex:new RegExp(search),$options:'i'}}
                ]
            }
        }
    ]).skip(limit).limit(perpage).exec();
    if(user.length){
        return res.status(410).json({'message':'No data found','success':false});
    }else{
        return res.status(200).json({'user':user,'success':true});
    }
}

const dashboard=async(req,res)=>{
    console.log(req.socket.remoteAddress);
    return res.status(200).send({message:"At dashboard after auth"});
}


const sendMessage=async(req,res)=>{
    console.log(req.body);
    const {message,receiver}=req.body;
    const sender=req.user._id;
    const chat_of_sender=await chatModel.find({sender_id:sender,receiver_id:receiver});
    if(chat_of_sender.length>0){
        await chatModel.updateOne({sender_id:sender,receiver_id:receiver},{
            $push:{
                messages:{
                    message,
                    sender:true
                }
            }
        });
    }else{
        await chatModel.create({
            sender_id:sender,
            receiver_id:receiver,
            messages:[
                {
                    message,
                    sender:true
                }
            ]
        });
    }
    const chat_of_reciver=await chatModel.find({sender_id:receiver,receiver_id:sender});
    if(chat_of_reciver.length>0){
        await chatModel.updateOne({sender_id:receiver,receiver_id:sender},{
            $push:{
                messages:{
                    message,
                    sender:false
                }
            }
        });
    }else{
        await chatModel.create({
            sender_id:receiver,
            receiver_id:sender,
            messages:[
                {
                    message,
                    sender:false
                }
            ]
        });
    }
    return res.status(200).send({message:"At dashboard after auth"});
}

module.exports={
    alluser,
    dashboard,
    sendMessage
}