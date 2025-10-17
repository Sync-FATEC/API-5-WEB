import { FC } from "react";
import { NavLink } from "react-router-dom";

export const Sidebar: FC = () => {
  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/users", label: "Usuários", icon: "👥" },
    { path: "/invoices", label: "Notas Fiscais", icon: "📄" },
  ];

  return (
    <aside className="drawer-side">
      <label htmlFor="sidebar-drawer" className="drawer-overlay"></label>
      <div className="min-h-full w-72 bg-primary text-primary-content">
        <div className="px-4 py-6">
          <h2 className="text-2xl font-bold">SYNC</h2>
          <p className="opacity-80">Almoxarifado</p>
        </div>
        <ul className="menu space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                    isActive ? "bg-primary-content text-primary" : "hover:bg-primary/20"
                  }`
                }
              >
                <span className="text-2xl">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
