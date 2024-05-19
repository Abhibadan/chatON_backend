const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const userRegistration=require('./controller/userRegistrationController');
const authUserRouter=require('./router/authUserRoutes');
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
  
app.post('/test',(req,res)=>{
    console.log(req.body);
    const privateKey=process.env.PRIVATE_KEY.replace(/\\n/g, '\n');
    const encryptedData = req.body.message;
    const buffer = Buffer.from(encryptedData, 'base64');
    const decrypted = crypto.privateDecrypt({
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PADDING
      }, buffer);
    console.log(decrypted.toString());
    res.status(200).json({decrypted:decrypted.toString()});
})
app.use('/auth',authUserRouter);

module.exports=app;