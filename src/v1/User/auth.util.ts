import * as bcrypt from 'bcrypt';
import { User } from 'generated/prisma/client';

const saltRounds = 10;

export const AuthUtil = {
	async hashPassword(unhashedPassword: string): Promise<string> {
		return await bcrypt.hash(unhashedPassword, saltRounds);
	},

	async checkIsValidUser(user: User, password: string): Promise<boolean> {
		const match: boolean = await bcrypt.compare(password, user.password);
		return match;
	},
};
