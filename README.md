# Typesense Collection Schema Generator

Given a JSON object, this CLI utility gives you a **first-draft** Typesense Collection schema for the JSON object, that you can edit to suit your needs. 

## Usage:

```bash
npx typesense-collection-schema-generator <path_to_input_json_document_file> <path_to_output_typesense_collection_schema_json_file>
```

An input JSON file like this:

```json
{
  "id": 133,
  "organization_name": "Acme Inc",
  "country": "USA",
  "full_name": "John Herrero",
  "address": "123 ABC Street",
  "tags": ["TagA", "TagB", "TagC"]
}
```

Will generate an output schema like this:

```json
{
  "name": "your_collection_name",
  "fields": [
    { "name": "organization_name", "type": "string", "optional": true },
    { "name": "country", "type": "string", "optional": true },
    { "name": "full_name", "type": "string", "optional": true },
    { "name": "address", "type": "string", "optional": true },
    { "name": "tags", "type": "string[]", "optional": true }
  ]
}
```

> [!IMPORTANT]  
> This schema is not meant to be used as-is. You want to review the generated schema, add `facet: true` for any facet fields, remove any un-indexed fields, or consider using auto-schema detection. Consider using regex field names for repeated field definitions. 
