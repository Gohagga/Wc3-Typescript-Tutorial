import { IDungeonRoom } from "./IDungeonRoom";

export interface IDungeon {
    entranceRoom: IDungeonRoom | null;
    goalRoom: IDungeonRoom | null;
    bossRoom: IDungeonRoom | null;

    roomCollection: IDungeonRoom[];
}