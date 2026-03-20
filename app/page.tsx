"use client";
import { useState, ChangeEvent } from 'react';

// ฐานข้อมูลตัวเลขสถิติจริงจาก CSV เพื่อใช้เป็น Preset และแสดงในตาราง
const rankPresets: Record<string, any> = {
  iron: { kills: 9702, deaths: 9271, assists: 2828, headshots: 6410, damage: 1832300, damage_received: 1692848, traded: 1366, matches: 667 },
  bronze: { kills: 7276, deaths: 8329, assists: 2785, headshots: 3287, damage: 1565588, damage_received: 1540524, traded: 1308, matches: 605 },
  silver: { kills: 10738, deaths: 11513, assists: 3905, headshots: 5601, damage: 1983127, damage_received: 2206452, traded: 1962, matches: 820 },
  gold: { kills: 12136, deaths: 12390, assists: 4201, headshots: 6413, damage: 2284886, damage_received: 2416563, traded: 2252, matches: 780 },
  platinum: { kills: 6881, deaths: 8106, assists: 3110, headshots: 4158, damage: 1308751, damage_received: 1541642, traded: 1423, matches: 510 },
  diamond: { kills: 10808, deaths: 12072, assists: 3512, headshots: 7308, damage: 2044703, damage_received: 2374888, traded: 2387, matches: 719 },
  ascendant: { kills: 12810, deaths: 11934, assists: 4025, headshots: 7441, damage: 2414422, damage_received: 2317130, traded: 2216, matches: 708 },
  immortal: { kills: 12439, deaths: 11521, assists: 3145, headshots: 7914, damage: 2351128, damage_received: 2261937, traded: 2742, matches: 683 }
};

export default function Home() {
  const [formData, setFormData] = useState({
    kills: 500, deaths: 300, assists: 200, headshots: 200, damage: 50000, damage_received: 75000, traded: 200, matches: 80
  });

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "error" });
  const [selectedPreset, setSelectedPreset] = useState("custom");

  const displayLabels: Record<string, string> = {
    kills: "Kills (ฆ่า)", deaths: "Deaths (ตาย)", assists: "Assists (ช่วย)", headshots: "Headshots (ยิงหัว)",
    damage: "Damage (ดาเมจ)", damage_received: "Dmg Received (รับดาเมจ)", traded: "Traded (เทรด)", matches: "Matches (เกมที่เล่น)"
  };

  const showAlert = (message: string, type: "error" | "warning" | "success" = "error") => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert(prev => ({ ...prev, show: false })), 4000);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSelectedPreset("custom"); 
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handlePresetChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const rank = e.target.value;
    setSelectedPreset(rank);
    if (rank !== "custom" && rankPresets[rank]) {
      setFormData(rankPresets[rank]);
    }
  };

  const handlePredict = async () => {
    if (formData.kills < 0 || formData.damage < 0 || formData.matches <= 0) {
      showAlert("ข้อมูลไม่ถูกต้อง! ตัวเลขสถิติไม่สามารถติดลบหรือเป็น 0 ได้ครับ", "error"); return;
    }
    if (formData.damage < formData.kills * 50) {
      showAlert("ข้อมูลผิดปกติ! สัดส่วน Kills กับ Damage ไม่สอดคล้องกัน โมเดลอาจทำนายผิดพลาด", "warning"); return;
    }
    if (formData.headshots > formData.kills) {
      showAlert("ข้อมูลผิดปกติ! จำนวนยิงหัว มากกว่าจำนวนการฆ่าทั้งหมดไม่ได้ครับ", "warning"); return;
    }

    setLoading(true);
    setResult("");
    try {
      const res = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.error) {
        showAlert(`API Error: ${data.error}`, "error"); setResult("ERROR");
      } else {
        setResult(data.rank); showAlert("วิเคราะห์แรงค์สำเร็จ!", "success");
      }
    } catch (error) {
      showAlert("ไม่สามารถเชื่อมต่อกับ Server ได้ กรุณาเปิด API Backend ด้วยครับ", "error"); setResult("ERROR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen py-12 px-4 relative bg-[#0f1923] text-white overflow-x-hidden">
      {/* Alert Pop-up */}
      <div className={`fixed top-6 right-6 z-50 max-w-sm w-full transition-all duration-500 transform ${alert.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
        <div className={`p-4 border-l-4 backdrop-blur-md shadow-2xl ${
          alert.type === 'error' ? 'bg-red-500/20 border-[#ff4655]' : alert.type === 'warning' ? 'bg-yellow-500/20 border-yellow-500' : 'bg-green-500/20 border-green-500'
        }`}>
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className={`text-sm font-black uppercase tracking-widest ${alert.type === 'error' ? 'text-[#ff4655]' : alert.type === 'warning' ? 'text-yellow-400' : 'text-green-400'}`}>
                {alert.type === 'error' ? 'System Error' : alert.type === 'warning' ? 'Validation Warning' : 'Success'}
              </h3>
              <p className="mt-1 text-xs text-gray-300">{alert.message}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed inset-0 pointer-events-none flex items-center justify-center select-none z-0">
        <h1 className="text-[15vw] font-black italic tracking-tighter leading-none opacity-[0.03] uppercase">VALORANT</h1>
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto space-y-8">
        {/* Main Calculator Box */}
        <div className="bg-[#1f2326]/90 backdrop-blur-xl border border-white/10 p-8 shadow-2xl">
          <header className="mb-8 relative">
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-[2px] bg-[#ff4655]"></div>
            <p className="text-[#ff4655] text-xs font-bold tracking-[0.4em] uppercase mb-1">Rank Analysis Protocol</p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">
                Rank <span className="text-[#ff4655]">Predictor</span>
              </h1>
              
              <div className="w-full md:w-64">
                <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-2">Load Data Preset</label>
                <select 
                  value={selectedPreset} 
                  onChange={handlePresetChange}
                  className="w-full bg-[#0f1923] border border-white/20 text-white text-sm p-3 outline-none focus:border-[#ff4655] transition-colors cursor-pointer appearance-none"
                  style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
                >
                  <option value="custom">-- กรอกข้อมูลเอง (Custom) --</option>
                  {Object.keys(rankPresets).map(rank => (
                    <option key={rank} value={rank}>ข้อมูลผู้เล่น: {rank.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center border-t border-white/5 pt-8">
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
                    className="w-full bg-transparent text-xl font-bold focus:outline-none transition-all"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-center order-1 lg:order-2 space-y-8">
              <div className="relative w-64 h-64 flex items-center justify-center">
                <div className={`absolute inset-0 border-2 border-dashed border-[#ff4655]/30 rounded-full ${loading ? 'animate-spin' : ''}`} style={{animationDuration: '8s'}}></div>
                <div className="w-52 h-52 rounded-full bg-gradient-to-t from-[#ff4655]/20 to-transparent flex flex-col items-center justify-center border border-[#ff4655]/50 shadow-[0_0_40px_rgba(255,70,85,0.1)]">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Estimated</p>
                  <span className="text-4xl font-black italic tracking-widest uppercase">
                    {result ? result : (loading ? "..." : "READY")}
                  </span>
                </div>
              </div>
              <button 
                onClick={handlePredict} 
                disabled={loading}
                className="group relative px-8 py-4 bg-[#ff4655] font-black uppercase tracking-[0.2em] w-full max-w-[280px] transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
                style={{ clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)' }}
              >
                {loading ? "Analyzing..." : "Predict Now"}
              </button>
            </div>
          </div>
        </div>

        {/* 🆕 Data Reference Table Section */}
        <div className="bg-[#1f2326]/80 backdrop-blur-xl border border-white/10 p-6 lg:p-8 shadow-xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-2 h-6 bg-[#ff4655]"></div>
            <div>
              <h2 className="text-xl font-black italic uppercase tracking-wider">Dataset Reference <span className="text-[#ff4655]">Table</span></h2>
              <p className="text-xs text-gray-400 tracking-widest uppercase mt-1">สถิติอ้างอิงของแต่ละแรงค์ (ดึงจากไฟล์ CSV จริง)</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-[10px] uppercase tracking-widest text-gray-400 bg-black/40 border-b border-[#ff4655]/50">
                <tr>
                  <th className="p-4 font-bold text-[#ff4655]">Rank</th>
                  <th className="p-4">Matches</th>
                  <th className="p-4">Kills</th>
                  <th className="p-4">Deaths</th>
                  <th className="p-4">Assists</th>
                  <th className="p-4">Headshots</th>
                  <th className="p-4">Damage</th>
                  <th className="p-4">Dmg Received</th>
                  <th className="p-4">Traded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {Object.entries(rankPresets).map(([rank, data]) => (
                  <tr key={rank} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 font-bold uppercase tracking-wider text-gray-300 group-hover:text-white">
                      {rank}
                    </td>
                    <td className="p-4 text-gray-400">{data.matches.toLocaleString()}</td>
                    <td className="p-4 text-gray-400">{data.kills.toLocaleString()}</td>
                    <td className="p-4 text-gray-400">{data.deaths.toLocaleString()}</td>
                    <td className="p-4 text-gray-400">{data.assists.toLocaleString()}</td>
                    <td className="p-4 text-gray-400">{data.headshots.toLocaleString()}</td>
                    <td className="p-4 text-gray-400">{data.damage.toLocaleString()}</td>
                    <td className="p-4 text-gray-400">{data.damage_received.toLocaleString()}</td>
                    <td className="p-4 text-gray-400">{data.traded.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-[10px] text-gray-500 text-right uppercase tracking-widest">
            * สถิติแบบ Lifetime สะสมตลอดการใช้งานไอดี
          </div>
        </div>
        
      </div>
    </main>
  );
}