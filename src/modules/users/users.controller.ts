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

  
}
/*
Add User Body
{
  "id": "u123456789",
  "fullName": "Murad Mohamed",
  "fullNameArabic": "راضى محمد",
  "gender": "Male",
  "maritalStatus": "Single",
  "nationalId": "29805011234567",

  "phone": "+201234527190",
  "additionalPhone": "+201028765432",
  "address": "123 Nile Street, Giza",
  "city": "Giza",

  "role": "employee",
  "departmentName": "Engineering",
  "departmentRole": "Team Leader",
  "status": "active",

  "addedAt": "2024-01-15T09:30:00.000Z",
  "updatedAt": "2024-08-25T13:45:00.000Z",
  "dateOfBirth": "1995-05-10",
  "hiredAt": "2022-02-01T00:00:00.000Z",

  "age": 29,
  "yearsOfExperience": 7,
  "yearsInCompany": 2,
  "rate": 4.5,

  "languages": ["Arabic", "English"],
  "courses": ["NestJS Fundamentals", "Advanced TypeScript"],
  "certifications": ["AWS Certified Developer", "Scrum Master Certified"],

  "educations": [
    {
      "degree": "B.Sc. Computer Science",
      "institution": "Cairo University",
      "year": 2017
    },
    {
      "degree": "M.Sc. Information Systems",
      "institution": "AUC",
      "year": 2020
    }
  ],

  "cvLink": "https://drive.google.com/file/d/abc123/view?usp=sharing",
  "avatarUrl": "https://cdn.agec.com/avatars/u123456.jpg",

  "bankAccount": "EG12 3456 7890 1234 5678 9012 345 1",
  "salary": "33000",
  "salaryCurrency": "EGP",

  "facebookLink": "https://facebook.com/ahmed.essam",

  "family": [
    {
      "relation": "Father",
      "fullName": "Essam Hassan",
      "phone": "+201234001422",
      "notes": "Emergency contact"
    },
    {
      "relation": "Mother",
      "fullName": "Mona Samir"
    }
  ],

  "employeeIds": ["emp_1098", "emp_2033"],
  "notes": "Promoted to Team Leader in 2023",
  "tags": ["react", "nestjs", "backend"],
  "metadata": {
    "preferredLanguage": "en",
    "shift": "morning",
    "remote": true
  }
}

*/ 

// {
//   "absences":[],
//   "addedAt":"1970-01-01T00:00:45.942Z",
//   "additionalPhone":undefined, string
//   "address":"الرشاح - كرداسة",
//   "age":48,
//   "avatarUrl":undefined, string
//   "bankAccount":undefined, string
//   "certifications":["لا يوجد"],
//   "city":"الجيزة",
//   "computerSkills":undefined, array
//   "courses":[],
//   "cvLink":undefined, string
//   "dateOfBirth":undefined, string
//   "departmentName":"الانتاج",
//   "departmentRole":"مشرف القسم",
//   "educationLevel":undefined, string
//   "educations":undefined, string
//   "email":undefined, string
//   "employeeIds":[],
//   "facebookLink":undefined, string
//   "family":undefined, array
//   "fullName":"Ahmed Mohamed Mohamady",
//   "fullNameArabic":"أحمد محمد محمدي",
//   "gender":"ذكر",
//   "hasCar":false,
//   "hiredAt":"1970-01-01T00:00:41.061Z",
//   "id":"EMP2",
//   "languages":["عربي"],
//   "lastCompanies":["السويدي للحلول الكهربائية"],
//   "maritalStatus":"متزوج",
//   "metadata":undefined, array
//   "nationalId":"27709182101738",
//   "notes":undefined, array
//   "phone":"01007511682",
//   "rate":undefined, string
//   "role":"مشرف تركيبات",
//   "salary":undefined, string
//   "salaryCurrency":"جنية مصر",
//   "status":"مفعل",
//   "tags":[],
//   "updatedAt":undefined, string
//   "yearsInCompany":13,
//   "yearsOfExperience":undefined, string
//   }

