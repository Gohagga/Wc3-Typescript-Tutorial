import { IKey } from "../IKey";
import { IRoomCondition } from "../IRoomCondition";

export class RoomCondition implements IRoomCondition {
    and(latestKey: IKey): IRoomCondition {
        return this;
    }

}