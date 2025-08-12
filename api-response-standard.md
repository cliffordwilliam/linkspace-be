# API Response Standard

This document outlines the standardized structure for all API responses in CRUD operations, using consistent `data` and `meta` fields to ensure clarity and extensibility.

## Response Format

All responses follow this general structure:

```json
{
  "success": true,
  "data": {},
  "meta": {}
}
```

* `success`: Indicates whether the request was successful (`true` or `false`).
* `data`: Contains the main response payload.
* `meta`: Holds additional metadata (e.g., pagination details).

---

## CRUD Response Examples

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

---

## Handling Empty or Null Values

### Empty Lists

When a list query returns no results, the response should include an empty array for `data` and show zero in `meta.pagination.total`:

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

If a single resource is not found or is intentionally null, return `success: false` with a relevant error message and `data` omitted or set to `null`:

```json
{
  "success": false,
  "error": {
    "message": "Guest not found."
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

## Error Response Format

Error responses should include at least a message describing the error. Optionally, they can include an error code and detailed field-specific messages:

```json
{
  "success": false,
  "error": {
    "message": "Validation error",
    "code": 1234,
    "details": [
      {
        "field": "guest_name",
        "message": "Guest Name is required."
      },
      {
        "field": "guest_birth_date",
        "message": "Guest Birth Date must be less than today."
      }
    ]
  }
}
```

* `message` (required): General description of the error.
* `code` (optional): Numeric error code.
* `details` (optional): Array of specific errors tied to individual fields.
