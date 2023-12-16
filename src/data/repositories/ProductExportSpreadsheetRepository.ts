import { Product, ProductStatus } from "../../domain/entities/Product";
import { ProductExportRepository } from "../../domain/entities/ProductExportRepository";
import ExcelJS from "exceljs";
import _c from "../../domain/entities/generic/Collection";
import { Maybe } from "../../utils/ts-utils";

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
        const { activeProducts, inactiveProducts } = this.splitProducts(products);

        const sheets = [
            this.createProductsSheet("Active Products", activeProducts),
            this.createProductsSheet("Inactive Products", inactiveProducts),
        ];

        const wb = new ExcelJS.Workbook();

        sheets.forEach(sheet => {
            const sh = wb.addWorksheet(sheet.name);

            sh.addRow(sheet.columns);
            sh.addRows(sheet.rows);
        });

        this.createSummarySheet(wb, [...activeProducts, ...inactiveProducts]);

        this.saveWorkBook(wb, name);
    }

    private splitProducts(products: Product[]) {
        const productsSortedByTitle = _c(products)
            .uniqWith((product1, product2) => product1.equals(product2))
            .sortBy(product => product.title)
            .value();

        const activeProducts = productsSortedByTitle.filter(product => product.status === "active");

        const inactiveProducts = productsSortedByTitle.filter(
            product => product.status === "inactive"
        );
        return { activeProducts, inactiveProducts, productsSortedByTitle };
    }

    private createProductsSheet(sheetName: string, products: Product[]): Sheet {
        return {
            name: sheetName,
            columns: ["Id", "Title", "Quantity", "Status"],
            rows: products.map(product => ({
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
            numberOrUndefined(productsSortedByTitle.length),
            numberOrUndefined(total),
            numberOrUndefined(act),
            numberOrUndefined(inctv),
        ]);
    }

    protected async saveWorkBook(wb: ExcelJS.Workbook, name: string): Promise<void> {
        wb.xlsx.writeFile(name);
    }
}

function numberOrUndefined(n: number): Maybe<number> {
    return n === 0 ? undefined : n;
}
