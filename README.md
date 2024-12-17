# Salesforce Commerce - Product Flag management and rendering
This extension allow to manage and append flags to Products render on PLP using standard B2B and D2C components
![Store showing Flags](doc/Store%20-%20Product%20Flag.png)

## How to Deploy

Go to setup and assign following permision set to relevante users:
- `B2B Category Manage Product Flags`: give access to Tab and Flag object to create and edit them.
- `B2B Category Read Product Flags`; give read access to shopper.

Go to Setup > Object Manager > Product2 > Page Layouts, then add `Flag` to relevante layout.

Whithin Experience Builder, drop component `B2B - Category Add Product Flags` below standard `Results` (B2B) or `Results Grid` (D2C) component on Category Page, then publish.
![Store showing Flags](doc/Experience%20Builder%20-%20Product%20Flag.png)

Create `Flags` using the Tab and assign them to Product.