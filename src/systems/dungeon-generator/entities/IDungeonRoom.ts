import { IRoomCondition } from "./IRoomCondition";
import { IRoomEdge } from "./IRoomEdge";
import { IKey } from "./IKey";
import { RoomEdgeLocation } from "./concrete/RoomEdgeLocation";

export interface IDungeonRoom {
    id: string,
    lockLevel: number,
    entranceCondition: IRoomCondition;
    key: IKey | null;
    entrances: IRoomEdge[];
    exits: IRoomEdge[];
    edges: Record<number, RoomEdgeState>;
    
    getFreeExitEdges(): RoomEdgeLocation[];
    portalEdgeCount: number;
    
    roomX: number;
    roomY: number;

    childrenRooms: IDungeonRoom[];
    parentRoom: IDungeonRoom | null;
}

export const enum RoomEdgeState {
    None = 0,
    Blocked = 1,
    Portal = 2,
}