import { Navigate, Outlet } from 'react-router'

interface ProtectedRouteProps {
  isAuthenticated: boolean
  redirectTo?: string
}

/**
 * 인증된 사용자만 접근 가능.
 * 미인증 시 /login 으로 redirect.
 */
export default function ProtectedRoute({
  isAuthenticated,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }
  return <Outlet />
}
