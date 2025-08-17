# Description

This directory contains the Postman collection and its environment file for the **Express API**.  
We utilize this setup to perform **end-to-end (E2E) testing** using [`newman`](https://github.com/postmanlabs/newman).

# How To Do E2E Test

1. Install newman globally `npm i -g newman`
2. Run testing

```
newman run ./postman_collection.json \
--folder "Health Check" \
--folder "Products" \
--environment ./postman_environment.json
```
