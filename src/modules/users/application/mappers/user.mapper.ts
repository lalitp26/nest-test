import { Injectable } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UserResponseDto } from '../dto/user-response.dto';

@Injectable()
export class UserMapper {
  toDto(user: User): UserResponseDto {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email.value,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  toDtoList(users: User[]): UserResponseDto[] {
    return users.map(user => this.toDto(user));
  }
}
