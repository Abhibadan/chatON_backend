const app=require('./app');
const {Server}=require('socket.io');
const http= require('http');
const {socketMiddlewear} = require('./middleware/authMiddlewear');
const {make_online,make_offline,connection_details,sendMessage}= require('./controller/socketController');


const server=http.createServer(app);
const io=new Server(server,{
    cors: {
      origin: "*",
      credentials: true
    }
  });

io.use(socketMiddlewear);
io.on('connection',(socket)=>{
    // console.log(socket);
    make_online(socket.handshake.query.user_id,socket.handshake.address,socket.id);
    // io.emit('join_user',online_user);
    socket.on('chat message',async (data)=>{
      await sendMessage(data).then((response)=>{
        
        response.sockets.forEach((element) => {
          console.log("socket ",element.socket_id);
          // .to(element.socket_id)
          io.to(element.socket_id).emit('recived message', {message:response.message,sender:false,sender_name:response.sender});
        });
      }).catch(error=>{
        console.log(error);
      });
    });
    // (target_user,message) => {
    //     connection_details(target_user).then((response)=>{
    //       response.sockets.forEach((element) => {
    //         io.to(element.socket_id).emit('recived message', message); 
    //       });
    //     });
    // }


    socket.on('offline',(data)=>{
      make_offline(data);
    })

    socket.on("error", (err) => {
      console.log("error");
      console.log(err.message); // prints the message associated with the error
    });
    socket.on("disconnect",(msg)=>{
      console.log(msg);

    });
})

module.exports=server;