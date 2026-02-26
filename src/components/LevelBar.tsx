// src/components/LevelBar.tsx
import { useState, useEffect } from 'react';
import { getUserStats } from '../../lib/levelUp'; 

interface LevelBarProps {
  totalExp: number;
}

// ⭐️ 한글 티어 이름과 이미지 파일 경로를 연결해 주는 매핑 객체!
const tierImages: Record<string, string> = {
  "아이언": "/tiers/iron.png",
  "브론즈": "/tiers/bronze.png",
  "실버": "/tiers/silver.png",
  "골드": "/tiers/gold.png",
  "플래티넘": "/tiers/platinum.png",
  "에메랄드": "/tiers/emerald.png",
  "다이아몬드": "/tiers/diamond.png",
  "마스터": "/tiers/master.png",
  "그랜드마스터": "/tiers/grandmaster.png",
  "챌린저": "/tiers/challenger.png",
};

export default function LevelBar({ totalExp }: LevelBarProps) {
  const stats = getUserStats(totalExp);
  const [animatedWidth, setAnimatedWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(stats.progressPercent);
    }, 100);
    return () => clearTimeout(timer);
  }, [stats.progressPercent]);

  return (
    <div className="w-full bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-lg">
      <div className="flex justify-between items-end mb-4">
        <div className="flex items-center gap-4">
          
          <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center border border-gray-700 shadow-inner overflow-hidden">
            <img 
              src={tierImages[stats.tier]} 
              alt={stats.tier} 
              className="w-14 h-14 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]" 
              // 혹시 이미지를 못 찾으면 임시로 텍스트 띄우기
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white drop-shadow-md">{stats.tier}</h3>
            <p className="text-cyan-400 font-semibold text-lg">Lv. {stats.level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-mono font-bold text-white">{animatedWidth}%</p>
        </div>
      </div>

      <div className="relative w-full h-5 bg-gray-800 rounded-full overflow-hidden shadow-inner border border-gray-700">
        <div 
          className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.6)] relative"
          style={{ width: `${animatedWidth}%`, transition: 'width 1000ms ease-out' }}
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-white opacity-20 rounded-t-full"></div>
        </div>
      </div>

      <div className="flex justify-between text-sm text-gray-400 mt-2 font-mono">
        <span>{stats.currentLevelExp.toLocaleString()} EXP</span>
        <span>{stats.requiredExp.toLocaleString()} EXP</span>
      </div>
    </div>
  );
}