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
      <nav className="navbar">
        <div className="flex-none lg:hidden">
          <label htmlFor="sidebar-drawer" className="btn btn-ghost btn-square">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="inline-block h-6 w-6 stroke-current"
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
          <a className="btn btn-ghost text-xl normal-case">Sistema SYNC</a>
        </div>
        <div className="flex-none gap-2">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
              <div className="w-10 rounded-full bg-neutral text-neutral-content">
                <span>{user ? getUserInitials(user.name) : 'U'}</span>
              </div>
            </label>
            <ul
              tabIndex={0}
              className="menu dropdown-content menu-sm z-[1] mt-3 w-52 rounded-box bg-base-100 p-2 shadow"
            >
              <li className="menu-title">
                <span>{user?.name || 'Usuário'}</span>
                <span className="text-xs opacity-60">{user?.email}</span>
              </li>
              <li>
                <a>Perfil</a>
              </li>
              <li>
                <a>Configurações</a>
              </li>
              <li>
                <button onClick={handleLogout} className="text-error">
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
