Backend Flask API for fund net values.

Endpoint:
- GET /get-fund-net-value-records

This setup assumes you already have an external MySQL server (not managed by docker-compose). Configure connection via environment variables (see `.env.example`).

Quick start
1. Copy `.env.example` to `.env` and update DB_HOST to point to your MySQL server. On macOS with Docker Desktop you can often use `host.docker.internal` as the host for a DB running on the host machine.
2. From the `backend/` folder run:

```bash
docker compose up --build -d
```

The API will be available at http://localhost:5000

Testing once (no persistent containers)
- Use `docker compose run --rm --service-ports api` to run the API once; the container will be removed when it exits.

Production / long-running
- `docker compose up -d` will start the `api` service in the background. The compose file includes `restart: unless-stopped` and a simple `healthcheck` so Docker will attempt to restart the container on failure.

Database table
The service expects a table named `fund_net_values` with at least: id, fund_code, net_value_date, net_value. Adjust `app.py` SELECT statement if your schema differs.
