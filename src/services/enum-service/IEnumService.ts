import { Coords } from "systems/coords/Coords";
import { Destructable, Item, Rectangle, Unit } from "w3ts/index";

export interface IEnumService {

    EnumUnitsInRange(origin: Coords, radius: number, filter?: (target: Unit, caster?: Unit) => boolean, source?: Unit): Unit[];

    /**Angles are all in radians.*/
    EnumUnitsInCone(origin: Coords, range: number, angle: number, angleRange: number, filter?: (target: Unit, caster?: Unit) => boolean, source?: Unit): Unit[];

    EnumUnitsInLine(origin: Coords, destination: Coords, width: number, filter?: (target: Unit, caster: Unit, source?: Unit) => boolean): Unit[];

    EnumItemsInRange(originX: number, originY: number, radius: number, filter?: (target: Item, caster?: Unit) => boolean, source?: Unit): Item[];
    
    EnumDestructablesInRange(originX: number, originY: number, radius: number, filter?: (target: Destructable, caster?: Unit) => boolean, source?: Unit): Destructable[];

    EnumDestructablesInArea(originX: number, originY: number, width: number, height: number, filter?: (target: Destructable) => boolean): Destructable[];
    
    EnumDestructablesInRect(rect: Rectangle, filter?: (target: Destructable) => boolean): Destructable[];
}