import { EnumService } from "services/enum-service/EnumService";
import { DungeonGenerator } from "systems/dungeon-generator/DungeonGenerator";
import { RoomBuilder, RoomBuilderConfig } from "systems/map-generator/builders/room/RoomBuilder";
import { DungeonMapGenerator } from "systems/map-generator/generators/DungeonMapGenerator";
import { Random } from "systems/random/Random";
import { MapPlayer, Rectangle, Trigger } from "w3ts";

export function InitializeGame() {

    let random = new Random(1);
    const dungeonGenerator = new DungeonGenerator(
        random,
        { getLocation: () => [0, 0] },
        { getMaxRoomCount: () => 5 },
        { getLockCount: () => 6, getMaxRoomsPerLockCount: () => 3 },
        3,
        3
    );

    try {
        let dungeon = dungeonGenerator.generate();
        
        print(0)

        let config: RoomBuilderConfig = {
            roomTemplates: [
`78889
4   6
4   6
4   6
12223
`
            ],
            stampRegions: {
                '1': Rectangle.fromHandle(gg_rct_Wall_BL),
                '7': Rectangle.fromHandle(gg_rct_Wall_TL),
                '9': Rectangle.fromHandle(gg_rct_Wall_TR),
                '3': Rectangle.fromHandle(gg_rct_Wall_BR),

                '8': Rectangle.fromHandle(gg_rct_Wall_T),
                '2': Rectangle.fromHandle(gg_rct_Wall_B),
                '4': Rectangle.fromHandle(gg_rct_Wall_L),
                '6': Rectangle.fromHandle(gg_rct_Wall_R),
            }
        }

        print(1)

        let enumService = new EnumService();
        let roomBuilder = new RoomBuilder(config, enumService, random, 512, 512, 2560, 2560);

        print(2)

        let roomRect = new Rectangle(0, 0, 2560, 2560);
        print(3)

        let generator = new DungeonMapGenerator(random, roomBuilder, Rectangle.fromHandle(gg_rct_DungeonMapRegion), roomRect, dungeon);

        print(4)

        generator.resume();

        let cam = new Trigger();
        cam.registerPlayerChatEvent(MapPlayer.fromLocal(), '-cam', false);
        cam.registerPlayerChatEvent(MapPlayer.fromLocal(), '-zoom', false);
        cam.addAction(() => {
            let str = GetEventPlayerChatString();
            let number: number = 3000;
            let ind = 0;
            if (str.startsWith('-cam '))
                ind = 5;
            else if (str == '-cam') {
                number = 3000;
                ind = 5;
            } else if (str.startsWith('-zoom ')) {
                ind = 6;
            } else {
                return;
            }
            let n = S2I(string.sub(str, ind));
            if (n != 0) number = n;
            print("Camera distance set to ", number);
            SetCameraFieldForPlayer(MapPlayer.fromEvent().handle, CAMERA_FIELD_TARGET_DISTANCE, number, 0.5);
            SetCameraFieldForPlayer(MapPlayer.fromEvent().handle, CAMERA_FIELD_FARZ, 100000, 0.5);
        });

    } catch (ex: any) {
        print(ex);
    }
}