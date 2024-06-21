import express from "express";
import jwt from 'jsonwebtoken';
import {
  addKrestar,ModKrestar,addKrestar2,addKrestar1,ModActivities,updateModActivities,createModActivities,GetModDetails,
} from "../controllers/moderator.js";

const router = express.Router();
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

  if (!token) {
      console.log("No token found in cookies.");
      return res.status(401).json("Ej autentiserad!");
  }

  jwt.verify(token, "jwtkey", (err, userInfo) => {
      if (err) return res.status(403).json("Token är ogiltig!");
      
      if (userInfo.role !== 1 && userInfo.id !== req.params.userId && userInfo.role !== 2 && userInfo.id !== req.body.userId) {
        console.log("User is not an admin and does not own the resource.");
        return res.status(403).json("Ej behörig! Endast administratörer eller ägare har åtkomst.");
      }
      req.userInfo = userInfo; // Attach user information to the request object
      next();
  });
};

router.get("/krestar/:id", ModKrestar); 
router.post("/", addKrestar); 
router.put("/", addKrestar2); 
router.put("/add/", addKrestar1); 
router.get("/activities/:id", ModActivities); 
router.put("/activities/:id", updateModActivities); 
router.post("/activities/:id", createModActivities); 
router.get("/:id", GetModDetails);

export default router;
