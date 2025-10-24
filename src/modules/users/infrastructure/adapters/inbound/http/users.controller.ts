import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Inject,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ICreateUserUseCase,
  CREATE_USER_USE_CASE,
} from '../../../../application/ports/inbound/create-user.use-case';
import {
  IGetUserUseCase,
  GET_USER_USE_CASE,
} from '../../../../application/ports/inbound/get-user.use-case';
import { CreateUserDto } from '../../../../application/dto/create-user.dto';
import { UserResponseDto } from '../../../../application/dto/user-response.dto';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(CREATE_USER_USE_CASE)
    private readonly createUserUseCase: ICreateUserUseCase,
    @Inject(GET_USER_USE_CASE)
    private readonly getUserUseCase: IGetUserUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.createUserUseCase.execute(createUserDto);
  }

  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    return this.getUserUseCase.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.getUserUseCase.execute(id);
  }
}
