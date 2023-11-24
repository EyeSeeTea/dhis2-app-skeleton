import { Product } from "../../domain/entities/Product";
import { ProductExportRepository } from "../../domain/entities/ProductExportRepository";
import ExcelJS from "exceljs";

export class ProductExportSpreadsheetRepository implements ProductExportRepository {
    async export(name: string, products: Product[]): Promise<void> {
        const wb = new ExcelJS.Workbook();

        // add worksheet ProductList
        const sh = wb.addWorksheet("ProductsList");

        // Add row header
        sh.addRow(["id", "title", "quantity", "status"]);

        let prs: Product[] = [];
        products.forEach(p => {
            if (prs.some(pr => pr.equals(p))) return; // Skip if repeated product
            prs.push(p);
        });

        // Sort products by title
        prs.sort((a, b) => {
            if (a.title < b.title) {
                return -1;
            }
            if (a.title > b.title) {
                return 1;
            }
            return 0;
        });

        prs.forEach(p => {
            // Add product row
            sh.addRow([p.id, p.title, p.quantity.value, p.status]);
        });

        // Second sheet: Summary
        const sh2 = wb.addWorksheet("Summary");

        let total = 0;
        let act = 0;
        let inctv = 0;

        prs.forEach(p => {
            total += p.quantity.value;
            if (p.status === "active") {
                act += p.quantity.value;
            }
            if (p.status === "inactive") {
                inctv += p.quantity.value;
            }
        });

        sh2.addRow(["# Products", "# Items total", "# Items active", "# Items inactive"]);
        sh2.addRow([
            // If a value is zero, render "-" instead
            products.length > 0 ? products.length : "-",
            total > 0 ? total : "-",
            act > 0 ? act : "-",
            inctv > 0 ? act : "-",
        ]);

        await wb.xlsx.writeFile(name);
    }
}

console.log("test");
