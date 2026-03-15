import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 도메인 에러 코드를 포함하는 커스텀 예외 클래스.
 * 컨트롤러/서비스에서 명시적 에러 코드가 필요할 때 사용한다.
 *
 * @example
 * throw new AppException('DUPLICATE_ID', '이미 사용 중인 아이디입니다.', HttpStatus.CONFLICT);
 */
export class AppException extends HttpException {
  constructor(
    public readonly code: string,
    message: string,
    status: HttpStatus,
  ) {
    super({ code, message }, status);
  }
}
