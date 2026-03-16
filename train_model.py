import pandas as pd
from sklearn.tree import DecisionTreeClassifier
import joblib

try:
    # 1. อ่านไฟล์ข้อมูลที่คลีนแล้ว 
    # (ต้องแน่ใจว่ามีไฟล์ valorant_clean.csv อยู่ในโฟลเดอร์นี้ด้วยนะครับ)
    print("กำลังโหลดข้อมูล...")
    df = pd.read_csv('valorant_clean.csv')

    # แยกข้อมูลสถิติ (X) และแรงค์เป้าหมาย (y)
    X = df.drop(columns=['tier'])
    y = df['tier']

    # 2. สร้างและเทรนโมเดล Decision Tree
    print("กำลังเทรนโมเดล Decision Tree...")
    model = DecisionTreeClassifier(random_state=42)
    model.fit(X, y)

    # 3. บันทึกโมเดลแพ็กเป็นไฟล์ .pkl
    joblib.dump(model, 'valorant_dt_model.pkl')
    print("✅ สร้างไฟล์ 'valorant_dt_model.pkl' สำเร็จแล้ว! พร้อมเอาไปใช้กับ API")

except FileNotFoundError:
    print("❌ Error: หาไฟล์ 'valorant_clean.csv' ไม่เจอครับ ต้องเอาไฟล์ที่คลีนแล้วมาวางไว้ในโฟลเดอร์นี้ก่อนนะ")