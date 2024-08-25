const authUserRouter=require('express').Router();
const {authMiddlewear} = require('../middleware/authMiddlewear');
const userController=require('../controller/userController');
const friendController=require("../controller/friendController");
authUserRouter.use(authMiddlewear);
authUserRouter.get('/',userController.dashboard);
authUserRouter.get('/allusers',userController.alluser);
authUserRouter.post('/send-friend-request',friendController.sendFriendRequest);
authUserRouter.post('/handle-friend-request',friendController.handleFriendRequest);
authUserRouter.get('/get-connection-details',userController.getConnectionDetails);
authUserRouter.get('/get-friends',friendController.friendList);
// authUserRouter.post('/test',userController.sendMessage);

module.exports=authUserRouter;