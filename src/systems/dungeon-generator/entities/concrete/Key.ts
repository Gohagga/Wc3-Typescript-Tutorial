import { IKey } from "../IKey";

export class LockKey implements IKey {

    constructor(
        public lockLevel: number
    ) {
        
    }
}