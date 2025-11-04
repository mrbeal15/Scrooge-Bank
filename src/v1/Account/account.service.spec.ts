import { AccountService } from './account.service';
import { PrismaService } from '../../prisma.service';
import { UserRole } from './account.types';
import { AuthUtil } from '../User/auth.util';

describe('AccountService', () => {
	let service: AccountService;
	let prismaMock: {
		user: { create: jest.Mock };
		account: { create: jest.Mock; update: jest.Mock };
	};

	beforeEach(() => {
		prismaMock = {
			user: {
				create: jest.fn(),
			},
			account: {
				create: jest.fn(),
				update: jest.fn(),
			},

		};


		service = new AccountService(prismaMock as unknown as PrismaService);
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

			prismaMock.user.create.mockResolvedValueOnce({
				id: 42,
				first_name: 'Matt',
				last_name: 'Beal',
				role: UserRole.customer,
				email: 'beal@example.com',
			});

			const createdAccount = {
				id: 123,
				user_id: 42,
				type: 'checking',
				status: 'open',
				balance: 0,
			};

			jest.spyOn(AuthUtil, 'hashPassword').mockResolvedValue('hashed_password');

			prismaMock.account.create.mockResolvedValueOnce(createdAccount);

			const result = await service.createNewAccount(input);

			expect(prismaMock.user.create).toHaveBeenCalledWith({
				data: {
					first_name: 'Matt',
					last_name: 'Beal',
					role: 'customer',
					email: 'beal@example.com',
					password: 'hashed_password',
				},
			});

			expect(prismaMock.account.create).toHaveBeenCalledWith({
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

			expect(result).toEqual(createdAccount);
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

			const result = await service.closeAccount('123');

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
