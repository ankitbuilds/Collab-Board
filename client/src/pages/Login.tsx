import {useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import api from "../services/api";

export default function Login(){
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async(event: React.FormEvent)=>{
        event.preventDefault();
        setError("");

        try{
            const response = await api.post("/auth/login",{
                email,
                password
            });
            localStorage.setItem("token", response.data.token);
            navigate("/dashboard",{replace:true});
        }catch{
            setError("email and password is not correct");
        }
    };
    return(
        <main>
            <h1>Login to collabboard</h1>
            <form onSubmit = {handleSubmit}>
                <input 
                type="text"
                value={email}
                placeholder="Enter you email"
                required
                onChange={(event)=>setEmail(event.target.value)}/>
                <input
                type="text"
                value={password}
                placeholder="Enter your password"
                onChange={(event)=>setPassword(event.target.value)}
                required/>

                <button type="submit">Submit</button>
            </form>
            {error && <p role="alert"> {error}</p>}
            <p>New here? <Link to="/register">Create an Account</Link></p>
        </main>
    )
}