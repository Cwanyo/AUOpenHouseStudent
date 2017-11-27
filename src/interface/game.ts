export interface Game {
    GID: string;
    Name: string;
    Info: string;
    Image: string;
    Time_Start: string;
    Time_End: string;
    State: string;
    Location_Latitude: string;
    Location_Longitude: string;
    Game_Question: GameQuestion[];
    MID: string;
    FID: string;
}

export interface GameQuestion {
    QID: string;
    Question: string;
    Answer_Choice: AnswerChoice[];
    Right_Choice: string;
}

export interface AnswerChoice{
    CID: string;
    Choice: string;
}