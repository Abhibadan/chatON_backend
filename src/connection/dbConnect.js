const mongoose=require('mongoose');
mongoose.connect("mongodb+srv://connectUser:Ae30xXFENtg91dOL@abhibadanghosh.igcasvl.mongodb.net/chatON?retryWrites=true&w=majority&appName=AbhibadanGhosh")

.then(()=>console.log(`DB Connection Success`))
.catch((err)=>console.log(err));
