export interface Event {
    EID: string;
    Name: string;
    Info: string;
    Image: string;
    State: string;
    Location_Latitude: string;
    Location_Longitude: string;
    Event_Time: EventTime[];
    MID: string;
    FID: string;
}

export interface EventTime {
    TID: string;
    Time_Start: string;
    Time_End: string;
}