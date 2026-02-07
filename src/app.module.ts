import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseService } from './core/firebase/firebase.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { StudiesModule } from './modules/Studies/studies.module';
import { DriveModule } from './modules/drive/drive.module';
import { ProjectsModule } from './modules/projects/projects.module';

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}), UsersModule, AuthModule, StudiesModule, DriveModule, ProjectsModule],
  providers: [FirebaseService]
})
export class AppModule {
  constructor() {}
}