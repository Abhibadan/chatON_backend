const {mongoose}=require('../connection/dbConnect');
const socketSchema = new mongoose.Schema({
    current_ip: String,
    socket_id: String
}, { _id: false });
const connectedUserSchema=new mongoose.Schema({
    user_id:{
        type:mongoose.Schema.ObjectId,
    },
    sockets:{
        type:[socketSchema],
    },
    
},{timestamps:true});

connectedUserSchema.set('toJSON', {
    transform: function (doc, ret) {
      delete ret.__v;
      return ret;
    }
  });
const connectedUserModel=mongoose.model('connectedUser',connectedUserSchema);
module.exports={
    connectedUserModel
}