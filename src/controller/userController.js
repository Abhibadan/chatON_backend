const {userModel}=require('../model/userModel');

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
module.exports={
    alluser,
    dashboard

}