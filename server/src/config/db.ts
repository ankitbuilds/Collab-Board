import mongoose from "mongoose";

const connectDB = async(): Promise<void> =>{
    try{
        const connection = await mongoose.connect(process.env.MONGO_URI as string);
        console.log(`MongoDB connected: ${connection.connection.host}`)

    }catch(error){
        console.log("mongodb connection failed");
        process.exit(1);

    }
}
export default connectDB;