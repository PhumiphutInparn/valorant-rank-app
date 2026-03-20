"use client";
import { useState, ChangeEvent, useEffect } from 'react';

const rankPresets: Record<string, any> = {
  iron: { matches: 667, kills: 9702, deaths: 9271, assists: 2828, headshots: 6410, damage: 1832300, damage_received: 1692848, traded: 1366 },
  bronze: { matches: 605, kills: 7276, deaths: 8329, assists: 2785, headshots: 3287, damage: 1565588, damage_received: 1540524, traded: 1308 },
  silver: { matches: 820, kills: 10738, deaths: 11513, assists: 3905, headshots: 5601, damage: 1983127, damage_received: 2206452, traded: 1962 },
  gold: { matches: 780, kills: 12136, deaths: 12390, assists: 4201, headshots: 6413, damage: 2284886, damage_received: 2416563, traded: 2252 },
  platinum: { matches: 510, kills: 6881, deaths: 8106, assists: 3110, headshots: 4158, damage: 1308751, damage_received: 1541642, traded: 1423 },
  diamond: { matches: 719, kills: 10808, deaths: 12072, assists: 3512, headshots: 7308, damage: 2044703, damage_received: 2374888, traded: 2387 },
  ascendant: { matches: 708, kills: 12810, deaths: 11934, assists: 4025, headshots: 7441, damage: 2414422, damage_received: 2317130, traded: 2216 },
  immortal: { matches: 683, kills: 12439, deaths: 11521, assists: 3145, headshots: 7914, damage: 2351128, damage_received: 2261937, traded: 2742 }
};

export default function Home() {
  const [formData, setFormData] = useState({
    matches: 50, kills: 750, deaths: 650, assists: 225, headshots: 180, damage: 105000, damage_received: 84000, traded: 150
  });

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "error" });
  const [selectedPreset, setSelectedPreset] = useState("custom");
  const [isTeacherMode, setIsTeacherMode] = useState(false);

  // 🆕 State สำหรับเก็บข้อมูล Dataset ทั้งหมด
  const [fullDataset, setFullDataset] = useState<any[]>([]);
  const [showDataset, setShowDataset] = useState(false);
  const [loadingDataset, setLoadingDataset] = useState(false);

  const displayLabels: Record<string, string> = {
    matches: "Matches (เกมที่เล่น)", kills: "Kills (ฆ่า)", deaths: "Deaths (ตาย)", assists: "Assists (ช่วย)", 
    headshots: "Headshots (ยิงหัว)", damage: "Damage (ดาเมจ)", damage_received: "Dmg Received (รับดาเมจ)", traded: "Traded (เทรด)"
  };

  const formulas: Record<string, string> = {
    matches: "💡 แนะนำ: 30 - 100 เกม", kills: "💡 สูตร: Matches × 15", deaths: "💡 สูตร: Kills × 0.9",
    assists: "💡 สูตร: Kills × 0.3", headshots: "💡 สูตร: Kills × 0.25", damage: "💡 สูตร: Kills × 140",
    damage_received: "💡 สูตร: Damage × 0.8", traded: "💡 สูตร: Kills × 0.2"
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
      showAlert("ไม่สามารถเชื่อมต่อกับ Server ได้", "error"); setResult("ERROR");
    } finally {
      setLoading(false);
    }
  };

  // 🆕 ฟังก์ชันดึงข้อมูล Dataset ทั้งหมดจาก API
  const fetchDataset = async () => {
    if (fullDataset.length > 0) {
      setShowDataset(!showDataset);
      return;
    }
    setLoadingDataset(true);
    try {
      const res = await fetch('http://localhost:5000/dataset');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setFullDataset(data);
      setShowDataset(true);
      showAlert(`โหลดข้อมูลสำเร็จจำนวน ${data.length} รายการ`, "success");
    } catch (error) {
      showAlert("ไม่สามารถโหลด Dataset ได้ กรุณาตรวจสอบ API", "error");
    } finally {
      setLoadingDataset(false);
    }
  };

  const themeBg = isTeacherMode ? "bg-[#111827]" : "bg-[#0f1923]";
  const boxBg = isTeacherMode ? "bg-[#1f2937] border-2 border-gray-600 rounded-2xl" : "bg-[#1f2326]/90 border border-white/10";
  const labelText = isTeacherMode ? "text-[13px] text-yellow-300 font-medium tracking-wide" : "text-[10px] text-gray-500 uppercase tracking-widest";
  const inputFont = isTeacherMode ? "text-3xl font-bold text-white bg-gray-800/50 p-2 rounded-lg mt-1" : "text-xl font-bold text-white";
  const formulaText = isTeacherMode ? "text-[11px] text-yellow-200/80 mt-1" : "text-[9px] text-yellow-500/80 tracking-widest";
  const titleText = isTeacherMode ? "text-4xl md:text-5xl text-white" : "text-4xl md:text-5xl text-[#ff4655]";
  const highlightColor = isTeacherMode ? "text-yellow-400" : "text-[#ff4655]";
  const buttonStyle = isTeacherMode ? "bg-yellow-500 text-gray-900 text-xl font-bold py-4 rounded-xl shadow-lg hover:bg-yellow-400" : "bg-[#ff4655] text-white py-4 font-black uppercase tracking-[0.2em]";
  const resultCircle = isTeacherMode ? "border-4 border-gray-600 bg-gray-800 shadow-[0_0_30px_rgba(250,204,21,0.1)]" : "border border-[#ff4655]/50 bg-gradient-to-t from-[#ff4655]/20 to-transparent shadow-[0_0_40px_rgba(255,70,85,0.1)]";

  return (
    <main className={`min-h-screen py-12 px-4 relative ${themeBg} text-white overflow-x-hidden transition-colors duration-500`}>
      <div className="fixed top-4 right-4 z-[60]">
        <button onClick={() => setIsTeacherMode(!isTeacherMode)} className={`px-4 py-2 text-sm rounded-full font-bold shadow-lg transition-all ${isTeacherMode ? 'bg-gray-700 text-white border border-gray-500 hover:bg-gray-600' : 'bg-[#1f2326] text-gray-300 border border-gray-600 hover:text-white hover:border-[#ff4655]'}`}>
          {isTeacherMode ? "👀 กลับโหมดเกมเมอร์" : "👁️ โหมดนำเสนอ (อ่านง่าย)"}
        </button>
      </div>

      <div className={`fixed top-20 right-6 z-50 max-w-sm w-full transition-all duration-500 transform ${alert.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
        <div className={`p-5 rounded-lg border-l-8 backdrop-blur-md shadow-2xl ${alert.type === 'error' ? 'bg-red-900/90 border-red-500' : alert.type === 'warning' ? 'bg-yellow-900/90 border-yellow-500' : 'bg-green-900/90 border-green-500'}`}>
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className={`text-sm font-bold uppercase tracking-wider ${alert.type === 'error' ? 'text-red-400' : alert.type === 'warning' ? 'text-yellow-400' : 'text-green-400'}`}>
                {alert.type === 'error' ? 'System Error' : alert.type === 'warning' ? 'Validation Warning' : 'Success'}
              </h3>
              <p className="mt-1 text-sm text-white">{alert.message}</p>
            </div>
          </div>
        </div>
      </div>

      {!isTeacherMode && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center select-none z-0">
          <h1 className="text-[15vw] font-black italic tracking-tighter leading-none opacity-[0.03] uppercase">VALORANT</h1>
        </div>
      )}

      <div className="relative z-10 w-full max-w-6xl mx-auto space-y-8 mt-4">
        {/* Main Calculator Box */}
        <div className={`backdrop-blur-xl p-8 shadow-2xl transition-all duration-300 ${boxBg}`}>
          <header className="mb-8 relative">
            {!isTeacherMode && <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-[2px] bg-[#ff4655]"></div>}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <p className={`mb-1 ${isTeacherMode ? 'text-sm text-yellow-400 font-medium tracking-wider' : 'text-[#ff4655] text-xs font-bold tracking-[0.4em] uppercase'}`}>Data Mining Mini-Project</p>
                <h1 className={`font-black italic uppercase tracking-tighter transition-all ${titleText}`}>Rank <span className={highlightColor}>Predictor</span></h1>
              </div>
              <div className="w-full md:w-80">
                <label className={`block mb-2 ${isTeacherMode ? 'text-sm text-gray-300 font-medium' : 'text-[10px] uppercase tracking-widest text-gray-400'}`}>เลือกชุดข้อมูลตัวอย่าง</label>
                <select value={selectedPreset} onChange={handlePresetChange} className={`w-full p-3 outline-none transition-colors cursor-pointer appearance-none ${isTeacherMode ? 'bg-gray-800 text-white text-base rounded-lg border border-gray-600 focus:border-yellow-400' : 'bg-[#0f1923] border border-white/20 text-white text-sm focus:border-[#ff4655]'}`}>
                  <option value="custom">-- พิมพ์ตัวเลขเอง (Custom) --</option>
                  {Object.keys(rankPresets).map(rank => (
                    <option key={rank} value={rank}>ข้อมูลอ้างอิงแรงค์: {rank.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>
          </header>

          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-8 ${isTeacherMode ? 'border-t border-gray-600' : 'border-t border-white/10'}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8 order-2 lg:order-1">
              {Object.keys(formData).map((key) => (
                <div key={key} className={`relative group ${isTeacherMode ? '' : 'border-b border-white/10 pb-2'}`}>
                  <label className={`block transition-colors ${labelText}`}>{displayLabels[key] || key}</label>
                  <input type="number" name={key} value={(formData as any)[key]} onChange={handleChange} className={`w-full bg-transparent focus:outline-none transition-all ${inputFont}`} />
                  {selectedPreset === "custom" && <div className={`${isTeacherMode ? 'mt-1' : 'absolute -bottom-6 left-0 w-full'}`}><p className={`${formulaText} ${isTeacherMode ? '' : 'animate-pulse'}`}>{formulas[key]}</p></div>}
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-center order-1 lg:order-2 space-y-8">
              <div className="relative w-64 h-64 flex items-center justify-center">
                {!isTeacherMode && <div className={`absolute inset-0 border-2 border-dashed border-[#ff4655]/30 rounded-full ${loading ? 'animate-spin' : ''}`} style={{animationDuration: '8s'}}></div>}
                <div className={`w-56 h-56 rounded-full flex flex-col items-center justify-center transition-all ${resultCircle}`}>
                  <p className={`mb-2 ${isTeacherMode ? 'text-xs text-gray-400 font-medium tracking-widest' : 'text-[10px] uppercase tracking-[0.2em] text-gray-400'}`}>ผลการประเมิน</p>
                  <span className={`font-black italic uppercase ${isTeacherMode ? 'text-4xl text-yellow-400' : 'text-4xl tracking-widest text-white'}`}>{result ? result : (loading ? "..." : "รอวิเคราะห์")}</span>
                </div>
              </div>
              <button onClick={handlePredict} disabled={loading} className={`w-full max-w-[280px] transition-all active:scale-95 disabled:opacity-50 ${buttonStyle}`} style={isTeacherMode ? {} : { clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0 100%)' }}>
                {loading ? "กำลังประมวลผล..." : "คลิกเพื่อทำนาย"}
              </button>
            </div>
          </div>
        </div>

        {/* 🆕 ปุ่มเปิด/ปิด โชว์ Dataset ทั้งหมด */}
        <div className="flex justify-center mt-8">
          <button 
            onClick={fetchDataset}
            className={`px-8 py-3 rounded-full font-bold transition-all border ${showDataset ? 'bg-gray-800 text-white border-gray-600' : 'bg-transparent text-gray-400 border-gray-600 hover:bg-white/5 hover:text-white hover:border-white'}`}
          >
            {loadingDataset ? "⏳ กำลังโหลดข้อมูล..." : showDataset ? "ปิดตาราง Dataset" : "📂 ดูข้อมูล Dataset ต้นฉบับทั้งหมด"}
          </button>
        </div>

        {/* 🆕 ตารางแสดง Dataset ฉบับเต็ม (มี Scrollbar เลื่อนดูได้) */}
        {showDataset && fullDataset.length > 0 && (
          <div className={`p-6 shadow-xl transition-all duration-300 animate-fade-in ${isTeacherMode ? 'bg-[#1f2937] border border-gray-600 rounded-2xl' : 'bg-[#1f2326]/80 backdrop-blur-xl border border-white/10'}`}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className={`font-black italic uppercase tracking-wider ${isTeacherMode ? 'text-xl text-yellow-400' : 'text-xl text-white'}`}>
                  Full Dataset <span className="text-gray-400 text-sm not-italic ml-2">({fullDataset.length} rows)</span>
                </h2>
              </div>
            </div>
            
            {/* กล่อง Scrollable แบบล็อกความสูง ไม่ให้หน้าเว็บยาวเกินไป */}
            <div className="overflow-auto max-h-[500px] border border-gray-700/50 rounded bg-black/20">
              <table className="w-full text-left whitespace-nowrap">
                <thead className={`sticky top-0 z-20 ${isTeacherMode ? 'text-xs text-yellow-300 bg-gray-900 border-b-2 border-yellow-500' : 'text-[10px] uppercase tracking-widest text-gray-400 bg-black/90 border-b border-[#ff4655]'}`}>
                  <tr>
                    <th className="p-3 font-bold">#</th>
                    <th className="p-3 font-bold">Tier (Rank)</th>
                    <th className="p-3">Matches</th>
                    <th className="p-3">Kills</th>
                    <th className="p-3">Deaths</th>
                    <th className="p-3">Assists</th>
                    <th className="p-3">Headshots</th>
                    <th className="p-3">Damage</th>
                    <th className="p-3">Dmg Received</th>
                    <th className="p-3">Traded</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isTeacherMode ? 'divide-gray-700 text-sm' : 'divide-white/5 text-xs'}`}>
                  {fullDataset.map((row, idx) => (
                    <tr key={idx} className={`transition-colors ${isTeacherMode ? 'hover:bg-gray-700' : 'hover:bg-white/5'}`}>
                      <td className="p-3 text-gray-500">{idx + 1}</td>
                      <td className={`p-3 font-bold uppercase ${isTeacherMode ? 'text-white' : 'text-[#ff4655]'}`}>{row.tier || 'N/A'}</td>
                      <td className="p-3 text-gray-300">{row.matches?.toLocaleString()}</td>
                      <td className="p-3 text-gray-300">{row.kills?.toLocaleString()}</td>
                      <td className="p-3 text-gray-300">{row.deaths?.toLocaleString()}</td>
                      <td className="p-3 text-gray-300">{row.assists?.toLocaleString()}</td>
                      <td className="p-3 text-gray-300">{row.headshots?.toLocaleString()}</td>
                      <td className="p-3 text-gray-300">{row.damage?.toLocaleString()}</td>
                      <td className="p-3 text-gray-300">{row.damage_received?.toLocaleString()}</td>
                      <td className="p-3 text-gray-300">{row.traded?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}