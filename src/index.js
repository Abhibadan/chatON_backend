require('dotenv').config();
require('./connection/dbConnect');
const app=require('./app');
const server=require('./socket');

app.listen(5000,()=>{
  console.log("Http Connection success");
});

server.listen(5050, () => {
  console.log(`Socket Connection success`);
});