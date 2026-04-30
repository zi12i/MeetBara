# 회의바라 (MeetBara) - AI 기반 스마트 회의 비서
회의의 본질인 몰입에만 집중하세요. 기록과 요약, 의사결정은 바라(Bara)가 지원합니다.
회의바라는 실시간 음성 인식(STT)과 AI 기반 문맥 분석을 통해 회의의 생산성을 극대화하고, 팀의 신속한 의사결정을 돕는 스마트 회의 솔루션입니다.

# 주요 기능 (Key Features)
## 🎙️ 1. 실시간 회의 모니터링 (Live Meeting)
실시간 스크립트 및 요약: 발화자의 음성을 실시간 텍스트로 변환하고 문맥을 파악해 요약문을 생성합니다.

안건 달성률 트래킹: 설정된 안건의 완료 여부를 AI가 판단하여 회의 진행률을 퍼센트(%)로 동기화합니다.

안건 이탈 감지: 대화 내용이 안건에서 벗어날 경우 AI가 이를 감지하고 실시간 알림을 통해 회의 흐름을 중재합니다.

실시간 AI 챗봇: 회의 도중 요약 요청이나 남은 안건 확인 등 AI 비서에게 질문하고 즉각적인 답변을 받을 수 있습니다.

## 🎡 2. 인터랙티브 의사결정 도구 (Decision Helper)
회의 중 발생하는 사소하거나 중요한 결정을 즐겁고 신속하게 해결하기 위한 도구 세트를 제공합니다.

바라 룰렛: - 최대 8개 항목 설정 가능 및 무지개 스펙트럼 기반의 화려한 UI를 제공합니다.

설정(Setup) 모드와 플레이(Play) 모드를 분리하여 사용성을 높였습니다.

바라 사다리 타기: - 참가자 수에 맞춰 벌칙/결과 항목을 자동 생성(부족 시 '통과' 처리)합니다.

캐릭터별 이동 경로를 색상 자취(Trace)로 남겨 결과 도출 과정을 시각적으로 기록합니다.

8종의 다양한 바라 캐릭터 아이콘(Bulb, White, Pink, Sprout, Tang, Star, Cup 등)을 지원합니다.

성격 급한 한국인을 위한 '빠른 결과 보기' 기능을 통해 즉시 전체 결과를 확인할 수 있습니다.

## 📝 3. 회의 결과 검토 및 AI 교정 (Meeting Result)
STT 문맥 교정: AI가 문맥상 어색하거나 잘못 인식된 단어를 감지하여 올바른 표현으로 일괄/개별 수정을 제안합니다.

오디오-스크립트 동기화: 스크립트의 타임스탬프를 클릭하면 해당 시점의 오디오 구간으로 즉시 이동하여 재생됩니다.

발화자 매핑 및 병합: STT 엔진이 임의로 분류한 발화자를 실제 참석자 프로필과 원클릭으로 매핑하거나 병합할 수 있습니다.

# 시스템 특징 (Technical Highlights)
레이아웃 일관성 유지: 모든 인터랙티브 컴포넌트는 고정된 컨테이너 크기(Height: 750px)를 유지하여 화면 전환 시 레이아웃이 무너지는 현상을 방지했습니다.

반응형 디자인: 다양한 디스플레이 환경에 대응할 수 있도록 최소 너비(min-width)와 높이(min-height)를 보장하며 유동적으로 크기가 조절됩니다.

사용자 경험(UX) 최적화: 한글 입력 시 엔터 키 중복 입력 방지(IME 보정), 설정 모드와 게임 모드의 명확한 분리 등을 통해 조작 실수를 최소화했습니다.

# 기술 스택 (Tech Stack)
## Frontend
Framework: React.js (TypeScript)

Styling: Tailwind CSS

State Management: React Hooks

Build Tool: Vite

## Backend & DB
Server: Python (FastAPI / Flask)

Database: PostgreSQL

AI / ML: OpenAI API / STT Engine

# 시작하기 (Getting Started)
## 1. 프로젝트 클론 및 패키지 설치
Bash
git clone https://github.com/zi12i/meetbara.git
cd meetbara
npm install
## 2. 실행
Bash
npm run dev

# 파일 구조
Plaintext
src/
 ├── components/       # 공통 UI 및 기능별 컴포넌트 (Roulette, Ladder, Toast 등)
 ├── pages/            # 페이지 레벨 컴포넌트
 │    ├── Dashboard/   # 메인 대시보드 및 회의 목록
 │    └── Meetings/    # 실시간 회의(Live), 결과 페이지(Result)
 ├── layout/           # 사이드바, 헤더 등 레이아웃 프레임워크
 ├── assets/           # 이미지, 캐릭터 아이콘(Bara Icons), 스타일 리소스
 └── App.tsx           # 라우팅 및 전체 구조 정의
