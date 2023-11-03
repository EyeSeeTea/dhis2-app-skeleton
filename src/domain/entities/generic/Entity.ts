import { Id } from "../Ref";

export interface EntityData {
    id: Id;
}

const isEntity = (v: any): v is Entity => {
    return v instanceof Entity;
};

export abstract class Entity implements EntityData {
    constructor(public id: Id) {}

    public equals(object?: Entity): boolean {
        if (object === null || object === undefined) {
            return false;
        }

        if (this === object) {
            return true;
        }

        if (!isEntity(object)) {
            return false;
        }

        return this.id === object.id;
    }
}
