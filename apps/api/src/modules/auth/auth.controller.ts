import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService, type MeResult } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { extractIp } from '../../common/utils/ip.util';
import type { AuthUser } from '../../common/types/auth-user.type';
import type { LoginResult, TokenPair } from './types/auth-result.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** 로그인 → Access Token + Refresh Token 발급 */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Req() req: Request, @Body() dto: LoginDto): Promise<LoginResult> {
    return this.authService.login(extractIp(req), dto.id, dto.password);
  }

  /** Access Token 재발급 (Refresh Token Rotation) */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshTokenDto): Promise<TokenPair> {
    return this.authService.refresh(dto.refreshToken);
  }

  /** 로그아웃 → Refresh Token 폐기 */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@CurrentUser() _user: AuthUser, @Body() dto: LogoutDto): Promise<void> {
    return this.authService.logout(dto.refreshToken);
  }

  /** 내 정보 조회 */
  @Get('me')
  me(@CurrentUser() user: AuthUser): Promise<MeResult> {
    return this.authService.me(user.id);
  }
}
