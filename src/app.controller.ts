import { Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { Role } from './role/role.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Role(['admin', 'user'])
  async getHello(): Promise<string> {
    return await this.appService.getHello();
  }

  @Get('error')
  async errorInterceptorTest(): Promise<string> {
    throw new Error('Test Error');
  }
}
