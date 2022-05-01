import { Coords } from "systems/coords/Coords";
import { IDungeon } from "systems/dungeon-generator/entities/IDungeon";
import { IDungeonRoom } from "systems/dungeon-generator/entities/IDungeonRoom";
import { Random } from "systems/random/Random";
import { Rectangle } from "w3ts";
import { MapGeneratorBase } from "../MapGeneratorBase";

export interface IRoomBuilder {
    buildRoom(region: Rectangle, dungeonRoom: IDungeonRoom);
}

export class DungeonMapGenerator extends MapGeneratorBase {
    
    private roomWidth: number;
    private roomHeight: number;

    constructor(
        private random: Random,
        private roomStrategy: IRoomBuilder,
        private mapRegion: Rectangle,
        private roomRegion: Rectangle,
        private dungeon: IDungeon,
    ) {
        super();
        this.roomWidth = this.roomRegion.maxX - this.roomRegion.minX;
        this.roomHeight = this.roomRegion.maxY - this.roomRegion.minY;
    }

    protected generateMap(): void {
        
        let roomWidth = Math.abs(this.roomRegion.maxX - this.roomRegion.minX);
        let roomHeight = Math.abs(this.roomRegion.maxY - this.roomRegion.minY);

        print("ro0m count", this.dungeon.roomCollection.length);
        // Iterate all dungeon rooms
        for (let room of this.dungeon.roomCollection) {

            // Move region to its new coords
            let coordX = this.mapRegion.minX + roomWidth * room.roomX;
            let coordY = this.mapRegion.maxY - roomHeight * room.roomY;

            print("Room " + room.id,  room.roomX, room.roomY, "at", coordX, coordY);

            this.roomRegion.setRect(coordX, coordY - this.roomHeight, coordX + this.roomWidth, coordY);
            print("Same as", this.roomRegion.minX, this.roomRegion.maxY);

            // Build room
            this.roomStrategy.buildRoom(this.roomRegion, room);
        }
    }
}