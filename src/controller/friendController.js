
const { ConnectionStates } = require("mongoose");
const {userModel}=require("../model/userModel");
const { ObjectId } = require('mongodb');
const validator = require('validator');
const {decrypt} = require("../helper/asyncDecrypt");

/**
 * Handles the logic for sending a friend request to another user.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.user - The authenticated user making the request.
 * @param {string} req.body.friend_id - The ID of the user to send the friend request to.
 * @param {Object} res - The HTTP response object.
 * @returns {Promise<Object>} - A JSON response indicating the success or failure of the friend request.
 */
const sendFriendRequest = async (req, res) => {
  const user = req.user;
  const { friend_id } = req.body;
  if (friend_id == undefined) {
    return res
      .status(422)
      .json({ message: "Please provide requested friend details" });
  }

  try {
    const check_friend = await userModel
      .find({
        _id: friend_id,
        friendList: {
          $elemMatch: {
            user_id: user._id,
          },
        },
      })
      .exec()
      .then((res) => {
        return res;
      })
      .catch((error) => {
        throw new Error("Friend not found");
      });
    if (check_friend.length > 0) {
      for (let friend of check_friend[0].friendList) {
        if (friend.user_id.equals(user._id)) {
          if (friend.status == "requested") {
            return res
              .status(400)
              .json({ message: "Friend request already send" });
          } else if (friend.status == "accepted") {
            return res
              .status(400)
              .json({ message: "Friend request already accepted" });
          } else if (friend.status == "pending") {
            return res
              .status(400)
              .json({ message: "Friend request already pending" });
          } else if (friend.status == "rejected") {
            return res
              .status(400)
              .json({ message: "Friend request already rejected" });
          } else if (friend.status == "blocked") {
            return res
              .status(400)
              .json({ message: "Your id is by the user blocked" });
          }
        }
      }
    }
    const friend = await userModel
      .updateOne(
        { _id: friend_id },
        {
          $push: {
            friendList: {
              user_id: user._id,
              status: "requested",
            },
          },
        }
      )
      .exec()
      .then((res) => {
        return res;
      })
      .catch((error) => {
        throw new Error("Friend not found");
      });
    const user_updated = await userModel
      .updateOne(
        { _id: user._id },
        {
          $push: {
            friendList: {
              user_id: ObjectId.createFromHexString(friend_id),
              status: "pending",
            },
          },
        }
      )
      .exec()
      .then((res) => {
        return res;
      })
      .catch((error) => {
        throw new Error("Uriend not found");
      });
    res.status(200).json({ message: "Frined request send successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
/**
 * Handles a friend request by updating the status of the friendship between the current user and the requested friend.
 *
 * @param {Object} req - The HTTP request object.
 * @param {Object} req.user - The current authenticated user.
 * @param {Object} req.body.request - The encrypted friend request details.
 * @returns {Promise<Object>} - A JSON response with a success message or an error message.
 */
const handleFriendRequest = async (req, res) => {
  const user = req.user;
  const { request } = req.body;
  try {
    const { friend_id, handle } = JSON.parse(decrypt(request));
    if (friend_id == undefined) {
      return res
        .status(422)
        .json({ message: "Please provide requested friend details" });
    } else if (handle == undefined) {
      return res.status(422).json({ message: "Please provide handle" });
    }
    let handle_user = handle;
    let handle_friend;
    if (handle_user == "accepted") {
      handle_friend = handle_user;
    } else if (handle_user == "blocked") {
      handle_friend = "blocked_by_friend";
    } else if (handle_user == "connected") {
      handle_friend = handle_user;
    } else if (handle_user == "rejected") {
      const friend = await userModel
        .updateOne(
          { _id: friend_id },
          { $pull: { friendList: { user_id: user._id } } }
        )
        .exec()
        .then((res) => {
          return res;
        })
        .catch((error) => {
          throw new Error("Friend not found");
        });
      const user_updated = await userModel
        .updateOne(
          { _id: user._id },
          { $pull: { friendList: { user_id: ObjectId.createFromHexString(friend_id) } } }
        )
        .exec()
        .then((res) => {
          return res;
        })
        .catch((error) => {
          throw new Error("User not found");
        });
      return res.status(200).json({ message: "Removed From frined list" });
    }
    const friend = await userModel
      .updateOne(
        { _id: friend_id },
        { $set: { "friendList.$[element].status": handle_friend } },
        { arrayFilters: [{ "element.user_id": user._id }] }
      )
      .exec()
      .then((res) => {
        return res;
      })
      .catch((error) => {
        throw new Error("Friend not found");
      });
    const user_updated = await userModel
      .updateOne(
        { _id: user._id },
        { $set: { "friendList.$[element].status": handle_user } },
        {
          arrayFilters: [
            { "element.user_id": ObjectId.createFromHexString(friend_id) },
          ],
        }
      )
      .exec()
      .then((res) => {
        return res;
      })
      .catch((error) => {
        throw new Error("User not found");
      });
    return res
      .status(200)
      .json({ message: "Frined status updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports={
    sendFriendRequest,
    handleFriendRequest
}