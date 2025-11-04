import * as bcrypt from 'bcrypt';
import { User } from 'generated/prisma/client';
import { AuthUtil } from './v1/User/auth.util';

describe('AuthUtil', () => {
	describe('hashPassword', () => {
		it("should call bcrypt's hash function", async () => {
			const plainTextPassword = 'password';

			const bcryptHashSpy = jest
				.spyOn(bcrypt, 'hash')
				.mockResolvedValue('-');

			await AuthUtil.hashPassword(plainTextPassword);

			expect(bcryptHashSpy).toHaveBeenCalledWith(plainTextPassword, 10);
		});
	});

	describe('checkIsValidUser', () => {
		it("should call bcrypt's compare function using the user's stored password hash and the provided password", async () => {
			const user = {
				email: 'test@example.com',
				password: 'shh',
			} as User;
			const password = 'shh';

			const bcryptCompareSpy = jest
				.spyOn(bcrypt, 'compare')
				.mockResolvedValue(true);

			await AuthUtil.checkIsValidUser(user, password);

			expect(bcryptCompareSpy).toHaveBeenCalledWith(
				user.password,
				password,
			);
		});
	});
});
