const {mongoose,mongoose_delete}=require('../connection/dbConnect');
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
    
},{timestamps:true}).plugin(mongoose_delete, { deletedAt : true });

userSchema.path('first_name').set(function(v) {
    return capitalize(v);
  });

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