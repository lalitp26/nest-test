import { UserResponseDto } from '../../dto/user-response.dto';

export interface IGetUserUseCase {
  execute(id: string): Promise<UserResponseDto>;
  findAll(): Promise<UserResponseDto[]>;
  findByEmail(email: string): Promise<UserResponseDto | null>;
}

export const GET_USER_USE_CASE = Symbol('IGetUserUseCase');
