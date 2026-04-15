import { useState } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { Link } from "react-router";

// 👉 사람 모양 아이콘 SVG 컴포넌트
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        // 시안 디자인: 네모난 테두리, 그림자, 패딩 적용 [cite: 322]
        className="flex items-center gap-3 px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors dark:bg-gray-900 dark:border-gray-800"
      >
        {/* 1. 이미지 대신 사람 아이콘 배치 [cite: 323] */}
        <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 bg-gray-100 rounded dark:bg-gray-800">
          <UserIcon />
        </span>

        {/* 2. 사용자 정보 텍스트 [cite: 324] */}
        <span className="block text-[13px] font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
          김효겸 / 부장 / 프로젝트 관리팀
        </span>

        {/* 3. 우측 쉐브론 화살표 아이콘 [cite: 325] */}
        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* 드롭다운 메뉴 영역 */}
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute right-0 mt-2 flex w-[240px] flex-col rounded-xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <div className="px-3 py-2">
          <span className="block font-semibold text-gray-800 text-theme-sm dark:text-white">
            김효겸 부장
          </span>
          <span className="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
            hyogyeom.kim@barabara.co.kr
          </span>
        </div>

        <ul className="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              tag="a"
              to="/profile"
              className="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
            >
              내 정보 관리
            </DropdownItem>
          </li>
        </ul>
        <Link
          to="/signin"
          className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-red-500 rounded-lg group text-theme-sm hover:bg-red-50 dark:hover:bg-red-500/10"
        >
          로그아웃
        </Link>
      </Dropdown>
    </div>
  );
}