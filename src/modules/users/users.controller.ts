import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  NotFoundException,
  BadRequestException,
  Param,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  // ✅ Create a new user
  @Post('/create')
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.userService.createUser(createUserDto);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  // 🔍 Get all users (optionally with filters)
  @Post('/getUsers')
  async getAllUsers(@Body() body: any) {
    return this.userService.getAllUsers(body);
  }

  // 🔍 Get user by ID
  @Post('/getUser')
  async getUserById(@Body() body: any) {
    const user = await this.userService.getUserByEmail(body.email);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ✏️ Update user by ID
  @Put('/updateUser')
  async updateUser(@Body() updateData: any) {
    return this.userService.updateUser(updateData);
  }

  // 🗑️ Delete user by ID
  @Delete('/deleteUser')
  async deleteUser(@Body() body: any) {
    return this.userService.deleteUser(body.email);
  }


  @Delete('/deleteUser/All')
  async deleteAllUser(@Body() body: any) {
    return this.userService.deleteAllUsers();
  }


  @Post(':id/vacation-request')
  async vacationRequest(
    @Param('id') userId: string,
    @Body() body: { days: string[]; type: string; reason: string },
  ) {
    return this.userService.requestVacation(userId, body);
  }

  @Post(':id/events')
  async createEvent(
    @Param('id') userId: string,
    @Body() body: { name: string; date: string; description: string },
  ) {
    return this.userService.createEvent(userId, body);
  }

  @Get(':id/events')
  async getEvents(@Param('id') userId: string) {
    return this.userService.getEvents(userId);
  }

  @Patch(':id/events/:eventId')
  async updateEvent(
    @Param('id') userId: string,
    @Param('eventId') eventId: string,
    @Body() body: { name?: string; date?: string; action?: string },
  ) {
    return this.userService.updateEvent(userId, eventId, body);
  }

  @Delete(':id/events/:eventId')
  async deleteEvent(@Param('id') userId: string, @Param('eventId') eventId: string) {
    return this.userService.deleteEvent(userId, eventId);
  }

  @Post('calculateAbsences')
  async calculateAbsences(@Body() body: any) {
    console.log("🚀 ~ UsersController ~ calculateAbsences ~ body:", body)
    return this.userService.getAbsences(body.userId, body.userEmail, body.startDate, body.endDate);
  } 

  
}

