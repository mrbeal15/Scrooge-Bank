import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma.service';
import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { AuthUtil } from './auth.util';

describe('UserService', () => {
	let service: UserService;
	let prismaMock: {
		user: { findUnique: jest.Mock };
	};
	let jwtServiceMock: {
		signAsync: jest.Mock
	};
	let configServiceMock: {
		get: jest.Mock
	};

	beforeEach(() => {
		prismaMock = {
			user: {
				findUnique: jest.fn(),
			},
		};
		jwtServiceMock = {
			signAsync: jest.fn().mockResolvedValue('token'),
		};
		configServiceMock = {
			get: jest.fn().mockReturnValue('shhh'),
		};

		service = new UserService(
			prismaMock as unknown as PrismaService,
			jwtServiceMock as unknown as JwtService,
			configServiceMock as unknown as ConfigService,
		);
	});

	describe('Login', () => {
		it('should throw an error if a user is unable to be found with the provided email', async () => {

			prismaMock.user.findUnique.mockResolvedValueOnce(undefined);

			expect(async () => {
				await service.login('no@example.com', 'not-real');
			}).rejects.toThrow();
		});

		it('should throw an error if the provided password does not match the user\'s stored password', async () => {
			prismaMock.user.findUnique.mockResolvedValueOnce({
				id: 1,
				first_name: 'test',
				last_name: 'user',
				email: 'test@example.com',
				password: 'hashed_password',
			});

			jest.spyOn(AuthUtil, 'checkIsValidUser').mockResolvedValue(false);

			expect(async () => {
				await service.login('test@example.com', 'wrong_pw');
			}).rejects.toThrow();
		});

		it('should return a signed token if a user is found and the provided password is valid', async () => {
			prismaMock.user.findUnique.mockResolvedValueOnce({
				id: 1,
				first_name: 'test',
				last_name: 'user',
				email: 'test@example.com',
				password: 'hashed_password',
			});

			jest.spyOn(AuthUtil, 'checkIsValidUser').mockResolvedValue(true);

			const response = await service.login('test@example.com', 'right_pw');

			expect(response).toEqual({ token: 'token' });
		});
	});

});
