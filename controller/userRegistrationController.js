const {userModel}=require('../model/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const saltRounds = 12;

const registration=async(req,res)=>{ 
    try{
        const email_regex=/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        const phone_regex=/^[+]{1}(?:[0-9\-\\(\\)\\/.]\s?){6,15}[0-9]{1}$/;
        let {password,first_name,last_name,email,phone}=req.body;
        if(password==null || password==""){
            return res.status(422).json({ message: "Please provide Password"});   
        }else if(first_name.length < 2 || last_name.length < 2){
            return res.status(422).json({ message: "Please provide valid first name & last name"});   
        }else if(!email_regex.test(email)){
            return res.status(422).json({ message: "Please provide valid email"});  
        }else if(!phone_regex.test(phone)){
            return res.status(422).json({ message: "Please provide valid phone number"});  
        }
        first_name=first_name[0].toUpperCase()+first_name.slice(1);
        last_name=last_name[0].toUpperCase()+last_name.slice(1);
        const salt = bcrypt.genSaltSync(saltRounds);
        const hash = bcrypt.hashSync(password, salt);
        const instance = new userModel({...req.body,first_name,last_name, password: hash });
        await instance.save()
          .then((user) => {
            var token = jwt.sign(user.toJSON(),process.env.JWT_SECRET,{ expiresIn: 60*60*24*7 });
            return res.status(200).json({ message: "User registration Successfull.", user:user.toJSON() , auth:token });
          })
          .catch((error) => {
            return res.status(422).json({ message: "Unable to register new uer.Please try again.", error });
          });
    }catch(error){
        return res.status(401).json({message:"Something went wrong! Please try again",error});
    }
}

const login =async(req,res)=>{
    const request=req.body;
    const user=await userModel.findOne({email:request.email}).exec();
    if(user==null){
        return res.status(401).json({message:"Please sign up before login",status:false});
    }
    if(bcrypt.compareSync(request.password,user.password)){
        var token = jwt.sign(user.toJSON(),process.env.JWT_SECRET,{ expiresIn: 60*60*24*7 });
        return res.status(200).json({ message: "User Login Successfull.", user:user.toJSON() , auth:token });

    }else{
        return res.status(401).json({message:"Please enter valid password",status:false})
    }
}
const dashboard=async(req,res)=>{
    return res.status(200).send({message:"At dashboard after auth"});
}
module.exports={
    registration,
    login,
    dashboard
}