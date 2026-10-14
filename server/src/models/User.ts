import mongoose,{Document, Schema} from "mongoose";

export interface IUser extends Document {
    name: string,
    email: string,
    password: string,
    avatar?: string;
}

const userSchema = new Schema<IUser>(
    {
        name:{
            type:String,
            trim : true,
            required: true

        },
        email:{
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password:{
            type: String,
            required: true,
        },
        avatar:{
            type: String
        }
    }
)