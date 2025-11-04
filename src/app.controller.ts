import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserService } from './v1/User/user.service';

@Controller()
export class AppController {
	constructor(private readonly userService: UserService) { }

	@Get('/health')
	healthCheck(): { status: string, message: string } {
		return { status: '200OK', message: 'healthy' };
	}

	@Post('/login')
	login(@Body() body: { email: string, password: string }): Promise<{ token: string }> {
		const { email, password } = body;
		return this.userService.login(email, password);
	}
}
