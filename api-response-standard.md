# API Response Standard

This document outlines the standardized structure for all API responses in CRUD operations, using consistent `success`, `data`, `meta`, and `error` fields to ensure clarity, extensibility, and predictability.

---

## 1️⃣ General Response Format

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

- `success` (boolean): Indicates whether the request was successful (`true` or `false`).
- `data` (object/array/null): Contains the main response payload.
- `meta` (object, optional): Holds additional metadata, such as pagination details.

---

## 2️⃣ CRUD Response Examples

### READ (GET)

#### Single Resource (GET /guest/{id})

```json
{
  "success": true,
  "data": {
    "GuestId": "uuid",
    "FirstName": "John"
  }
}
```

#### List of Resources (GET /guests)

```json
{
  "success": true,
  "data": [
    { "GuestId": "uuid", "FirstName": "John" },
    { "GuestId": "uuid", "FirstName": "Jane" }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "size": 10,
      "total": 42
    }
  }
}
```

---

### CREATE (POST)

```json
{
  "success": true,
  "data": {
    "GuestId": "uuid",
    "FirstName": "John"
  }
}
```

---

### UPDATE (PUT/PATCH)

```json
{
  "success": true,
  "data": {
    "GuestId": "uuid",
    "FirstName": "John Updated"
  }
}
```

---

### DELETE (DELETE)

```json
{
  "success": true
}
```

- `data` and `meta` can be omitted for delete operations.

---

## 3️⃣ Handling Empty or Null Values

### Empty Lists

```json
{
  "success": true,
  "data": [],
  "meta": {
    "pagination": {
      "page": 1,
      "size": 10,
      "total": 0
    }
  }
}
```

### Null Single Resource

```json
{
  "success": false,
  "error": {
    "message": "Guest not found.",
    "code": "RESOURCE_NOT_FOUND",
    "type": "ResourceNotFoundException"
  }
}
```

### Optional Fields

Fields without values should be explicitly set to `null` rather than omitted:

```json
{
  "success": true,
  "data": {
    "GuestId": "uuid",
    "MiddleName": null
  }
}
```

---

## 4️⃣ Error Response Format

All errors follow a consistent structure:

```json
{
  "success": false,
  "error": {
    "message": "General human-readable description of the error",
    "code": "ERROR_CODE",
    "type": "ErrorType", // optional, e.g., class name for resource errors
    "details": [
      // optional, for field-specific validation errors
      {
        "field": "body.property_name",
        "message": "Human-readable validation message",
        "type": "validation_constraint" // e.g., minLength, isBoolean
      }
    ]
  }
}
```

### Examples

#### Resource Not Found

```json
{
  "success": false,
  "error": {
    "message": "Product with id f53e804b-87a4-4651-9788-63a6a7b60871 not found",
    "code": "RESOURCE_NOT_FOUND",
    "type": "ResourceNotFoundException"
  }
}
```

#### Validation Error

```json
{
  "success": false,
  "error": {
    "message": "Request validation error",
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "body.product_name",
        "message": "product_name must be longer than or equal to 1 characters",
        "type": "minLength"
      },
      {
        "field": "body.deleted_status",
        "message": "deleted_status must be a boolean value",
        "type": "isBoolean"
      }
    ]
  }
}
```

#### Internal Server Error (Generic)

```json
{
  "success": false,
  "error": {
    "message": "Internal server error",
    "code": "INTERNAL_SERVER_ERROR",
    "type": "Error"
  }
}
```

---

### Notes

- `success` is always `false` for errors.
- `error.code` is a **string identifier** for programmatic handling.
- `error.type` is optional; it can be used to classify the error further.
- `error.details` is optional and used primarily for field-level validation errors.
- Field paths in `details` should include the source (`body`, `query`, `params`) for clarity.
