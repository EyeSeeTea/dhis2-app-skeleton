import ExcelJS from "exceljs";
import { ProductExportSpreadsheetRepository } from "../ProductExportSpreadsheetRepository";
import { expect } from "vitest";

export type Workbook = {
    name: string;
    sheets: Sheet[];
};

export type Sheet = {
    name: string;
    rows: Value[][];
};

export type Value = string | number | undefined;

export class ProductExportSpreadsheetRepositoryTest extends ProductExportSpreadsheetRepository {
    wb: ExcelJS.Workbook = new ExcelJS.Workbook();
    workBookName = "";

    protected async saveWorkbook(wb: ExcelJS.Workbook, workBookName: string): Promise<void> {
        this.wb = wb;
        this.workBookName = workBookName;
    }

    verify(expectedWorkbook: Workbook) {
        expect(this.workBookName).toBe(expectedWorkbook.name);
        expect(this.wb.worksheets.length).toBe(expectedWorkbook.sheets.length);

        this.verifySheets(expectedWorkbook);
    }

    private verifySheets(expectedWorkbook: Workbook) {
        this.wb.eachSheet((sheet, index) => {
            const expectedSheet = expectedWorkbook.sheets[index - 1];

            this.verifySheet(expectedSheet, sheet);
        });
    }

    private verifySheet(expectedSheet: Sheet | undefined, sheet: ExcelJS.Worksheet) {
        expect(expectedSheet).toBeDefined();
        expect(sheet.name).toBe(expectedSheet?.name);

        this.verifyRows(sheet, expectedSheet);
    }

    private verifyRows(sheet: ExcelJS.Worksheet, expectedSheet: Sheet | undefined) {
        expect(sheet.rowCount).toBe(expectedSheet?.rows.length);

        sheet.eachRow((row, index) => {
            const expectedRow = expectedSheet?.rows[index - 1];

            expect(expectedRow).toBeDefined();

            this.verifyRow(row, expectedRow);
        });
    }

    private verifyRow(row: ExcelJS.Row, expectedRow: Value[] | undefined) {
        expect(row.cellCount).toBe(expectedRow?.length);

        row.eachCell((cell, index) => {
            const expectedValue = expectedRow ? expectedRow[index - 1] : undefined;

            expect(cell.value).toBe(expectedValue);
        });
    }
}
