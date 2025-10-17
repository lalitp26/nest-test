import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before handling the request...');
    const now = Date.now();
    return next
      .handle()
      .pipe(
        tap(() =>
          console.log(`After handling the request... ${Date.now() - now}ms`),
        ),
      );
  }
}
