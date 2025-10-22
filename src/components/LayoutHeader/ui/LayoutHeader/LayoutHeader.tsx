import { FC } from "react";
import { useAuth } from "@/contexts/useAuth";

const LayoutHeader: FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-10 border-b border-base-300 bg-base-100 shadow-sm">
      <nav className="navbar min-h-[3rem] px-2 sm:min-h-[4rem] sm:px-4">
        <div className="flex-none lg:hidden">
          <label htmlFor="sidebar-drawer" className="btn btn-ghost btn-square btn-sm sm:btn-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block h-5 w-5 stroke-current sm:h-6 sm:w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </label>
        </div>
        <div className="flex-1">
          <a className="btn btn-ghost text-base normal-case sm:text-xl">
            <span className="hidden sm:inline">Sistema SYNC</span>
            <span className="sm:hidden">SYNC</span>
          </a>
        </div>
        <div className="flex-none gap-1 sm:gap-2">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle btn-sm avatar placeholder sm:btn-md">
              <div className="w-8 rounded-full bg-neutral text-neutral-content sm:w-10">
                <span className="text-xs sm:text-base">{user ? getUserInitials(user.name) : 'U'}</span>
              </div>
            </label>
            <ul
              tabIndex={0}
              className="menu dropdown-content menu-sm z-[1] mt-3 w-48 rounded-box bg-base-100 p-2 shadow sm:w-52"
            >
              <li className="menu-title">
                <span className="truncate text-xs sm:text-sm">{user?.name || 'Usuário'}</span>
                <span className="truncate text-[10px] opacity-60 sm:text-xs">{user?.email}</span>
              </li>
              {/* <li>
                <a>Perfil</a>
              </li>
              <li>
                <a>Configurações</a>
              </li> */}
              <li>
                <button onClick={handleLogout} className="text-error text-xs sm:text-sm">
                  Sair
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default LayoutHeader;
