const online_user={};
const make_online=(user_id,socket_id)=>{
    
    online_user[user_id]=socket_id;
}
const make_offline=(user_id)=>{
    delete online_user[user_id];
}
module.exports={
    online_user,
    make_online,
    make_offline
}