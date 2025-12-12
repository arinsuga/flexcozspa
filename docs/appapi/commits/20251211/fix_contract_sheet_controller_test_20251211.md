# Fix ContractSheetControllerTest Failure

## Changes Made
Modified `tests/Feature/ContractSheetControllerTest.php` to align with the `ContractSheetController`'s bulk creation logic.

### 1. Updated `it_creates_a_new_contract_sheet`
- Changed the POST payload to be an array of objects `[$contractSheetData]` instead of a single object.
- Updated the `ContractSheetRepositoryInterface` mock to expect `bulkCreate` instead of `create`.
- Updated the mock to return an array of created items.

### 2. Updated `it_validates_required_fields_when_creating_contract_sheet`
- Changed the empty payload `[]` to an array containing an empty object `[[]]` (or `[{}]` logic) to trigger validation on individual items.
- Updated validation error keys to include the index `0.` (e.g., `0.project_id`).
