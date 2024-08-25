const mongoose=require('mongoose');
mongoose.connect(process.env.MONGO_CONNECTION)

.then(()=>console.log(`DB Connection Success`))
.catch((err)=>console.log(err));
