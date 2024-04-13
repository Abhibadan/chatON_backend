require('dotenv').config();
require('./connection/dbConnect');
const app=require('./app');
const server=require('./socket');

app.listen(5000,()=>{
  console.log("Connection success");
});

server.listen(5050, () => {
  console.log(`Server is running`);
});