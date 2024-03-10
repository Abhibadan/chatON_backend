require('dotenv').config();
const express = require('express');
const http= require('http');
const cors = require('cors');
const {Server}=require('socket.io');
const userRegistration=require('./controller/userRegistrationController');
const {authMiddlewear} = require('./middlewear/authMiddlewear');

const app=express();
const server=http.createServer(app);
const io=new Server(server,{
    cors: {
      origin: "*",
      credentials: true
    }
  });
app.use(express.json());
app.use(cors());
const router=express.Router();
router.use(authMiddlewear);


app.post('/registration',userRegistration.registration);
app.post('/login',userRegistration.login);

router.get('/',userRegistration.dashboard);


app.use('/auth',router);
app.listen(5000);

io.on('connection',(socket)=>{
    // console.log(socket.id);

    socket.on('chat message', (message) => {
        console.log(message);
        io.emit('recived message', message); // Broadcast the message to all clients
    });
    socket.on("disconnect",()=>{
        console.log("disconnect");
    })
})
io.on('chat message',(socket)=>{
    console.log(socket)
})
server.listen(5050, () => {
    console.log(`Server is running on port`);
  });