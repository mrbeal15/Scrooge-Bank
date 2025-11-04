import { AccountService } from './account.service';
import { PrismaService } from '../../prisma.service';
import { UserRole } from './account.types';
import { AuthUtil } from '../User/auth.util';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AccountService', () => {
	let service: AccountService;
	let prismaMock: {
		user: { create: jest.Mock };
		account: { create: jest.Mock; update: jest.Mock };
		$transaction: any,
	};
	let tx;
	let jwtServiceMock: {
		signAsync: jest.Mock,
	};
	let configServiceMock: {
		get: jest.Mock,
	};

	beforeEach(() => {
		tx = {
			user: {
				findFirst: jest.fn(),
				create: jest.fn(),
			},
			account: {
				findFirst: jest.fn(),
				create: jest.fn(),
				update: jest.fn(),
			},
		};
		prismaMock = {
			$transaction: jest.fn((cb: any) => cb(tx)),
			user: {
				create: jest.fn(),
			},
			account: {
				create: jest.fn(),
				update: jest.fn(),
			},
		};
		jwtServiceMock = {
			signAsync: jest.fn().mockResolvedValue('token'),
		};
		configServiceMock = {
			get: jest.fn().mockReturnValue('shhh'),
		};

		service = new AccountService(
			prismaMock as unknown as PrismaService,
			jwtServiceMock as unknown as JwtService,
			configServiceMock as unknown as ConfigService,
		);
	});

	describe('createNewAccount', () => {
		it('creates a user then creates an account connected to that user', async () => {
			const input = {
				first_name: 'Matt',
				last_name: 'Beal',
				account_type: 'checking',
				role: 'customer',
				email: 'beal@example.com',
				password: 'secret',
			};

			tx.user.findFirst.mockResolvedValueOnce(null);

			jest.spyOn(AuthUtil, 'hashPassword').mockResolvedValue('hashed_password');

			tx.user.create.mockResolvedValueOnce({
				id: 42,
				first_name: 'Matt',
				last_name: 'Beal',
				role: UserRole.customer,
				email: 'beal@example.com',
			});

			tx.account.findFirst.mockResolvedValueOnce(null);

			const createdAccount = {
				id: 123,
				user_id: 42,
				type: 'checking',
				status: 'open',
				balance: 0,
			};

			tx.account.create.mockResolvedValueOnce(createdAccount);

			const result = await service.createNewAccount(input);

			expect(tx.user.create).toHaveBeenCalledWith({
				data: {
					first_name: 'Matt',
					last_name: 'Beal',
					role: 'customer',
					email: 'beal@example.com',
					password: 'hashed_password',
				},
			});

			expect(tx.account.create).toHaveBeenCalledWith({
				data: {
					user: {
						connect: {
							id: 42,
						},
					},
					type: 'checking',
					status: 'open',
					balance: 0,
				},
			});

			expect(result).toEqual({ account: createdAccount, token: 'token' });
		});
	});

	describe('closeAccount', () => {
		it('updates account status to closed and returns the updated account', async () => {
			prismaMock.account.update.mockResolvedValueOnce({
				id: 123,
				user_id: 42,
				type: 'checking',
				status: 'closed',
				balance: 0,
			});

			const result = await service.closeAccount(123);

			expect(prismaMock.account.update).toHaveBeenCalledWith({
				where: { id: 123 },
				data: { status: 'closed' },
			});

			expect(result).toEqual({
				id: 123,
				user_id: 42,
				type: 'checking',
				status: 'closed',
				balance: 0,
			});
		});
	});
});
