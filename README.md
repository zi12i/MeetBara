# 🐹 회의바라 (MeetBara) - AI 기반 스마트 회의 비서

![MeetBara Banner](https://via.placeholder.com/1000x300/F4F9ED/91D148?text=MeetBara+-+AI+Smart+Meeting+Assistant)

> **"회의에만 집중하세요. 기록과 요약은 바라(Bara)가 다 해드릴게요!"** > 회의바라는 실시간 음성 인식(STT)과 AI 기반 문맥 분석을 통해 회의의 생산성을 극대화해 주는 스마트 회의록 웹 서비스입니다.

<br/>

## ✨ 주요 기능 (Key Features)

### 🎙️ 1. 실시간 회의 모니터링 (Live Meeting)
- **실시간 스크립트 & 요약:** 발화자의 음성을 텍스트로 변환하고, 대화의 문맥을 파악해 실시간으로 요약합니다.
- **안건 달성률 트래킹:** 회의 안건(Agenda)의 완료 여부를 AI가 스스로 판단하여 진행률(%)을 동기화합니다.
- **안건 이탈 경고:** 회의가 산으로 갈 때(점심 메뉴 등 사담), AI가 이를 감지하고 화면과 캐릭터를 통해 경고를 줍니다.
- **실시간 AI 챗봇:** 회의 도중 "지금까지 요약해 줘", "남은 안건이 뭐야?" 등 AI '바라'에게 질문하고 즉각적인 답변을 받을 수 있습니다.

### 📝 2. 회의록 검토 및 AI 교정 (Meeting Result)
- **STT 문맥 교정 (오탈자 자동 수정):** AI가 문맥상 어색한 단어를 감지하고 올바른 단어를 제안합니다. (일괄 수정 및 개별 수정 완벽 지원)
- **오디오-스크립트 동기화 재생:** 스크립트의 타임스탬프를 클릭하면 오디오 재생바가 해당 구간으로 즉시 이동하여 재생됩니다.
- **직관적인 발화자 매핑:** STT가 임의로 나눈 발화자(예: 참가자 3)를 실제 참석자로 원클릭 병합(Bulk/Single)할 수 있습니다.
- **템플릿 기반 핵심 요약:** 회의가 종료되면 결정 사항과 향후 일정을 보기 쉽게 템플릿 형태로 자동 정리해 줍니다.

### 💾 3. 유연한 내보내기 및 관리
- 완성된 회의록은 **PDF, Word (.docx), 텍스트 (.txt)** 등 다양한 확장자로 즉시 내보낼 수 있습니다.
- 회의별 주요 키워드를 바탕으로 지난 회의록을 쉽게 검색하고 조회할 수 있습니다.

<br/>

## 🛠 기술 스택 (Tech Stack)

### Frontend
- **Framework:** React.js (TypeScript)
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Build Tool:** Vite

### Backend & DB (Architecture)
- **Server:** Python (FastAPI / Flask)
- **Database:** PostgreSQL
- **AI / ML:** OpenAI API / STT Engine

<br/>

## 🚀 시작하기 (Getting Started)

프로젝트를 로컬 환경에서 실행하는 방법입니다.

### 1. 클론 및 패키지 설치
```bash
# 프로젝트 클론
git clone [https://github.com/zi12i/meetbara.git](https://github.com/zi12i/meetbara.git)
cd meetbara

# 패키지 설치
npm install
# or
yarn install


## 파일 구조
src/
 ├── components/       # 공통 UI 및 기능별 모달/컴포넌트 (Toast, Modals 등)
 ├── pages/            # 페이지 레벨 컴포넌트
 │    ├── Dashboard/   # 홈 / 목록 화면
 │    └── Meetings/    # 실시간 회의(LiveMeeting), 회의 결과(MeetingResult)
 ├── layout/           # 사이드바, 헤더 등 공통 레이아웃
 ├── assets/           # 이미지, 아이콘 리소스 (바라 GIF 등)
 └── App.tsx           # 라우팅 구조