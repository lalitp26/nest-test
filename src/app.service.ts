import { Injectable } from '@nestjs/common';

const HELLO_TIMEOUT_MS = 5000;

@Injectable()
export class AppService {
  getHello(): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('Hello World!');
      }, HELLO_TIMEOUT_MS);
    });
  }
}
