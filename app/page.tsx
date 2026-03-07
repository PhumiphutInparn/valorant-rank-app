"use client";
import { useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    kills: 5000, deaths: 4500, assists: 1500, headshots: 1200,
    damage: 800000, damage_received: 750000, traded: 800, matches: 300
  });
  const [result, setResult] = useState("");

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: Number(e.target.value) });
  };

  const handlePredict = async () => {
    // ยิงข้อมูลไปให้ Python API ทำนาย
    const res = await fetch('http://localhost:5000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    setResult(data.rank); // รับผลลัพธ์มาแสดง
  };

  return (
    <div style={{ padding: '50px', maxWidth: '600px', margin: 'auto', fontFamily: 'sans-serif' }}>
      <h1>🎮 Valorant Rank Predictor (Next.js)</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        {Object.keys(formData).map((key) => (
          <div key={key}>
            <label style={{ display: 'block', marginBottom: '5px' }}>{key.toUpperCase()}:</label>
            <input 
              type="number" name={key} 
              value={(formData as any)[key]} 
              onChange={handleChange} 
              style={{ width: '100%', padding: '8px' }} 
            />
          </div>
        ))}
      </div>
      <button 
        onClick={handlePredict} 
        style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#ff4655', color: 'white', border: 'none', cursor: 'pointer', width: '100%', fontSize: '18px' }}>
        🔮 ทํานายแรงค์เลย!
      </button>

      {result && (
        <h2 style={{ marginTop: '20px', textAlign: 'center', color: '#ff4655' }}>
          🏆 แรงค์ของคุณคือ: {result.toUpperCase()}
        </h2>
      )}
    </div>
  );
}