export default function Header({
  userName,
  onLogout,
  sidebarOpen,
  onSidebarToggle,
  tabs,
  activeTab,
  setActiveTab,
  expandedSection,
  setExpandedSection,
}) {
  return (
    <header className="w-full flex flex-row items-center sm:items-stretch justify-between px-4 py-3 sm:px-8 sm:py-5 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 shadow-lg rounded-b-2xl relative">
      {/* Sidebar Toggle Button (mobile only) */}
      {userName && onSidebarToggle && (
        <button
          className="sm:hidden absolute left-4 top-1/2 -translate-y-1/2 bg-indigo-500 text-white p-2 rounded shadow-lg"
          onClick={onSidebarToggle}
          aria-label="Toggle sidebar"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}

      <aside
        className={`
          fixed sm:hidden top-16 left-0 h-[calc(100vh-4rem)] z-20 bg-white/90 shadow-lg rounded-r-2xl p-4 min-w-[180px] max-w-[260px]
          flex-col gap-2 transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          sm:static sm:translate-x-0 sm:flex sm:mt-8 sm:ml-4 sm:h-fit
        `}
      >
        {/* Main Sections */}
        <div className="flex flex-col gap-2 mb-2">
          {tabs.map((section) => (
            <div key={section.key}>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition text-left w-full ${
                  expandedSection === section.key
                    ? "bg-indigo-500 text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-indigo-100"
                }`}
                onClick={() => {
                  setExpandedSection(
                    expandedSection === section.key ? null : section.key
                  );
                  setActiveTab(null);
                }}
              >
                <span>{section.icon}</span>
                <span>{section.label}</span>
                {section.children && section.children.length > 0 ? (
                  <span className="ml-auto">
                    {expandedSection === section.key ? "▲" : "▼"}
                  </span>
                ) : null}
              </button>
              {/* Sub-tabs: only show if this section is expanded */}
              {expandedSection === section.key &&
                section.children &&
                section.children.length > 0 && (
                  <div className="flex flex-col gap-2 pl-4 pt-4">
                    {section?.children?.map((tabItem) => (
                      <button
                        key={tabItem.key}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition text-left ${
                          activeTab === tabItem.key
                            ? "bg-indigo-400 text-white shadow"
                            : "bg-gray-100 text-gray-700 hover:bg-indigo-100"
                        }`}
                        onClick={() => {
                          setActiveTab(tabItem.key);
                        }}
                      >
                        <span>{tabItem.icon}</span>
                        <span>{tabItem.label}</span>
                      </button>
                    ))}
                  </div>
                )}
            </div>
          ))}
        </div>
      </aside>
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-10 sm:hidden"
          onClick={() => onSidebarToggle(false)}
        />
      )}

      {/* App Name & Breadcrumb */}
      <div className="flex flex-col  items-start flex-1 ml-12">
        <div className="flex items-center gap-3 md:text-lg font-bold text-white tracking-wide drop-shadow sm:text-sm xs:text-xs ">
          <span
            role="img"
            aria-label="Money Tracker"
            className="text-2xl sm:text-3xl"
          >
            💰
          </span>
          Money Tracker
        </div>
      </div>

      {/* User Info & Logout */}
      <div className="flex items-center gap-2 sm:gap-4 ">
        {userName && (
          <>
            <span className=" text-white font-medium drop-shadow md:text-lg sm:text-sm xs:text-xs">
              Hello, {userName.split(" ")[0]}!
            </span>
            <button
              onClick={onLogout}
              className="flex items-center gap-1 sm:gap-2 bg-white/20 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-white/40 transition font-semibold shadow text-sm sm:text-base"
              title="Sign out"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1"
                />
              </svg>
              <span className="xs:hidden sm:inline">Logout</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
