
import { Response } from "express";
import mongoose from "mongoose";
import Board from "../models/Board";
import BoardElement from "../models/BoardElement";
import { AuthRequest } from "../middleware/authMiddleware";

// Drawing point structure
type Point = {
    x: number;
    y: number;
};

// Drawing stroke structure
type StrokeData = {
    points: Point[];
    color: string;
    brushSize: number;
    tool?: "pen" | "eraser";
};

// Validate incoming drawing data
const isValidStroke = (value: unknown): value is StrokeData => {
    if (
        !value ||
        typeof value !== "object" ||
        Array.isArray(value)
    ) {
        return false;
    }

    const data = value as Record<string, unknown>;

    return (
        Array.isArray(data.points) &&
        data.points.length >= 1 &&
        data.points.length <= 10000 &&

        data.points.every(
            (point: unknown) =>
                point !== null &&
                typeof point === "object" &&
                !Array.isArray(point) &&
                typeof (point as Point).x === "number" &&
                Number.isFinite((point as Point).x) &&
                typeof (point as Point).y === "number" &&
                Number.isFinite((point as Point).y)
        ) &&

        typeof data.color === "string" &&
        /^#[0-9a-fA-F]{6}$/.test(data.color) &&

        typeof data.brushSize === "number" &&
        Number.isFinite(data.brushSize) &&
        data.brushSize >= 1 &&
        data.brushSize <= 20 &&

        (
            data.tool === undefined ||
            data.tool === "pen" ||
            data.tool === "eraser"
        )
    );
};

// GET /api/boards/:roomId/elements
// Fetch all drawings belonging to a board
export const getBoardElements = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const userId = req.userId;
        const roomId = req.params.roomId;

        if (!userId) {
            res.status(401).json({
                message: "Authentication required",
            });
            return;
        }

        // Find board and verify user access
        const board = await Board.findOne({
            roomId,
            $or: [
                { owner: userId },
                { participants: userId },
            ],
        });

        if (!board) {
            res.status(404).json({
                message: "Board not found or access denied",
            });
            return;
        }

        // Retrieve drawings in creation order
        const elements = await BoardElement.find({
            board: board._id,
        })
            .sort({ createdAt: 1, _id: 1 })
            .lean();

        res.status(200).json({
            elements: elements.map((element) => ({
                id: element._id.toString(),
                type: element.type,
                data: element.data,
                createdBy: element.createdBy.toString(),
            })),
        });

    } catch (error) {
        console.error("Get board elements error:", error);

        res.status(500).json({
            message: "Failed to fetch board elements",
        });
    }
};

// POST /api/boards/:roomId/elements
// Save a drawing stroke in MongoDB
export const createBoardElement = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const userId = req.userId;
        const roomId = req.params.roomId;

        if (!userId) {
            res.status(401).json({
                message: "Authentication required",
            });
            return;
        }

        const { type, data } = req.body ?? {};

        // Validate drawing data
        const validStroke = isValidStroke(data);

        if (type !== "line" || !validStroke) {
            res.status(400).json({
                message: "Invalid drawing stroke",
            });
            return;
        }

        // Find board and verify user access
        const board = await Board.findOne({
            roomId,
            $or: [
                { owner: userId },
                { participants: userId },
            ],
        });

        if (!board) {
            res.status(404).json({
                message: "Board not found or access denied",
            });
            return;
        }

        // Save drawing in MongoDB
        const element = await BoardElement.create({
            board: board._id,
            type: "line",
            data: {
                points: data.points,
                color: data.color,
                brushSize: data.brushSize,
                tool: data.tool ?? "pen",
            },
            createdBy: new mongoose.Types.ObjectId(userId),
        });

        res.status(201).json({
            message: "Drawing saved successfully",
            element: {
                id: element._id.toString(),
                type: element.type,
                data: element.data,
                createdBy: element.createdBy.toString(),
            },
        });

    } catch (error) {
        console.error("Create board element error:", error);

        res.status(500).json({
            message: "Failed to save drawing",
        });
    }
};
