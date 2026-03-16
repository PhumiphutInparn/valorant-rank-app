from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}) # อนุญาตให้ Next.js ยิง API เข้ามาได้

# โหลดโมเดล
model = joblib.load('valorant_dt_model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    # 1. รับข้อมูลสถิติที่ส่งมาจาก Next.js
    data = request.json
    
    # 2. จัดเรียงข้อมูลให้ตรงกับตอนเทรน
    input_df = pd.DataFrame([[
        data['assists'], data['damage_received'], data['headshots'], 
        data['traded'], data['kills'], data['matches'], 
        data['deaths'], data['damage']
    ]], columns=['assists', 'damage_received', 'headshots', 'traded', 'kills', 'matches', 'deaths', 'damage'])
    
    # 3. ทำนายผล
    prediction = model.predict(input_df)[0]
    
    # 4. ส่งผลลัพธ์กลับไปให้ Next.js
    return jsonify({"rank": prediction})

if __name__ == '__main__':
    app.run(port=5000, debug=True)