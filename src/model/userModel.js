const mongoose=require('mongoose');
const mongoose_delete=require('mongoose-delete');
const friendSchema=new mongoose.Schema({
    user_id:{
        type: mongoose.Schema.ObjectId,
        ref:'user',
        required:true,
    },
    status:{
        type:String,
        enum:['requested','accepted','blocked'],
        default:'requested',
    }
},{_id:false});
const userSchema=new mongoose.Schema({
    first_name:{
        type:String
    },
    last_name:{
        type:String
    },
    email:{
        type:String,
        lowercase: true,
        required:true
    },
    phone:{
        type:String,
        unique:true,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
    friendList:{
        type:["friendSchema"],
        default:[],
    }
    
},{timestamps:true}).plugin(mongoose_delete, { deletedAt : true });

// userSchema.path('first_name').set(function(v) {
//     return capitalize(v);
//   });

userSchema.set('toJSON', {
    transform: function (doc, ret) {
      delete ret.password;
      delete ret.__v;
      return ret;
    }
  });
const userModel=mongoose.model('user',userSchema);
module.exports={
    userModel
}