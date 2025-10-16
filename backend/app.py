import os
import json
from flask import Flask, jsonify, request
from sqlalchemy import create_engine
import pandas as pd
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)

def get_sqlalchemy_engine():
    # Create a SQLAlchemy engine using the same environment variables
    host = os.environ.get('DB_HOST', 'mysql')
    port = os.environ.get('DB_PORT', '3306')
    user = os.environ.get('DB_USER', 'root')
    password = os.environ.get('DB_PASSWORD', '')
    db = os.environ.get('DB_NAME', 'funds')

    connection_string = f'mysql+pymysql://{user}:{password}@{host}:{port}/{db}'
    engine = create_engine(connection_string)
    return engine


@app.route('/')
def index():
    return jsonify({'status': 'ok', 'message': 'Fund net value API'})


@app.route('/get-fund-net-value-records', methods=['GET', 'OPTIONS'])
def get_fund_net_value_records():
    conn = None
    try:
        # Handle CORS preflight
        if request.method == 'OPTIONS':
            return ('', 204)
        engine = get_sqlalchemy_engine()
        sql = 'SELECT * FROM fund_net_value_records'

        # Use pandas to read SQL directly into a DataFrame
        df = pd.read_sql(sql, con=engine)
        df['date'] = pd.to_datetime(df['date']).dt.strftime('%Y-%m-%d')
        df['total_value'] = df['cash'] + df['futures_account_balance'] + df['margin_financing_account_balance'] + df['options_account_balance'] + df['stock_account_balance']
        df['returns'] = df['total_value'] / df['fund_shares']
        df = df.sort_values(by='date')

        # If DataFrame is empty, return empty list
        # logging.info(df)
        records = df.to_dict(orient='records')

        return jsonify({'data': records})
    except Exception as e:
        app.logger.exception('DB query failed')
        return jsonify({'error': str(e)}), 500
    finally:
        if conn is not None:
            try:
                conn.close()
            except Exception:
                pass


@app.after_request
def add_cors_headers(response):
    # Very permissive CORS for local development; tighten in production as needed
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response


if __name__ == '__main__':
    # Default to 5001 for local development and container runtime as requested
    # Allow overriding via the PORT environment variable
    port = int(os.environ.get('PORT', 5001))
    app.logger.info(f"Starting Flask app on 0.0.0.0:{port}")
    app.run(host='0.0.0.0', port=port)
