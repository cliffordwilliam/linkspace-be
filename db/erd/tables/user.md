# User Table

## Description

Main table storing user account information.

## Columns

| column        | Type         | constraints               | Description                       |
| ------------- | ------------ | ------------------------- | --------------------------------- |
| id            | SERIAL       | PRIMARY KEY               | Auto-incrementing unique user ID  |
| username      | VARCHAR(50)  | UNIQUE, NOT NULL          | Unique username for the user      |
| email         | VARCHAR(100) | UNIQUE, NOT NULL          | Unique email address for the user |
| password_hash | TEXT         | NOT NULL                  | Hashed password                   |
| created_at    | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP | Record creation timestamp         |
| updated_at    | TIMESTAMP    | DEFAULT CURRENT_TIMESTAMP | Last modification timestamp       |

## SQL Schema

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
