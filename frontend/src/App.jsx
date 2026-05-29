import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import { useEffect, useState} from 'react';
import {useAuth,useUser,AuthenticateWithRedirectCallback,SignedIn, SignedOut, SignIn, SignUp} from '@clerk/clerk-react';
import { Loader2 } from 'lucide-react';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Verify from './pages/Verify';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import DermatologistFinder from './pages/DermatologistFinder';
import MockInbox from './pages/MockInbox';
import NotFound from './pages/NotFound';
import SidebarLayout from './components/SidebarLayout';
import AIInsights from './pages/AIInsights';
import Settings from './pages/Settings';
import ScanDetail from './pages/ScanDetail';
import NewScan from "./pages/NewScan";

// SYNC CLERK AUTH
function SyncClerkAuth({ children }) {
 const {  isLoaded, isSignedIn, getToken} = useAuth();
  const { user } = useUser();
  const [synced, setSynced] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      localStorage.removeItem('token');
      setSynced(true);
      return;
    }
    const syncToken = async () => {
      try {
        const clerkToken =  await getToken();
        if (!clerkToken) {
          throw new Error(
            "Could not retrieve authentication token"
          );
        }
        const email =  user?.primaryEmailAddress?.emailAddress;

        if (!email) {

          throw new Error(
            "No primary email address found"
          );
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/clerk-login`,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json'
            },

            body: JSON.stringify({
              email,
              clerk_token: clerkToken
            }),
          }
        );

        if (!response.ok) {

          const data =
            await response.json();

          throw new Error(
            data.detail ||
            'Failed to synchronize session'
          );
        }

        const data =
          await response.json();

        localStorage.setItem(
          'token',
          data.access_token
        );

        setSynced(true);

      } catch (err) {

        console.error(
          "Auth sync error:",
          err
        );

        setError(err.message);
      }
    };

    syncToken();

  }, [
    isLoaded,
    isSignedIn,
    getToken,
    user
  ]);

  if (
    !isLoaded ||
    (isSignedIn && !synced)
  ) {

    return (

      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0A1628] text-white p-6 relative overflow-hidden">

        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#2D7DD2]/10 rounded-full blur-3xl" />

        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-cyan-500/5 rounded-full blur-3xl" />

        <div className="relative z-10 text-center max-w-sm bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">

          <Loader2 className="animate-spin h-8 w-8 text-[#2D7DD2] mx-auto mb-4" />

          <h3 className="text-sm font-bold uppercase tracking-widest text-slate-200">

            {error
              ? "Sync Failed"
              : "Connecting Session"}

          </h3>

          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-2 leading-relaxed">

            {error
              ? error
              : "Calibrating clinical database access tokens..."}

          </p>

        </div>

      </div>
    );
  }

  return children;
}

// PROTECTED ROUTE
function ProtectedRoute({ children }) {

  return (
    <>
      <SignedIn> {children} </SignedIn>
      <SignedOut> <Navigate  to="/login" replace /> </SignedOut>
    </>
  );
}

// PUBLIC ROUTE
function PublicRoute({ children }) {

  return (
    <>
      <SignedIn>
        <Navigate
          to="/dashboard"
          replace
        />
      </SignedIn>

      <SignedOut>
        {children}
      </SignedOut>
    </>
  );
}

function AppContent() {

  const {
    isSignedIn,
    signOut
  } = useAuth();

  // THEME
  useEffect(() => {

    const savedTheme =
      localStorage.getItem('theme');

    const root =
      window.document.documentElement;

    if (savedTheme === 'dark') {

      root.classList.add('dark');

    } else {

      root.classList.remove('dark');
    }

  }, []);

  // AUTO LOGOUT
  useEffect(() => {

    if (!isSignedIn) return;

    const INACTIVITY_TIMEOUT =
      15 * 60 * 1000;

    let timeoutId;

    const handleLogout = () => {

      console.log(
        "Logging out due to inactivity"
      );

      signOut();
    };

    const resetTimer = () => {

      if (timeoutId)
        clearTimeout(timeoutId);

      timeoutId = setTimeout(
        handleLogout,
        INACTIVITY_TIMEOUT
      );
    };

    const activityEvents = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart'
    ];

    activityEvents.forEach((event) => {

      window.addEventListener(
        event,
        resetTimer
      );
    });

    resetTimer();

    return () => {

      if (timeoutId)
        clearTimeout(timeoutId);

      activityEvents.forEach((event) => {

        window.removeEventListener(
          event,
          resetTimer
        );
      });
    };

  }, [isSignedIn, signOut]);

  return (

    <div className="min-h-screen bg-[#030712] flex flex-col text-slate-100">

      <main className="flex-grow flex flex-col">

        <Routes>

          {/* PUBLIC */}

          <Route  path="/login" element={  <PublicRoute>  <Login />  </PublicRoute> } />

          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />

          <Route
            path="/verify"
            element={
              <PublicRoute>
                <Verify />
              </PublicRoute>
            }
          />

          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />

          <Route
            path="/sso-callback"
            element={
              <AuthenticateWithRedirectCallback />
            }
          />

          {/* CLERK */}

          <Route
            path="/clerk-login"
            element={
              <PublicRoute>
                <div className="min-h-screen flex items-center justify-center bg-[#030712] py-12 px-4">
                  <SignIn
                    appearance={{
                      variables: {
                        colorPrimary:
                          '#2D7DD2'
                      }
                    }}
                  />
                </div>
              </PublicRoute>
            }
          />

          <Route
            path="/clerk-signup"
            element={
              <PublicRoute>
                <div className="min-h-screen flex items-center justify-center bg-[#030712] py-12 px-4">
                  <SignUp
                    appearance={{
                      variables: {
                        colorPrimary:
                          '#2D7DD2'
                      }
                    }}
                  />
                </div>
              </PublicRoute>
            }
          />

          {/* PROTECTED */}

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <SidebarLayout />
              </ProtectedRoute>
            }
          >

            <Route
              path="dashboard"
              element={<Dashboard />}
            />

            <Route
              path="history"
              element={<History />}
            />

            <Route
              path="dermatologists"
              element={<DermatologistFinder />}
            />

            <Route
              path="mock-inbox"
              element={<MockInbox />}
            />

            <Route
              path="insights"
              element={<AIInsights />}
            />

            <Route
              path="settings"
              element={<Settings />}
            />
   <Route path="new-scan" element={<NewScan />}/>
            <Route   path="scan/:id" element={<ScanDetail />}  />

            <Route
              index
              element={
                <Navigate
                  to="/dashboard"
                  replace
                />
              }
            />

          </Route>

          {/* 404 */}

          <Route path="*" element={<NotFound />}   />

        </Routes>

      </main>

    </div>
  );
}

function App() {
  return (
    <Router>
      <SyncClerkAuth>
        <AppContent />
      </SyncClerkAuth>
    </Router>
  );
}

export default App;