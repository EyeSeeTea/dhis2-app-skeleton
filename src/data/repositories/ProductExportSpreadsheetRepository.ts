import { Product } from "../../domain/entities/Product";
import { ProductExportRepository } from "../../domain/entities/ProductExportRepository";
import ExcelJS from "exceljs";
import _c from "../../domain/entities/generic/Collection";

export class ProductExportSpreadsheetRepository implements ProductExportRepository {
    async export(name: string, products: Product[]): Promise<void> {
        // Create workbook
        const wb = new ExcelJS.Workbook();

        const productsSortedByTitle = _c(products)
            .uniqWith((product1, product2) => product1.equals(product2))
            .sortBy(product => product.title)
            .value();

        // add worksheet for active products
        const sh = wb.addWorksheet("Active Products");

        // Add row header
        sh.addRow(["Id", "Title", "Quantity", "Status"]);

        productsSortedByTitle.forEach(p => {
            if (p.status === "active") {
                sh.addRow([p.id, p.title, p.quantity.value, p.status]);
            }
        });

        // add worksheet for inactive products
        const sh2 = wb.addWorksheet("Inactive Products");

        // Add row header
        sh2.addRow(["Id", "Title", "Quantity", "Status"]);

        productsSortedByTitle.forEach(p => {
            if (p.status === "inactive") {
                sh2.addRow([p.id, p.title, p.quantity.value, p.status]);
            }
        });

        // Add sheet summary
        const sh3 = wb.addWorksheet("Summary");

        let total = 0;
        let act = 0;
        let inctv = 0;

        productsSortedByTitle.forEach(p => {
            total += p.quantity.value;
            if (p.status === "active") {
                act += p.quantity.value;
            }
            if (p.status === "inactive") {
                inctv += p.quantity.value;
            }
        });

        sh3.addRow(["# Products", "# Items total", "# Items active", "# Items inactive"]);
        sh3.addRow([
            // If a value is zero, render an empty cell instead
            productsSortedByTitle.length > 0 ? productsSortedByTitle.length : undefined,
            total > 0 ? total : undefined,
            act > 0 ? act : undefined,
            inctv > 0 ? act : undefined,
        ]);

        this.saveWorkBook(wb, name);
    }

    protected async saveWorkBook(wb: ExcelJS.Workbook, name: string): Promise<void> {
        wb.xlsx.writeFile(name);
    }
}
