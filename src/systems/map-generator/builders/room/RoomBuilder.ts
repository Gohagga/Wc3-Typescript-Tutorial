import { IEnumService } from "services/enum-service/IEnumService";
import { Log } from "services/Log";
import { Coords } from "systems/coords/Coords";
import { RoomEdgeLocation } from "systems/dungeon-generator/entities/concrete/RoomEdgeLocation";
import { IDungeonRoom, RoomEdgeState } from "systems/dungeon-generator/entities/IDungeonRoom";
import { Random } from "systems/random/Random";
import { Destructable, Rectangle } from "w3ts";
import { IRoomBuilder } from "../../generators/DungeonMapGenerator";
import { Stamp } from "./Stamp";

export interface RoomBuilderConfig {
    stampRegions: Record<string, Rectangle>,
    roomTemplates: string[],
}

export class RoomBuilder implements IRoomBuilder{

    private readonly stamps: Record<string, Stamp> = {};
    private readonly roomTemplates: string[];

    constructor(
        config: RoomBuilderConfig,
        enumService: IEnumService,
        private readonly random: Random,
        private readonly stampWidth: number,
        private readonly stampHeight: number,
        private readonly roomWidth: number,
        private readonly roomHeight: number,
    ) {
        for (let sr of Object.keys(config.stampRegions)) {
            
            print("sr-", sr);

            let stampRegion = config.stampRegions[sr];
            
            if (stampRegion.maxX - stampRegion.minX != this.stampWidth
                || stampRegion.maxY - stampRegion.minY != this.stampHeight) {
                    Log.Error("Wrong stamp size.");
                    continue;
                }

            let stamp: Stamp = {
                destructables: []
            };

            let destructables = enumService.EnumDestructablesInRect(stampRegion);

            for (let dest of destructables) {

                let cX = dest.x - stampRegion.minX;
                let cY = dest.y - stampRegion.minY;

                print("Destructable offset", cX, cY);

                stamp.destructables.push({
                    coords: new Coords(cX, cY, 0),
                    typeId: dest.typeId,
                });
                print("Pushing destructable", stamp.destructables.length)
            }

            this.stamps[sr] = stamp;
        }

        this.roomTemplates = config.roomTemplates;
    }

    buildRoom(region: Rectangle, room: IDungeonRoom) {
        
        // let roomWidth = Math.abs(this.roomRegion.maxX - this.roomRegion.minX);
        // let roomHeight = Math.abs(this.roomRegion.maxY - this.roomRegion.minY);

        // Choose a random template
        let templateIndex = this.random.nextInt(this.roomTemplates.length - 1);
        let template = this.roomTemplates[templateIndex];

        // Make into arrays
        let col = 0;
        let row = 0;

        let cols = 0;
        let rows = 0;

        let map: string[][] = [];
        for (let stampId of template) {

            if (stampId != '\n') {
                // print("row, stamp", row, stampId);
                map[row] ||= [];
                if (stampId == ' ')
                    map[row].push('_');
                else
                    map[row].push(stampId);
            }

            if (col > cols) cols = col;
            col++;
            if (stampId == '\n') {
                row++;
                if (row > rows) rows = row;
                col = 0;
            }
        }

        let midCol = math.floor(cols * 0.5);
        let midRow = math.floor(rows * 0.5);

        // Preprocessing
        print("midCol, midRow, cols, rows", midCol, midRow, cols, rows);
        if (room.edges[RoomEdgeLocation.Up] == RoomEdgeState.Portal) map[0][midCol] = '_';
        if (room.edges[RoomEdgeLocation.Right] == RoomEdgeState.Portal) map[midRow][cols - 1] = '_';
        if (room.edges[RoomEdgeLocation.Down] == RoomEdgeState.Portal) map[rows - 1][midCol] = '_';
        if (room.edges[RoomEdgeLocation.Left] == RoomEdgeState.Portal) map[midRow][0] = '_';

        print("-");
        print(map[0].join(''));
        print(map[1].join(''));
        print(map[2].join(''));
        print(map[3].join(''));
        print(map[4].join(''));
        print("-");
        print(room.edges[RoomEdgeLocation.Up], room.edges[RoomEdgeLocation.Right], room.edges[RoomEdgeLocation.Down], room.edges[RoomEdgeLocation.Left]);

        for (let r = 0; r < map.length; r++) {
            for (let c = 0; c < map[r].length; c++) {

                let stampId = map[r][c];
                if (stampId == '_' || stampId == '\n') continue;

                let coordX = region.minX + this.stampWidth * c;
                let coordY = region.maxY - this.stampHeight * r;

                // Place the stamp destructables
                let stamp = this.stamps[stampId];
                if (stamp == null) Log.Error("Stamp not configured", stampId);
    
                if (stampId == '6') {
                    print("6", coordX, coordY);
                }
    
                // print("Dest count", stamp.destructables.length);
                for (let dest of stamp.destructables) {

                    // print("Creating destructable", GetObjectName(dest.typeId), "at", coordX + dest.coords.x, coordY - dest.coords.y);
                    CreateDestructable(dest.typeId, coordX + dest.coords.x, coordY + dest.coords.y, 0, 1, 0);
                }
            }
        }
        // for (let stampId of template) {

        //     // print("Checking stamp '" + stampId + "'");
        //     if (stampId == '\n') row++;
        //     if (stampId != ' ' && stampId != '\n') {

        //         let coordX = region.minX + this.stampWidth * column;
        //         let coordY = region.maxY - this.stampHeight * row;
    
        //         // Place the stamp destructables
        //         let stamp = this.stamps[stampId];
        //         if (stamp == null) Log.Error("Stamp not configured", stampId);
    
        //         if (stampId == '6') {
        //             print("6", coordX, coordY);
        //         }
    
        //         // print("Dest count", stamp.destructables.length);
        //         for (let dest of stamp.destructables) {

        //             // print("Creating destructable", GetObjectName(dest.typeId), "at", coordX + dest.coords.x, coordY - dest.coords.y);
        //             CreateDestructable(dest.typeId, coordX + dest.coords.x, coordY + dest.coords.y, 0, 1, 0);
        //         }
        //     }

        //     column++;
        //     if (stampId == '\n') column = 0;
        // }
    }
}