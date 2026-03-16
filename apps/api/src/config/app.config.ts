import { ConfigModuleOptions } from '@nestjs/config';
import { validateEnv } from './env.schema';

export const appConfigOptions: ConfigModuleOptions = {
  isGlobal: true,
  validate: validateEnv,
  // .env 파일 경로 (monorepo root 기준 실행 시 apps/api/.env)
  envFilePath: ['.env', '.env.local', 'apps/api/.env'],
  cache: true,
};
