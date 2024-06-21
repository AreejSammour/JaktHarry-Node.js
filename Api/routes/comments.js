import express from "express";
import { addComment, getComment, getUserComment, updateCommentVisibility, deleteComment } from "../controllers/comment.js";
import{verifyToken, isUser} from "../middleware/auth.js"

const router = express.Router();

router.post("/add", addComment);
router.get("/get/:id", getComment);
router.get("/userComment/:id", getUserComment);
router.put("/updateVisibility", updateCommentVisibility);
router.delete("/delete/:id", verifyToken, deleteComment); 

export default router;