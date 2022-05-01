import { IDungeonRoom, RoomEdgeState } from "../IDungeonRoom";
import { IKey } from "../IKey";
import { IRoomCondition } from "../IRoomCondition";
import { IRoomEdge } from "../IRoomEdge";
import { RoomEdgeLocation } from "./RoomEdgeLocation";

export class DungeonRoom implements IDungeonRoom {

    public key: IKey | null = null;

    constructor(
        public id: string,
        public parentRoom: IDungeonRoom | null,
        public childrenRooms: IDungeonRoom[],
        public entranceCondition: IRoomCondition,
        public roomX: number,
        public roomY: number
    ) {
    }
    
    entrances: IRoomEdge[] = [];
    exits: IRoomEdge[] = [];
    edges: Record<number, number> = {
        [RoomEdgeLocation.Up]: RoomEdgeState.None,
        [RoomEdgeLocation.Right]: RoomEdgeState.None,
        [RoomEdgeLocation.Down]: RoomEdgeState.None,
        [RoomEdgeLocation.Left]: RoomEdgeState.None,
    };
    
    public get lockLevel(): number {
        let lockLevel = 0;
        for (let edge of this.entrances) {
            if (edge.lockLevel != 0 && edge.lockLevel < lockLevel)
                lockLevel = edge.lockLevel;
        }
        return lockLevel;
    }

    public getFreeExitEdges(): RoomEdgeLocation[] {
        let edges: RoomEdgeLocation[] = [];

        if (this.edges[RoomEdgeLocation.Up] == RoomEdgeState.None) edges.push(RoomEdgeLocation.Up);
        if (this.edges[RoomEdgeLocation.Right] == RoomEdgeState.None) edges.push(RoomEdgeLocation.Right);
        if (this.edges[RoomEdgeLocation.Down] == RoomEdgeState.None) edges.push(RoomEdgeLocation.Down);
        if (this.edges[RoomEdgeLocation.Left] == RoomEdgeState.None) edges.push(RoomEdgeLocation.Left);
        
        return edges;
    }

    public get portalEdgeCount(): number {
        let count = 0;

        if (this.edges[RoomEdgeLocation.Up] == RoomEdgeState.Portal) count++;
        if (this.edges[RoomEdgeLocation.Right] == RoomEdgeState.Portal) count++;
        if (this.edges[RoomEdgeLocation.Down] == RoomEdgeState.Portal) count++;
        if (this.edges[RoomEdgeLocation.Left] == RoomEdgeState.Portal) count++;

        return count;
    }
}