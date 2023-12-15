import { describe, it } from "vitest";
import {
    ProductExportSpreadsheetRepositoryTest,
    Workbook,
} from "./ProductExportSpreadsheetRepositoryTest";
import { Product } from "../../../domain/entities/Product";

const testName = "Test";
const productsColumns = ["Id", "Title", "Quantity", "Status"];
const summaryColumns = ["# Products", "# Items total", "# Items active", "# Items inactive"];

describe("ProductExportSpreadsheetRepository", () => {
    it("Should export successfully empty products", () => {
        const repository = new ProductExportSpreadsheetRepositoryTest();

        repository.export(testName, []);

        const expectedWorkbook: Workbook = {
            name: testName,
            sheets: [
                {
                    name: "Active Products",
                    rows: [productsColumns],
                },
                {
                    name: "Inactive Products",
                    rows: [productsColumns],
                },
                {
                    name: "Summary",
                    rows: [summaryColumns, []],
                },
            ],
        };

        repository.verify(expectedWorkbook);
    });
    it("Should export successfully two products", () => {
        const repository = new ProductExportSpreadsheetRepositoryTest();

        repository.export(testName, [
            Product.create("1", "product 1", "image1", "2").get(),
            Product.create("2", "product 2", "image2", "0").get(),
        ]);

        const expectedWorkbook: Workbook = {
            name: testName,
            sheets: [
                {
                    name: "Active Products",
                    rows: [productsColumns, ["1", "product 1", 2, "active"]],
                },
                {
                    name: "Inactive Products",
                    rows: [productsColumns, ["2", "product 2", 0, "inactive"]],
                },
                {
                    name: "Summary",
                    rows: [summaryColumns, [2, 2, 2]],
                },
            ],
        };

        repository.verify(expectedWorkbook);
    });
});
