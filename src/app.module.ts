import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { FirebaseService } from './firebase/firebase.service';

@Module({
  imports: [ConfigModule.forRoot(), UsersModule],
  providers: [FirebaseService]
})
export class AppModule {
  constructor() {}
}