import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/health')
  healthCheck(): { status: string, message: string } {
    return { status: '200OK', message: 'healthy' };
  }
}
