import { Coords } from "systems/coords/Coords"

export type Stamp = {
    destructables: {
        coords: Coords,
        typeId: number,
    }[]
}