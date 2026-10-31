
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import type { Board, BoardResponse } from "../types/board";

export default function Dashboard() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [boardName, setBoardName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  // Load boards belonging to the current user.
  const loadBoards = useCallback(async () => {
    try {
      setError("");

      const response = await api.get<BoardResponse>("/boards");
      setBoards(response.data.boards);
    } catch {
      setError("Unable to load boards. Please log in again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBoards();
  }, [loadBoards]);

  // Navigate to a particular board.
  const openBoard = (id: string) => {
    navigate(`/board/${encodeURIComponent(id)}`);
  };

  // Create a new board.
  const createBoard = async () => {
    if (!boardName.trim()) {
      setError("Enter a board name.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await api.post<{ board: Board }>("/boards", {
        name: boardName.trim(),
      });

      const newBoard = response.data.board;

      setBoards((current) => [newBoard, ...current]);
      setBoardName("");

      openBoard(newBoard.roomId);
    } catch {
      setError("Could not create board. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Join a board using its room ID.
  const joinBoard = async () => {
    const id = roomId.trim();

    if (!id) {
      setError("Enter a room ID.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await api.post(
        `/boards/${encodeURIComponent(id)}/join`
      );

      openBoard(id);
    } catch {
      setError("Could not join board. Check the room ID and your access.");
    } finally {
      setSubmitting(false);
    }
  };

  // Log out the current user.
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <main>
      <header>
        <h1>CollabBoard</h1>
        <button type="button" onClick={logout}>
          Logout
        </button>
      </header>

      {error && <p role="alert">{error}</p>}

      <section>
        <h2>Create a board</h2>

        <input
          value={boardName}
          onChange={(event) => setBoardName(event.target.value)}
          placeholder="Sprint planning"
          maxLength={100}
          aria-label="Board name"
        />

        <button
          type="button"
          onClick={createBoard}
          disabled={submitting}
        >
          {submitting ? "Please wait..." : "Create Board"}
        </button>
      </section>

      <section>
        <h2>Join a board</h2>

        <input
          value={roomId}
          onChange={(event) => setRoomId(event.target.value)}
          placeholder="Enter room ID"
          aria-label="Room ID"
        />

        <button
          type="button"
          onClick={joinBoard}
          disabled={submitting}
        >
          {submitting ? "Please wait..." : "Join Board"}
        </button>
      </section>

      <section>
        <h2>Your boards</h2>

        {loading ? (
          <p>Loading boards...</p>
        ) : boards.length === 0 ? (
          <p>No boards yet. Create your first board!</p>
        ) : (
          <ul>
            {boards.map((board) => (
              <li key={board.roomId}>
                <strong>{board.name}</strong>
                <p>Room ID: {board.roomId}</p>

                <button
                  type="button"
                  onClick={() => openBoard(board.roomId)}
                >
                  Open Board
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
