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
    print("\n📥 1. ข้อมูลดิบที่รับมาจากเว็บ:", data)

    try:
        input_data = pd.DataFrame([[
            float(data['assists']), 
            float(data['damage_received']), 
            float(data['headshots']), 
            float(data['traded']), 
            float(data['kills']), 
            float(data['matches']), 
            float(data['deaths']), 
            float(data['damage'])
        ]], columns=['assists', 'damage_received', 'headshots', 'traded', 'kills', 'matches', 'deaths', 'damage'])
        
        print("📊 2. ข้อมูลที่เตรียมเข้าโมเดล:\n", input_data)
        
        prediction = model.predict(input_data)[0]
        print("🎯 3. โมเดลทายว่า:", prediction)
        
        return jsonify({"rank": str(prediction)})
    except Exception as e:
        print("❌ เกิด Error:", str(e))
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(port=5000, debug=True)