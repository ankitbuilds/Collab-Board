import express from "express";
import cors from "cors";
import authRoutes from './routes/authRoutes';
import boardRoutes from "./routes/boardRoutes";
const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);
app.use(express.json());



app.get("/",(_req,res)=>{
    res.json({
        message: "API is running"
    });
});

app.get("/",(_req,res)=>{
  res.json({
    message:"Cpllab Board Api is running",
  })
})

app.use("/api/auth",authRoutes)
app.use("/api/boards",boardRoutes)

export default app;