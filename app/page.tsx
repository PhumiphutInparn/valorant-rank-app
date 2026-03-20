"use client";
import { useState, ChangeEvent } from 'react';

export default function Home() {
  const [formData, setFormData] = useState({
    kills: 500,
    deaths: 300,
    assists: 200,
    headshots: 200,
    damage: 50000,
    damage_received: 75000,
    traded: 200,
    matches: 80
  });

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // ตัวแปรสำหรับแสดงหัวข้อแบบ English (ภาษาไทย)
  const displayLabels: Record<string, string> = {
    kills: "Kills (จำนวนการฆ่า)",
    deaths: "Deaths (จำนวนการตาย)",
    assists: "Assists (ช่วยฆ่า)",
    headshots: "Headshots (ยิงเข้าหัว)",
    damage: "Damage (ดาเมจที่ทำได้)",
    damage_received: "Damage Received (ดาเมจที่ได้รับ)",
    traded: "Traded (เทรดคืน)",
    matches: "Matches (จำนวนเกมที่เล่น)"
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: Number(value)
    }));
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
      setResult("ERROR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#0f1923]">
      {/* Background VALORANT Decor */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center select-none z-0">
        <h1 className="text-[18vw] font-black italic tracking-tighter leading-none opacity-[0.03] text-white uppercase">
          VALORANT
        </h1>
      </div>

      <div className="relative z-10 w-full max-w-5xl bg-[#1f2326]/90 backdrop-blur-xl border border-white/10 p-8 shadow-2xl">
        <header className="mb-10 relative">
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-[2px] bg-[#ff4655]"></div>
          <p className="text-[#ff4655] text-xs font-bold tracking-[0.4em] uppercase mb-1">Rank Analysis Protocol</p>
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">
            Rank <span className="text-[#ff4655]">Predictor</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Inputs Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 order-2 lg:order-1">
            {Object.keys(formData).map((key) => (
              <div key={key} className="relative border-b border-white/10 pb-2 group">
                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1 group-focus-within:text-[#ff4655] transition-colors">
                  {displayLabels[key] || key}
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

          {/* Visualization Section */}
          <div className="flex flex-col items-center justify-center order-1 lg:order-2 space-y-8">
            <div className="relative w-64 h-64 flex items-center justify-center">
              {/* Spinning Ring */}
              <div className={`absolute inset-0 border-2 border-dashed border-[#ff4655]/30 rounded-full ${loading ? 'animate-spin' : ''}`} style={{animationDuration: '8s'}}></div>
              
              <div className="w-52 h-52 rounded-full bg-gradient-to-t from-[#ff4655]/20 to-transparent flex flex-col items-center justify-center border border-[#ff4655]/50 shadow-[0_0_40px_rgba(255,70,85,0.1)]">
                <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Estimated</p>
                <span className="text-4xl font-black italic tracking-widest uppercase text-white">
                  {result ? result : (loading ? "..." : "READY")}
                </span>
              </div>
            </div>

            <button 
              onClick={handlePredict} 
              disabled={loading}
              className="group relative px-8 py-4 bg-[#ff4655] text-white font-black uppercase tracking-[0.2em] w-full max-w-[280px] transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
              style={{ clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)' }}
            >
              {loading ? "Analyzing..." : "Predict Now"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}