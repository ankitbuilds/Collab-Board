import {Router, Response} from "express";
import {register, login} from "../controllers/authController";
import {protect, AuthRequest} from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me",protect,(req: AuthRequest,res: Response)=>{
    res.status(200).json({
        message:"You are authnticated",
        userId: req.userId,
    })
})

export default router;