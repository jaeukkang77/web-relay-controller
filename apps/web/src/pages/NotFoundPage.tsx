import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-3 bg-canvas">
      <p className="text-[64px] font-extrabold text-ink-3 leading-none">404</p>
      <p className="text-[17px] font-semibold text-ink">페이지를 찾을 수 없습니다.</p>
      <p className="text-[15px] text-ink-2">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
      <Link
        to="/"
        className="mt-2 text-[15px] font-medium text-primary hover:text-primary-dark transition-colors"
      >
        홈으로 돌아가기
      </Link>
    </div>
  )
}
