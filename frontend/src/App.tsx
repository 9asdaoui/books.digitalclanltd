import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AdminLayout } from "./components/layout/AdminLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import AccountPage from "./pages/AccountPage";
import AdminLibrary from "./pages/admin/AdminLibrary";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUpload from "./pages/admin/AdminUpload";
import BookDetailPage from "./pages/BookDetailPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ReaderPage from "./pages/ReaderPage";
import SignupPage from "./pages/SignupPage";
import StorePage from "./pages/StorePage";

function AdminRoutes() {
  return (
    <ProtectedRoute adminOnly>
      <AdminLayout />
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="/books/:bookId" element={<BookDetailPage />} />
        <Route path="/read/:bookId" element={<ReaderPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/admin" element={<AdminRoutes />}>
          <Route index element={<AdminOverview />} />
          <Route path="upload" element={<AdminUpload />} />
          <Route path="library" element={<AdminLibrary />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
