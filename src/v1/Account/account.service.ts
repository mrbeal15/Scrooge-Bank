import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { NewAccountInput } from "./schemas/NewAccountSchema";
import { PrismaService } from "../../prisma.service";
import { Prisma } from "generated/prisma/client";
import { Account } from "generated/prisma/browser";
import { AuthUtil } from "../User/auth.util";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AccountService {
	constructor(
		private prisma: PrismaService,
		private jwtService: JwtService,
		private readonly configService: ConfigService,
	) {}

	async createNewAccount(data: NewAccountInput): Promise<{ account: Account, token: string }> {
		return await this.prisma.$transaction(async (tx) => {

			let user = await tx.user.findFirst({ where: { email: data.email }});
			if (!user) {
				const hashedPassword = await AuthUtil.hashPassword(data.password);
				const userData: Prisma.UserCreateInput = {
					first_name: data.first_name,
					last_name: data.last_name,
					email: data.email,
					password: hashedPassword,
					role: 'customer',
				};
				user = await tx.user.create({ data: userData });
			}

			const accountExists = await tx.account.findFirst({ where: {
				user_id: user.id,
				status: 'open',
			}});

			if (accountExists) {
				throw new ConflictException('An open account already exists for this user');
			}

			const accountData: Prisma.AccountCreateInput = {
				user: {
					connect: {
						id: user.id,
					},
				},
				type: data.account_type,
				status: 'open',
				balance: 0,
			}

			const newAccount = await tx.account.create({ data: accountData });
			const secret = this.configService.get('JWT_SECRET');
			const payload = { sub: user.id, id: user.id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name };
			const token = await this.jwtService.signAsync(payload, { expiresIn: '30d', secret });
			return {
				account: newAccount,
				token,
			};
		});
	}

	async closeAccount(account_id: number): Promise<Account> {
		const closedAccount = await this.prisma.account.update({
			where: { id: account_id },
			data: {
				status: 'closed',
			},
		});
		return closedAccount;
	}

	async getAccounts(user_id: number): Promise<Account[]> {
		const accounts = await this.prisma.account.findMany({
			where: {
				user_id,
			},
		});

		return accounts;
	}
};
