import { FC } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "@/app/Layout";
import { Home, NoMatch, Dashboard, Users, Invoices } from "@/pages";

const App: FC = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="*" element={<NoMatch />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
