export interface Board{
    id: string;
    name: string;
    roomId: string;
    owner: string;
    participants: string[];
    createdAt?:string;
    updatedAt?:string;
}

export interface BoardResponse{
    count: number;
    boards: Board[];
}