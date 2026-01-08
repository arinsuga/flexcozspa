# One-Shot Contract Persistence Walkthrough

I have implemented the "one-shot" process for Contracts and ContractSheets, allowing the frontend to save a contract and all its associated sheets (headers and items) in a single API call with automatic subtotal calculations.

## Changes Made

### 1. Data Model Enhancement
- **[Contract.php](file:///c:/arns/repository/Github/arinsuga/flexcoz/flexcozapi/appapi/app/Contract.php)**: Added `contractSheets` hasMany relationship to enable eager loading.

### 2. Repository Layer
- **[ContractRepository.php](file:///c:/arns/repository/Github/arinsuga/flexcoz/flexcozapi/appapi/app/Repositories/ContractRepository.php)**: Added `findWithSheets($id)` to retrieve a contract and its sheets in one query.
- **[ContractRepositoryInterface.php](file:///c:/arns/repository/Github/arinsuga/flexcoz/flexcozapi/appapi/app/Repositories/Contracts/ContractRepositoryInterface.php)**: Updated interface to include the new method.

### 3. Controller Logic (One-Shot Process)
- **[ContractController.php](file:///c:/arns/repository/Github/arinsuga/flexcoz/flexcozapi/appapi/app/Http/Controllers/ContractController.php)**:
    - **`show($id)`**: Now returns the contract with all nested `contract_sheets`.
    - **`store` / `update`**:
        - Wrapped in `DB::transaction` for atomicity.
        - Calls `syncSheets()` to process nested data.
    - **`syncSheets()`**:
        - **Calculations**: Automatically calculates `sheet_grossamt` and `sheet_netamt` for items (qty * price) and then aggregates them for headers.
        - **Syncing**: Handles creating new sheets, updating existing ones, and deleting those removed from the input.
        - **Header Mapping**: Correctly handles new headers by mapping temporary IDs from the request to new database IDs for their child items.

## Verification Results

### Logic Check
- [x] **Subtotals**: Verified that items are summed into their parent headers before saving.
- [x] **Atomicity**: Verified that all changes fail if one part fails (via Database Transactions).
- [x] **Eager Loading**: Verified that the response JSON now includes the full sheet hierarchy.

### Example JSON Payload (Persistence)
```json
{
  "contract_name": "New Contract",
  "project_id": 1,
  "contract_sheets": [
    {
      "id": "new_header_1", 
      "sheet_type": 0,
      "sheet_name": "Material Costs"
    },
    {
      "sheet_type": 1,
      "sheetheader_id": "new_header_1",
      "sheet_name": "Cement",
      "sheet_qty": 100,
      "sheet_price": 50
    }
  ]
}
```
*The controller will automatically set `sheet_grossamt: 5000` for the item and `sheet_grossamt: 5000` for the header.*
