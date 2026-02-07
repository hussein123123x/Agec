import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import * as admin from 'firebase-admin';

@ValidatorConstraint({ async: true })
export class UniquePhoneConstraint implements ValidatorConstraintInterface {
  async validate(phone: string, args: ValidationArguments) {
    if (!phone) return false;

    const usersCollection = admin.firestore().collection('users');
    const snapshot = await usersCollection
      .where('phone', '==', phone.trim())
      .limit(1)
      .get();

    return snapshot.empty; // ✅ valid only if no user found
  }

  defaultMessage(args: ValidationArguments) {
    return `Phone number "${args.value}" is already in use`;
  }
}

export function UniquePhone(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: UniquePhoneConstraint,
    });
  };
}
