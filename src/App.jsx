import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout";
import AdsPage from "./pages/adds";
import AnnouncementDiscount from "./pages/ann-discount";
import AnnouncementTypes from "./pages/announcement";
import AnnouncementsPage from "./pages/announcement-filters";
import AnnFilterDetail from "./pages/announcement-filters-detail";
import AreaPage from "./pages/area";
import LoginPage from "./pages/auth/login";
import CategoryPage from "./pages/categories";
import InnerCategoriesPage from "./pages/inner-category";
import JobTypes from "./pages/job-types";
import Dashboard from "./pages/dashboard";
import Region from "./pages/region";
import UserPage from "./pages/single-user";
import UsersPage from "./pages/users";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import SaveLastPage from "./routes/SaveLastPage";

function App() {
  return (
    <BrowserRouter>
      {/* Har bir sahifada oxirgi page saqlanadi */}
      <SaveLastPage />

      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected */}
        <Route
          path="/"
          element={
            <ProtectedRoutes>
              <Layout />
            </ProtectedRoutes>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="region" element={<Region />} />
          <Route path="region/:regionId" element={<AreaPage />} />
          <Route path="areas" element={<AreaPage />} />
          <Route path="job-types" element={<JobTypes />} />
          <Route path="advertisement" element={<AdsPage />} />
          <Route path="announcement" element={<AnnouncementTypes />} />
          <Route path="announcement/:id" element={<AnnouncementDiscount />} />
          <Route path="categories" element={<CategoryPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="users/:usersId" element={<UserPage />} />
          <Route path="ann-filters" element={<AnnouncementsPage />} />
          <Route path="ann-filters/:id" element={<AnnFilterDetail />} />

          {/* Public */}
          <Route
            path="categories/:categoryId"
            element={<InnerCategoriesPage />}
          />
          <Route path="inner-categories" element={<InnerCategoriesPage />} />
        </Route>

        {/* 404 fallback */}
        <Route
          path="*"
          element={
            <Navigate
              to={localStorage.getItem("lastPath") || "/region"}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
