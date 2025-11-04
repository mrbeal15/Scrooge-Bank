import { Test } from '@nestjs/testing';
import { INestApplication, CanActivate, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { AuthGuard } from '../../auth.guard';

class MockAuthGuard implements CanActivate {
	canActivate(ctx: ExecutionContext): boolean {
		const req = ctx.switchToHttp().getRequest();
		req.user = { id: 42, email: 'beal@example.com', role: 'customer' };
		return true;
	}
}

describe('TransactionController (integration)', () => {
	let app: INestApplication;
	let serviceMock: {
		createWithdrawal: jest.Mock;
		createDeposit: jest.Mock;
		createPayment: jest.Mock;
	};

	beforeAll(async () => {
		serviceMock = {
			createWithdrawal: jest.fn(),
			createDeposit: jest.fn(),
			createPayment: jest.fn(),
		};

		const moduleRef = await Test.createTestingModule({
			controllers: [TransactionController],
			providers: [{ provide: TransactionService, useValue: serviceMock }],
		})
			.overrideGuard(AuthGuard)
			.useClass(MockAuthGuard)
			.compile();

		app = moduleRef.createNestApplication();
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	describe('POST /transactions/withdrawal', () => {
		it('400 when body fails validation', async () => {
			await request(app.getHttpServer())
				.post('/transactions/withdrawal')
				.send({})
				.expect(400);

			expect(serviceMock.createWithdrawal).not.toHaveBeenCalled();
		});

		it('201 and calls service with (req.user.id, body) on success', async () => {
			const body = { user_id: 42, account_id: 7, amount: 123, type: 'withdrawal' };
			const returned = { id: 555, account_id: 7, user_id: 42, type: 'withdrawal', amount: 123 };
			serviceMock.createWithdrawal.mockResolvedValueOnce(returned);

			const res = await request(app.getHttpServer())
				.post('/transactions/withdrawal')
				.send(body)
				.expect(201);

			expect(serviceMock.createWithdrawal).toHaveBeenCalledWith(42, body);
			expect(res.body).toEqual(returned);
		});
	});

	describe('POST /transactions/deposit', () => {
		it('400 when body fails validation', async () => {
			await request(app.getHttpServer())
				.post('/transactions/deposit')
				.send({ account_id: 1 })
				.expect(400);

			expect(serviceMock.createDeposit).not.toHaveBeenCalled();
		});

		it('201 and calls service with (req.user.id, body) on success', async () => {
			const body = { user_id: 42, account_id: 10, amount: 500, type: 'deposit' };
			const returned = { id: 777, account_id: 10, user_id: 42, type: 'deposit', amount: 500 };
			serviceMock.createDeposit.mockResolvedValueOnce(returned);

			const res = await request(app.getHttpServer())
				.post('/transactions/deposit')
				.send(body)
				.expect(201);

			expect(serviceMock.createDeposit).toHaveBeenCalledWith(42, body);
			expect(res.body).toEqual(returned);
		});
	});

	describe('POST /transactions/payment', () => {
		it('400 when body fails validation', async () => {
			await request(app.getHttpServer())
				.post('/transactions/payment')
				.send({ type: 'payment' })
				.expect(400);

			expect(serviceMock.createPayment).not.toHaveBeenCalled();
		});

		it('201 and calls service with body on success', async () => {
			const body = { user_id: 42, account_id: 9, amount: 250, type: 'payment' };
			const returned = { id: 888, account_id: 9, user_id: 42, type: 'payment', amount: 250 };
			serviceMock.createPayment.mockResolvedValueOnce(returned);

			const res = await request(app.getHttpServer())
				.post('/transactions/payment')
				.send(body)
				.expect(201);

			expect(serviceMock.createPayment).toHaveBeenCalledWith(42, body);
			expect(res.body).toEqual(returned);
		});
	});
});
