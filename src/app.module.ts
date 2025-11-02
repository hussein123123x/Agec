import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseService } from './core/firebase/firebase.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}), UsersModule, AuthModule],
  providers: [FirebaseService]
})
export class AppModule {
  constructor() {}
}