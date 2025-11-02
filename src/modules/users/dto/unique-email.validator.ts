import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';
import * as admin from 'firebase-admin';

@ValidatorConstraint({ async: true })
export class UniqueEmailConstraint implements ValidatorConstraintInterface {
  async validate(email: string, args: ValidationArguments) {
    if (!email) return false;

    const usersCollection = admin.firestore().collection('users');
    const snapshot = await usersCollection
      .where('email', '==', email.trim().toLowerCase())
      .limit(1)
      .get();

    return snapshot.empty; // ✅ valid only if no user found
  }

  defaultMessage(args: ValidationArguments) {
    return `Email "${args.value}" is already taken`;
  }
}

export function UniqueEmail(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: UniqueEmailConstraint,
    });
  };
}
