const express = require('express');
const cors = require('cors');
const userRegistration=require('./controller/userRegistrationController');
const authUserRouter=require('./router/authUserRoutes');
const { register } = require('module');
const { log } = require('console');
const app=express();
app.use(express.json());
app.use(cors());
app.post('/registration',userRegistration.registration);
app.post('/login',userRegistration.login);

app.use('/auth',authUserRouter);

module.exports=app;