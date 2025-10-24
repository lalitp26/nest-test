import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { ICreateUserUseCase } from '../ports/inbound/create-user.use-case';
import { IUserRepository, USER_REPOSITORY } from '../ports/outbound/user-repository.port';
import { IPasswordHasher, PASSWORD_HASHER } from '../ports/outbound/password-hasher.port';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { UserMapper } from '../mappers/user.mapper';
import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';

@Injectable()
export class CreateUserUseCaseImpl implements ICreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly passwordHasher: IPasswordHasher,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(dto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create email value object
    const email = new Email(dto.email);

    // Hash password
    const hashedPassword = await this.passwordHasher.hash(dto.password);

    // Create user entity
    const user = User.create(
      dto.firstName,
      dto.lastName,
      email,
      hashedPassword,
    );

    // Validate business rules
    user.validate();

    // Persist user
    const savedUser = await this.userRepository.save(user);

    // Map to DTO and return
    return this.userMapper.toDto(savedUser);
  }
}
