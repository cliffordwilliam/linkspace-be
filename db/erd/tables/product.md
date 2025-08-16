# Product Table

## Description

Master list of products available in the e-commerce platform.

## Columns

| column         | Type                     | constraints               | Description                                    |
| -------------- | ------------------------ | ------------------------- | ---------------------------------------------- |
| product_id     | uuid                     | PRIMARY KEY               | Unique identifier for the product              |
| product_name   | VARCHAR(200)             | NOT NULL                  | Name of the product                            |
| deleted_status | BOOLEAN                  | NOT NULL DEFAULT FALSE    | Active status (FALSE = active, TRUE = deleted) |
| date_created   | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp                      |
| date_modified  | TIMESTAMP WITH TIME ZONE | DEFAULT CURRENT_TIMESTAMP | Last modification timestamp                    |

## SQL Schema

```sql
CREATE TABLE product (
    product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_name VARCHAR(200) NOT NULL,
    deleted_status BOOLEAN NOT NULL DEFAULT FALSE,
    date_created TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    date_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
