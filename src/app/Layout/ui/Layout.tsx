import { FC } from "react";
import { LayoutFooter, LayoutHeader, Sidebar } from "@/components";
import { Outlet } from "react-router-dom";

const Layout: FC = () => {
  return (
    <div className="drawer lg:drawer-open">
      <input id="sidebar-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col min-h-screen">
        <LayoutHeader />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
        <LayoutFooter />
      </div>
      <Sidebar />
    </div>
  );
};

export default Layout;
