import React, { useState, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import CapybaraZone from "../../components/common/CapybaraZone";
import { createPortal } from "react-dom";

// =============================================
// 달력 아이콘
// =============================================
const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

// =============================================
// 타입 정의
// =============================================
interface ActionItem {
  assignee: string;
  task: string;
  status: "진행 중" | "완료" | "지연";
}

interface Agenda {
  title: string;
  isDone: boolean;
}

interface Meeting {
  id: number;
  date: string;
  title: string;
  projectName: string;
  projectColor: string;
  agenda: string;
  keywords: string[];
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  duration: string;
  location: string;
  status: "진행 완료" | "진행 중";
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  projectFullName: string;
  owner: string;
  department: string;
  participants: string[];
  aiSummary: string;
  agendaItems: Agenda[];
  actionItems: ActionItem[];
  recordingFile: string;
  referenceDoc: string;
  keywordTags: string[];
}

// =============================================
// 더미 데이터
// =============================================
const DUMMY_MEETINGS: Meeting[] = [
  {
    id: 1,
    date: "2026-04-15",
    title: "UI/UX 개선안 확정 회의",
    projectName: "프로젝트 알파",
    projectColor: "#91D148",
    agenda: "모바일 앱 메인화면 개편",
    keywords: ["UI/UX", "#디자인", "#피그마", "#모바일시스템"],
    dayOfWeek: "수",
    startTime: "14:00",
    endTime: "15:30",
    duration: "90분",
    location: "본사 4층 소회의실 2호",
    status: "진행 완료",
    completedTasks: 2,
    inProgressTasks: 1,
    overdueTasks: 0,
    projectFullName: "AI 미팅 에이전트 고도화",
    owner: "김철수 / PM",
    department: "서비스: 기획팀, 디자인팀, 개발 1팀",
    participants: ["김철수", "이영희", "박지민", "최유진", "강민호", "황수아"],
    aiSummary: "\"사용자 체류 시간 증대를 위한 카드형 UI 0안 도입이 최종 결정되었습니다. 개발팀의 성능 우려 사항은 프리렌더링 기술 적용으로 합의하였으며, 관련하여 3건의 액션 아이템이 생성되었습니다.\"",
    agendaItems: [
      { title: "안건1: 카드형 레이아웃 0안 확정 → 이미지 로딩 최적화 기법 적용 결정", isDone: true },
      { title: "안건2: 검색 필터 고도화 검토 → 다중 필터 선택 기능을 1차 마일스톤에 포함하기로 결정", isDone: true },
      { title: "안건3: 알림 센터 통합 방식 → OS 네이티브 알림과 앱 내 알림 센터를 통기화하기로 결정", isDone: false },
    ],
    actionItems: [
      { assignee: "박지민", task: "카드형 UI 최적 성능 데이터 분석 보고서 작성", status: "진행 중" },
      { assignee: "이영희", task: "알림 센터 통합 방식 v2.1 시안 수정", status: "완료" },
      { assignee: "김창수", task: "검색 필터 고도화 기획서 로직 정리", status: "진행 중" },
    ],
    recordingFile: "meeting_20260415.mp3",
    referenceDoc: "메타티시_시안_v2_figma, 사용자체류시간_리포트.pdf",
    keywordTags: ["#카드UI", "#알림UI", "#필터고도화", "#모바일시스템"],
  },
  {
    id: 2,
    date: "2026-05-07",
    title: "신규 서비스 기획 논의",
    projectName: "프로젝트 베타",
    projectColor: "#4A90D9",
    agenda: "신규 기능 로드맵 수립",
    keywords: ["기획", "로드맵", "신규서비스"],
    dayOfWeek: "목",
    startTime: "10:00",
    endTime: "11:30",
    duration: "90분",
    location: "화상회의 (Zoom)",
    status: "진행 완료",
    completedTasks: 3,
    inProgressTasks: 2,
    overdueTasks: 1,
    projectFullName: "신규 서비스 런칭 프로젝트",
    owner: "이수진 / PL",
    department: "기획팀, 개발팀",
    participants: ["이수진", "박민준", "최지원", "한소희"],
    aiSummary: "\"신규 서비스 로드맵 초안이 확정되었습니다. 1분기 출시 목표를 위한 핵심 기능 우선순위가 결정되었으며, 5건의 액션 아이템이 생성되었습니다.\"",
    agendaItems: [
      { title: "안건1: 핵심 기능 범위 확정 → MVP 기준으로 5개 기능으로 축소 결정", isDone: true },
      { title: "안건2: 출시 일정 조율 → 6월 말 베타 출시로 합의", isDone: true },
      { title: "안건3: 마케팅 연계 방안 논의 → 추가 검토 필요", isDone: false },
    ],
    actionItems: [
      { assignee: "박민준", task: "MVP 기능 상세 스펙 문서 작성", status: "완료" },
      { assignee: "최지원", task: "베타 출시 일정 상세 계획 수립", status: "진행 중" },
      { assignee: "한소희", task: "마케팅 연계 방안 초안 작성", status: "지연" },
    ],
    recordingFile: "meeting_20260507.mp3",
    referenceDoc: "신규서비스_기획서_v1.0.pdf",
    keywordTags: ["#기획", "#로드맵", "#신규서비스", "#MVP"],
  },
  {
    id: 3,
    date: "2026-04-30",
    title: "디자인 시스템 정립 회의",
    projectName: "프로젝트 감마",
    projectColor: "#E8944A",
    agenda: "UI 컴포넌트 표준화",
    keywords: ["디자인", "UI", "컴포넌트"],
    dayOfWeek: "목",
    startTime: "15:00",
    endTime: "16:00",
    duration: "60분",
    location: "본사 3층 대회의실",
    status: "진행 완료",
    completedTasks: 4,
    inProgressTasks: 1,
    overdueTasks: 0,
    projectFullName: "디자인 시스템 v2.0",
    owner: "정다은 / 디자인리드",
    department: "디자인팀, 프론트엔드팀",
    participants: ["정다은", "김유진", "이준혁", "박서연"],
    aiSummary: "\"컴포넌트 라이브러리 표준화 방향이 확정되었습니다. Storybook 도입과 디자인 토큰 체계 수립이 결정되었습니다.\"",
    agendaItems: [
      { title: "안건1: 컴포넌트 네이밍 규칙 확정 → BEM 방식으로 통일", isDone: true },
      { title: "안건2: Storybook 도입 결정 → 다음 스프린트부터 적용", isDone: true },
      { title: "안건3: 디자인 토큰 정의 → 색상/타이포 기준 1차 완료", isDone: true },
    ],
    actionItems: [
      { assignee: "김유진", task: "Storybook 환경 세팅 및 기본 컴포넌트 등록", status: "완료" },
      { assignee: "이준혁", task: "디자인 토큰 코드 연동 작업", status: "진행 중" },
    ],
    recordingFile: "meeting_20260430.mp3",
    referenceDoc: "디자인시스템_가이드_v2.0.pdf",
    keywordTags: ["#디자인시스템", "#UI", "#컴포넌트", "#Storybook"],
  },
  {
    id: 4,
    date: "2026-04-25",
    title: "백엔드 아키텍처 검토",
    projectName: "프로젝트 알파",
    projectColor: "#91D148",
    agenda: "DB 구조 및 API 설계 검토",
    keywords: ["백엔드", "API", "DB"],
    dayOfWeek: "토",
    startTime: "09:00",
    endTime: "10:30",
    duration: "90분",
    location: "화상회의 (Teams)",
    status: "진행 완료",
    completedTasks: 2,
    inProgressTasks: 3,
    overdueTasks: 1,
    projectFullName: "AI 미팅 에이전트 고도화",
    owner: "김철수 / PM",
    department: "백엔드팀, 인프라팀",
    participants: ["김철수", "박지민", "이상혁", "최도현"],
    aiSummary: "\"마이크로서비스 아키텍처 전환 방향이 확정되었으며, API 게이트웨이 도입이 결정되었습니다.\"",
    agendaItems: [
      { title: "안건1: MSA 전환 방향 확정 → 단계적 전환 방식으로 결정", isDone: true },
      { title: "안건2: API 게이트웨이 솔루션 선정 → Kong 도입 결정", isDone: true },
      { title: "안건3: DB 샤딩 전략 논의 → 추가 POC 필요", isDone: false },
    ],
    actionItems: [
      { assignee: "박지민", task: "Kong API 게이트웨이 POC 진행", status: "진행 중" },
      { assignee: "이상혁", task: "DB 샤딩 POC 계획서 작성", status: "지연" },
    ],
    recordingFile: "meeting_20260425.mp3",
    referenceDoc: "백엔드_아키텍처_검토서_v1.pdf",
    keywordTags: ["#MSA", "#API", "#DB", "#인프라"],
  },
  {
    id: 5,
    date: "2026-04-20",
    title: "마케팅 전략 수립",
    projectName: "프로젝트 델타",
    projectColor: "#9B59B6",
    agenda: "2분기 마케팅 캠페인 기획",
    keywords: ["마케팅", "캠페인", "2분기"],
    dayOfWeek: "월",
    startTime: "13:00",
    endTime: "14:00",
    duration: "60분",
    location: "본사 5층 마케팅팀 회의실",
    status: "진행 완료",
    completedTasks: 5,
    inProgressTasks: 0,
    overdueTasks: 0,
    projectFullName: "2분기 성장 전략 프로젝트",
    owner: "최유진 / 마케팅리드",
    department: "마케팅팀, 콘텐츠팀",
    participants: ["최유진", "강민호", "황수아", "임지현"],
    aiSummary: "\"2분기 캠페인 전략이 확정되었습니다. SNS 중심의 바이럴 마케팅과 인플루언서 협업 방향이 결정되었습니다.\"",
    agendaItems: [
      { title: "안건1: 2분기 캠페인 방향 확정 → SNS 바이럴 중심으로 결정", isDone: true },
      { title: "안건2: 예산 배분 논의 → 인플루언서 40%, 광고 60% 확정", isDone: true },
      { title: "안건3: KPI 지표 설정 → MAU 20% 증가 목표 설정", isDone: true },
    ],
    actionItems: [
      { assignee: "강민호", task: "인플루언서 후보 리스트 작성 및 컨택", status: "완료" },
      { assignee: "황수아", task: "SNS 콘텐츠 캘린더 작성", status: "완료" },
    ],
    recordingFile: "meeting_20260420.mp3",
    referenceDoc: "마케팅_전략서_Q2_2026.pdf",
    keywordTags: ["#마케팅", "#캠페인", "#SNS", "#인플루언서"],
  },
  {
    id: 6,
    date: "2026-04-15",
    title: "인프라 점검 회의",
    projectName: "프로젝트 베타",
    projectColor: "#4A90D9",
    agenda: "서버 이전 및 비용 최적화",
    keywords: ["인프라", "서버", "비용"],
    dayOfWeek: "수",
    startTime: "11:00",
    endTime: "12:00",
    duration: "60분",
    location: "화상회의 (Zoom)",
    status: "진행 완료",
    completedTasks: 3,
    inProgressTasks: 2,
    overdueTasks: 0,
    projectFullName: "신규 서비스 런칭 프로젝트",
    owner: "이수진 / PL",
    department: "인프라팀, 개발팀",
    participants: ["이수진", "박민준", "이상혁"],
    aiSummary: "\"AWS에서 GCP로의 서버 이전 계획이 확정되었습니다. 비용 절감 예상액은 월 30%이며, 이전 일정은 6월로 결정되었습니다.\"",
    agendaItems: [
      { title: "안건1: 클라우드 이전 대상 서버 확정 → 전체 프로덕션 서버 이전 결정", isDone: true },
      { title: "안건2: 이전 일정 수립 → 6월 첫째 주 시작으로 확정", isDone: true },
      { title: "안건3: 비용 최적화 방안 검토 → Reserved Instance 도입 결정", isDone: false },
    ],
    actionItems: [
      { assignee: "이상혁", task: "GCP 이전 상세 계획서 작성", status: "진행 중" },
      { assignee: "박민준", task: "Reserved Instance 비용 시뮬레이션", status: "진행 중" },
    ],
    recordingFile: "meeting_20260415_infra.mp3",
    referenceDoc: "인프라_이전계획서_v1.pdf",
    keywordTags: ["#인프라", "#클라우드", "#GCP", "#비용최적화"],
  },
  {
    id: 7,
    date: "2026-04-10",
    title: "사용자 리서치 결과 공유",
    projectName: "프로젝트 감마",
    projectColor: "#E8944A",
    agenda: "사용자 인터뷰 결과 및 인사이트",
    keywords: ["리서치", "UX", "인터뷰"],
    dayOfWeek: "금",
    startTime: "14:00",
    endTime: "15:00",
    duration: "60분",
    location: "본사 4층 회의실",
    status: "진행 완료",
    completedTasks: 2,
    inProgressTasks: 1,
    overdueTasks: 0,
    projectFullName: "디자인 시스템 v2.0",
    owner: "정다은 / 디자인리드",
    department: "UX팀, 기획팀",
    participants: ["정다은", "김유진", "이준혁"],
    aiSummary: "\"사용자 인터뷰 20건의 결과가 공유되었습니다. 주요 페인포인트 3가지가 도출되었으며 개선 방향이 결정되었습니다.\"",
    agendaItems: [
      { title: "안건1: 인터뷰 결과 요약 공유 → 3대 페인포인트 확정", isDone: true },
      { title: "안건2: 개선 우선순위 결정 → 검색 기능 개선 1순위 결정", isDone: true },
    ],
    actionItems: [
      { assignee: "김유진", task: "페인포인트 기반 개선안 프로토타입 제작", status: "진행 중" },
    ],
    recordingFile: "meeting_20260410.mp3",
    referenceDoc: "UX리서치_결과보고서.pdf",
    keywordTags: ["#UX", "#리서치", "#인터뷰", "#페인포인트"],
  },
  {
    id: 8,
    date: "2026-04-05",
    title: "법무 검토 회의",
    projectName: "프로젝트 알파",
    projectColor: "#91D148",
    agenda: "계약서 및 이용약관 검토",
    keywords: ["법무", "계약", "약관"],
    dayOfWeek: "일",
    startTime: "10:00",
    endTime: "11:00",
    duration: "60분",
    location: "본사 2층 법무팀 회의실",
    status: "진행 완료",
    completedTasks: 3,
    inProgressTasks: 0,
    overdueTasks: 0,
    projectFullName: "AI 미팅 에이전트 고도화",
    owner: "김철수 / PM",
    department: "법무팀, 기획팀",
    participants: ["김철수", "이지현", "박성민"],
    aiSummary: "\"서비스 이용약관 및 개인정보처리방침 최종 검토가 완료되었습니다. 3건의 수정 사항이 반영되었습니다.\"",
    agendaItems: [
      { title: "안건1: 이용약관 최종 검토 → 수정 2건 반영 후 확정", isDone: true },
      { title: "안건2: 개인정보처리방침 검토 → 수정 1건 반영 후 확정", isDone: true },
    ],
    actionItems: [
      { assignee: "이지현", task: "수정된 약관 최종본 배포", status: "완료" },
    ],
    recordingFile: "meeting_20260405.mp3",
    referenceDoc: "이용약관_최종본_v3.pdf",
    keywordTags: ["#법무", "#약관", "#개인정보", "#계약"],
  },
  {
    id: 9,
    date: "2026-03-28",
    title: "보안 감사 결과 보고",
    projectName: "프로젝트 델타",
    projectColor: "#9B59B6",
    agenda: "취약점 점검 및 보완 방안",
    keywords: ["보안", "감사", "취약점"],
    dayOfWeek: "토",
    startTime: "14:00",
    endTime: "15:30",
    duration: "90분",
    location: "본사 보안팀 회의실",
    status: "진행 완료",
    completedTasks: 4,
    inProgressTasks: 1,
    overdueTasks: 2,
    projectFullName: "2분기 성장 전략 프로젝트",
    owner: "최유진 / 마케팅리드",
    department: "보안팀, 개발팀",
    participants: ["최유진", "강민호", "이상혁"],
    aiSummary: "\"보안 감사 결과 7건의 취약점이 발견되었습니다. 긴급 패치 3건은 즉시 적용되었으며 나머지 4건은 일정에 따라 처리 예정입니다.\"",
    agendaItems: [
      { title: "안건1: 긴급 취약점 3건 패치 → 즉시 적용 완료", isDone: true },
      { title: "안건2: 일반 취약점 4건 처리 일정 수립 → 2주 내 완료 목표", isDone: true },
      { title: "안건3: 보안 정책 강화 방안 논의 → 추가 검토 중", isDone: false },
    ],
    actionItems: [
      { assignee: "이상혁", task: "일반 취약점 패치 작업", status: "지연" },
      { assignee: "강민호", task: "보안 정책 강화 방안 문서 작성", status: "진행 중" },
    ],
    recordingFile: "meeting_20260328.mp3",
    referenceDoc: "보안감사_결과보고서_2026Q1.pdf",
    keywordTags: ["#보안", "#취약점", "#감사", "#패치"],
  },
  {
    id: 10,
    date: "2026-03-20",
    title: "팀 빌딩 및 목표 수립",
    projectName: "프로젝트 베타",
    projectColor: "#4A90D9",
    agenda: "2분기 팀 목표 및 역할 분담",
    keywords: ["팀빌딩", "목표", "역할"],
    dayOfWeek: "금",
    startTime: "15:00",
    endTime: "17:00",
    duration: "120분",
    location: "본사 대강당",
    status: "진행 완료",
    completedTasks: 5,
    inProgressTasks: 0,
    overdueTasks: 0,
    projectFullName: "신규 서비스 런칭 프로젝트",
    owner: "이수진 / PL",
    department: "전 팀",
    participants: ["이수진", "박민준", "최지원", "한소희", "이상혁"],
    aiSummary: "\"2분기 팀 목표 OKR이 확정되었습니다. 각 팀별 역할과 책임이 명확하게 정의되었습니다.\"",
    agendaItems: [
      { title: "안건1: 2분기 OKR 확정 → 팀별 3개씩 설정 완료", isDone: true },
      { title: "안건2: 역할 분담 정의 → RACI 차트 기준으로 확정", isDone: true },
    ],
    actionItems: [
      { assignee: "박민준", task: "OKR 트래킹 시스템 설정", status: "완료" },
    ],
    recordingFile: "meeting_20260320.mp3",
    referenceDoc: "팀빌딩_OKR_2026Q2.pdf",
    keywordTags: ["#OKR", "#팀빌딩", "#목표", "#역할분담"],
  },
  {
    id: 11,
    date: "2026-03-15",
    title: "QA 테스트 결과 공유",
    projectName: "프로젝트 알파",
    projectColor: "#91D148",
    agenda: "버그 목록 및 수정 우선순위 결정",
    keywords: ["QA", "테스트", "버그"],
    dayOfWeek: "일",
    startTime: "10:00",
    endTime: "11:30",
    duration: "90분",
    location: "화상회의 (Zoom)",
    status: "진행 완료",
    completedTasks: 6,
    inProgressTasks: 2,
    overdueTasks: 1,
    projectFullName: "AI 미팅 에이전트 고도화",
    owner: "김철수 / PM",
    department: "QA팀, 개발팀",
    participants: ["김철수", "박지민", "이준혁", "최도현"],
    aiSummary: "\"1차 QA 결과 총 23건의 버그가 발견되었습니다. Critical 5건은 즉시 수정 완료, 나머지는 우선순위에 따라 처리 예정입니다.\"",
    agendaItems: [
      { title: "안건1: Critical 버그 5건 처리 완료 보고 → 모두 수정 완료 확인", isDone: true },
      { title: "안건2: 나머지 버그 우선순위 결정 → P1/P2/P3 분류 완료", isDone: true },
    ],
    actionItems: [
      { assignee: "이준혁", task: "P1 버그 수정 작업", status: "진행 중" },
      { assignee: "최도현", task: "P2 버그 수정 작업", status: "지연" },
    ],
    recordingFile: "meeting_20260315.mp3",
    referenceDoc: "QA_테스트_결과보고서_1차.pdf",
    keywordTags: ["#QA", "#테스트", "#버그", "#품질"],
  },
  {
    id: 12,
    date: "2026-03-10",
    title: "고객사 미팅 사전 준비",
    projectName: "프로젝트 감마",
    projectColor: "#E8944A",
    agenda: "발표 자료 및 데모 시나리오 검토",
    keywords: ["고객사", "발표", "데모"],
    dayOfWeek: "화",
    startTime: "14:00",
    endTime: "15:00",
    duration: "60분",
    location: "본사 4층 PT룸",
    status: "진행 완료",
    completedTasks: 4,
    inProgressTasks: 0,
    overdueTasks: 0,
    projectFullName: "디자인 시스템 v2.0",
    owner: "정다은 / 디자인리드",
    department: "기획팀, 디자인팀",
    participants: ["정다은", "김유진", "이준혁", "박서연"],
    aiSummary: "\"고객사 발표 준비가 완료되었습니다. 데모 시나리오 3가지가 확정되었으며 발표 역할이 배분되었습니다.\"",
    agendaItems: [
      { title: "안건1: 발표 자료 최종 검토 → 수정 없이 확정", isDone: true },
      { title: "안건2: 데모 시나리오 리허설 → 3가지 시나리오 확정", isDone: true },
    ],
    actionItems: [
      { assignee: "김유진", task: "발표 자료 최종본 인쇄 및 배포", status: "완료" },
    ],
    recordingFile: "meeting_20260310.mp3",
    referenceDoc: "고객사_발표자료_최종.pdf",
    keywordTags: ["#발표", "#데모", "#고객사", "#PT"],
  },
];

const PAGE_SIZE = 10;

const statusColor = (status: ActionItem["status"]) => {
  if (status === "완료") return "bg-[#C8E6A5]/70 text-[#4d7222]";
  if (status === "지연") return "bg-red-100 text-red-600";
  return "bg-blue-100 text-blue-600";
};

const PROJECT_NAMES = [...new Set(DUMMY_MEETINGS.map((m) => m.projectName))];

// =============================================
// 모달 컴포넌트
// =============================================
const MeetingDetailModal: React.FC<{
  meeting: Meeting;
  onClose: () => void;
}> = ({ meeting, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      {createPortal(<CapybaraZone />, document.body)}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[860px] max-h-[90vh] overflow-y-auto mx-4 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10"
          style={{ borderLeft: `4px solid ${meeting.projectColor}` }}
        >
          <div>
            <p className="text-[11px] font-bold text-gray-400 mb-1">{meeting.projectName}</p>
            <h2 className="text-[18px] font-black text-gray-900">{meeting.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700 text-[18px] font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">

          {/* 기본 정보 */}
          <div className="border border-gray-200 rounded-xl p-4">
            <p className="text-[12px] font-black text-gray-400 mb-3 uppercase tracking-wide">기본 정보</p>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <span className="text-gray-400 font-bold">일시</span>
                <p className="text-gray-800 font-bold mt-0.5">
                  {meeting.date} ({meeting.dayOfWeek}) {meeting.startTime}~{meeting.endTime} ({meeting.duration})
                </p>
              </div>
              <div>
                <span className="text-gray-400 font-bold">장소</span>
                <p className="text-gray-800 font-bold mt-0.5">{meeting.location}</p>
              </div>
              <div>
                <span className="text-gray-400 font-bold">상태</span>
                <p className="mt-0.5">
                  <span className="inline-block px-2 py-0.5 bg-[#C8E6A5]/60 text-[#4d7222] rounded-full text-[11px] font-bold">
                    {meeting.status}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-gray-400 font-bold">이행 현황</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="inline-block px-2 py-0.5 bg-[#C8E6A5]/60 text-[#4d7222] rounded-full text-[11px] font-bold">
                    완료 {meeting.completedTasks}
                  </span>
                  <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-[11px] font-bold">
                    진행중 {meeting.inProgressTasks}
                  </span>
                  {meeting.overdueTasks > 0 && (
                    <span className="inline-block px-2 py-0.5 bg-red-100 text-red-500 rounded-full text-[11px] font-bold">
                      지연 {meeting.overdueTasks}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 프로젝트 정보 */}
          <div className="border border-gray-200 rounded-xl p-4">
            <p className="text-[12px] font-black text-gray-400 mb-3 uppercase tracking-wide">프로젝트 정보</p>
            <div className="grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <span className="text-gray-400 font-bold">프로젝트명</span>
                <p className="text-gray-800 font-bold mt-0.5">{meeting.projectFullName}</p>
              </div>
              <div>
                <span className="text-gray-400 font-bold">책임자</span>
                <p className="text-gray-800 font-bold mt-0.5">{meeting.owner}</p>
              </div>
              <div>
                <span className="text-gray-400 font-bold">참여 부서</span>
                <p className="text-gray-800 font-bold mt-0.5">{meeting.department}</p>
              </div>
              <div>
                <span className="text-gray-400 font-bold">참여자</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {meeting.participants.map((p) => (
                    <span
                      key={p}
                      className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[11px] font-bold"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI 회의 요약 */}
          <div className="border border-[#91D148]/30 bg-[#F4F9ED]/50 rounded-xl p-4">
            <p className="text-[12px] font-black text-[#4d7222] mb-2 uppercase tracking-wide">AI 회의 요약</p>
            <p className="text-[13px] text-gray-700 font-bold leading-relaxed">{meeting.aiSummary}</p>
          </div>

          {/* 주요 안건 + 파생 액션아이템 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-[12px] font-black text-gray-400 mb-3 uppercase tracking-wide">주요안건 및 결정사항</p>
              <div className="flex flex-col gap-2">
                {meeting.agendaItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div
                      className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center text-[10px] font-black border ${
                        item.isDone
                          ? "bg-[#91D148] border-[#91D148] text-white"
                          : "border-gray-300 text-transparent"
                      }`}
                    >
                      ✓
                    </div>
                    <p className={`text-[12px] leading-relaxed ${item.isDone ? "text-gray-700" : "text-gray-400"}`}>
                      {item.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-[12px] font-black text-gray-400 mb-3 uppercase tracking-wide">파생 액션아이템 및 이행 현황</p>
              <div className="flex flex-col gap-2">
                {meeting.actionItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-black flex-shrink-0 ${statusColor(item.status)}`}
                    >
                      {item.assignee}
                    </span>
                    <p className="text-[12px] text-gray-600 leading-relaxed">{item.task}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-[11px] font-black text-gray-400 mb-1.5">관련 자료 및 키워드</p>
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-[11px] text-gray-400">🎵</span>
                  <span className="text-[11px] text-[#4d7222] font-bold underline cursor-pointer">
                    {meeting.recordingFile}
                  </span>
                </div>
                {meeting.referenceDoc && (
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-[11px] text-gray-400">📎</span>
                    <span className="text-[11px] text-gray-500 font-bold">{meeting.referenceDoc}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-1 mt-1">
                  {meeting.keywordTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[11px] font-bold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// =============================================
// 메인 컴포넌트
// =============================================
const MeetingHistory: React.FC = () => {
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [projectName, setProjectName] = useState<string>("");
  const [agenda, setAgenda] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");

  const dateFromRef = useRef<HTMLInputElement | null>(null);
  const dateToRef = useRef<HTMLInputElement | null>(null);

  const [results, setResults] = useState<Meeting[]>(
    [...DUMMY_MEETINGS].sort((a, b) => (a.date < b.date ? 1 : -1))
  );
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showProjectDropdown, setShowProjectDropdown] = useState<boolean>(false);

  // ── 종료일이 시작일보다 이전인지 체크 ──
  const isDateRangeInvalid =
    dateFrom !== "" && dateTo !== "" && dateTo < dateFrom;

  // ── 달력 팝업 열기 ──
  const openDatePicker = (ref: React.MutableRefObject<HTMLInputElement | null>) => {
    if (!ref.current) return;
    if (typeof ref.current.showPicker === "function") {
      ref.current.showPicker();
    } else {
      ref.current.focus();
    }
  };

  // ── 검색 ──
  const handleSearch = () => {
    // 날짜 범위가 잘못됐으면 실행 안 함
    if (isDateRangeInvalid) return;

    let filtered = [...DUMMY_MEETINGS];

    // 시작일만 있으면 → 시작일 이후 전체
    if (dateFrom) filtered = filtered.filter((m) => m.date >= dateFrom);

    // 종료일만 있으면 → 종료일까지 전체
    if (dateTo) filtered = filtered.filter((m) => m.date <= dateTo);

    if (projectName.trim()) {
      filtered = filtered.filter((m) => m.projectName.includes(projectName.trim()));
    }
    if (agenda.trim()) {
      filtered = filtered.filter((m) => m.agenda.includes(agenda.trim()));
    }
    if (keyword.trim()) {
      filtered = filtered.filter(
        (m) =>
          m.title.includes(keyword.trim()) ||
          m.keywords.some((k) => k.includes(keyword.trim()))
      );
    }

    filtered.sort((a, b) => (a.date < b.date ? 1 : -1));
    setResults(filtered);
    setCurrentPage(1);
  };

  // ── 페이지네이션 ──
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const pagedResults = results.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const filteredProjects = PROJECT_NAMES.filter((name) =>
    name.includes(projectName.trim())
  );

  return (
    <>
     {createPortal(<CapybaraZone />, document.body)}
      <PageMeta title="히스토리 - 회의 관리" description="과거 회의 데이터를 확인할 수 있습니다." />

      {selectedMeeting && (
        <MeetingDetailModal
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
        />
      )}

      <div className="flex flex-col h-full w-full bg-white p-8 overflow-hidden">

        {/* 검색 조건 박스 */}
        <div className="border border-gray-200 rounded-xl p-5 mb-4 shrink-0 bg-white shadow-sm">
          <p className="text-[13px] font-bold text-gray-700 mb-4">검색 조건</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">

            {/* 기간 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-gray-500">기간</label>
              <div className="flex items-center gap-2">

                {/* 시작일 */}
                <div className="relative flex-1">
                  <input
                    ref={dateFromRef}
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    max="9999-12-31"
                    className="w-full h-9 pl-3 pr-8 text-[12px] border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:border-[#91D148]"
                  />
                  <button
                    type="button"
                    onClick={() => openDatePicker(dateFromRef)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#91D148] transition-colors"
                  >
                    <CalendarIcon />
                  </button>
                </div>

                <span className="text-gray-400 text-[12px] flex-shrink-0">~</span>

                {/* 종료일 */}
                <div className="relative flex-1">
                  <input
                    ref={dateToRef}
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    max="9999-12-31"
                    className={`w-full h-9 pl-3 pr-8 text-[12px] border rounded-md text-gray-700 focus:outline-none ${
                      isDateRangeInvalid
                        ? "border-red-400 bg-red-50 focus:border-red-400"
                        : "border-gray-300 focus:border-[#91D148]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => openDatePicker(dateToRef)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#91D148] transition-colors"
                  >
                    <CalendarIcon />
                  </button>
                </div>

              </div>

              {/* 날짜 오류 경고 문구 */}
              {isDateRangeInvalid && (
                <p className="text-[11px] text-red-500 font-bold mt-0.5">
                  ⚠ 종료일은 시작일 이후 날짜로 선택해주세요.
                </p>
              )}
            </div>

            {/* 프로젝트명 — 드롭다운 */}
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[12px] font-bold text-gray-500">프로젝트명</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="프로젝트를 선택하세요"
                  value={projectName}
                  onChange={(e) => {
                    setProjectName(e.target.value);
                    setShowProjectDropdown(true);
                  }}
                  onFocus={() => setShowProjectDropdown(true)}
                  onBlur={() => setTimeout(() => setShowProjectDropdown(false), 150)}
                  className="w-full h-9 px-3 pr-8 text-[12px] border border-gray-300 rounded-md text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#91D148]"
                />
                <svg
                  className="absolute right-2.5 w-3.5 h-3.5 text-gray-400 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {showProjectDropdown && filteredProjects.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                  {filteredProjects.map((name) => (
                    <button
                      key={name}
                      onMouseDown={() => {
                        setProjectName(name);
                        setShowProjectDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-[12px] text-gray-700 hover:bg-[#F4F9ED] hover:text-[#4d7222] font-bold transition-colors flex items-center gap-2"
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: DUMMY_MEETINGS.find((m) => m.projectName === name)?.projectColor,
                        }}
                      />
                      {name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 안건 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-gray-500">안건</label>
              <input
                type="text"
                placeholder="해당 란에 작성하십시오"
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                className="h-9 px-3 text-[12px] border border-gray-300 rounded-md text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#91D148]"
              />
            </div>

            {/* 키워드 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-gray-500">키워드</label>
              <input
                type="text"
                placeholder="해당 란에 작성하십시오"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                className="h-9 px-3 text-[12px] border border-gray-300 rounded-md text-gray-700 placeholder-gray-300 focus:outline-none focus:border-[#91D148]"
              />
            </div>
          </div>

          {/* 검색 버튼 */}
          <div className="flex justify-end">
            <button
              onClick={handleSearch}
              disabled={isDateRangeInvalid}
              className={`px-10 py-2 rounded-md font-bold text-[13px] transition-colors shadow-sm ${
                isDateRangeInvalid
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-[#C8E6A5] text-[#4d7222] hover:bg-[#b8dd8d]"
              }`}
            >
              검색
            </button>
          </div>
        </div>

        {/* 결과 테이블 */}
        <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-0">
          <div className="overflow-auto flex-1">
            <table className="w-full text-[13px] border-collapse">
              <thead className="bg-[#F4F9ED] sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-600 border-b border-gray-200 w-[110px]">날짜</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600 border-b border-gray-200">회의명</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600 border-b border-gray-200 w-[150px]">프로젝트명</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600 border-b border-gray-200">안건</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-600 border-b border-gray-200 w-[200px]">키워드</th>
                </tr>
              </thead>
              <tbody>
                {pagedResults.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-20 text-gray-400 text-[13px] font-bold">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  pagedResults.map((meeting, idx) => (
                    <tr
                      key={meeting.id}
                      onClick={() => setSelectedMeeting(meeting)}
                      className={`border-b border-gray-100 hover:bg-[#F4F9ED]/60 transition-colors cursor-pointer select-none ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{meeting.date}</td>
                      <td className="px-4 py-3 font-bold text-gray-800">{meeting.title}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: meeting.projectColor }}
                          />
                          <span className="text-gray-600">{meeting.projectName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{meeting.agenda}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {meeting.keywords.map((k) => (
                            <span
                              key={k}
                              className="inline-block px-2 py-0.5 bg-[#C8E6A5]/60 text-[#4d7222] rounded-full text-[11px] font-bold"
                            >
                              {k}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 안내 문구 */}
        <p className="text-center text-[11px] text-gray-300 mt-2 shrink-0">
          행을 클릭하면 회의 상세 내용을 볼 수 있습니다
        </p>

        {/* 페이지네이션 */}
        {results.length > 0 && (
          <div className="flex justify-center items-center gap-1 mt-3 shrink-0">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-[#F4F9ED] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[13px] font-bold"
            >
              ‹
            </button>
            {getPageNumbers().map((p, i) =>
              p === "..." ? (
                <span
                  key={`dots-${i}`}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 text-[13px]"
                >
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => setCurrentPage(Number(p))}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-[13px] font-bold transition-colors border ${
                    currentPage === p
                      ? "bg-[#91D148] text-white border-[#91D148] shadow-sm"
                      : "border-gray-200 text-gray-600 hover:bg-[#F4F9ED]"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-[#F4F9ED] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-[13px] font-bold"
            >
              ›
            </button>
          </div>
        )}

      </div>
    </>
  );
};

export default MeetingHistory;