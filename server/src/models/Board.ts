import mongoose, {Document,Types, Schema}from "mongoose";

export interface IBoard extends Document{
    name: String,
    roomId: string,
    owner: Types.ObjectId,
    participants: Types.ObjectId[],
    createdAt: Date;
    updatedAt: Date;
}

const boardSchema = new Schema<IBoard>(
    {
        name:{
            type: String,
            required: true,
            trim: true,

        },
        roomId:{
            type: String,
            required: true,
            unique: true,
        },

        owner:{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,

        },
        participants: [
        {
            type:Schema.Types.ObjectId,
            ref: "User"
        }
        ]
    },
    {
        timestamps: true,
    }
);
const Board = mongoose.model<IBoard>("Board", boardSchema);

export default Board;