import { Dungeon } from "./entities/concrete/Dungeon";
import { DungeonRoom } from "./entities/concrete/DungeonRoom";
import { LockKey } from "./entities/concrete/Key";
import { RoomCondition } from "./entities/concrete/RoomCondition";
import { RoomEdge } from "./entities/concrete/RoomEdge";
import { RoomEdgeLocation } from "./entities/concrete/RoomEdgeLocation";
import { IDungeon } from "./entities/IDungeon";
import { IDungeonRoom, RoomEdgeState } from "./entities/IDungeonRoom";
import { IKey } from "./entities/IKey";
import { IRoomCondition } from "./entities/IRoomCondition";
import { IRoomEdge } from "./entities/IRoomEdge";

export interface RandomStrategy {
    next(max?: number): number;
    nextInt(max?: number): number;
}

export interface EntranceRoomLocationStrategy {
    getLocation(): [number, number];
}

export interface RoomCountStrategy {
    getMaxRoomCount(): number;
}

export interface LockCountStrategy {
    getLockCount(): number;
    getMaxRoomsPerLockCount(): number;
}

const invertedRoomEdgeLocation = {
    [RoomEdgeLocation.Up]: RoomEdgeLocation.Down,
    [RoomEdgeLocation.Right]: RoomEdgeLocation.Left,
    [RoomEdgeLocation.Down]: RoomEdgeLocation.Up,
    [RoomEdgeLocation.Left]: RoomEdgeLocation.Right,
}

export class DungeonGenerator {

    constructor(
        private random: RandomStrategy,
        private entranceRoomLocation: EntranceRoomLocationStrategy,
        private roomCount: RoomCountStrategy,
        private lockStrategy: LockCountStrategy,
        private mapX: number,
        private mapY: number,
    ) {

    }

    // private displayer = new DungeonDisplay(10, 5);
    
    public generate(): IDungeon {
        // Create a Dungeon object
        const dungeon = new Dungeon();

        let roomMap: IDungeonRoom[][] = [];

        // Place an Entrance room
        const [entranceX, entranceY] = this.entranceRoomLocation.getLocation();
        const entranceRoom = new DungeonRoom('0', null, [], new RoomCondition(), entranceX, entranceY);
        (roomMap[entranceRoom.roomY] ||= [])[entranceRoom.roomX] = entranceRoom;

        dungeon.entranceRoom = entranceRoom;
        dungeon.roomCollection.push(entranceRoom);
        this.UpdateEdgesFromRoomMap(roomMap, entranceRoom);

        // Create rest of the rooms
        const roomCount = this.roomCount.getMaxRoomCount();
        const maxLockCount = this.lockStrategy.getLockCount() - 1;
        const maxRoomsPerLock = this.lockStrategy.getMaxRoomsPerLockCount();

        let lockLevel = 0;
        let latestKey: IKey | null = null;
        let lockLevelRooms: Record<number, IDungeonRoom[]> = {};

        // print(0);
        let i = 0;
        for (i; i < roomCount; i++) {
            
            // print("0." + i +'' + 1);
            let condition: IRoomCondition = new RoomCondition();

            let doLock = false;

            lockLevelRooms[lockLevel] ||= [];
            // print("0." + i +'' + 2);

            // If should add a new lock
            if (lockLevel < maxLockCount && lockLevelRooms[lockLevel].length >= maxRoomsPerLock) {
                latestKey = new LockKey(lockLevel++);
                condition = condition.and(latestKey);
                lockLevelRooms[lockLevel] = [];
                doLock = true;
            }
            // print("0." + i +'' + 3);

            // Find existing parent room with a free edge
            let parentRoom: IDungeonRoom | null = null;
            let newRoomDirection: RoomEdgeLocation | null = null;

            if (i == 13) {
                const l = "";
            }
            // print("0." + i +'' + 4);

            if (doLock == false 
                && lockLevelRooms[lockLevel] != null
                && lockLevelRooms[lockLevel].length > 0
                // && this.random.next() <= 0.5
                )
            {
                [parentRoom, newRoomDirection] = this.chooseRoomWithFreeEdge(lockLevelRooms[lockLevel], roomMap);
            }

            // print("0." + i +'.' + 5);

            if (parentRoom == null && newRoomDirection == null) {
                // Find any room with free edge
                [parentRoom, newRoomDirection] = this.chooseRoomWithFreeEdge(dungeon.roomCollection, roomMap);
                doLock = true;
            }

            if (parentRoom == null || newRoomDirection == null)
                throw "No room to place more rooms.";

            // print("0." + i +'' + 6 + ' placing room');

            let newRoom = this.PlaceRoom(parentRoom, newRoomDirection, i, condition, lockLevel, latestKey, roomMap);
            dungeon.roomCollection.push(newRoom);
            lockLevelRooms[lockLevel].push(newRoom);
            
            // print("0." + i +'' + 7);

            // console.log("Step " + i + ":\n");
            // console.log(this.displayer.stringify(dungeon));
        }
        //...
        // print(1);

        // Place Boss and Goal rooms
        let bossRoomCandidates = lockLevelRooms[lockLevel];
        if (bossRoomCandidates.length == 0)
            throw "Error";

        let [bossParentRoom, bossRoomDirection] = this.chooseRoomWithFreeEdge(bossRoomCandidates, roomMap);
        if (bossParentRoom == null || bossRoomDirection == null) throw "Could not create boss room";

        latestKey = new LockKey(lockLevel++);

        dungeon.bossRoom = this.PlaceRoom(bossParentRoom, bossRoomDirection, i + 1, new RoomCondition().and(latestKey), lockLevel, latestKey, roomMap);
        dungeon.bossRoom.id = 'BOSS';
        dungeon.roomCollection.push(dungeon.bossRoom);
        // lockLevelRooms[lockLevel] = [];
        // lockLevelRooms[lockLevel].push(dungeon.bossRoom);

        // let [bossX, bossY] = this.calculateRelativeRoomPosition(bossParentRoom, bossRoomDirection);
        // let bossRoom = new DungeonRoom("BOSS", bossParentRoom, [], bossCondition, bossX, bossY);
        // bossRoom.entranceCondition = bossCondition;
        // bossRoom.parentRoom = bossParentRoom;

        // print(2);

        // Place locks
        for (let k of Object.keys(lockLevelRooms)) {

            let key = Number(k);
            let keyPlaced = false;

            let lockKey = new LockKey(key + 1);

            let sorted = lockLevelRooms[key].sort((a, b) =>
                a.portalEdgeCount - b.portalEdgeCount);

            for (let room of sorted) {
                if (room.key == null) {
                    room.key = lockKey;
                    keyPlaced = true;
                    break;
                }
            }

            if (keyPlaced == false) throw "Key was not placed successfully.";
        }

        // Calculate room intensity

        // Place keys

        return dungeon;
    }

    private PlaceRoom(parentRoom: IDungeonRoom, newRoomDirection: RoomEdgeLocation, i: number, condition: IRoomCondition, lockLevel: number, latestKey: IKey | null, roomMap: IDungeonRoom[][]) {
        let [roomX, roomY] = this.calculateRelativeRoomPosition(parentRoom, newRoomDirection);
        let newRoom = new DungeonRoom((i + 1).toString(), parentRoom, [], condition, roomX, roomY);
        newRoom.entranceCondition = condition;
        newRoom.parentRoom = parentRoom;
        // TODO: Coordinates

        // Link rooms with an edge
        let newEdge = new RoomEdge(lockLevel, latestKey, parentRoom, newRoom);
        parentRoom.exits[newRoomDirection] = newEdge;
        newRoom.entrances[invertedRoomEdgeLocation[newRoomDirection]] = newEdge;
        parentRoom.childrenRooms.push(newRoom);

        (roomMap[newRoom.roomY] ||= [])[newRoom.roomX] = newRoom;

        // Update the edges
        parentRoom.edges[newRoomDirection] = RoomEdgeState.Portal;
        newRoom.edges[invertedRoomEdgeLocation[newRoomDirection]] = RoomEdgeState.Portal;

        this.UpdateEdgesFromRoomMap(roomMap, newRoom);

        return newRoom;
    }

    private UpdateEdgesFromRoomMap(roomMap: IDungeonRoom[][], newRoom: DungeonRoom) {
        if (newRoom.edges[RoomEdgeLocation.Up] == RoomEdgeState.None && roomMap[newRoom.roomY - 1] != null && roomMap[newRoom.roomY - 1][newRoom.roomX] != null) {
            newRoom.edges[RoomEdgeLocation.Up] = RoomEdgeState.Blocked;
            let otherRoomEdges = roomMap[newRoom.roomY - 1][newRoom.roomX].edges;
            if (otherRoomEdges[RoomEdgeLocation.Down] == RoomEdgeState.None) otherRoomEdges[RoomEdgeLocation.Down] = RoomEdgeState.Blocked;
        }
        
        if (newRoom.edges[RoomEdgeLocation.Down] == RoomEdgeState.None && roomMap[newRoom.roomY + 1] != null && roomMap[newRoom.roomY + 1][newRoom.roomX] != null) {
            newRoom.edges[RoomEdgeLocation.Down] = RoomEdgeState.Blocked;
            let otherRoomEdges = roomMap[newRoom.roomY + 1][newRoom.roomX].edges;
            if (otherRoomEdges[RoomEdgeLocation.Up] == RoomEdgeState.None) otherRoomEdges[RoomEdgeLocation.Up] = RoomEdgeState.Blocked;
        }
        
        if (newRoom.edges[RoomEdgeLocation.Left] == RoomEdgeState.None && roomMap[newRoom.roomY] != null && roomMap[newRoom.roomY][newRoom.roomX - 1] != null) {
            newRoom.edges[RoomEdgeLocation.Left] = RoomEdgeState.Blocked;
            let otherRoomEdges = roomMap[newRoom.roomY][newRoom.roomX - 1].edges;
            if (otherRoomEdges[RoomEdgeLocation.Right] == RoomEdgeState.None) otherRoomEdges[RoomEdgeLocation.Right] = RoomEdgeState.Blocked;
        }
        
        if (newRoom.edges[RoomEdgeLocation.Right] == RoomEdgeState.None && roomMap[newRoom.roomY] != null && roomMap[newRoom.roomY][newRoom.roomX + 1] != null) {
            newRoom.edges[RoomEdgeLocation.Right] = RoomEdgeState.Blocked;
            let otherRoomEdges = roomMap[newRoom.roomY][newRoom.roomX + 1].edges;
            if (otherRoomEdges[RoomEdgeLocation.Left] == RoomEdgeState.None) otherRoomEdges[RoomEdgeLocation.Left] = RoomEdgeState.Blocked;
        }

        if (newRoom.roomY == 0) newRoom.edges[RoomEdgeLocation.Up] = RoomEdgeState.Blocked;
        if (newRoom.roomY == this.mapY - 1) newRoom.edges[RoomEdgeLocation.Down] = RoomEdgeState.Blocked;
        if (newRoom.roomX == 0) newRoom.edges[RoomEdgeLocation.Left] = RoomEdgeState.Blocked;
        if (newRoom.roomX == this.mapX - 1) newRoom.edges[RoomEdgeLocation.Right] = RoomEdgeState.Blocked;
    }

    calculateRelativeRoomPosition(parentRoom: IDungeonRoom, newRoomDirection: RoomEdgeLocation): [number, number] {
        let x = parentRoom.roomX;
        let y = parentRoom.roomY;

        if (newRoomDirection == RoomEdgeLocation.Up) {
            y -= 1;
        } else if (newRoomDirection == RoomEdgeLocation.Right) {
            x += 1;
        } else if (newRoomDirection == RoomEdgeLocation.Down) {
            y += 1;
        } else if (newRoomDirection == RoomEdgeLocation.Left)
            x -= 1;

        return [x, y];
    }

    chooseRoomWithFreeEdge(possibleRooms: IDungeonRoom[], roomMap: IDungeonRoom[][]): [IDungeonRoom | null, RoomEdgeLocation | null] {

        let parentRoom: IDungeonRoom | null = null;
        let newRoomDirection: RoomEdgeLocation | null = null;
        
        // print('chooseRoomWithFreeEdge ' + 1);

        // Find adjacent edges from rooms with same lock level
        // that we can extend to
        let roomsWithFreeEdge: { room: IDungeonRoom, edges: RoomEdgeLocation[] }[] = [];
        for (let room of possibleRooms) {
            let freeEdges = room.getFreeExitEdges();
            if (freeEdges.length > 0)
                roomsWithFreeEdge.push({
                    room: room,
                    edges: freeEdges
                });
        }

        // print('chooseRoomWithFreeEdge ' + 2);

        // Choose random room and random edge
        if (roomsWithFreeEdge.length > 0) {
            let randomRoomIndex = this.random.nextInt(roomsWithFreeEdge.length - 1);
            // print('randomRoomIndex', randomRoomIndex);

            parentRoom = roomsWithFreeEdge[randomRoomIndex].room;
            let randomEdgeIndex = this.random.nextInt(roomsWithFreeEdge[randomRoomIndex].edges.length - 1);
            newRoomDirection = roomsWithFreeEdge[randomRoomIndex].edges[randomEdgeIndex];
        }

        // print('chooseRoomWithFreeEdge ' + 3);

        return [parentRoom, newRoomDirection];
    }
}

// Dungeon contains all the rooms and their coordinates
// Dungeon knows which room is the boss room, goal room and entrance room