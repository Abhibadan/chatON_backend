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

const socketMiddlewear = (socket, next) => {
  const user_id=socket.handshake.query.user_id;
  const token = socket.handshake.auth.token;
  var decoded = jwt.verify(token,process.env.JWT_SECRET);
  if(user_id==decoded._id){
    next();
  }else{
    return next(new Error('Authentication failed,Please login again'));
  }
};
module.exports={
    authMiddlewear,socketMiddlewear
}