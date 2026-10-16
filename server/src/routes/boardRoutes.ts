import {Router} from "express";
import {protect} from "../middleware/authMiddleware";
import {createBoard,getMyBoards,getBoardByRoomId,joinBoard} from "../controllers/boardController";

const router = Router();

router.use(protect);

router.post("/",createBoard);
router.get("/", getMyBoards);
router.get("/:roomId", getBoardByRoomId);
router.post("/:roomId/join", joinBoard);

export default router;