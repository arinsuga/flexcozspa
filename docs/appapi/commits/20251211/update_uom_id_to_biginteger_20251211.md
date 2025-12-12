# Update uom_id to bigInteger

**Date:** 2025-12-11

This change updates the `uom_id` field from a string to a `bigInteger` across the application, ensuring consistency with the database schema updates.

## Changes

### 1. Seeders

- **UomsTableSeeder.php**: Added missing UOMs ('LOT', 'UNIT') to ensure all IDs required by other seeders exist.
- **ContractsheetsTableSeeder.php**: Replaced string UOMs ('LOT', 'PCS', 'M3', etc.) with their corresponding integer IDs from `uoms` table.
- **OrdersheetsTableSeeder.php**: Updated `uom_id` to use integer ID (1 for 'PCS').

### 2. Controllers

- **ContractSheetController.php**: Updated `store` validation rules to require `uom_id` as an integer and check existence in `uoms` table.
- **OrdersheetController.php**: Updated `store` and `update` validation rules to ensure `uom_id` is an integer.

### 3. Models

- **ContractSheet.php**: Added `uom` relationship.
- **Ordersheet.php**: Added `uom` relationship.

### 4. Tests

- **ContractSheetControllerTest.php**: Updated test data to use integer `uom_id` and added `uoms` seeding in `setUp`.
- **OrdersheetControllerTest.php**: Fixes to match controller logic (bulkCreate, array input) and updated test data to include required `uom_id` and `uom_name`.
