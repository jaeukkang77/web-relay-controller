import { Navigate, Outlet } from 'react-router'

interface AdminRouteProps {
  isAdmin: boolean
  redirectTo?: string
}

/**
 * admin 역할만 접근 가능.
 * 권한 없을 시 /regions 으로 redirect.
 */
export default function AdminRoute({
  isAdmin,
  redirectTo = '/regions',
}: AdminRouteProps) {
  if (!isAdmin) {
    return <Navigate to={redirectTo} replace />
  }
  return <Outlet />
}
