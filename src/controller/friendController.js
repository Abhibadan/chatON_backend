
const { ConnectionStates } = require("mongoose");
const {userModel}=require("../model/userModel");
const { ObjectId } = require('mongodb');
const validator = require('validator');
const {decrypt} = require("../helper/asyncDecrypt");
const {chatModel}=require("../model/chatModel");

/**
 * Handles the logic for sending a friend request to another user.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.user - The authenticated user making the request.
 * @param {string} req.body.friend_id - The ID of the user to send the friend request to.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<Object>} - A JSON response indicating the success or failure of the friend request.
 */
const sendFriendRequest = async (req, res) => {
  const user = req.user;
  const { friend_id } = req.body;
  if (friend_id == undefined) {
    return res
      .status(422)
      .json({ message: "Please provide requested friend details" });
  }

  try {
    const check_friend=await userModel
      .find({
        _id: friend_id,
        friendList: {
          $elemMatch: {
            user_id: user._id,
          },
        },
      }).select({
        friendList: {
          $elemMatch: {
            user_id: user._id,
          },
        },
      })
      .exec();
      if (check_friend.length > 0) {
        if (check_friend[0].friendList[0].status == "accepted") {
          return res
            .status(400)
            .json({ message: "Friend request already accepted" });
        } else if (check_friend[0].friendList[0].status == "pending") {
          return res
            .status(400)
            .json({ message: "Friend request already pending" });
        } else if (check_friend[0].friendList[0].status == "requested") {
          return res
            .status(400)
            .json({ message: "Friend request already send" });
        } else if (check_friend[0].friendList[0].status == "blocked_by_friend") {
          return res
            .status(400)
            .json({ message: "You are blocked by friend" });
        } else if (check_friend[0].friendList[0].status == "blocked") {
          return res
            .status(400)
            .json({ message: "Unblock user before sending request" });
        } 
      }
    
    const friend = await userModel
      .updateOne(
        { _id: friend_id },
        {
          $push: {
            friendList: {
              user_id: user._id,
              status: "requested",
            },
          },
        }
      )
      .exec();
    const user_updated = await userModel
      .updateOne(
        { _id: user._id },
        {
          $push: {
            friendList: {
              user_id: ObjectId.createFromHexString(friend_id),
              status: "pending",
            },
          },
        }
      )
      .exec();
    res.status(200).json({ message: "Frined request send successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
/**
 * Handles a friend request by updating the status of the friendship between the current user and the requested friend.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.user - The current authenticated user.
 * @param {Object} req.body.request - The encrypted friend request details.
 * @returns {Promise<Object>} - A JSON response with a success message or an error message.
 */

const handleFriendRequest = async (req, res) => {
  const user = req.user;
  const { request } = req.body;
  try {
    // const { friend_id, handle } = JSON.parse(decrypt(request));
    const { friend_id, handle } = req.body;
    if (friend_id == undefined) {
      return res
        .status(422)
        .json({ message: "Please provide requested friend details" });
    } else if (handle == undefined) {
      return res.status(422).json({ message: "Please provide handle" });
    }else{
      console.log("in else");
      const check_request_status=await userModel
      .find({ _id: user._id, friendList: { $elemMatch: { user_id: ObjectId.createFromHexString(friend_id) } } })
      .select({
        friendList: {
          $elemMatch: {
            user_id: user._id,
          },
        },
      }).exec();
      if(check_request_status.length > 0){
        if(check_request_status[0].friendList[0].status == "accepted"){
          return res
            .status(400)
            .json({ message: "Friend request already accepted" });
        }else if(check_request_status[0].friendList[0].status != "pending"){
          return res
          .status(400)
          .json({ message: "Friend request is pending" });
        }else if(check_request_status[0].friendList[0].status != "requested"){
          return res
          .status(400)
          .json({ message: "Friend request is already accepted" });
        }else if(check_request_status[0].friendList[0].status != "blocked_by_friend"){
          return res
          .status(400)
          .json({ message: "Friend request is already accepted" });
        }else if(check_request_status[0].friendList[0].status != "blocked"){
          return res
          .status(400)
          .json({ message: "Friend request is already accepted" });

        }
      }else{
        return res.status(406).json({ message: "No request exists from this user" });
      }
      
    }
    let handle_user = handle;
    let handle_friend;

    if (handle_user == "accepted") {
      handle_friend = handle_user;
    } else if (handle_user == "blocked") {
      handle_friend = "blocked_by_friend";
    } else if (handle_user == "connected") {
      handle_friend = handle_user;
    } else if (handle_user == "rejected") {
      try {
        await userModel
          .updateOne(
            { _id: friend_id, friendList: { $elemMatch: { user_id: user._id } } },
            { $pull: { friendList: { user_id: user._id } } }
          )
          .exec()
          .then((res) => {
            userModel
              .updateOne(
                { _id: user._id, friendList: { $elemMatch: { user_id: ObjectId.createFromHexString(friend_id) } } },
                { $pull: { friendList: { user_id: ObjectId.createFromHexString(friend_id) } } }
              )
              .exec();
            if (res.modifiedCount == 0) {
              throw new Error("Friend not found");
            }
          })
          .catch((error) => {
            throw new Error(error.message);
          });
        return res.status(200).json({ message: "Removed From frined list" });
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
      // return res.status(200).json({ message: "Removed From frined list" });
    }



    await userModel
      .updateOne(
        { _id: friend_id, friendList: { $elemMatch: { user_id: user._id } } },
        { $set: { "friendList.$[element].status": handle_friend } },
        { arrayFilters: [{ "element.user_id": user._id }] }
      )
      .exec()
      .then(async (response) => {
        if (response.modifiedCount == 0) {
          userModel
            .updateOne(
              { _id: user._id, friendList: { $elemMatch: { user_id: ObjectId.createFromHexString(friend_id) } } },
              { $pull: { friendList: { user_id: ObjectId.createFromHexString(friend_id) } } }
            )
            .exec();
          throw new Error("Friend not found");
        } else {
          userModel
            .updateOne(
              { _id: user._id, friendList: { $elemMatch: { user_id: ObjectId.createFromHexString(friend_id) } } },
              { $set: { "friendList.$[element].status": handle_user } },
              {
                arrayFilters: [
                  { "element.user_id": ObjectId.createFromHexString(friend_id) },
                ],
              }
            )
            .exec();
        }
        return res
          .status(200)
          .json({ message: "Frined status updated successfully" });
      })
      .catch((error) => {
        return res
          .status(404)
          .json({ message: error.message });
      });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const friendList=async(req,res)=>{
  let {page=1,per_page=50,status='accepted',order_by="time",order_type=1}=req.query;
  page=Number(page);
  per_page=Number(per_page);
  
  const skip=(page-1)*per_page;
  const user=req.user; 
  let pipeline=[
    {$match:{_id:user._id}},
    {$unwind:'$friendList'},
    {$sort:{'friendList.created_at':Number(order_type)}}
  ]
  if(status!='all'){
    pipeline.push({$match:{'friendList.status':status}});
  }
  pipeline.push({$lookup:{
    from:'users',
    localField:'friendList.user_id',
    foreignField:'_id',
    as:'friends'
  }});

  if(order_by=="time"){
    pipeline.push({$sort:{'friendList.created_at':Number(order_type)}});
  }if(order_by=="name"){
    pipeline.push({$sort:{'friends.first_name':Number(order_type)}});
  }
  pipeline.push(
    {$skip:skip},
    {$limit:per_page},
  {
    $project:{
      _id:0,
      first_name:{$first:'$friends.first_name'},
      last_name:{$first:'$friends.last_name'},
      connected_from:'$friendList.created_at'
    }
  })
  
  const friends=await userModel.aggregate(
    pipeline
  ).exec();
  if(friends.length==0){
    return res.status(204).json({data:'No friends forund'});
  }else{
    return res.status(200).json({data:friends,page,per_page});

  }
}

const oldMessages=async(req,res)=>{
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  const sender_id=req.params.sender;
  const receiver_id=req.params.receiver;
  const chat_of_user=await chatModel.find({sender_id,receiver_id});
  let counter=1;
  let timeout;
  if(chat_of_user.length==0){
      return res.end();
  }
  chat_of_user.forEach((messageGroup)=>{
    counter+=0;
    messageGroup.messages.forEach((message)=>{
      timeout=setTimeout(()=>{
          res.write(`data: ${JSON.stringify(message)}\n\n`);
      },counter*10);
      counter++;
    });
  })
  
  res.on('close', () => {
      console.log('connection closed');
      clearTimeout(timeout);
      res.end();
  });
}

module.exports={
    sendFriendRequest,
    handleFriendRequest,
    oldMessages,
    friendList

}
