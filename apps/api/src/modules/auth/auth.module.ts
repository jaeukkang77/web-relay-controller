import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { jwtModuleOptions } from '../../config/jwt.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthAttemptService } from './auth-attempt.service';
import { AuthTokensService } from './auth-tokens.service';
import { AuthRepository } from './auth.repository';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync(jwtModuleOptions),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthAttemptService,
    AuthTokensService,
    AuthRepository,
    JwtStrategy,
  ],
  exports: [AuthService, AuthRepository],
})
export class AuthModule {}
