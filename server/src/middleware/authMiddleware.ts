import {Request, Response, NextFunction} from "express";
import jwt, {JwtPayload} from "jsonwebtoken";

export interface AuthRequest extends Request{
    userId?: string;
}

export const protect=(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void=>{
    const authHeader = req.headers.authorization;

    if(!authHeader?.startsWith("Bearer")){
        res.status(401).json({
            message: "Authentication required",
        });
        return;
    }

    const token = authHeader.split(" ")[1];
    const secret = process.env.JWT_SECRET;

    if(!secret){
        res.status(500).json({
            message:"Authentication configuration error",
        });
        return;
    }

    try{
        const decoded = jwt.verify(token,secret);

        if(
            typeof decoded === "string"||
            !("userId" in decoded)||
            typeof (decoded as JwtPayload).userId !== "string"

        ){
            res.status(401).json({
                message: "Invalid token",
            });
            return;
        }

        req.userId = (decoded as JwtPayload).userId;
        next();
    }catch{
        res.status(401).json({
            message: "Invalid or expired token"
        })
    }

}