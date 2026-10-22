import { useState } from "react";
import {Link,useNavigate} from "react-router-dom";
import api from "../services/api";

export default function Register(){
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async(event: React.FormEvent)=>{
        event.preventDefault();
        setError("");

        try{
            const response = await api.post("/auth/register",{
                name,
                email,
                password
            });
            localStorage.setItem("token", response.data.token);
            navigate("/dashboard",{replace: true});
        }catch(error){
            setError("Registration failed. Checked your details")
        }
    };
    return(
        <main>
            <h1>Register Yourself in Collab Board</h1>
            <form onSubmit={handleSubmit}>
                <input
                type="text"
                value={name}
                placeholder="Enter your name"
                onChange={(event)=>setName(event.target.value)}
                required/>

                <input
                type="text"
                value={email}
                placeholder="Enter your email"
                onChange={(event)=>setEmail(event.target.value)}
                required/>
                <input
                type="text"
                value={password}
                placeholder="Enter your password"
                onChange={(event)=>setPassword(event.target.value)}
                required/>

                <button type="submit">Submit</button>
            </form>
            {error && <p role="alert">{error}</p>}
            <p>Already Resgistered <Link to="/login">Login</Link></p>
        </main>
    )


}
