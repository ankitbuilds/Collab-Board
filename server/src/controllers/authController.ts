import {Request, Response} from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";

export const register = async(
    req:Request,
    res: Response
): Promise<void> =>{
    try{
        const {name,email,password} = req.body as{
            name?:string;
            email?:string;
            password?:string;
        };
        if(!name?.trim()||!email?.trim()||!password){
            res.status(400).json({
                message: "Name, email and password are required",
            });
            return;
        }
        if(password.length<0){
            res.status(400).json({
                message: "password must be at least 8 characters"
            });
            return;
        }
        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if(existingUser){
            res.status(400).json({
                message: "An account with this email already exists",
            });
            return;
        }

        const hashedPassword = await bcrypt.hash(password,12);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
        });

        const token = jwt.sign(
            {userId: user._id.toString()},
            process.env.JWT_SECRET as string,
            {expiresIn:"1d"}
        );

        res.status(201).json({
            message:"Registration successfull",
            token,
            user:{
                id: user._id.toString(),
                name: user.name,
                email: user.email,
            },
        });
    }catch(error){
        if(
            typeof error === "object" &&
            error !==null &&
            "code" in error &&
            error.code === 11000
        ){
            res.status(409).json({
                message: "An account with this emil already exists",

            });
            return;
        }
        console.error("Registration error",error);
        res.status(500).json({message:"Internal server error"});
    }
};

export const login = async(
    req: Request,
    res: Response
): Promise<void>=>{
    try{
        const {email,password} = req.body as{
            email?: string;
            password?: string;
        }

        if(!email?.trim()||!password){
            res.status(400).json({
                message:"Email abd password are required",
            });
            return;
        }

        const user = await User.findOne({
            email: email.trim().toLowerCase(),
        });

        if(!user){
            res.status(401).json({
                message: "Invalide email or password",
            });
            return;
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if(!isPasswordValid){
            res.status(401).json({
                message: "Invalid email or password"
            });
            return;
        }

        const token = jwt.sign(
            {userId: user._id.toString()},
            process.env.JWT_SECRET as string,
            {expiresIn: "1d"}
        );

        res.status(200).json({
            message:"Login successful",
            token,user:{
                id:user._id.toString(),
                name: user.name,
                email: user.email,
            }
        })
            
        
    }catch(error){
        console.log("login error:",error);
        res.status(500).json({message:"Internal server error"});
    }
}