import {Router} from "express";
import {register, login} from "../controllers/authController";
import {protect} from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me",protect,(req,res)=>{
    res.status(200).json({
        message:"You are authnticated",
        userId: req.userId,
    })
})

export default router;