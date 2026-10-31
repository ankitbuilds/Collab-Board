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

        const trimmedName = name.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName || !trimmedEmail || password.length < 8) {
            setError("Please enter a valid name, email, and at least 8 characters for the password.");
            return;
        }

        try{
            const response = await api.post("/auth/register",{
                name: trimmedName,
                email: trimmedEmail,
                password
            });
            localStorage.setItem("token", response.data.token);
            navigate("/dashboard",{replace: true});
        }catch(error){
            setError("Registration failed. Check your details")
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
                type="email"
                value={email}
                placeholder="Enter your email"
                onChange={(event)=>setEmail(event.target.value)}
                required/>
                <input
                type="password"
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
