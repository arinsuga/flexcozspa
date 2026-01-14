Work on frontend application
Modify the application UI and data logic according to the following specifications:

# Object Reference
## searchButton
- Component: button
- Title: "Search"
- Icon: magnifying glass
- Font color: auto-sync with dark/light mode
- Background color: auto-sync with dark/light mode

## vendorData
- Component: modal form
- Contains: vendor list of values
- Filtering: list can be filtered by vendor type
- Interaction: user can double-click a list item
- Action: modal sends vendor_id to the caller form
- Data source: vendorService.ts
- Data filter: vendorTypeService.ts

# Order Sheet Column Specification
Refactor and relayout @beautifulMention into the following columns:

## Column 1: Code
- Type: text
- Title: "Code"
- Value: sheet_code
- Rules: required

## Column 2: Reff Type
- Type: dropdown list (list of values)
- Title: "Reff Type"
- Value: sheet_refftypeid
- Rules: required if sheet_reffno (Column 3) is not empty

## Column 3: Reff No
- Type: text
- Title: "Reff No"
- Value: sheet_reffno
- Rules: required if sheet_refftypeid (Column 2) is not empty

## Column 4: Reff No Date
- Type: date picker
- Title: "Reff No Date"
- Value: Selected Date
- Rules: required if sheet_refftypeid (Column 2) is not empty

## Column 5: Vendor
- Type: text with searchButton
- Title: "S/SM"
- Value: id
- Value mapping: vendor_id
- Display value: vendor_name
- Rules: required
- Action: show vendorData modal when searchButton is clicked

## Column 6: Description
- Type: multiline text (max 5 rows)
- Title: "Description"
- Value: sheet_description
- Rules: required

## Column 7: Vol
- Type: number (2 decimal digits, right aligned)
- Title: "Vol"
- Value: sheet_qty
- Rules: required

## Column 8: Sat
- Type: text (center aligned)
- Title: "Sat"
- Value: uom_name
- Rules: required

## Column 9: H.Satuan
- Type: number (2 decimal digits, right aligned)
- Title: "H.Satuan"
- Value: sheet_price
- Rules: required

## Column 10: Total
- Type: readonly number (2 decimal digits, right aligned, grey background)
- Title: "Total"
- Value: Column 7 × Column 9
- Value mapping: [sheet_grossamt, sheet_netamt]
- Rules: required