
const { ConnectionStates } = require("mongoose");
const {userModel}=require("../model/userModel");
const { ObjectId } = require('mongodb');
var validator = require('validator');
const sendFriendRequest=async (req,res)=>{
    const user_id=req.params.id;
    const {friend_id}=req.body;
    if(user_id==undefined){
        return res.status(422).json({"message":"Please provide user details"});
    }else if(friend_id==undefined){
        return res.status(422).json({"message":"Please provide requested friend details"});
    }

    try{
        const user=await userModel.findById(user_id).exec().then((res)=>{
            return res;
        }).catch((error)=>{
           throw new Error('User not found');
        });
        const check_friend=await userModel.find({'_id':friend_id,'friendList':
            {$elemMatch:{
                'user_id':user._id,
                'status' :'requested',
            }}
        }).exec().then((res)=>{
            return res;
        }).catch((error)=>{
           throw new Error('Friend not found');
        });

        console.log(check_friend[0].friendList);
        for (let friend of check_friend[0].friendList){
            console.log(friend.user_id);
            console.log(user._id);
            console.log(friend.user_id.equals(user._id));
        }
        // const friend=await userModel.updateOne({'_id':friend_id},{$push:{
        //     friendList:{
        //         user_id:user._id,
        //         status:'requested'
        //     }
        // }}).exec().then((res)=>{
        //     return res;
        // }).catch((error)=>{
        //    throw new Error('Friend not found');
        // });
        
        res.status(200).json({"message":"Frined request send successfully"});
    }catch(error){
        return res.status(406).json({"message":error.message});
    }

    
}

module.exports={
    sendFriendRequest
}