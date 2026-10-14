import mongoose, {Document,Schema, Types} from "mongoose";

export interface IBoardElement extends Document{
    board: Types.ObjectId,
    type: "line"|"rectangle"|"circle"|"text",
    data: Record<string, unknown>,
    createdBy: Types.ObjectId,

}

const boardElementSchema = new Schema<IBoardElement>(
    {
        board:{
            type: Schema.Types.ObjectId,
            ref:"board",
            required: true,
        },
        type:{
            type: String,
            enum: ["line", "rectangle", "circle", "text"],
            required: true,

        },
        data:{
            type:Schema.Types.Mixed,
            required: true
        },
        createdBy:{
            type: Schema.Types.ObjectId,
            required: true
        }


    },
    {
        timestamps: true,
    }
);
const BoardElement = mongoose.model<IBoardElement>("BoardElement", boardElementSchema);
export default BoardElement;