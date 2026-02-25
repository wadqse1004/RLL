# Real Life Leveling (RLL)

> **"게임처럼 일상을 레벨업하세요."**
> 공부와 작업 시간을 기록하고, 경험치(EXP)를 쌓아 티어를 올리는 게이미피케이션(Gamification) 생산성 타이머 앱입니다.

<br/>

## 프로젝트 소개

**Real Life Leveling**은 반복되고 지루할 수 있는 일상적인 공부와 업무에 '게임의 성취감'을 부여하고자 기획되었습니다. 타이머를 통해 집중한 시간을 측정하고, 누적된 시간에 따라 '아이언'부터 시작해 상위 티어로 승급하는 재미를 제공합니다.

- **배포 주소:** https://rll-xi.vercel.app/
- **개발 기간:** 2026.02.23 ~ 진행 중

<br/>

## 기술 스택 (Tech Stack)

### Frontend
- **Framework/Library:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS
- **State Management & Routing:** React Hooks, React Router DOM

### Backend & BaaS
- **Database & Auth:** Firebase (Firestore, Authentication)

### Deployment
- **Hosting:** Vercel

<br/>

## 주요 기능 (Key Features)

1. **간편 로그인 시스템**
   - Firebase Authentication을 활용한 Google 계정 연동 로그인
2. **실시간 집중 타이머**
   - 직관적인 UI의 스톱워치 기능으로 실제 작업/공부 세션 시간 측정
3. **경험치(EXP) 및 티어 시스템**
   - 저장된 세션 시간을 기반으로 경험치 획득 공식 적용
   - 누적 경험치에 따른 실시간 레벨업 및 티어(아이언, 브론즈 등) 승급 배지 제공
4. **동적 대시보드 UI**
   - 현재 시간, 남은 경험치 게이지바(Level Bar)를 시각적으로 제공하여 동기부여 강화

<br/>

## 트러블슈팅 (Troubleshooting)

### 1. Vercel 배포 시 의존성 충돌 및 TS 엄격성으로 인한 빌드 실패
- **문제 상황:** Vercel 환경에서 `npm install` 진행 중 `eslint` 관련 peer dependency 충돌(`ERESOLVE`) 발생. 또한 `App.tsx` 내 사용하지 않는 변수 선언(`TS6133`)으로 인해 TypeScript 빌드 단계에서 프로세스 중단.
- **해결 방법:** - Vercel의 **Build & Development Settings**에서 Install Command를 `npm install --legacy-peer-deps`로 오버라이드하여 의존성 충돌 무시.
  - `tsconfig.app.json`의 `noUnusedLocals`, `noUnusedParameters` 옵션을 조정하고 불필요한 `import` 문을 제거하여 타입스크립트 빌드 파이프라인 정상화 완료.

### 2. Firebase API Key GitHub 노출 및 로그인 승인 도메인 에러
- **문제 상황:** `.gitignore` 설정 누락으로 `.env` 파일이 원격 저장소에 푸시되어 Google Cloud로부터 API 키 노출 경고 수신. 배포 이후 Vercel 도메인에서 Google 로그인 팝업 호출 시 `auth/unauthorized-domain` 에러 발생.
- **해결 방법:**
  - 즉시 `git rm --cached .env` 명령어로 원격 저장소의 환경 변수 파일 삭제 후 `.gitignore`에 등록.
  - 노출된 기존 API Key를 완전 폐기하고 **새로운 API Key를 발급받아 Vercel 환경 변수에 재등록**.
  - Firebase Auth 설정의 '승인된 도메인'에 Vercel 배포 주소 및 로그인 리디렉션을 위한 `firebaseapp.com` 도메인 추가.
  - Google Cloud 콘솔에서 **API 키 사용처(HTTP 레퍼러)를 해당 도메인들로만 제한**하여 보안 조치 적용 완료.

<br/>
