require('dotenv').config();
const express = require('express');
const http= require('http');
const cors = require('cors');
const {Server}=require('socket.io');
const userRegistration=require('./controller/userRegistrationController');
const {authMiddlewear,socketMiddlewear} = require('./middleware/authMiddlewear');
const {online_user,make_online,make_offline}= require('./controller/socketController');
const { register } = require('module');

const app=express();
app.use(express.json());
app.use(cors());






app.post('/registration',userRegistration.registration);
app.post('/login',userRegistration.login);

const router=express.Router();
router.use(authMiddlewear);
router.get('/',userRegistration.dashboard);


app.use('/auth',router);
app.listen(5000);

const server=http.createServer(app);
const io=new Server(server,{
    cors: {
      origin: "*",
      credentials: true
    }
  });
io.use(socketMiddlewear);
io.on('connection',(socket)=>{
    make_online(socket.handshake.query.user_id,socket.id);
    io.emit('join_user',online_user);
    socket.on('chat message', (message) => {
        io.emit('recived message', message); 
    });
    socket.on('offline',(user_id)=>{
      make_offline(user_id);
    })
    socket.on("disconnect",(msg)=>{
      console.log(msg);

    });
})

server.listen(5050, () => {
    console.log(`Server is running on port`);
  });