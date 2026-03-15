import { createBrowserRouter, RouterProvider, Navigate } from 'react-router'
import { AuthProvider, useAuth } from './lib/auth/auth-store'

import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import AdminRoute from './components/layout/AdminRoute'

import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import DevicesPage from './pages/DevicesPage'
import RegionsPage from './pages/RegionsPage'
import RegionDetailPage from './pages/RegionDetailPage'
import SchedulesPage from './pages/SchedulesPage'
import UsersPage from './pages/UsersPage'
import NotFoundPage from './pages/NotFoundPage'

// ── AuthRouter: auth 상태를 읽어 라우터를 구성 ───────────────
function AuthRouter() {
  const { isAuthenticated, isAdmin, initialized } = useAuth()

  // 세션 복원 완료 전까지 렌더링 보류 (로그인 화면 깜빡임 방지)
  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <svg className="animate-spin text-primary" width="32" height="32"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round" />
        </svg>
      </div>
    )
  }

  // 로그인 후 기본 랜딩: 대시보드
  const defaultPath = '/dashboard'

  const router = createBrowserRouter([
    // ── Public ────────────────────────────────────────────
    {
      path:    '/login',
      element: isAuthenticated
        ? <Navigate to={defaultPath} replace />
        : <LoginPage />,
    },

    // ── Protected ─────────────────────────────────────────
    {
      element: <ProtectedRoute isAuthenticated={isAuthenticated} />,
      children: [
        {
          element: <AppLayout />,
          children: [
            // / → role 기반 리다이렉트
            { index: true, element: <Navigate to={defaultPath} replace /> },

            // 대시보드 (전체 장치 상태 요약)
            { path: 'dashboard', element: <DashboardPage /> },

            // 장치 (admin: CRUD 관리 / user: 릴레이 제어)
            { path: 'devices', element: <DevicesPage /> },

            // 스케줄 (admin + user 공통)
            { path: 'regions/:regionId/devices/:deviceId/schedules', element: <SchedulesPage /> },

            // 지역 관리 (admin only — AdminRoute로 보호)
            {
              element: <AdminRoute isAdmin={isAdmin} />,
              children: [
                { path: 'regions',            element: <RegionsPage /> },
                { path: 'regions/:regionId',  element: <RegionDetailPage /> },
                { path: 'users',              element: <UsersPage /> },
              ],
            },
          ],
        },
      ],
    },

    // ── 404 ───────────────────────────────────────────────
    { path: '*', element: <NotFoundPage /> },
  ])

  return <RouterProvider router={router} />
}

// ── App ──────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AuthRouter />
    </AuthProvider>
  )
}
