import {Request, Response} from "express";
import Board from "../models/Board";
import mongoose from "mongoose";
import { AuthRequest } from "../middleware/authMiddleware";
import { randomBytes } from "crypto";

export const createBoard = async(
    req: AuthRequest,
    res: Response
): Promise<void> =>{
    try{
        const userId = req.userId;
        const {name} = req.body as {name? : string}

        if(!userId){
            res.status(401).json({
                message:"authentication required"
            })
            return;
        }
        if(!name?.trim()){
            res.status(400).json({
                message:"user name is required"
            })
            return;
        }
        if(name.trim().length>100){
            res.status(400).json({
                message:"Board name can not exceed 100"
            })
            return;
        }
    

    const roomId = randomBytes(12).toString("hex");

    const board = await Board.create({
        name: name.trim(),
        roomId,
        owner: new mongoose.Types.ObjectId(userId),
        participants: [new mongoose.Types.ObjectId(userId)]
    });

    res.status(201).json({
        message:"Board created successfully",
        board:{
            id: board._id.toString(),
            name: board.name,
            roomId: board.roomId,
            owner: board.owner.toString(),
            participants: board.participants.map((id)=>id.toString()),
            createdAt: board.createdAt,
        },
    });

}catch(error){
    console.error("create board error", error);
    res.status(500).json({message:"Failed to create board"});
}
};

export const getMyBoards = async(
    req: AuthRequest,
    res: Response
): Promise<void> =>{
    try{
        const userId = req.userId;
        if(!userId){
            res.status(401).json({message:"Authentication required"});
            return;
        }

        const boards = await Board.find({
            $or:[
                {owner: userId},
                {participants: userId},
            ],
        }).sort({updatedAt: -1});

        res.status(200).json({
            count: boards.length,
            boards: boards.map((board)=>({
                id: board._id.toString(),
                name: board.name,
                roomId: board.roomId,
                owner: board.owner.toString(),
                participants: board.participants.map((id)=>id.toString()),
                createdAt: board.createdAt,
                updatedAt: board.updatedAt,

            })),
        });
    }catch(error){
        console.error("Get boards error:", error);
        res.status(500).json({
            message:"failed to fetch boards"
        });
    }
}

export const getBoardsByRoomId = async(
    req: AuthRequest,
    res: Response
): Promise<void> =>{
    try{
        const userId = req.userId;
        const {roomId} = req.params;

        if(!userId){
            res.status(401).json({
                message:"Authentication required"
            });
            return;
        }

        const board = await Board.findOne({roomId});

        if(
            !board||
            (!board.owner.equals(userId)&&!board.participants.some((id)=>id.equals(userId)))
        ){
            res.status(404).json({
                message: "Boardnot found or you do not have access",
            });
            return;
        }
        res.status(200).json({
            board:{
                id: board._id.toString(),
                name:board.name,
                roomId: board.roomId,
                owner:board.owner.toString(),
                participants: board.participants.map((id)=>id.toString()),
                createdAt: board.createdAt,
                updatedAt: board.updatedAt,
            }
        });
    }catch(error){
        console.error("get hard error:",error);
        res.status(500).json({message:"failed to fetch board"});
    }
};

export const joinBoard = async(
    req: AuthRequest,
    res: Response
): Promise<void>=>{
    try{
        const userId = req.userId;
        const {roomId} = req.params;

        if(!userId){
            res.status(401).json({message:"Authentication required"});
            return;
        }

        const board = await Board.findOne({roomId});

        if(!board){
            res.status(404).json({message:"Board not found"});
            return;
        }

        await Board.updateOne(
            {_id: board._id},
            {$addToSet: {participants: userId}}
        );

        res.status(200).json({
            message:"Joined board successfully",
            board:{
                id: board._id.toString(),
                name: board.name,
                roomId: board.roomId,
            }
        });
    }catch(error){
        console.error("Join board error:", error);
        res.status(500).json({messag:"Failed to join board"});
    }
}