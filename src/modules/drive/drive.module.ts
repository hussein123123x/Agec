import { Module } from '@nestjs/common';
import { FirebaseModule } from 'src/core/firebase/firebase.module';
import { GoogleOauthController } from './drive.controller';
import { DriveService } from './drive.service';

@Module({
  imports: [FirebaseModule],
  controllers: [GoogleOauthController],
  providers: [DriveService],
  exports: [DriveService],
})
export class DriveModule {}
