const authUserRouter=require('express').Router();
const {authMiddlewear} = require('../middleware/authMiddlewear');
const userController=require('../controller/userController');
authUserRouter.use(authMiddlewear);
authUserRouter.get('/',userController.dashboard);
authUserRouter.get('/alluser',userController.alluser);

module.exports=authUserRouter;