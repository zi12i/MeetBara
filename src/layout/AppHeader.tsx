import React from "react";
import UserDropdown from "../components/header/UserDropdown";

const AppHeader: React.FC = () => {
  return (
    // 👉 border-b 및 border-gray-200 클래스를 삭제하여 경계선을 없앴습니다.
    <header className="sticky top-0 flex w-full bg-white z-30 dark:bg-gray-900">
      <div className="flex items-center justify-end w-full h-16 px-4 md:px-6 2xl:px-10">
        
        <div className="flex items-center gap-3">
          <UserDropdown />
        </div>

      </div>
    </header>
  );
};

export default AppHeader;