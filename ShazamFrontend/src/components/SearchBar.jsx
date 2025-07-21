import React, { useState } from "react";

const SearchBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative">
      <div 
        className={`flex items-center bg-white/10 backdrop-blur-sm rounded-full transition-all duration-300 ease-in-out ${
          isExpanded ? 'w-[300px] pr-4' : 'w-10 cursor-pointer'
        }`}
        onClick={() => !isExpanded && setIsExpanded(true)}
      >
        <button 
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          onClick={() => isExpanded && setIsExpanded(false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
        <input
          type="text"
          placeholder="Search..."
          className={`bg-transparent outline-none text-white w-full py-2 pl-2 ${
            isExpanded ? 'opacity-100' : 'opacity-0 w-0 p-0'
          } transition-all duration-300`}
          onBlur={() => setIsExpanded(false)}
        />
      </div>
    </div>
  );
};

export default SearchBar; 