# Commit Summary 2025-12-11

**feat: Update Ordersheet and ContractSheet logic, validation, and tests**

## Summary of changes

### 1. Database & Seeders
- Added `sheetgroup_type` column (default 0) to `ordersheets` table.
- Updated `ContractsheetsTableSeeder` and `OrdersheetsTableSeeder` to populate `sheetgroup_type` and migrate `uom_id` from string codes to integer IDs.
- Updated `UomsTableSeeder` to include missing UOMs ('LOT', 'UNIT').

### 2. Application Logic
- **ContractSheetController**: Enhanced `store` validation to include all table fields and enforce `uom_id` as an integer.
- **OrdersheetController**: Updated `store`/`update` validation for `sheetgroup_type` and `uom_id` (integer).
- **Models**: Updated `ContractSheet`, `Ordersheet`, and `SheetGroup` with new fillable fields and relationships.

### 3. Tests
- **ContractSheetControllerTest**: Updated test data for bulk creation (array payload) and integer `uom_id`.
- **OrdersheetControllerTest**: Fixed validation errors (added `sheet_code`, `sheetgroup_type`) and updated assertions for bulk create responses.

### 4. Refactor
- Standardized `uom_id` as BigInteger across the application (Seeders, Controllers, Models, Tests).
