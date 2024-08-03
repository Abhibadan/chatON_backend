const {userModel}=require('../model/userModel');
const {connectedUserModel}=require('../model/connectedUserModel');
const {chatModel}=require('../model/chatModel');
const make_online=async (user_id,ip,socket_id)=>{
    const connectionDetials=await connectedUserModel.findOne({user_id}, { sockets: { $elemMatch: { current_ip: ip } } });
        if(connectionDetials.sockets.length==0){
            await connectedUserModel.updateOne({user_id},{$push:{sockets:{current_ip:ip,socket_id:socket_id}}});
        }else{
            await connectedUserModel.updateOne({user_id},
                { $set: { "sockets.$[elem].socket_id": socket_id } },
                { arrayFilters: [ { "elem.current_ip": ip} ] });
        }
        const checkConnection=await connectedUserModel.findOne({user_id});
        if(checkConnection.length>5){
            await connectedUserModel.updateOne({user_id},{$pop:{sockets:-1}});
        }
}
const make_offline=async(connection)=>{
    await connectedUserModel.updateOne({user_id:connection.user_id},{$pull:{sockets:{socket_id:connection.socket_id}}});
}
const connection_details=async(target_user)=>{
    const connectionDetials=await connectedUserModel.findOne({user_id:target_user});
    return connectionDetials;
}

const sendMessage=async(data)=>{
    const {message,sender,receiver}=data;
    const sender_details=await userModel.findOne({_id:sender});
    const chat_of_sender=await chatModel.find({sender_id:sender,receiver_id:receiver});
    if(chat_of_sender.length>0){
        await chatModel.updateOne({sender_id:sender,receiver_id:receiver},{
            $push:{
                messages:{
                    $each:[
                        {
                            message,
                            sender_name:`${sender_details.first_name} ${sender_details.last_name}`,
                            sender:true
                        }
                    ],
                    $position:0
                    
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
                    sender_name:`${sender_details.first_name} ${sender_details.last_name}`,
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
                    $each:[
                        {
                            message,
                            sender_name:`${sender_details.first_name} ${sender_details.last_name}`,
                            sender:false
                        }
                    ],
                    $position:0
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
                    sender_name:`${sender_details.first_name} ${sender_details.last_name}`,
                    sender:false
                }
            ]
        });
    }
    return connection_details(receiver).then((response)=>{
        return {message,sockets:response.sockets,sender:`${sender_details.first_name} ${sender_details.last_name}`};
    }).catch((err)=>{
        throw new Error(err);
    });
}

module.exports={
    make_online,
    make_offline,
    connection_details,
    sendMessage,
}