import {Router} from "express";
import {protect} from "../middleware/authMiddleware";
import {createBoard,getMyBoards,getBoardByRoomId,joinBoard} from "../controllers/boardController";
import {getBoardElements, createBoardElement} from "../controllers/boardElementController"

const router = Router();

router.use(protect);

router.post("/",createBoard);
router.get("/", getMyBoards);

router.get("/:roomId/elements", getBoardElements);
router.post("/:roomId/elements", createBoardElement);
router.get("/:roomId", getBoardByRoomId);
router.post("/:roomId/join", joinBoard);

export default router;