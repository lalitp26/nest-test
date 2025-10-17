import { AuthGuard } from './auth.guard';
import { Reflector } from '@nestjs/core';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    const mockReflector = new Reflector();
    guard = new AuthGuard(mockReflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should call canActivate and return a boolean', async () => {
    const mockExecutionContext: any = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer testtoken' }
        })
      })
    };
    const result = await guard.canActivate(mockExecutionContext);
    expect(typeof result === 'boolean' || typeof result === 'object').toBeTruthy();
  });
});
