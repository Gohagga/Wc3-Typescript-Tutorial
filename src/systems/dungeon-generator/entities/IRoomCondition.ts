import { IKey } from "./IKey";

export interface IRoomCondition {
    
    and(latestKey: IKey): IRoomCondition;    
}