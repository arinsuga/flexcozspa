# Improve ContractSheetController Validation

## Description
Improved the validation in the `ContractSheetController` `store` method to ensure all fields from the `contractsheets` table migration are correctly validated.

## Date
2025-12-11

## Changes

### 1. ContractSheetController

Updated the `store` method in `appapi/app/Http/Controllers/ContractSheetController.php`:

```php
public function store(Request $request)
{
    $validated = $request->validate([
        'project_id' => 'required|integer|exists:projects,id',
        'contract_id' => 'required|integer|exists:contracts,id',
        'sheet_dt' => 'nullable|date',
        'sheet_type' => 'integer',
        'sheetgroup_id' => 'required|integer',
        'sheetheader_id' => 'nullable|integer',
        'sheet_code' => 'nullable|string|max:255',
        'sheet_name' => 'nullable|string|max:255',
        'sheet_description' => 'nullable|string|max:255',
        'sheet_notes' => 'nullable|string|max:255',
        'sheet_qty' => 'nullable|numeric',
        'sheet_price' => 'nullable|numeric',
        'sheet_grossamt' => 'nullable|numeric',
        'sheet_discountrate' => 'nullable|numeric',
        'sheet_discountvalue' => 'nullable|numeric',
        'sheet_taxrate' => 'nullable|numeric',
        'sheet_taxvalue' => 'nullable|numeric',
        'sheet_netamt' => 'nullable|numeric',
        'uom_id' => 'required|string|max:255',
        'uom_name' => 'required|string|max:255',
        'sheetgroup_seqno' => 'nullable|integer',
        'sheet_seqno' => 'nullable|integer',
    ]);

    $contractsheet = $this->repository->create($request->all());
    return response()->json(['data' => $contractsheet], 201);
}
```

### 2. ContractSheetControllerTest

Updated `appapi/tests/Feature/ContractSheetControllerTest.php` to reflect the new validation rules:

- Updated `it_creates_a_new_contract_sheet` to include required fields: `project_id`, `sheetgroup_id`, `uom_id`, `uom_name`.
- Updated `it_validates_required_fields_when_creating_contract_sheet` to assert validation errors for the new required fields.

## Verification

Ran `vendor/bin/phpunit tests/Feature/ContractSheetControllerTest.php` and all 10 tests passed.
