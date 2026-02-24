import { useNavigate } from 'react-router-dom';
import { auth, provider, db } from '../../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          displayName: user.displayName || '익명의 플레이어',
          email: user.email,
          totalExp: 0,
          level: 1,
          tier: '아이언',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
      } else {
        await setDoc(userRef, { lastLogin: new Date().toISOString() }, { merge: true });
      }

      navigate('/dashboard');
    } catch (error) {
      console.error("로그인 중 에러 발생:", error);
      alert("로그인에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-2xl shadow-2xl border border-gray-800 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gray-800 rounded-full mx-auto flex items-center justify-center border-2 border-cyan-500 shadow-[0_0_15px_rgba(8,145,178,0.3)]">
            <span className="text-3xl text-cyan-400">⏳</span>
          </div>
          <h2 className="text-3xl font-bold text-white mt-6 mb-2">RLL</h2>
          <p className="text-gray-400">Real Life Leveling</p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-semibold py-3 px-4 rounded-xl hover:bg-gray-100 transition duration-200"
        >
          Google 계정으로 시작하기
        </button>
      </div>
    </div>
  );
}