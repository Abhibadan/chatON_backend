const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const userRegistration=require('./controller/userRegistrationController');
const authUserRouter=require('./router/authUserRoutes');
const userController=require('./controller/userController');
const { register } = require('module');
const { log } = require('console');
const app=express();
app.use(bodyParser.json({
    limit: '10mb',
    strict: true, // only parse objects and arrays
    type: 'application/json' // parse only if Content-Type matches
}));

app.use(cors());
app.post('/registration',userRegistration.registration);
app.post('/login',userRegistration.login);

// const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
//     modulusLength: 2048,
//     publicKeyEncoding: {
//       type: 'spki',
//       format: 'pem'
//     },
//     privateKeyEncoding: {
//       type: 'pkcs8',
//       format: 'pem'
//     }
//   });
  

app.use('/auth',authUserRouter);

module.exports=app;