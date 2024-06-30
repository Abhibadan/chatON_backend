const {userModel}=require('../model/userModel');
// const {chatModel}=require('../model/chatModel');

const alluser=async(req,res)=>{
    const page=parseInt(req.query.page)||1;
    const search=req.query.search||'';
    const thisUser=req.user;
    const perpage=20;
    const limit=perpage*(page-1);
    const user=await userModel.aggregate([
        {
            $match:{
                $and:[
                    {
                        $or:[
                            {first_name:{$regex:new RegExp(search),$options:'i'}},
                            {last_name:{$regex:new RegExp(search),$options:'i'}}
                        ]
                    },
                    {
                        _id:{
                            $ne:thisUser._id
                        }
                    }
                ]
            }
        }
    ]).skip(limit).limit(perpage).exec();
    if(user.length==0){
        return res.status(410).json({'message':'No data found',user,'success':false});
    }else{
        return res.status(200).json({'user':user,'success':true});
    }
}

const dashboard=async(req,res)=>{
    console.log(req.socket.remoteAddress);
    return res.status(200).send({message:"At dashboard after auth"});
}



module.exports={
    alluser,
    dashboard
}