import express from "express";
import jwt from 'jsonwebtoken';
import {
  addPost,
  deletePost,
  getPost,
  getPosts,
  updatePost,
  updateActivityDetails,
  signUpToActivity,
  userPostStatus,
  AddNewUserAct,
  userPostStatus2,
  getEntries,
  updateRegisterTotal,
  addPostRating,
  getUserPostRating, getAverageRating
} from "../controllers/post.js";

const router = express.Router();

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
      console.log("No token found in cookies.");
      return res.status(401).json("Ej autentiserad!");
  }

  jwt.verify(token, "jwtkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token är ogiltig!");
    
    // Check if user is an admin or the owner of the resource
    if (userInfo.role === 1 || userInfo.role === 2 || userInfo.id === req.params.userId || userInfo.id === req.body.userId) {
      req.userInfo = userInfo; // Attach user information to the request object
      next();
    } else {
      console.log("User is not an admin and does not own the resource.");
      return res.status(403).json("Ej behörig! Endast administratörer eller ägare har åtkomst.");
    }
});
};

// Routes
router.get("/", getPosts);
router.get("/:id", getPost);
router.put("/totalUpdate", verifyToken, updateRegisterTotal);
router.put("/:id", verifyToken, updatePost); 
router.post("/", verifyToken, addPost); 
router.delete("/:id", verifyToken, deletePost); 
router.put("/:id", verifyToken, updatePost); 
router.put("/updateActDetails/:id", verifyToken, updateActivityDetails); 
router.get("/signup/status", userPostStatus);

router.post("/signup", verifyToken, signUpToActivity);
router.get("/signup/status2", userPostStatus2);
router.post("/adminsignup", AddNewUserAct);  
router.get("/getEntries/:id", getEntries); 

router.put("/rate/:id", addPostRating); 
router.get("/getRating/:id", getUserPostRating); 
router.get("/getAverageRating/:id", getAverageRating); 

export default router;
