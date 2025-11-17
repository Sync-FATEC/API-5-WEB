import { FC } from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "@/app/Layout";
import { Home, NoMatch, Users, Invoices, Login, Stocks, StockDetails, Suppliers, CommitmentNotes, CommitmentNoteForm, CommitmentNoteDetail, EmailTemplates } from "@/pages";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

const App: FC = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute> <Layout /> </ProtectedRoute>}>
          <Route index element={<Home />} />
          <Route path="users" element={<Users />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="stocks" element={<Stocks />} />
          <Route path="stocks/:id" element={<StockDetails />} />
          <Route path="commitment-notes" element={<CommitmentNotes />} />
          <Route path="commitment-notes/new" element={<CommitmentNoteForm />} />
          <Route path="commitment-notes/:id" element={<CommitmentNoteDetail />} />
          <Route path="commitment-notes/:id/edit" element={<CommitmentNoteForm />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="email-templates" element={<EmailTemplates />} />
          <Route path="*" element={<NoMatch />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
};

export default App;
