# Changes

## OrdersheetControllerTest.php

- **Fixed Validation Error**: Added `sheet_code` to the test data in `it_creates_a_new_ordersheet` as it is a required field.
- **Fixed Assertion Error**: Updated `it_creates_a_new_ordersheet` and `it_creates_ordersheet_with_all_optional_fields` to expect an array of objects in the JSON response `data` key, matching the `bulkCreate` behavior in the controller.
- **Fixed Missing Field**: Added `sheetgroup_type` to `it_creates_ordersheet_with_all_optional_fields` as it is a required field.
