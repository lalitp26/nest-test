import { CreateUserDto } from '../../dto/create-user.dto';
import { UserResponseDto } from '../../dto/user-response.dto';

export interface ICreateUserUseCase {
  execute(dto: CreateUserDto): Promise<UserResponseDto>;
}

export const CREATE_USER_USE_CASE = Symbol('ICreateUserUseCase');
