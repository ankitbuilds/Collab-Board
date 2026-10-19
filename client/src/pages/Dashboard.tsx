import { useEffect, useState } from "react";
import {useNavigate} from "react-router-dom";
import api from "../services/api";
import type {Board, BoardResponse} from "../types/board";

export default function Dashboard(){
    const [boards,setBoards] = useState<Board[]>([]);
    const [boardName, setBoardName] = useState("");
    const[roomId, setRoomId] = useState("");
    const [error, setError] = useState("");
    const[loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const navigate = useNavigate();

    const loadBoards = async()=>{
        try{
            const response = await api.get<BoardResponse>("/boards");
            setBoards(response.data.boards);
        }catch{
            setError("Unable to load boards. Please log in again");
        
        }finally{
            setLoading(false);
        }
    };
    useEffect(()=>{
        void loadBoards();
    },[]);

    const createBoard = async()=>{
        if(!boardName.trim()){
            setError("Enter a board name.");
            return;
        }
        setSubmitting(true);
        setError("");

        try{
            const response = await api.post<{board: Board}>("/brands",{
                name: boardName.trim(),
            });
            setBoards((current)=>[
                response.data.board,
                ...current,
            ]);
            setBoardName("");
            navigate(`/board/${response.data.board.roomId}`);
        }catch{
            setError("could not create board.");
        }finally{
            setSubmitting(false);
        }
    };


    const joinBoard = async()=>{
        if(!roomId.trim()){
            setError ("Enter a room ID");
            return;
        }
        setSubmitting(true);
        setError("");

        try{
            await api.post(
                `/boards/${encodeURIComponent(roomId.trim())}/join`
            );
            navigate(`/board/${encodeURIComponent(roomId.trim())}`);
        }catch{
            setError ("Could not join board. Check the rrom ID.");
        }finally{
            setSubmitting(false);
        }

    };
    const logout = ()=>{
        localStorage.removeItem("token");
        navigate("/login",{replace:true});
    };

    return(
        <main>
            <header>
                <h1>CollabBoard</h1>
                <button onClick={logout}>Logout</button>
            </header>
            {error && <p role="alert">{error}</p>}

            <section>
                <h2>Create a board</h2>
                <input value={boardName}
                onChange={(event)=>setBoardName(event.target.value)}
                placeholder="sprint planning"
                maxLength={100}/>
                <button onClick={createBoard} disabled={submitting}>
                    Create Board
                </button>
            </section>

            <section>
                <h2>Join a board</h2>
                <input
                value={roomId}
                onChange={(event)=>setRoomId(event.target.value)}
                placeholder = "Enter room ID"/>

                <button onClick={joinBoard} disabled={submitting}>Join Board</button>
            </section>

            <section>
                <h2>Your boards</h2>
                {loading?(
                    <p>Loading boards...</p>
                ):boards.length === 0 ? (
                    <p>No boards yet. Create your first board!</p>
                ):(
                    <ul>
                        {boards.map((board)=>(
                            <li>
                                <strong>{board.name}</strong>
                                <p>Room ID:{board.roomId}</p>
                                <button
                                onClick={()=>navigate(`/board/${encodeURIComponent(board.roomId)}`)}>
                                    Open Board
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    )
}