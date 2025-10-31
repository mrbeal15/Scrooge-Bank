import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
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
