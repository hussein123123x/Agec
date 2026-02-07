import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { FirebaseModule } from 'src/core/firebase/firebase.module';
import { UsersHelperService } from './users.helper.service';

@Module({
    imports: [FirebaseModule],
    controllers: [UsersController],
    providers: [UsersService, UsersHelperService],
    exports: [UsersService],
})
export class UsersModule {}
