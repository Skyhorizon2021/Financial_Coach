import os
import pandas as pd
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import json
from datetime import datetime, timedelta
import numpy as np

app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)  # Enable CORS for API endpoints

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'csv', 'xlsx', 'xls'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# In-memory storage for demo purposes
# In production, you'd use a proper database
app_data = {
    'transactions': [],
    'goals': [
        {
            'id': '1',
            'title': 'Emergency Fund',
            'target_amount': 5000,
            'current_amount': 1200,
            'target_date': '2024-12-31',
            'goal_type': 'savings'
        },
        {
            'id': '2',
            'title': 'Vacation to Japan',
            'target_amount': 3000,
            'current_amount': 800,
            'target_date': '2024-10-15',
            'goal_type': 'savings'
        }
    ],
    'insights': {
        'spending': [],
        'subscriptions': []
    }
}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def process_transaction_data(df):
    """Process uploaded transaction data and extract insights"""
    try:
        # Standardize column names (handle common variations)
        column_mapping = {
            'amount': ['amount', 'Amount', 'AMOUNT', 'transaction_amount', 'value'],
            'description': ['description', 'Description', 'DESCRIPTION', 'memo', 'details'],
            'date': ['date', 'Date', 'DATE', 'transaction_date', 'posted_date'],
            'category': ['category', 'Category', 'CATEGORY', 'type'],
            'merchant': ['merchant', 'Merchant', 'MERCHANT', 'payee', 'vendor']
        }
        
        # Rename columns to standard names
        for standard_name, variations in column_mapping.items():
            for variation in variations:
                if variation in df.columns:
                    df = df.rename(columns={variation: standard_name})
                    break
        
        # Process transactions
        transactions = []
        for index, row in df.iterrows():
            transaction = {
                'id': str(index + 1),
                'amount': abs(float(row.get('amount', 0))),
                'description': str(row.get('description', 'Unknown')),
                'category': str(row.get('category', 'other')).lower(),
                'type': 'expense' if float(row.get('amount', 0)) < 0 else 'income',
                'date': str(row.get('date', datetime.now().strftime('%Y-%m-%d'))),
                'merchant': str(row.get('merchant', ''))
            }
            transactions.append(transaction)
        
        app_data['transactions'] = transactions
        
        # Generate insights after processing transactions
        generate_spending_insights()
        detect_subscriptions()
        
        return True, f"Successfully processed {len(transactions)} transactions"
    
    except Exception as e:
        return False, f"Error processing data: {str(e)}"

def generate_spending_insights():
    """Generate spending insights from transaction data"""
    transactions = app_data['transactions']
    expenses = [t for t in transactions if t['type'] == 'expense']
    
    if not expenses:
        return
    
    # Calculate category totals
    category_totals = {}
    total_expenses = 0
    
    for transaction in expenses:
        category = transaction['category']
        amount = transaction['amount']
        category_totals[category] = category_totals.get(category, 0) + amount
        total_expenses += amount
    
    # Generate insights
    insights = []
    for category, total in category_totals.items():
        percentage = (total / total_expenses * 100) if total_expenses > 0 else 0
        
        # Simple trend analysis (you can make this more sophisticated)
        trend = 'increasing' if percentage > 20 else 'decreasing'
        
        insights.append({
            'category': category.title(),
            'total_spent': round(total, 2),
            'percentage_of_total': round(percentage, 1),
            'trend': trend
        })
    
    # Sort by spending amount
    insights.sort(key=lambda x: x['total_spent'], reverse=True)
    app_data['insights']['spending'] = insights

def detect_subscriptions():
    """Detect recurring subscriptions from transaction data"""
    transactions = app_data['transactions']
    
    # Group by merchant and look for recurring patterns
    merchant_transactions = {}
    for transaction in transactions:
        merchant = transaction.get('merchant', '')
        if merchant and merchant != 'nan':
            if merchant not in merchant_transactions:
                merchant_transactions[merchant] = []
            merchant_transactions[merchant].append(transaction)
    
    subscriptions = []
    subscription_keywords = ['netflix', 'spotify', 'adobe', 'gym', 'fitness', 'subscription']
    
    for merchant, merchant_txns in merchant_transactions.items():
        # Check if merchant name suggests subscription
        is_subscription = any(keyword in merchant.lower() for keyword in subscription_keywords)
        
        # Check for recurring amounts
        if len(merchant_txns) >= 2 or is_subscription:
            amounts = [t['amount'] for t in merchant_txns]
            avg_amount = np.mean(amounts)
            
            # Calculate confidence score based on consistency and keywords
            amount_consistency = 1.0 - (np.std(amounts) / avg_amount if avg_amount > 0 else 1.0)
            keyword_boost = 0.3 if is_subscription else 0.0
            confidence = min(0.95, max(0.5, amount_consistency + keyword_boost))
            
            subscription = {
                'merchant': merchant,
                'amount': round(avg_amount, 2),
                'frequency': 'monthly',
                'last_transaction': max(merchant_txns, key=lambda x: x['date'])['date'],
                'confidence_score': round(confidence, 2),
                'category': 'subscription'
            }
            subscriptions.append(subscription)
    
    app_data['insights']['subscriptions'] = subscriptions

# API Routes

@app.route("/api/hello", methods=["GET"])
def hello():
    return jsonify({
        "message": "Hello from Flask!",
        "status": "connected",
        "transactions_count": len(app_data['transactions'])
    })

@app.route("/api/upload-transactions", methods=["POST"])
def upload_transactions():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        try:
            # Read the file based on extension
            if filename.lower().endswith('.csv'):
                df = pd.read_csv(filepath)
            elif filename.lower().endswith(('.xlsx', '.xls')):
                df = pd.read_excel(filepath)
            else:
                return jsonify({'error': 'Unsupported file format'}), 400
            
            success, message = process_transaction_data(df)
            
            if success:
                return jsonify({
                    'message': message,
                    'transactions_processed': len(app_data['transactions'])
                })
            else:
                return jsonify({'error': message}), 500
                
        except Exception as e:
            return jsonify({'error': f'Error reading file: {str(e)}'}), 500
        finally:
            # Clean up uploaded file
            if os.path.exists(filepath):
                os.remove(filepath)
    
    return jsonify({'error': 'Invalid file type'}), 400

@app.route("/api/transactions", methods=["GET"])
def get_transactions():
    return jsonify(app_data['transactions'])

@app.route("/api/insights/spending", methods=["GET"])
def get_spending_insights():
    return jsonify(app_data['insights']['spending'])

@app.route("/api/subscriptions", methods=["GET"])
def get_subscriptions():
    return jsonify(app_data['insights']['subscriptions'])

@app.route("/api/goals", methods=["GET"])
def get_goals():
    return jsonify(app_data['goals'])

@app.route("/api/goals/<goal_id>/forecast", methods=["GET"])
def get_goal_forecast(goal_id):
    goal = next((g for g in app_data['goals'] if g['id'] == goal_id), None)
    
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    # Calculate forecast
    progress = (goal['current_amount'] / goal['target_amount']) * 100
    remaining = goal['target_amount'] - goal['current_amount']
    
    # Calculate months remaining
    target_date = datetime.strptime(goal['target_date'], '%Y-%m-%d')
    months_remaining = max(1, (target_date - datetime.now()).days // 30)
    
    monthly_required = remaining / months_remaining
    likelihood = 'likely' if progress > 30 else 'unlikely'
    
    # Generate recommendations based on spending insights
    recommendations = [
        f"Save ${monthly_required:.2f} per month to reach your goal"
    ]
    
    # Add specific recommendations based on spending patterns
    spending_insights = app_data['insights']['spending']
    if spending_insights:
        top_category = spending_insights[0] if spending_insights else None
        if top_category and top_category['total_spent'] > 100:
            recommendations.append(f"Consider reducing {top_category['category'].lower()} spending by 20%")
    
    subscriptions = app_data['insights']['subscriptions']
    if subscriptions:
        recommendations.append("Review subscription services for potential savings")
    
    forecast = {
        'goal_id': goal_id,
        'current_progress': round(progress, 1),
        'monthly_required': round(monthly_required, 2),
        'likelihood': likelihood,
        'months_remaining': months_remaining,
        'recommendations': recommendations
    }
    
    return jsonify(forecast)

@app.route("/api/goals", methods=["POST"])
def create_goal():
    data = request.get_json()
    
    if not data or not all(key in data for key in ['title', 'target_amount', 'target_date']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    new_goal = {
        'id': str(len(app_data['goals']) + 1),
        'title': data['title'],
        'target_amount': float(data['target_amount']),
        'current_amount': float(data.get('current_amount', 0)),
        'target_date': data['target_date'],
        'goal_type': data.get('goal_type', 'savings')
    }
    
    app_data['goals'].append(new_goal)
    return jsonify(new_goal), 201

@app.route("/api/analytics/summary", methods=["GET"])
def get_analytics_summary():
    """Get a summary of financial analytics"""
    transactions = app_data['transactions']
    
    if not transactions:
        return jsonify({
            'total_income': 0,
            'total_expenses': 0,
            'net_income': 0,
            'transaction_count': 0,
            'top_expense_category': None
        })
    
    income_transactions = [t for t in transactions if t['type'] == 'income']
    expense_transactions = [t for t in transactions if t['type'] == 'expense']
    
    total_income = sum(t['amount'] for t in income_transactions)
    total_expenses = sum(t['amount'] for t in expense_transactions)
    net_income = total_income - total_expenses
    
    # Find top expense category
    spending_insights = app_data['insights']['spending']
    top_category = spending_insights[0]['category'] if spending_insights else None
    
    summary = {
        'total_income': round(total_income, 2),
        'total_expenses': round(total_expenses, 2),
        'net_income': round(net_income, 2),
        'transaction_count': len(transactions),
        'top_expense_category': top_category,
        'goals_count': len(app_data['goals']),
        'subscriptions_count': len(app_data['insights']['subscriptions'])
    }
    
    return jsonify(summary)

# Serve React static files in production
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(app.static_folder + "/" + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
