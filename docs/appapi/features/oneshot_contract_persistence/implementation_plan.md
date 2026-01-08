# One-Shot Contract Persistence and Retrieval

Enable `ContractController` to handle `Contract` and `ContractSheet` data in a single atomic operation for both persistence (create/update) and retrieval.

## Proposed Changes

### [Backend]

#### [MODIFY] [Contract.php](file:///c:/arns/repository/Github/arinsuga/flexcoz/flexcozapi/appapi/app/Contract.php)
- Add `contractSheets` hasMany relationship to allow eager loading and easy access to children.

#### [MODIFY] [ContractController.php](file:///c:/arns/repository/Github/arinsuga/flexcoz/flexcozapi/appapi/app/Http/Controllers/ContractController.php)
- **Retrieval**:
    - Update `show($id)` to eager load `contract_sheets`.
    - Update `index()` to optionally eager load `contract_sheets` if requested (or by default if small enough).
- **Persistence**:
    - Update `store(Request $request)` to handle a nested `contract_sheets` array.
    - Update `update(Request $request, $id)` to sync `contract_sheets` (create new, update existing, and remove/deactivate missing ones).
    - **Calculations**: Before persisting, calculate subtotals for `sheet_grossamt` and `sheet_netamt` for header rows based on item rows within the same `sheetgroup_id` and `sheetheader_id`.
    - Use `DB::transaction` to ensure atomicity.

## Data Structures

### Retrieval (GET `/api/contracts/{id}`)
```json
{
  "data": {
    "id": 1,
    "contract_name": "Contract A",
    "contract_number": "CNT-001",
    "project_id": 1,
    "...": "...",
    "contract_sheets": [
      {
        "id": 101,
        "sheet_type": 0,
        "sheetgroup_id": 1,
        "sheetheader_id": null,
        "sheet_name": "Header Section",
        "sheet_grossamt": 5000.00,
        "sheet_netamt": 5000.00,
        "...": "..."
      },
      {
        "id": 102,
        "sheet_type": 1,
        "sheetgroup_id": 1,
        "sheetheader_id": 101,
        "sheet_name": "Work Item 1",
        "sheet_qty": 10,
        "sheet_price": 500,
        "sheet_grossamt": 5000.00,
        "sheet_netamt": 5000.00,
        "uom_id": 5,
        "uom_name": "m3"
      }
    ]
  }
}
```

### Persistence (POST `/api/contracts` or PUT `/api/contracts/{id}`)
```json
{
  "contract_name": "Contract A",
  "contract_number": "CNT-001",
  "project_id": 1,
  "contract_sheets": [
    {
      "id": 101, 
      "sheet_type": 0,
      "sheetgroup_id": 1,
      "sheetheader_id": null,
      "sheet_name": "Header Section"
    },
    {
      "id": null,
      "sheet_type": 1,
      "sheetgroup_id": 1,
      "sheetheader_id": 101,
      "sheet_name": "New Work Item",
      "sheet_qty": 5,
      "sheet_price": 1000,
      "uom_id": 5,
      "uom_name": "m3"
    }
  ]
}
```
> [!NOTE]
> For `PUT` requests, items in `contract_sheets` with an `id` will be updated, those without will be created, and existing sheets NOT in the list will be removed (or set to `is_active = 0`).


#### [MODIFY] [ContractRepository.php](file:///c:/arns/repository/Github/arinsuga/flexcoz/flexcozapi/appapi/app/Repositories/ContractRepository.php)
- Add methods to handle the complex persistence logic to keep the controller clean, or implement directly in controller if preferred.

## Verification Plan

### Manual Verification
- Test `GET /api/contracts/{id}` to verify `contract_sheets` are included in the JSON.
- Test `POST /api/contracts` with a JSON payload containing `contract_sheets` (items) to verify headers are correctly calculated and persisted.
- Test `PUT /api/contracts/{id}` with modified `contract_sheets` to verify sync logic and recalculated subtotals.
