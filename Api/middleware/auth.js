import jwt from "jsonwebtoken";
import { db } from "../db.js";

// Middleware to verify JWT token
export const verifyToken = (req, res, next) => {
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
        req.userInfo = userInfo;
        next();
    });
};


export const isUser = (req, res, next) => {
  const { userInfo } = req;

  // Check if the user is an admin or moderator
  if (userInfo.role === 1 || userInfo.role === 2) {
      return next(); // Allow admin and moderator to comment
  }

  // Check if the user is the current user
  if (userInfo.id === req.params.userId) {
      return next(); // Allow current user to comment
  }

  if (userInfo.id === req.body.userId) {
    return next(); // Allow current user to comment
}

  // Deny access for other users
  return res.status(401).json("Not authorized to comment");
};