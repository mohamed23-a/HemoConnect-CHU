import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import PrivateRoute from "./components/Common/PrivateRoute";
import { PageLoader } from "./components/Common/LoadingSpinner";
import { pageTransition } from "./animations/variants";

// Lazy load pages
const Login = lazy(() => import("./pages/Auth/Login"));
const AdminDashboard = lazy(() => import("./pages/Dashboard/AdminDashboard"));
const HospitalDashboard = lazy(
  () => import("./pages/Dashboard/HospitalDashboard"),
);
const BloodCenterDashboard = lazy(
  () => import("./pages/Dashboard/BloodCenterDashboard"),
);
const DemandesList = lazy(() => import("./pages/Demandes/DemandesList"));
const CreateDemande = lazy(() => import("./pages/Demandes/CreateDemande"));
const DemandeDetails = lazy(() => import("./pages/Demandes/DemandeDetails"));
const StockManagement = lazy(() => import("./pages/Stock/StockManagement"));
const UserManagement = lazy(() => import("./pages/Users/UserManagement"));
const Historique = lazy(() => import("./pages/Historique/Historique"));
const Statistiques = lazy(() => import("./pages/Statistiques/Statistiques"));

// Animated page wrapper
const AnimatedPage = ({ children }) => {
  const location = useLocation();
  return (
    <motion.div
      key={location.pathname}
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {children}
    </motion.div>
  );
};

// Dashboard Router Component
const DashboardRouter = () => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case "admin":
      return (
        <AnimatedPage>
          <AdminDashboard />
        </AnimatedPage>
      );
    case "hospital":
      return (
        <AnimatedPage>
          <HospitalDashboard />
        </AnimatedPage>
      );
    case "blood_center":
      return (
        <AnimatedPage>
          <BloodCenterDashboard />
        </AnimatedPage>
      );
    default:
      return (
        <AnimatedPage>
          <HospitalDashboard />
        </AnimatedPage>
      );
  }
};

// AnimatePresence-aware Routes
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route
          path="/login"
          element={
            <Suspense fallback={<PageLoader />}>
              <AnimatedPage>
                <Login />
              </AnimatedPage>
            </Suspense>
          }
        />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Suspense fallback={<PageLoader />}>
                <DashboardRouter />
              </Suspense>
            </PrivateRoute>
          }
        />

        <Route
          path="/demandes"
          element={
            <PrivateRoute>
              <Suspense fallback={<PageLoader />}>
                <AnimatedPage>
                  <DemandesList />
                </AnimatedPage>
              </Suspense>
            </PrivateRoute>
          }
        />

        <Route
          path="/demandes/create"
          element={
            <PrivateRoute allowedRoles={["hospital"]}>
              <Suspense fallback={<PageLoader />}>
                <AnimatedPage>
                  <CreateDemande />
                </AnimatedPage>
              </Suspense>
            </PrivateRoute>
          }
        />

        <Route
          path="/demandes/edit/:id"
          element={
            <PrivateRoute allowedRoles={["hospital"]}>
              <Suspense fallback={<PageLoader />}>
                <AnimatedPage>
                  <CreateDemande />
                </AnimatedPage>
              </Suspense>
            </PrivateRoute>
          }
        />

        <Route
          path="/demandes/:id"
          element={
            <PrivateRoute>
              <Suspense fallback={<PageLoader />}>
                <AnimatedPage>
                  <DemandeDetails />
                </AnimatedPage>
              </Suspense>
            </PrivateRoute>
          }
        />

        <Route
          path="/stock"
          element={
            <PrivateRoute allowedRoles={["blood_center", "admin"]}>
              <Suspense fallback={<PageLoader />}>
                <AnimatedPage>
                  <StockManagement />
                </AnimatedPage>
              </Suspense>
            </PrivateRoute>
          }
        />

        <Route
          path="/users"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Suspense fallback={<PageLoader />}>
                <AnimatedPage>
                  <UserManagement />
                </AnimatedPage>
              </Suspense>
            </PrivateRoute>
          }
        />

        <Route
          path="/historique"
          element={
            <PrivateRoute>
              <Suspense fallback={<PageLoader />}>
                <AnimatedPage>
                  <Historique />
                </AnimatedPage>
              </Suspense>
            </PrivateRoute>
          }
        />

        <Route
          path="/statistiques"
          element={
            <PrivateRoute allowedRoles={["admin"]}>
              <Suspense fallback={<PageLoader />}>
                <AnimatedPage>
                  <Statistiques />
                </AnimatedPage>
              </Suspense>
            </PrivateRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Toaster
            position="top-left"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 4000,
              style: {
                background: "#fff",
                color: "#1e293b",
                borderRadius: "12px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
                fontSize: "14px",
                padding: "12px 16px",
                fontFamily: "Inter, sans-serif",
                border: "1px solid #f1f5f9",
              },
              success: {
                duration: 3000,
                iconTheme: { primary: "#10b981", secondary: "#fff" },
                style: { borderLeft: "4px solid #10b981" },
              },
              error: {
                duration: 5000,
                iconTheme: { primary: "#ef4444", secondary: "#fff" },
                style: { borderLeft: "4px solid #ef4444" },
              },
            }}
          />
          <AnimatedRoutes />
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;
