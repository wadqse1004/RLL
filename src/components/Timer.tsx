import { useState, useEffect, useRef } from 'react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface TimerProps {
  uid: string;
}

export default function Timer({ uid }: TimerProps) {
  const [isStudying, setIsStudying] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTimeText, setStartTimeText] = useState('-');
  const [endTimeText, setEndTimeText] = useState('-');
  const timerRef = useRef<number | null>(null);

  // 1. 컴포넌트 마운트 시: 로컬 스토리지 확인 (랭킹 페이지 다녀왔을 때 복구)
  useEffect(() => {
    const savedStartTime = localStorage.getItem('startTime');
    if (savedStartTime) {
      const startTimestamp = parseInt(savedStartTime, 10);
      const startDate = new Date(startTimestamp);
      
      setStartTimeText(startDate.toLocaleTimeString('ko-KR'));
      setEndTimeText('-');
      setIsStudying(true);
      
      // (현재 시간 - 저장된 시작 시간)으로 지난 시간 즉시 계산
      setElapsedTime(Math.floor((Date.now() - startTimestamp) / 1000));
    }
  }, []);

  // 2. 타이머 동작 로직 (브라우저 탭 비활성화 시 시간 느려지는 현상 방지)
  useEffect(() => {
    if (isStudying) {
      timerRef.current = window.setInterval(() => {
        const savedStartTime = localStorage.getItem('startTime');
        if (savedStartTime) {
          // 단순히 +1을 하는 게 아니라, 실제 시간 차이를 계산해야 정확해!
          const currentElapsed = Math.floor((Date.now() - parseInt(savedStartTime, 10)) / 1000);
          setElapsedTime(currentElapsed);
        }
      }, 1000);
    } else {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, [isStudying]);

  // 3. 타이머 작동 중 창 닫기/새로고침 방지 경고창
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isStudying) {
        e.preventDefault();
        e.returnValue = ''; // 크롬 등 최신 브라우저에서 경고창을 띄우기 위한 필수 설정
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isStudying]);

  // DB에 경험치 추가
  const addExpToDB = async (earnedExp: number) => {
    if (earnedExp <= 0) return;
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { totalExp: increment(earnedExp) });
    } catch (error) {
      console.error("경험치 업데이트 실패:", error);
    }
  };

  const handleStart = () => {
    const now = Date.now();
    const startDate = new Date(now);
    setStartTimeText(startDate.toLocaleTimeString('ko-KR'));
    setEndTimeText('-'); 
    
    localStorage.setItem('startTime', now.toString()); // 시작 시간 브라우저에 기록
    setIsStudying(true);
  };

  const handleStop = () => {
    if (timerRef.current !== null) clearInterval(timerRef.current);
    setIsStudying(false);
    
    const endDate = new Date();
    setEndTimeText(endDate.toLocaleTimeString('ko-KR'));
    
    const earnedExp = Math.floor(elapsedTime / 60);
    if (earnedExp > 0) {
      alert(`고생했어! \n총 ${Math.floor(elapsedTime / 60)}분 작업 완료.\n+${earnedExp} EXP 획득! 🌟`);
      addExpToDB(earnedExp);
    } else {
      alert("1분 미만은 경험치가 오르지 않아. 조금만 더 힘내자!");
    }

    localStorage.removeItem('startTime'); // 멈췄으니 메모장 지우기
    setElapsedTime(0);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className="flex flex-col items-center gap-6 mt-4 w-full">
      {!isStudying ? (
        <button 
          onClick={handleStart} 
          className="w-full max-w-sm py-4 text-xl font-bold border-2 border-cyan-500 bg-cyan-900/30 hover:bg-cyan-800/50 text-cyan-400 rounded-xl shadow-[0_0_15px_rgba(8,145,178,0.4)] transition-all"
        >
          시작
        </button>
      ) : (
        <button 
          onClick={handleStop} 
          className="w-full max-w-sm py-4 text-xl font-bold border-2 border-red-500 bg-red-900/30 hover:bg-red-800/50 text-red-400 rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all"
        >
          종료
        </button>
      )}

      <div className="w-full max-w-md flex flex-col gap-4">
        <div className="flex justify-between gap-4">
          <div className="flex-1 bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-center">
            <span className="text-sm text-gray-400 mb-1">시작시간</span>
            <span className="text-lg font-mono text-white">{startTimeText}</span>
          </div>
          <div className="flex-1 bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col items-center justify-center">
            <span className="text-sm text-gray-400 mb-1">종료시간</span>
            <span className="text-lg font-mono text-white">{endTimeText}</span>
          </div>
        </div>

        <div className="w-full bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col items-center justify-center relative overflow-hidden">
          {isStudying && <div className="absolute inset-0 bg-cyan-900/10 animate-pulse"></div>}
          
          <span className="text-sm text-gray-400 mb-2 relative z-10">작업시간</span>
          <div className="flex items-baseline gap-3 relative z-10">
            <span className="text-4xl font-mono text-white tracking-wider">{formatTime(elapsedTime)}</span>
            <span className="text-xl font-bold text-cyan-400">
              / +{Math.floor(elapsedTime / 60)} EXP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}