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
        enum:['connected','requested','pending','accepted','blocked','blocked_by_friend'],
        default:'requested',
    },
    created_at:{
        type:Date,
        default:Date.now
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
        type:[friendSchema],
        default:[],
    }
    
},{timestamps:true}).plugin(mongoose_delete, { deletedAt : true });

// userSchema.path('first_name').set(function(v) {
//     return capitalize(v);
//   });

userSchema.set('toJSON', {
    transform: function (doc, ret,options) {
      delete ret.password;
      if (!options?.withfriends) delete ret.friendList;
      delete ret.__v;
      return ret;
    }
  });
const userModel=mongoose.model('user',userSchema);
module.exports={
    userModel
}