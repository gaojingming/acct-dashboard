import os
import json
from flask import Flask, jsonify, request
import pymysql

app = Flask(__name__)

def get_db_connection():
    # Read DB config from env vars with sensible defaults for local dev
    host = os.environ.get('DB_HOST', 'mysql')
    port = int(os.environ.get('DB_PORT', 3306))
    user = os.environ.get('DB_USER', 'root')
    password = os.environ.get('DB_PASSWORD', '')
    db = os.environ.get('DB_NAME', 'funds')

    conn = pymysql.connect(host=host,
                           port=port,
                           user=user,
                           password=password,
                           db=db,
                           cursorclass=pymysql.cursors.DictCursor,
                           autocommit=True)
    return conn


@app.route('/')
def index():
    return jsonify({'status': 'ok', 'message': 'Fund net value API'})


@app.route('/get-fund-net-value-records', methods=['GET'])
def get_fund_net_value_records():
    # Optional query params: fund_code, limit
    # fund_code = request.args.get('fund_code')
    # limit = request.args.get('limit', type=int)

    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            sql = 'SELECT * FROM fund_net_value_records'
            cur.execute(sql)
            rows = cur.fetchall()

        return jsonify({'data': rows})
    except Exception as e:
        app.logger.exception('DB query failed')
        return jsonify({'error': str(e)}), 500
    finally:
        try:
            conn.close()
        except Exception:
            pass


if __name__ == '__main__':
    # Default to 5001 for local development and container runtime as requested
    # Allow overriding via the PORT environment variable
    port = int(os.environ.get('PORT', 5001))
    app.logger.info(f"Starting Flask app on 0.0.0.0:{port}")
    app.run(host='0.0.0.0', port=port)
