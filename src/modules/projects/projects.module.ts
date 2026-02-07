import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { FirebaseModule } from 'src/core/firebase/firebase.module';
import { ProjectsService } from './projects.service';

@Module({
  imports: [FirebaseModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
