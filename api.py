from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}) 

# ตรวจสอบการโหลดโมเดล
try:
    model = joblib.load('valorant_dt_model.pkl')
except Exception as e:
    print(f"Model Load Error: {e}")

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    try:
        # ลำดับ Features ต้องตรงกับที่ใช้ Train
        input_df = pd.DataFrame([[
            data['assists'], data['damage_received'], data['headshots'], 
            data['traded'], data['kills'], data['matches'], 
            data['deaths'], data['damage']
        ]], columns=['assists', 'damage_received', 'headshots', 'traded', 'kills', 'matches', 'deaths', 'damage'])
        
        prediction = model.predict(input_df)[0]
        return jsonify({"rank": str(prediction)})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(port=5000, debug=True)