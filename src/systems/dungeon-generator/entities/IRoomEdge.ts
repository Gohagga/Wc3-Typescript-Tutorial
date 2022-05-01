import { IDungeonRoom } from "./IDungeonRoom";
import { IKey } from "./IKey";

export interface IRoomEdge {
    lockLevel: number,
    requiredKey: IKey | null;
    fromRoom: IDungeonRoom;
    toRoom: IDungeonRoom;
}