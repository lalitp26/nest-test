import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IGetUserUseCase } from '../ports/inbound/get-user.use-case';
import { IUserRepository, USER_REPOSITORY } from '../ports/outbound/user-repository.port';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class GetUserUseCaseImpl implements IGetUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return this.userMapper.toDto(user);
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.findAll();
    return this.userMapper.toDtoList(users);
  }

  async findByEmail(email: string): Promise<UserResponseDto | null> {
    const user = await this.userRepository.findByEmail(email);
    return user ? this.userMapper.toDto(user) : null;
  }
}
