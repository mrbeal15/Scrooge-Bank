import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

const validNewAccountBody = {
	first_name: 'Scrooge',
	last_name: 'McDuck',
	account_type: 'checking',

};

describe('AccountController (integration-ish)', () => {
	let app: INestApplication;
	let accountServiceMock: {
		createNewAccount: jest.Mock;
		closeAccount: jest.Mock;
	};

	beforeAll(async () => {
		accountServiceMock = {
			createNewAccount: jest.fn(),
			closeAccount: jest.fn(),
		};

		const moduleRef = await Test.createTestingModule({
			controllers: [AccountController],
			providers: [
				{
					provide: AccountService,
					useValue: accountServiceMock,
				},
			],
		}).compile();

		app = moduleRef.createNestApplication();
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	describe('POST /accounts/new', () => {
		it('400s when body fails validation', async () => {
			const badBody = { first_name: 'invalid payload' };

			const res = await request(app.getHttpServer())
				.post('/accounts/new')
				.send(badBody)
				.expect(400);

			expect(res.statusCode).toBe(400);
			expect(accountServiceMock.createNewAccount).not.toHaveBeenCalled();
		});

		it('returns created account when body is valid', async () => {
			const fakeAccount = {
				id: 123,
				user_id: 42,
				type: 'checking',
				status: 'open',
				balance: 0,
			};

			accountServiceMock.createNewAccount.mockResolvedValueOnce(fakeAccount);

			const res = await request(app.getHttpServer())
				.post('/accounts/new')
				.send(validNewAccountBody)
				.expect(201);

			expect(res.body).toEqual(fakeAccount);
			expect(accountServiceMock.createNewAccount).toHaveBeenCalledWith(
				validNewAccountBody,
			);
		});
	});

	describe('POST /accounts/close', () => {
		it('400s if account_id is missing', async () => {
			const res = await request(app.getHttpServer())
				.post('/accounts/close')
				.send({}) // no account_id
				.expect(400);

			expect(res.body.statusCode).toBe(400);
			expect(res.body.message).toBe('account_id is required');
			expect(accountServiceMock.closeAccount).not.toHaveBeenCalled();
		});

		it('returns closed account on success', async () => {
			const fakeClosed = {
				id: 123,
				user_id: 42,
				type: 'checking',
				status: 'closed',
				balance: 0,
			};

			accountServiceMock.closeAccount.mockResolvedValueOnce(fakeClosed);

			const res = await request(app.getHttpServer())
				.post('/accounts/close')
				.send({ account_id: '123' })
				.expect(201);

			expect(res.body).toEqual(fakeClosed);
			expect(accountServiceMock.closeAccount).toHaveBeenCalledWith('123');
		});
	});
});
