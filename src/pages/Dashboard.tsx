import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import LevelBar from '../components/LevelBar';
import Timer from '../components/Timer';

interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  totalExp: number;
  level: number;
  tier: string;
  createdAt: string;
  lastLogin: string;
}

export default function Dashboard() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // ⭐️ 현재 시간을 저장할 상태 추가
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const navigate = useNavigate();

  // ⭐️ 1초마다 현재 시간을 업데이트하는 타이머 작동
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    let unsubscribeSnapshot: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        unsubscribeSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserProfile({
              uid: user.uid,
              displayName: data.displayName,
              email: data.email,
              totalExp: data.totalExp,
              level: data.level,
              tier: data.tier,
              createdAt: data.createdAt,
              lastLogin: data.lastLogin
            });
          }
          setLoading(false);
        });
      } else {
        navigate('/');
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  // ⭐️ 시, 분, 초를 00:00:00 포맷으로 예쁘게 만들어주는 함수
  const formatClock = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-cyan-400 font-mono animate-pulse">RLL 서버 접속 중...</p>
      </div>
    );
  }

  return (
    // ⭐️ flex-col을 주어서 요소들을 세로로 쫙 펴줌
    <div className="min-h-screen bg-gray-950 text-white font-sans relative overflow-hidden flex flex-col">
      <div className="absolute top-[-10%] left-[20%] w-96 h-96 bg-cyan-900 rounded-full mix-blend-screen filter blur-[128px] opacity-20 pointer-events-none"></div>

      {/* 헤더 (맨 위 고정) */}
      <header className="w-full max-w-3xl mx-auto p-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-800 rounded-full border border-gray-700 flex items-center justify-center">👤</div>
          <h1 className="text-xl font-bold text-gray-100">
            {userProfile?.displayName} <span className="text-sm font-normal text-gray-400 ml-1">플레이어</span>
          </h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/ranking')}
            className="text-sm text-cyan-400 hover:text-cyan-300 transition px-4 py-2 bg-gray-900 rounded-lg border border-cyan-900 hover:bg-gray-800"
          >
            🏆 랭킹 보기
          </button>
          <button 
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white transition px-4 py-2 bg-gray-900 rounded-lg border border-gray-800 hover:bg-gray-800"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 (flex-1을 주어서 남는 화면 높이를 전부 차지하게 함) */}
      <main className="w-full max-w-3xl mx-auto px-6 pb-8 flex flex-col items-center relative z-10 flex-1">
        
        {/* 1. 실시간 시계 (상단 중앙) */}
        <div className="mb-10 mt-6 text-center">
          <p className="text-gray-400 text-sm font-mono mb-2 tracking-[0.3em] uppercase">Current Time</p>
          <h2 className="text-6xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 drop-shadow-md tracking-widest">
            {formatClock(currentTime)}
          </h2>
        </div>

        {/* 2. 작업 타이머 (중앙) */}
        <div className="w-full bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-xl flex flex-col items-center">
          <h2 className="text-gray-400 mb-6 font-mono tracking-widest text-sm uppercase">Study Session</h2>
          <Timer uid={userProfile?.uid || ''} />
        </div>

        {/* 3. 티어 & 레벨 바 (mt-auto를 주어서 화면 맨 아랫바닥으로 쭉 밀어냄!) */}
        <div className="w-full mt-auto pt-10">
          <LevelBar totalExp={userProfile?.totalExp || 0} />
        </div>
        
      </main>
    </div>
  );
}