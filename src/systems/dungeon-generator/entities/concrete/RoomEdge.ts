import { IDungeonRoom } from "../IDungeonRoom";
import { IKey } from "../IKey";
import { IRoomEdge } from "../IRoomEdge";

export class RoomEdge implements IRoomEdge {

    constructor(
        public lockLevel: number,
        public requiredKey: IKey | null,
        public fromRoom: IDungeonRoom,
        public toRoom: IDungeonRoom
    ) {
        
    }
}