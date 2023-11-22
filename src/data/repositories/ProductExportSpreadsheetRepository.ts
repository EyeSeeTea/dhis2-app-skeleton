import { Product } from "../../domain/entities/Product";
import { ProductExportRepository } from "../../domain/entities/ProductExportRepository";
import ExcelJS from "exceljs";

export class ProductExportSpredsheetRepositoryExport implements ProductExportRepository {
    async export(name: string, products: Product[]): Promise<void> {
        const wb = new ExcelJS.Workbook();

        // ProductList
        const sh = wb.addWorksheet("ProductsList");

        // Add header
        sh.addRow(["id", "title", "quantity", "status"]);

        let prs: Product[] = [];
        products.forEach(p => {
            if (prs.some(pr => pr.equals(p))) return; // Skip if repeated product
            // Add row
            sh.addRow([p.id, p.title, p.quantity.value > 0 ? p.quantity.value : "-", p.status]);
            prs.push(p);
        });

        // Add sheet
        const sh2 = wb.addWorksheet("Summary");

        // Second sheet
        let total = 0;
        let act = 0;
        let inctv = 0;

        let prs2: Product[] = [];

        products.forEach(p => {
            if (prs2.some(pr => pr.equals(p))) return; // Skip if repeated product
            prs2.push(p);

            total += p.quantity.value;
            if (p.status === "active") {
                act += p.quantity.value;
            }
            if (p.status === "inactive") {
                inctv += p.quantity.value;
            }
        });

        sh2.addRow(["# Products", "# Items", "# Items active", "# Items inactive"]);
        sh2.addRow([
            // If a value is zero, use "-" instead
            products.length > 0 ? products.length : "-",
            total > 0 ? total : "-",
            act > 0 ? act : "-",
            inctv > 0 ? act : "-",
        ]);

        await wb.xlsx.writeFile(name);
    }
}

console.log("test");
