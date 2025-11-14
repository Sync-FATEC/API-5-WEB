import { FC } from "react";
import { NavLink } from "react-router-dom";
export const Sidebar: FC = () => {
  const navItems = [
    // { path: "/dashboard", label: "Dashboard" },
    { path: "/users", label: "Usuários" },
    { path: "/suppliers", label: "Fornecedores" },
    { path: "/stocks", label: "Estoques" },
    { path: "/commitment-notes", label: "Notas de Empenho" },
    // { path: "/invoices", label: "Notas Fiscais" },
  ];
  return (
    <aside className="drawer-side z-40 lg:!h-auto">
      <label htmlFor="sidebar-drawer" className="drawer-overlay"></label>
      <div className="min-h-full w-64 bg-primary text-primary-content sm:w-72">
        <div className="px-4 py-6">
          <h2 className="text-2xl font-bold">SYNC</h2>
        </div>
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-300 ease-in-out ${
                    isActive
                      ? "bg-primary-content text-primary shadow-lg font-semibold"
                      : "hover:bg-primary-focus hover:text-primary-content hover:scale-105 hover:shadow-md text-primary-content"
                  }`
                }
              >
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
