# Changes Verified

## Database Schema
- Added `sheetgroup_type` column to `ordersheets` table migration.
- Column is `integer` with default `0` (Work).

## Database Seeding
- Updated `ContractsheetsTableSeeder` to populate `sheetgroup_type` as `0` (Work) for all existing construction data.
- Updated `OrdersheetsTableSeeder` to populate `sheetgroup_type` as `0`.
- Verified data integrity after seeding.

## Application Logic
- Updated `ContractSheetController` validation to include `sheetgroup_type` (0 or 1).
- Updated `OrdersheetController` validation to include `sheetgroup_type` (0 or 1).
- Updated `ContractSheet`, `Ordersheet`, and `SheetGroup` models:
    - Added `sheetgroup_type` to `$fillable`.
    - Defined relationships between `SheetGroup` and sheets (`hasMany`/`belongsTo`).
