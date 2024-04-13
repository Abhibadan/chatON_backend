const express = require('express');
const cors = require('cors');
const userRegistration=require('./controller/userRegistrationController');
const {authMiddlewear} = require('./middleware/authMiddlewear');
const userController=require('./controller/userController');
const { register } = require('module');
const { log } = require('console');
const app=express();
app.use(express.json());
app.use(cors());
app.post('/registration',userRegistration.registration);
app.post('/login',userRegistration.login);
const router=express.Router();
router.use(authMiddlewear);
app.get('/',userRegistration.dashboard);
app.get('/alluser',userController.alluser);



app.use('/auth',router);

module.exports=app;