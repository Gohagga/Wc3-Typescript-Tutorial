import { IDungeon } from "../IDungeon";
import { IDungeonRoom } from "../IDungeonRoom";

export class Dungeon implements IDungeon {
    entranceRoom: IDungeonRoom | null = null;
    goalRoom: IDungeonRoom | null = null;
    bossRoom: IDungeonRoom | null = null;
    roomCollection: IDungeonRoom[] = [];

    constructor() {
        
    }
}