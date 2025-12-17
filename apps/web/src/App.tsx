import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthProvider";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardPage from "./pages/DashboardPage";

function HomeRedirect() {
  const { state } = useAuth();

  if (state.status === "loading") return <div>Loading...</div>;
  if (state.status === "guest") return <Navigate to="/login" replace />;

  // authed:
  return state.me.onboardingCompleted
    ? <Navigate to="/dashboard" replace />
    : <Navigate to="/onboarding" replace />;
}

function Protected({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();
  if (state.status === "loading") return <div>Loading...</div>;
  if (state.status === "guest") return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/onboarding"
        element={
          <Protected>
            <OnboardingPage />
          </Protected>
        }
      />

      <Route
        path="/dashboard"
        element={
          <Protected>
            <DashboardPage />
          </Protected>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
