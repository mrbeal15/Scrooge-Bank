import { BadRequestException, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { NewAccountInput } from "./schemas/NewAccountSchema";
import { PrismaService } from "../../prisma.service";
import { Prisma } from "generated/prisma/client";
import { Account } from "generated/prisma/browser";
import { AuthUtil } from "../User/auth.util";

@Injectable()
export class AccountService {
	constructor(private prisma: PrismaService) { }

	async createNewAccount(data: NewAccountInput): Promise<Account> {
		return await this.prisma.$transaction(async (tx) => {

			const user = await this.prisma.user.findFirst({ where: { email: data.email }});
			if (!user) {
				const hashedPassword = await AuthUtil.hashPassword(data.password);
				const userData: Prisma.UserCreateInput = {
					first_name: data.first_name,
					last_name: data.last_name,
					email: data.email,
					password: hashedPassword,
					role: 'customer',
				};
				await this.prisma.user.create({ data: userData });
			}

			const accountExists = await this.prisma.account.findFirst({ where: {
				user_id: user.id,
				status: 'open',
			}});

			if (accountExists) {
				throw new BadRequestException('An open account already exists for this user');
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

			const newAccount = await this.prisma.account.create({ data: accountData });
			return newAccount;
		});
	}

	async closeAccount(accountId: string): Promise<Account> {
		const where: Prisma.AccountWhereUniqueInput = { id: Number(accountId) };

		const closedAccount = await this.prisma.account.update({
			where,
			data: {
				status: 'closed',
			},
		});
		return closedAccount;
	}
};
