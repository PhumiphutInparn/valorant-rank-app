import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, classification_report
import pickle
import warnings
warnings.filterwarnings('ignore') # ซ่อนข้อความแจ้งเตือน

print("⏳ กำลังเริ่มกระบวนการ Train โมเดล...")

# 1. โหลดไฟล์ข้อมูลที่คลีนแล้ว
# (ตรวจสอบให้แน่ใจว่าไฟล์ valorant_clean.csv อยู่ในโฟลเดอร์เดียวกัน)
df = pd.read_csv('valorant_clean.csv')

# 2. แยก Features (ตัวแปรสถิติ / X) และ Class (แรงค์เป้าหมาย / y)
X = df.drop(columns=['tier']) 
y = df['tier']

# 3. แบ่งข้อมูลเป็น 2 ส่วน: สำหรับสอน (Train) 80% และ สำหรับทดสอบ (Test) 20%
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. สร้างและฝึกสอนโมเดล Decision Tree
# สามารถปรับแต่งค่าพารามิเตอร์ เช่น max_depth เพื่อลองเพิ่มความแม่นยำได้
model = DecisionTreeClassifier(random_state=42)
model.fit(X_train, y_train)

# 5. ทดสอบความแม่นยำของโมเดลกับข้อมูลชุด Test
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print(f"\n✅ เทรนโมเดลสำเร็จ!")
print(f"🎯 ความแม่นยำ (Accuracy) บนชุดทดสอบ: {accuracy * 100:.2f}%")

# (ออปชันเสริม) แสดงรายละเอียดว่าทายแรงค์ไหนแม่น/ไม่แม่นบ้าง
# print("\n--- รายละเอียดการทำนาย (Classification Report) ---")
# print(classification_report(y_test, y_pred))

# 6. บันทึกโมเดลเป็นไฟล์ .pkl (Pickle) เพื่อนำไปใช้งานต่อใน Web/GUI
model_filename = 'valorant_dt_model.pkl'
with open(model_filename, 'wb') as file:
    pickle.dump(model, file)

print(f"\n💾 บันทึกโมเดลเสร็จสิ้น! นำไฟล์ '{model_filename}' ไปเสียบเข้ากับระบบหลังบ้านของเว็บได้เลยครับ")