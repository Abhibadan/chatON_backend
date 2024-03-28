const {userModel}=require('../model/userModel');
const {connectedUserModel}=require('../model/connectedUserModel');
const make_online=async (user_id,ip,socket_id)=>{
    const user=await userModel.findById(user_id);
    const connectionDetials=await connectedUserModel.findOne({user_id:user._id});
    if(connectionDetials!==null){
        let currentConnection=connectionDetials.sockets;
        let flag=false;
        for (const con in currentConnection) {
            if(currentConnection[con].current_ip===ip){
                currentConnection[con].socket_id=socket_id;
                flag=true;
                break;
            }
        }
        if(!flag){
            currentConnection=[...connectionDetials.sockets.slice(-4),{current_ip:ip,socket_id:socket_id}];
        }
        await connectedUserModel.findOneAndUpdate({user_id:user._id},{sockets:currentConnection});

    }else{
        let newConnection= new connectedUserModel({user_id:user._id,sockets:[{current_ip:ip,socket_id:socket_id}]});
        await newConnection.save();
    }
}
const make_offline=async(connection)=>{
    const connectionDetials=await connectedUserModel.findOne({user_id:connection.user_id});
    console.log(connectionDetials);
}
const connection_details=async()=>{
    const connectionDetials=await connectedUserModel.findOne({user_id:'65e33c56ca2a3030c32a766a'});
    return connectionDetials;
}
module.exports={
    make_online,
    make_offline,
    connection_details
}