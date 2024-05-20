const authUserRouter=require('express').Router();
const {authMiddlewear} = require('../middleware/authMiddlewear');
const userController=require('../controller/userController');
const friendController=require("../controller/friendController");
authUserRouter.use(authMiddlewear);
authUserRouter.get('/',userController.dashboard);
authUserRouter.get('/alluser',userController.alluser);
authUserRouter.post('/send-friend-request',friendController.sendFriendRequest);
authUserRouter.post('/handle-friend-request',friendController.handleFriendRequest);
authUserRouter.get('/get-connection-details',friendController.getConnectionDetails);


module.exports=authUserRouter;