Fixed numeric range error and improved numeric parsing

**Backend**
*   **2025_12_01_150742_create_contracts_table.php**
    *   Increased precision of `contract_amount` and `contract_payment` columns from `decimal(15,2)` to `decimal(20,2)` to prevent "Numeric value out of range" errors for large transactions.
*   **2025_12_01_152128_create_contractsheets_table.php**
    *   Increased precision for monetary fields (`sheet_price`, `sheet_grossamt`, `sheet_netamt`, etc.) to `decimal(20,2)` for supporting larger values.
    *   Adjusted rate columns (`sheet_discountrate`, `sheet_taxrate`) to `decimal(5,2)` and value columns to `decimal(20,2)`.
*   **2025_12_08_112922_create_ordersheets_table.php**
    *   Increased precision for `sheet_qty`, `sheet_price`, and all calculated amount fields (gross, tax, discount, net) to `decimal(20,2)` to align with contract sheet precision.

**Frontend**
*   **ContractSheetConfirmation.tsx**
    *   Refined parent-child resolution logic to correctly identify parent items using `lastIndexOf` dot logic.
    *   Improved subtotal calculation to sum up all descendant items properly by matching code prefixes, ensuring accurate hierarchical totals.
*   **ContractSheetTable.tsx**
    *   Integrated `parseNumeric` utility for quantity and price inputs to ensure robust numeric conversion.
    *   Updated paste event handler to use `parseNumeric` for cleaning input data before processing, preventing invalid number formats.
*   **OrderSheetTable.tsx**
    *   Replaced ad-hoc `parseFloat` logic with the centralized `parseNumeric` utility for consistent numeric handling across the application.
    *   Updated paste functionality to strip invalid characters using `parseNumeric`.
*   **numberFormat.ts**
    *   Enhanced `formatNumeric` and `parseNumeric` functions to aggressively strip non-numeric characters (except valid dots and minus signs) before parsing, verifying cleaner data entry and preventing NaN results from formatted strings.
