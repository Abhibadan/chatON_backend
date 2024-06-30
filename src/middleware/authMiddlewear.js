const jwt = require('jsonwebtoken');
const {userModel}=require('../model/userModel');
const authMiddlewear=async (req,res,next)=>{
    const authorization= req.headers.authorization;
    if(!authorization){
        return res.status(401).json({message:"Unauthorized user"});
    }
    const token= authorization.replace("Bearer ",'');
    try{
      var decoded = jwt.verify(token,process.env.JWT_SECRET);

    }catch(error){
      return res.status(401).json({message:"Unauthorized user"});
    }
    const count=await userModel.countDocuments({'phone':decoded.phone});
    if(count==1){
        req.user=await userModel.findOne({'phone':decoded.phone}).exec();
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
  try{
    var decoded = jwt.verify(token,process.env.JWT_SECRET);
    if(user_id==decoded._id){
      socket.user=decoded;
      next();
    }else{
      return next(new Error('Authentication failed,Please login again'));
    }
  }catch(error){
    return next(new Error('Authentication failed,Please login again'));
  }
  
};
module.exports={
    authMiddlewear,socketMiddlewear
}