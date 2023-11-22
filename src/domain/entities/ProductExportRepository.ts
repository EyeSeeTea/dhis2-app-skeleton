import { FutureData } from "../../data/api-futures";
import { Product } from "./Product";

export interface ProductExportRepository {
    export(name: string, products: Product[]): Promise<void>;
}
