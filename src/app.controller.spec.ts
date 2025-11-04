import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { UserService } from './v1/User/user.service';

describe('AppController', () => {
	let appController: AppController;
	let userServiceMock: {
		login: jest.Mock,
	};

	beforeEach(async () => {
		userServiceMock = {
			login: jest.fn(),
		};

		const app: TestingModule = await Test.createTestingModule({
			controllers: [AppController],
			providers: [
				{
					provide: UserService,
					useValue: userServiceMock,
				},
			],
		}).compile();

		appController = app.get<AppController>(AppController);
	});

	describe('root', () => {
		describe('health', () => {
			it('should return { status: 200OK, message: healthy }', () => {
				expect(appController.healthCheck()).toEqual({ status: '200OK', message: 'healthy' });
			});
		});
	});
});
