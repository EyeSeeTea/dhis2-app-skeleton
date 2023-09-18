import { expect, test } from "vitest";
import { Struct } from "../Struct";

class Person extends Struct<{ name: string; age: number }>() {
    description() {
        return `${this.name} has ${this.age} years`;
    }
}

const mary = new Person({ name: "Mary Cassatt", age: 54 });

test("public attributes", () => {
    expect(mary.name).toEqual("Mary Cassatt");
    expect(mary.age).toEqual(54);
});

test("public custom methods", () => {
    expect(mary.description()).toEqual("Mary Cassatt has 54 years");
});
