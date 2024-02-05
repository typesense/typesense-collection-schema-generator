#! /usr/bin/env node

const fs = require("fs");
const inputJSONDocumentFilePath = process.argv[2];
const outputSchemaFilePath = process.argv[3];

if (!inputJSONDocumentFilePath || !outputSchemaFilePath) {
  console.log(
    `Usage: npx typesense-collection-schema-generator <path_to_input_json_document_file> <path_to_output_typesense_collection_schema_json_file>`,
  );
  process.exit(1);
}

// Function to check if a string is a valid URL by attempting to construct a URL object
function isValidUrl(string) {
  try {
    new URL(string);
    return true; // No error means it's a valid URL
  } catch (error) {
    return false; // An error means it's not a valid URL
  }
}

// Function to infer Typesense field types, excluding URLs, and accounting for arrays and nested objects
function inferTypesenseType(value) {
  if (typeof value === "string") {
    if (isValidUrl(value) || isImageFilename(value)) {
      return null; // Exclude URLs and image filenames
    }
    return "string";
  } else if (typeof value === "number") {
    return Number.isInteger(value) ? "int32" : "float";
  } else if (typeof value === "boolean") {
    return "bool";
  } else if (Array.isArray(value)) {
    // For simplicity, we check the type of the first element. Real use may require more complex handling.
    return value.length > 0 ? `${inferTypesenseType(value[0])}[]` : null; // Indicate an array of type
  } else if (typeof value === "object") {
    return "object"; // Treat nested objects as 'object', or use a recursive approach to handle deeply
  } else {
    return "UNKNOWN"; // Unsupported type
  }
}

// Function to check if a string ends with a common image file extension
function isImageFilename(string) {
  return /\.(jpg|jpeg|png|gif|bmp|svg)$/i.test(string);
}

const writeTypesenseCollectionSchemaToFile = (schema, filePath) => {
  try {
    const data = JSON.stringify(schema, null, 2); // Converts the array to a JSON string, formatted for readability
    fs.writeFileSync(filePath, data, "utf8");
    console.log(
      `Typesense Collection Schema successfully written to ${filePath}`,
    );
  } catch (error) {
    console.error("Error writing schema to file:", error);
  }
};

// Function to generate a Typesense schema from a JSON object, excluding URL fields
function generateTypesenseSchemaFromJson(filePath) {
  let schema = {};
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      return;
    }
    const jsonObject = JSON.parse(data);
    const fields = Object.keys(jsonObject)
      .filter((key) => !key.endsWith("_url")) // Exclude fields where the name ends with _url
      .map((key) => {
        const type = inferTypesenseType(jsonObject[key]);

        if (type == null || key === "id") {
          return null;
        } else if (type === "UNKNOWN") {
          console.warn(`Unknown field type for ${key}`);
        } else {
          return { name: key, type, optional: true };
        }
      })
      .filter((field) => field !== null); // Exclude fields that are null (eg: URLs)

    schema = {
      name: "your_collection_name", // Customize your collection name
      fields: fields,
    };
    writeTypesenseCollectionSchemaToFile(schema, outputSchemaFilePath);
  });
}

generateTypesenseSchemaFromJson(inputJSONDocumentFilePath);
