const {userModel}=require('../model/userModel');

const alluser=async(req,res)=>{
    const user=await userModel.find().sort({createdAt:-1});
    return res.status(200).json({'user':user,'success':true});

}

module.exports={
    alluser
}