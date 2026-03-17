"use client";
import { useState } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    kills: 5000, deaths: 4500, assists: 1500, headshots: 1200,
    damage: 800000, damage_received: 750000, traded: 800, matches: 300
  });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: Number(e.target.value) });
  };

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setResult(data.rank);
    } catch (error) {
      console.error("Error predicting rank:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* 1. ปรับพื้นหลัง VALORANT ให้อยู่กึ่งกลางหน้าจอพอดี */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center select-none z-0">
        <h1 className="text-[18vw] font-black italic tracking-tighter leading-none bg-text-outline uppercase">
          VALORANT
        </h1>
      </div>

      <div className="relative z-10 w-full max-w-5xl v-card">
        <header className="mb-10 relative">
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-[2px] bg-[#ff4655]"></div>
          <p className="text-[#ff4655] text-xs font-bold tracking-[0.4em] uppercase mb-1">Rank Analysis Protocol</p>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
            Rank <span className="text-[#ff4655]">Predictor</span>
          </h1>
        </header>

        {/* 2. ปรับ Grid ให้ items-center เพื่อให้ฝั่งขวาอยู่กึ่งกลางแนวตั้งด้วย */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* ส่วนของ Input Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 order-2 lg:order-1">
            {Object.keys(formData).map((key) => (
              <div key={key} className="relative border-b border-white/10 pb-2 group">
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1 group-focus-within:text-[#ff4655] transition-colors">
                  {key.replace('_', ' ')}
                </label>
                <input 
                  type="number" 
                  name={key} 
                  value={(formData as any)[key]} 
                  onChange={handleChange} 
                  className="w-full bg-transparent text-xl font-bold focus:outline-none transition-all text-white"
                />
              </div>
            ))}
          </div>

          {/* 3. ส่วนวงกลมและปุ่ม: ใช้ flex-col และ items-center เพื่อให้ทุกอย่างอยู่ตรงกลางเป๊ะ */}
          <div className="flex flex-col items-center justify-center order-1 lg:order-2 space-y-8">
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* วงกลมหมุน (Animation) */}
              <div className={`absolute inset-0 border-2 border-dashed border-[#ff4655]/30 rounded-full ${loading ? 'animate-spin-slow' : ''}`}></div>
              
              <div className="w-52 h-52 rounded-full bg-gradient-to-t from-[#ff4655]/20 to-transparent flex flex-col items-center justify-center border border-[#ff4655]/50 shadow-[0_0_40px_rgba(255,70,85,0.15)]">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Estimated</p>
                <span className="text-4xl font-black italic tracking-widest uppercase text-white">
                  {result ? result : (loading ? "..." : "READY")}
                </span>
              </div>
            </div>

            {/* ปุ่ม Predict Now ที่จัดวางไว้กึ่งกลางใต้รูปวงกลม */}
            <button 
              onClick={handlePredict} 
              disabled={loading}
              className="btn-valorant w-full max-w-[280px]"
            >
              {loading ? "Analyzing..." : "Predict Now"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}