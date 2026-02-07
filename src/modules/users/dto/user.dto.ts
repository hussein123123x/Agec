import {
  IsString,
  IsEmail,
  IsOptional,
  IsIn,
  IsArray,
  IsDateString,
  IsNumber,
  IsPhoneNumber,
  IsObject,
  ValidateNested,
  IsDefined,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UniquePhone } from './unique-phone.validator';
import { UniqueEmail } from './unique-email.validator';

class EducationDto {
  @IsString()
  degree: string;

  @IsString()
  institution: string;

  @IsNumber()
  year: number;
}

class FamilyMemberDto {
  @IsString()
  relation: string;

  @IsString()
  fullName: string;

  @IsOptional()
  @IsPhoneNumber()
  @UniquePhone({ message: 'Phone number must be unique' })
  phone?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateUserDto {
  // 🔐 Identity
  @IsString() id?: string;

  @IsString() fullName: string;

  @IsString() fullNameArabic?: string;

  @IsIn(['Male', 'Female']) gender: string;

  @IsOptional() @IsIn(['Single', 'Married', 'Divorced', 'Widowed']) maritalStatus?: string;

  @IsString() nationalId?: string;

  @IsEmail() @UniqueEmail({ message: 'Email must be unique' }) email: string;

  @IsString() phone: string;

  @IsOptional() @IsString() additionalPhone?: string;

  @IsOptional() @IsString() address?: string;

  @IsOptional() @IsString() city?: string;

  // 👥 Role & Organization
  @IsString() role: string;

  @IsOptional() @IsString() departmentName?: string;

  @IsOptional() @IsIn(['Manager', 'Supervisor', 'Team Leader', 'Member']) @IsString() departmentRole?: string;

  @IsIn(['active', 'inactive', 'suspended']) status: string;

  // 🕒 Dates
  @IsDateString() addedAt?: string;

  @IsOptional() @IsDateString() updatedAt?: string;

  @IsOptional() @IsDateString() dateOfBirth?: string;

  @IsOptional() @IsDateString() hiredAt?: string;

  @IsEmail() @UniqueEmail({ message: 'Email must be unique' }) agecEmail?: string;

  @IsBoolean() isNewMember?: boolean;

  // 💼 Experience & Skills
  @IsOptional() @IsNumber() age?: number;

  @IsOptional() @IsNumber() yearsOfExperience?: number;

  @IsOptional() @IsNumber() yearsInCompany?: number;

  @IsOptional() @IsNumber() rate?: number;

  @IsOptional() @IsArray() absences?: string[];

  @IsOptional() @IsArray() @IsString({ each: true }) languages?: string[];

  @IsOptional() @IsArray() @IsString({ each: true }) courses?: string[];

  @IsOptional() @IsArray() @IsString({ each: true }) certifications?: string[];

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => EducationDto)
  educations?: EducationDto[];

  // 🧾 Work Assets
  @IsOptional() @IsString() cvLink?: string;
  @IsOptional() @IsString() avatarUrl?: string;

  // 💵 Financial
  @IsOptional() @IsString() bankAccount?: string;

  @IsOptional() @IsString() salary?: string;

  @IsOptional() @IsString() salaryCurrency?: string;

  // 🔐 Auth
  @IsString() password: string;

  // 🌐 Social
  @IsOptional() @IsString() facebookLink?: string;

  // 👨‍👩‍👧 Family & Others
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => FamilyMemberDto)
  family?: FamilyMemberDto[];

  @IsOptional() @IsArray() @IsString({ each: true }) employeeIds?: string[];

  @IsOptional() @IsString() notes?: string;

  // 🏷️ Tags/Customization
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];

  @IsOptional() @IsObject() metadata?: Record<string, any>;

  @IsOptional() @IsBoolean() hasCar?: boolean;

  @IsOptional() @IsIn(['Beginner', 'Intermediate', 'Advanced', 'Expert']) @IsString() computerSkills?: string;

  @IsOptional() @IsString() educationLevel?: string;

  @IsOptional() @IsArray() lastCompanies?: string[];
}
