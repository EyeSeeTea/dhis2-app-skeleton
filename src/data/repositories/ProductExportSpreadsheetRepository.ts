import { Product, ProductStatus } from "../../domain/entities/Product";
import { ProductExportRepository } from "../../domain/entities/ProductExportRepository";
import ExcelJS from "exceljs";
import _c from "../../domain/entities/generic/Collection";

type Sheet = {
    name: string;
    columns: string[];
    rows: Row[];
};

type Row = {
    id: string;
    title: string;
    quantity: number;
    status: ProductStatus;
};

export class ProductExportSpreadsheetRepository implements ProductExportRepository {
    async export(name: string, products: Product[]): Promise<void> {
        const productsSortedByTitle = _c(products)
            .uniqWith((product1, product2) => product1.equals(product2))
            .sortBy(product => product.title)
            .value();

        // Create workbook
        const wb = new ExcelJS.Workbook();

        const activeProductsSheet = this.createActiveProductsSheet(productsSortedByTitle);
        const sh = wb.addWorksheet(activeProductsSheet.name);

        sh.addRow(activeProductsSheet.columns);
        sh.addRows(activeProductsSheet.rows);

        const inactiveProductsSheet = this.createInactiveProductsSheet(wb, productsSortedByTitle);

        const sh2 = wb.addWorksheet(inactiveProductsSheet.name);

        sh2.addRow(inactiveProductsSheet.columns);
        sh2.addRows(inactiveProductsSheet.rows);

        this.createSummarySheet(wb, productsSortedByTitle);

        this.saveWorkBook(wb, name);
    }

    private createActiveProductsSheet(productsSortedByTitle: Product[]): Sheet {
        const activeProducts = productsSortedByTitle.filter(product => product.status === "active");

        return {
            name: "Active Products",
            columns: ["Id", "Title", "Quantity", "Status"],
            rows: activeProducts.map(product => ({
                id: product.id,
                title: product.title,
                quantity: product.quantity.value,
                status: product.status,
            })),
        };
    }

    private createInactiveProductsSheet(
        wb: ExcelJS.Workbook,
        productsSortedByTitle: Product[]
    ): Sheet {
        const inactiveProducts = productsSortedByTitle.filter(
            product => product.status === "inactive"
        );

        return {
            name: "Inactive Products",
            columns: ["Id", "Title", "Quantity", "Status"],
            rows: inactiveProducts.map(product => ({
                id: product.id,
                title: product.title,
                quantity: product.quantity.value,
                status: product.status,
            })),
        };
    }

    private createSummarySheet(wb: ExcelJS.Workbook, productsSortedByTitle: Product[]) {
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
    }

    protected async saveWorkBook(wb: ExcelJS.Workbook, name: string): Promise<void> {
        wb.xlsx.writeFile(name);
    }
}
