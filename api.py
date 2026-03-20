from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import pickle

app = Flask(__name__)
CORS(app)

# โหลดโมเดล
try:
    with open('valorant_dt_model.pkl', 'rb') as f:
        model = pickle.load(f)
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Error: Could not load model. {e}")

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    try:
        input_data = pd.DataFrame([[
            float(data['assists']), float(data['damage_received']), float(data['headshots']), 
            float(data['traded']), float(data['kills']), float(data['matches']), 
            float(data['deaths']), float(data['damage'])
        ]], columns=['assists', 'damage_received', 'headshots', 'traded', 'kills', 'matches', 'deaths', 'damage'])
        
        prediction = model.predict(input_data)[0]
        return jsonify({"rank": str(prediction)})
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# 🆕 เพิ่ม API สำหรับดึงข้อมูล Dataset ทั้งหมดจาก CSV
@app.route('/dataset', methods=['GET'])
def get_dataset():
    try:
        df = pd.read_csv('valorant_clean.csv')
        # แปลงข้อมูลในตารางเป็น JSON แล้วส่งให้หน้าเว็บ
        return jsonify(df.to_dict(orient='records'))
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)