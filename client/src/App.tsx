import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth } from './lib/auth';
import { SignIn } from './pages/SignIn';
import { CreateTrip } from './pages/CreateTrip';
import { Dashboard } from './pages/Dashboard';
import { AddActivity } from './pages/AddActivity';
import { Summary } from './pages/Summary';
import { MyCosts } from './pages/MyCosts';

function OrganizerRoute({ children }: { children: React.ReactNode }) {
  const auth = getAuth();
  if (!auth) return <Navigate to="/" replace />;
  if (!auth.isOrganizer) return <Navigate to="/me" replace />;
  return <>{children}</>;
}

function MemberRoute({ children }: { children: React.ReactNode }) {
  const auth = getAuth();
  if (!auth) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/trip/new" element={<CreateTrip />} />
        <Route path="/trip" element={<OrganizerRoute><Dashboard /></OrganizerRoute>} />
        <Route path="/trip/activity/new" element={<OrganizerRoute><AddActivity /></OrganizerRoute>} />
        <Route path="/trip/activity/:id/edit" element={<OrganizerRoute><AddActivity /></OrganizerRoute>} />
        <Route path="/trip/summary" element={<OrganizerRoute><Summary /></OrganizerRoute>} />
        <Route path="/me" element={<MemberRoute><MyCosts /></MemberRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
