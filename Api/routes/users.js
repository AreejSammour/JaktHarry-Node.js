import express from "express";
import {
  getUsers,
  DoesUserExist,
  deleteUser,
  updateUserRole,
  getActivities,
  deleteUserActivity,
  getPostSignUps,
  updatePassword,
  getActUsers,
  deletePostSignUps, 
  updateProfilePic,
  updateLastActivity,
  getUserActivities,
  getUserDetails,
  updateIntress,
  resetPass
} from "../controllers/user.js";
import { verifyToken } from "../middleware/auth.js";
import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();

router.get("/", getUsers);
router.get("/check", DoesUserExist);
router.delete("/:id", verifyToken, deleteUser);
router.put("/role/:id", verifyToken, updateUserRole);
router.get("/user-activity", getActivities);
router.get("/activityUsers", getActUsers);
router.delete("/delete/:postId/:userId", verifyToken, deleteUserActivity);
router.get("/post-signups", verifyToken, getPostSignUps);
router.put("/update-password", verifyToken, updatePassword);
router.delete("/post-signups/:id", verifyToken, deletePostSignUps);
router.put("/update-profile-pic", upload.any(), updateProfilePic);
router.put("/update-last-activity/:userId", updateLastActivity);
router.get("/getUserActivities", getUserActivities);  
router.delete("/deleteUserActivity/:id", verifyToken, deleteUserActivity);
router.get("/getUserDetails/:id", getUserDetails);  
router.put("/updateUserIntress", updateIntress);
router.get("/reset", resetPass);


export default router;
