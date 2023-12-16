import { Product, ProductStatus } from "../../domain/entities/Product";
import { ProductExportRepository } from "../../domain/entities/ProductExportRepository";
import ExcelJS from "exceljs";
import _c from "../../domain/entities/generic/Collection";
import { Maybe } from "../../utils/ts-utils";

type Sheet<T> = {
    name: string;
    columns: string[];
    rows: T[];
};

type ProductRow = {
    id: string;
    title: string;
    quantity: number;
    status: ProductStatus;
};

type SummaryRow = {
    totalProducts: Maybe<number>;
    totalQuantity: Maybe<number>;
    activeQuantity: Maybe<number>;
    inactiveQuantity: Maybe<number>;
};

export class ProductExportSpreadsheetRepository implements ProductExportRepository {
    async export(name: string, products: Product[]): Promise<void> {
        const { activeProducts, inactiveProducts } = this.splitProducts(products);

        const sheets = [
            this.createProductsSheet("Active Products", activeProducts),
            this.createProductsSheet("Inactive Products", inactiveProducts),
            this.createSummarySheet(activeProducts, inactiveProducts),
        ];

        const wb = new ExcelJS.Workbook();

        sheets.forEach(sheet => {
            const sh = wb.addWorksheet(sheet.name);

            sh.addRow(sheet.columns);
            sh.addRows(sheet.rows);
        });

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

    private createProductsSheet(sheetName: string, products: Product[]): Sheet<ProductRow> {
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

    private createSummarySheet(
        activeProducts: Product[],
        inactiveProducts: Product[]
    ): Sheet<SummaryRow> {
        const products = [...activeProducts, ...inactiveProducts];

        const totalProducts = products.length;
        const totalQuantity = sumQuantities(products);
        const activeQuantity = sumQuantities(activeProducts);
        const inactiveQuantity = sumQuantities(inactiveProducts);

        return {
            name: "Summary",
            columns: ["# Products", "# Items total", "# Items active", "# Items inactive"],
            rows: [{ totalProducts, totalQuantity, activeQuantity, inactiveQuantity }],
        };
    }

    protected async saveWorkBook(wb: ExcelJS.Workbook, name: string): Promise<void> {
        wb.xlsx.writeFile(name);
    }
}

function numberOrUndefined(n: number): Maybe<number> {
    return n === 0 ? undefined : n;
}

function sumQuantities(products: Product[]): Maybe<number> {
    return numberOrUndefined(
        _c(products)
            .map(product => product.quantity.value)
            .sum()
    );
}
