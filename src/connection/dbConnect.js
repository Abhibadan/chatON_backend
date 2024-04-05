const mongoose=require('mongoose');
const mongoose_delete=require('mongoose-delete');
mongoose.connect("mongodb+srv://connectUser:Ae30xXFENtg91dOL@abhibadanghosh.igcasvl.mongodb.net/chatON?retryWrites=true&w=majority&appName=AbhibadanGhosh")

.then(()=>console.log(`Connection Success`))
.catch((err)=>console.log(err));

module.exports={
    mongoose,
    mongoose_delete
}