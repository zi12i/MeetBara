import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";
import { useSidebar } from "../context/SidebarContext";

// 상단 및 하단 메뉴용 SVG 아이콘들
const PlayIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>;
const EditIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const CalendarIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const DocumentIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const ServerIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>;
const SettingsIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
const HardHatIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 18h20"></path><path d="M19 18v-6a7 7 0 0 0-14 0v6"></path><path d="M12 4v5"></path><path d="M9 13h6"></path></svg>;
const ChevronDownIcon = ({ className }: { className?: string }) => <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;

type NavItem = {
  name: string;
  icon?: React.ReactNode;
  path?: string;
  borderColor?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const topFixedItems: NavItem[] = [
  { name: "빠른 회의 시작", path: "/meeting/quick/live", icon: <PlayIcon />, borderColor: "#91D148" },
  { name: "회의 시작", path: "/meeting-start", icon: <PlayIcon />, borderColor: "#91D148" },
  { name: "회의 등록", path: "/meeting-register", icon: <EditIcon />, borderColor: "#CAE7A7" },
  { name: "회의 일정", path: "/meeting-schedule", icon: <CalendarIcon />, borderColor: "#E2F3CA" },
];

const navItems: NavItem[] = [
  {
    icon: <DocumentIcon />,
    name: "회의 진행",
    subItems: [
      { 
        name: "실시간 회의 화면", 
        // 정석 경로인 /meeting/:id/live 형식에 맞춰 임시 ID '1' 부여
        path: "/meeting/1/live", 
        pro: false 
      }, 
      { name: "회의 요약본", path: "/meeting-records", pro: false },
    ],
  },
  {
    icon: <ServerIcon />,
    name: "회의 관리",
    subItems: [
      { name: "진행 현황", path: "/status", pro: false },
      { name: "히스토리", path: "/history", pro: false },
      { name: "회의 일정 관리", path: "/calendar", pro: false },
      { name: "회의 개설", path: "/room-reservation", pro: false },
      { name: "지식 관리", path: "/wiki", pro: false },
    ],
  },
  {
    icon: <SettingsIcon />,
    name: "설정",
    subItems: [
      { name: "내 정보 / 계정 연동", path: "/profile", pro: false },
      { name: "일반 / 템플릿 설정", path: "/template-settings", pro: false },
      { name: "팀 위키", path: "/wiki", pro: false },
      { name: "워크스페이스", path: "/workspace", pro: false },
      { name: "액션플랜", path: "/action-plan", pro: false },
    ],
  },
  {
    name: "관리자 설정 메뉴",
    icon: <HardHatIcon />,
    subItems: [
      { name: "조직 관리", path: "/basic-tables", pro: false },
      { name: "유저 관리", path: "/data-tables", pro: false },
      { name: "리포트 관리", path: "/editable-tables", pro: false },
    ],
  },
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{ type: "main" | "others"; index: number; } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  
  const [hoveredMenu, setHoveredMenu] = useState<{ index: number, title: string, items: any[], top: number } | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isActive = useCallback((path: string) => {
    if (location.pathname === "/" && path === "/meeting-start") {
      return true;
    }
    return location.pathname === path;
  }, [location.pathname]);

  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({ type: "main", index });
            submenuMatched = true;
          }
        });
      }
    });
    if (!submenuMatched) setOpenSubmenu(null);
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu && prevOpenSubmenu.type === "main" && prevOpenSubmenu.index === index) {
        return null;
      }
      return { type: "main", index };
    });
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLLIElement>, index: number, nav: NavItem) => {
    if (isExpanded || isMobileOpen || !nav.subItems) return;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredMenu({ index, title: nav.name, items: nav.subItems, top: rect.top });
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMenu(null);
    }, 150);
  };

  const renderTopFixedItems = (items: NavItem[]) => (
    <ul className="flex flex-col">
      {items.map((nav) => {
        const active = isActive(nav.path);
        return (
          <li key={nav.name}>
            {nav.path && (
              <Link
                to={nav.path}
                className={`flex items-center transition-colors duration-200 top-menu-item ${
                  isExpanded || isMobileOpen
                    ? "w-full py-4 pr-5 border-b border-gray-100"
                    : "justify-center w-full py-4 border-b border-gray-100"
                }`}
                style={{
                  backgroundColor: active ? "#EEF5E5" : "transparent",
                  borderLeft: `4px solid ${nav.borderColor}`,
                  color: active ? "#111827" : "#6B7280"
                }}
              >
                {isExpanded || isMobileOpen ? (
                  <span className={`ml-5 text-[15px] ${active ? "font-semibold text-gray-900" : "text-gray-700"}`}>
                    {nav.name}
                  </span>
                ) : (
                  <span className={`flex items-center justify-center w-6 h-6 ${active ? "text-gray-800" : "text-gray-500"}`}>
                    {nav.icon}
                  </span>
                )}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );

  const renderAccordionItems = (items: NavItem[]) => (
    <ul className="flex flex-col">
      {items.map((nav, index) => {
        const isMenuOpen = openSubmenu?.type === "main" && openSubmenu?.index === index;
        return (
          <li
            key={nav.name}
            onMouseEnter={(e) => handleMouseEnter(e, index, nav)}
            onMouseLeave={handleMouseLeave}
            className="flex flex-col"
            style={{
              backgroundColor: isMenuOpen && (isExpanded || isMobileOpen) ? "#EEF5E5" : "transparent",
              borderLeft: isMenuOpen && (isExpanded || isMobileOpen) ? "4px solid #91D148" : "4px solid transparent"
            }}
          >
            <button
              onClick={() => {
                if (!isExpanded && !isMobileOpen) {
                  toggleSidebar();
                }
                handleSubmenuToggle(index);
              }}
              // 👉 화살표 끝 정렬을 위해 justify-between 추가
              className={`flex items-center justify-between w-full py-3 cursor-pointer transition-colors ${
                isMenuOpen ? "text-gray-900" : "text-gray-600 hover:bg-gray-50"
              } ${isExpanded || isMobileOpen ? "px-5" : "justify-center"}`}
            >
              {/* 아이콘과 텍스트를 하나로 묶어서 좌측 정렬 */}
              <div className="flex items-center">
                <span className={`flex-shrink-0 ${isMenuOpen ? "text-[#91d148]" : "text-gray-400 group-hover:text-gray-600"}`}>
                  {nav.icon}
                </span>
                {(isExpanded || isMobileOpen) && (
                  <span className={`ml-3 text-[15px] whitespace-nowrap ${nav.name === "관리자 설정 메뉴" ? "text-[#91d148] font-medium" : ""}`}>
                    {nav.name}
                  </span>
                )}
              </div>

              {/* 👉 화살표는 알아서 우측 끝으로 밀려납니다 */}
              {(isExpanded || isMobileOpen) && (
                <ChevronDownIcon
                  className={`w-5 h-5 transition-transform duration-200 ${isMenuOpen ? "rotate-180 text-gray-500" : "text-gray-400"}`}
                />
              )}
            </button>

            {(isExpanded || isMobileOpen) && nav.subItems && (
              <div
                ref={(el) => { subMenuRefs.current[`main-${index}`] = el; }}
                className="overflow-hidden transition-all duration-300 px-5"
                style={{ height: isMenuOpen ? `${subMenuHeight[`main-${index}`]}px` : "0px" }}
              >
                <ul className="mt-1 pb-3 space-y-2 ml-7">
                  {nav.subItems.map((subItem) => (
                    <li key={subItem.name}>
                      <Link
                        to={subItem.path}
                        className={`block text-[14px] transition-colors ${
                          isActive(subItem.path) ? "text-[#91d148] font-medium" : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        • {subItem.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      <style>{`
        .top-menu-item:hover {
          background-color: #EEF5E5 !important;
        }
      `}</style>

      <aside
        className={`fixed mt-16 flex flex-col lg:mt-0 top-0 left-0 bg-white dark:bg-gray-900 text-gray-900 h-screen transition-all duration-300 ease-in-out z-40 border-r border-gray-200 
          ${isExpanded || isMobileOpen ? "w-[240px]" : "w-[90px]"} 
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0`}
      >
        <div className="flex flex-col pt-6 pb-4 px-5 border-b border-gray-100 dark:border-gray-800">
          <Link to="/" className={`flex ${isExpanded || isMobileOpen ? "justify-start" : "justify-center"}`}>
            {isExpanded || isMobileOpen ? (
              <img src="/images/logo/logo.svg" alt="회의바라 Logo" className="h-15 w-auto" />
            ) : (
              <img src="/images/logo/logo-icon.svg" alt="Logo" className="h-10 w-10" />
            )}
          </Link>
          
          <div className={`mt-4 flex ${isExpanded || isMobileOpen ? "justify-end" : "justify-center"}`}>
            <button
              onClick={() => {
                if (window.innerWidth >= 1024) toggleSidebar();
                else toggleMobileSidebar();
              }}
              // 👉 핵심 수정: bg-gray-50/80 제거, bg-transparent 및 hover:bg-[#EEF5E5] 적용
              className="flex items-center justify-center w-10 h-10 text-gray-500 bg-transparent rounded-lg hover:bg-[#EEF5E5] dark:hover:bg-gray-800 transition-colors"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <div className="flex flex-col flex-grow overflow-y-auto duration-300 ease-linear no-scrollbar">
          <nav className="mb-6 flex-grow flex flex-col">
            <div>
              {renderTopFixedItems(topFixedItems)}
            </div>
            <div className="px-5 mt-10 mb-4">
              <hr className="border-gray-200 dark:border-gray-800" />
            </div>
            <div className="flex-grow">
              {renderAccordionItems(navItems)}
            </div>
          </nav>

          {(isExpanded || isMobileOpen) && (
            <div className="px-5 py-8 mt-auto text-sm text-gray-400">
              <hr className="mb-6 border-gray-200 dark:border-gray-800" />
              <ul className="mb-6 space-y-3">
                <li><Link to="/policy" className="hover:text-gray-600 transition-colors">• 서비스 이용 정책</Link></li>
                <li><Link to="/privacy" className="hover:text-gray-600 transition-colors">• 개인정보처리방침</Link></li>
              </ul>
              <div className="space-y-1.5 text-xs text-gray-400 font-light tracking-tight">
                <p>주식회사 카피바라</p>
                <p>대표자 Junho-Seong</p>
                <p>사업자 등록번호 616-81-90947</p>
                <p>제주시 첨단로 213-3 613호</p>
                <p>대표 메일 barabara@bara.co.kr</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {hoveredMenu && !(isExpanded || isMobileOpen) && (
        <div
          className="fixed left-[90px] w-[200px] bg-white border border-gray-200 shadow-lg z-50 rounded-r-lg"
          style={{ top: `${hoveredMenu.top}px` }}
          onMouseEnter={() => { if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current); }}
          onMouseLeave={handleMouseLeave}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-[14px] font-semibold text-gray-800">{hoveredMenu.title}</span>
          </div>
          <ul className="py-2 flex flex-col">
            {hoveredMenu.items.map((subItem) => (
              <li key={subItem.name}>
                <Link
                  to={subItem.path}
                  className={`block px-4 py-2 text-[13px] ${
                    isActive(subItem.path) ? "text-[#91d148] bg-gray-50/50" : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  • {subItem.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};

export default AppSidebar;