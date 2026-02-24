import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';

// ⭐️ 데이터 모양(타입)을 명확하게 정의해 줍니다.
interface RankerData {
  id: string;
  displayName: string;
  tier: string;
  level: number;
  totalExp: number;
}

export default function Ranking() {
  // ⭐️ any 대신 방금 만든 RankerData를 넣어줍니다.
  const [rankers, setRankers] = useState<RankerData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopRankers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('totalExp', 'desc'), limit(10));
        const querySnapshot = await getDocs(q);
        
        // ⭐️ 임시 배열에도 RankerData 타입을 넣어줍니다.
        const rankersData: RankerData[] = [];
        
        querySnapshot.forEach((doc) => {
          // Firestore 데이터를 명시적으로 RankerData 타입으로 변환해서 넣기
          const data = doc.data();
          rankersData.push({ 
            id: doc.id, 
            displayName: data.displayName,
            tier: data.tier,
            level: data.level,
            totalExp: data.totalExp
          });
        });
        
        setRankers(rankersData);
      } catch (error) {
        console.error("랭킹 데이터를 불러오는데 실패했습니다:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopRankers();
  }, []);

  const getRankStyle = (index: number) => {
    if (index === 0) return 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] border-yellow-500/50 bg-yellow-900/20';
    if (index === 1) return 'text-gray-300 drop-shadow-[0_0_10px_rgba(209,213,219,0.8)] border-gray-400/50 bg-gray-700/20';
    if (index === 2) return 'text-amber-600 drop-shadow-[0_0_10px_rgba(217,119,6,0.8)] border-amber-700/50 bg-amber-900/20';
    return 'text-gray-400 border-gray-800 bg-gray-900';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex justify-center items-center text-cyan-400 font-mono animate-pulse">
        랭킹 데이터를 불러오는 중...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl flex items-center justify-between mb-8">
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-gray-400 hover:text-white transition flex items-center gap-2"
        >
          <span>←</span> 대시보드로 돌아가기
        </button>
        <h1 className="text-3xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          명예의 전당
        </h1>
        <div className="w-24"></div>
      </div>

      <div className="w-full max-w-2xl flex flex-col gap-3">
        {rankers.length === 0 ? (
          <div className="text-center text-gray-500 py-10 bg-gray-900 rounded-xl border border-gray-800">
            아직 랭킹 데이터가 없습니다. 첫 번째 랭커가 되어보세요!
          </div>
        ) : (
          rankers.map((user, index) => {
            const rankStyle = getRankStyle(index);
            return (
              <div key={user.id} className={`flex items-center justify-between p-5 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${rankStyle}`}>
                <div className="flex items-center gap-6">
                  <div className={`text-2xl font-bold italic w-8 text-center ${index < 3 ? '' : 'text-gray-500'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider opacity-80 mb-1">{user.tier}</div>
                    <div className={`text-lg font-bold ${index < 3 ? 'text-white' : 'text-gray-200'}`}>{user.displayName}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-cyan-400">Lv. {user.level}</div>
                  <div className="text-sm font-mono opacity-70">{user.totalExp?.toLocaleString()} EXP</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}