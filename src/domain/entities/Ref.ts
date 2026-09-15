export type Id = string;

export type Ref = { id: Id };

export type NamedRef = Ref & { name: string };

export function getId<T extends Ref>(ref: T): Id {
    return ref.id;
}
