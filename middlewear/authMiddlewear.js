const jwt = require('jsonwebtoken');
const {userModel}=require('../model/userModel');
const authMiddlewear=async (req,res,next)=>{
    const authorization= req.headers.authorization;
    const token= authorization.replace("Bearer ",'');
    var decoded = jwt.verify(token,process.env.JWT_SECRET);
    const count=await userModel.countDocuments({'email':decoded.email});
    if(count==1){
        next();
    }else if(count>1){
        return res.status(403).json({message:"Duplicate record present"});
    }else{
        return res.status(401).json({message:"Unauthorized user"});
    }

};

module.exports={
    authMiddlewear,
}