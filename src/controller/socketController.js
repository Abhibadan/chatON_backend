const {userModel}=require('../model/userModel');
const {connectedUserModel}=require('../../model/connectedUserModel');
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
const connection_details=async()=>{
    const connectionDetials=await connectedUserModel.findOne({user_id:'65e33c56ca2a3030c32a766a'});
    return connectionDetials;
}
module.exports={
    make_online,
    make_offline,
    connection_details
}