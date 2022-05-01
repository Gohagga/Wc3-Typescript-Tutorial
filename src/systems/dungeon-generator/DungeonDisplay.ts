import { RoomEdgeLocation } from "./entities/concrete/RoomEdgeLocation";
import { IDungeon } from "./entities/IDungeon";
import { IDungeonRoom } from "./entities/IDungeonRoom";
import { IRoomEdge } from "./entities/IRoomEdge";

export class DungeonDisplay {

    // private tl: string = '┌';
    // private tr: string = '┐';
    // private bl: string = '└';
    // private br: string = '┘';
    // private l: string = '│';
    // private r: string = '│';
    // private t: string = '─';
    // private b: string = '─';
    private tl: string = 'x';
    private tr: string = 'x';
    private bl: string = 'x';
    private br: string = 'x';
    private l: string = 'l';
    private r: string = 'l';
    private t: string = '-';
    private b: string = '-';

/*
┌───────┐
│       │
│  | |  │
│  | |  │
└───────┘
*/
    constructor(
        private roomWidth: number,
        private roomHeight: number,
    ) {
        if (roomWidth % 2 != 0 || roomWidth < 3) throw "roomWidth must not be an even number higher than 2";
        if (roomHeight % 2 == 0 || roomHeight < 3) throw "roomHeight must not be an even number higher than 2";

        // console.log(`Max X: ${maxX}, MaxY: ${maxY}\n\n`);
    }

    stringify(dungeon: IDungeon): string {
        
        let maxX = 0;
        let maxY = 0;
        let minX = 0;
        let minY = 0;

        for (let room of dungeon.roomCollection) {
            // room.roomY -= room.roomY;

            if (room.roomX > maxX) maxX = room.roomX;
            if (room.roomY > maxY) maxY = room.roomY;
            if (room.roomX < minX) minX = room.roomX;
            if (room.roomY < minY) minY = room.roomY;
        }

        // Normalize room coords
        for (let room of dungeon.roomCollection) {
            room.roomX -= minX;
            room.roomY -= minY;
        }
        maxX -= minX;
        maxY -= minY;

        // Create a 2x array of dungeon rooms
        let roomMap: (IDungeonRoom[])[] = [];
        for (let i = 0; i < maxY; i++) roomMap[i] = [];

        // Populate the room map with rooms
        
        if (dungeon.entranceRoom == null) return "";
        this.insertRoomIntoRoomMap(dungeon.entranceRoom, roomMap);

        // Create a map
        let map: string[][] = [];
        for (let room of dungeon.roomCollection) {

            let coordY = room.roomY * this.roomHeight;

            this.drawRow(coordY, room, map, -1);
            this.drawRow(coordY + this.roomHeight - 1, room, map, 1);

            for (let j = coordY + 1; j < coordY + this.roomHeight - 1; j++) {
                this.drawRow(j, room, map, 0);
            }
        }

        for (let c = 0; c < (maxY+1) * this.roomHeight + maxY + 1; c++) {
            if (map[c] == null) map[c] = [];

            for (let r = 0; r < (maxX+1) * this.roomWidth + maxX + 1; r++) {
                if (map[c][r] == null) map[c][r] = ' ';
            }
        }

        // Do locks and entrances
        for (let room of dungeon.roomCollection) {
            
            this.drawRoomEdges(room, room.entrances, map, 0);
            this.drawRoomEdges(room, room.exits, map, 1);

            let coordX = room.roomX * this.roomWidth + Math.floor((this.roomWidth) * 0.5) - 1;
            let coordY = room.roomY * this.roomHeight + Math.floor((this.roomHeight) * 0.5);
            
            // let id = room.id.toString();
            // let id = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'][room.id];
            let id: string | null = null;
            if (id == null) id = room.id; //.toString();
            if (room == dungeon.entranceRoom) id = 'START';
            else if (room == dungeon.bossRoom) id = 'BOSS';
            else id = null;

            if (id != null) {
                for (let i = 0; i < id.length; i++) {
                    map[coordY][coordX-i] = id[id.length - i - 1];
                }
            }
            // map[coordY][coordX] = room.id.toString();

            // Display the key
            if (room.key != null) {
                map[coordY][coordX + 1] = room.key.lockLevel.toString();
            }
        }

        let mapString = "";
        for (let column of map) {
            if (column != null)
                mapString += column.join('') + '\n';
        }

        return mapString;
    }

    // [
    //     [],
    //     [],
    //     [],
    // ]

    drawRow(rowIndex: number, room: IDungeonRoom, map: string[][], roomEdge: -1 | 0 | 1) {
        let row = map[rowIndex] ||= [];
        let coordX = room.roomX * this.roomWidth;

        if (roomEdge == -1) {
            row[coordX] = this.tl;
            row[coordX + this.roomWidth - 1] = this.tr;

            for (let i = coordX + 1; i < coordX + this.roomWidth - 1; i++) {
                row[i] = this.t;
            }
        } else if (roomEdge == 0) {
            row[coordX] = this.l;
            row[coordX + this.roomWidth - 1] = this.r;
        } else if (roomEdge == 1) {
            row[coordX] = this.bl;
            row[coordX + this.roomWidth - 1] = this.br;

            for (let i = coordX + 1; i < coordX + this.roomWidth - 1; i++) {
                row[i] = this.b;
            }
        }
    }

    insertRoomIntoRoomMap(room: IDungeonRoom, roomMap: (IDungeonRoom[])[]) {

        let column = roomMap[room.roomX] ||= [];
        column[room.roomY] = room;

        for (let childRoom of room.childrenRooms) {
            this.insertRoomIntoRoomMap(childRoom, roomMap);
        }
    }

    drawRoomEdges(room: IDungeonRoom, edges: IRoomEdge[], map: string[][], lockOrSpace: 0 | 1) {
        let coordX = room.roomX * this.roomWidth;
        let coordY = room.roomY * this.roomHeight;

        if (edges[RoomEdgeLocation.Up]) {
            let edgeX = coordX + Math.floor((this.roomWidth) * 0.5);
            let edgeY = coordY; // coordY - Math.floor((this.roomHeight + 1) * 0.5);
            let character = lockOrSpace == 0
                ? edges[RoomEdgeLocation.Up].lockLevel.toString()
                : ' ';
            if (character == '0') character = ' ';
            map[edgeY][edgeX] = character;
            map[edgeY][edgeX-1] = ' ';
        } if (edges[RoomEdgeLocation.Right]) {
            let edgeX = coordX + this.roomWidth - 1;
            let edgeY = coordY + Math.floor((this.roomHeight) * 0.5);
            let character = lockOrSpace == 0
                ? edges[RoomEdgeLocation.Right].lockLevel.toString()
                : ' ';
            if (character == '0') character = ' ';
            map[edgeY][edgeX] = character;
        } if (edges[RoomEdgeLocation.Down]) {
            let edgeX = coordX + Math.floor((this.roomWidth) * 0.5);
            let edgeY = coordY + this.roomHeight - 1;
            let character = lockOrSpace == 0
                ? edges[RoomEdgeLocation.Down].lockLevel.toString()
                : ' ';
            if (character == '0') character = ' ';
            map[edgeY][edgeX] = character;
            map[edgeY][edgeX-1] = ' ';
        } if (edges[RoomEdgeLocation.Left]) {
            let edgeX = coordX;
            let edgeY = coordY + Math.floor((this.roomHeight) * 0.5);
            let character = lockOrSpace == 0
                ? edges[RoomEdgeLocation.Left].lockLevel.toString()
                : ' ';
            if (character == '0') character = ' ';
            map[edgeY][edgeX] = character;
        }            
    }
}