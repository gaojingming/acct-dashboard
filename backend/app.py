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
    fund_code = request.args.get('fund_code')
    limit = request.args.get('limit', type=int)

    try:
        conn = get_db_connection()
        with conn.cursor() as cur:
            sql = 'SELECT id, fund_code, net_value_date, net_value FROM fund_net_values'
            params = []
            if fund_code:
                sql += ' WHERE fund_code = %s'
                params.append(fund_code)
            sql += ' ORDER BY net_value_date DESC'
            if limit:
                sql += ' LIMIT %s'
                params.append(limit)

            cur.execute(sql, params)
            rows = cur.fetchall()

        # Ensure Python types are JSON serializable
        for r in rows:
            # convert datetime/date to isoformat if present
            if isinstance(r.get('net_value_date'), (bytes,)):
                # unexpected bytes, decode
                r['net_value_date'] = r['net_value_date'].decode('utf-8')
            elif hasattr(r.get('net_value_date'), 'isoformat'):
                r['net_value_date'] = r['net_value_date'].isoformat()

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
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
