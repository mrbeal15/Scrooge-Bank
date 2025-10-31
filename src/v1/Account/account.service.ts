import { Injectable } from "@nestjs/common";
import { NewAccountInput } from "./schemas/NewAccountSchema";
import { PrismaService } from "../../prisma.service";
import { Prisma } from "generated/prisma/client";
import { Account } from "generated/prisma/browser";

@Injectable()
export class AccountService {
	constructor(private prisma: PrismaService) { }

	async createNewAccount(data: NewAccountInput): Promise<Account> {
		const userData: Prisma.UserCreateInput = {
			first_name: data.first_name,
			last_name: data.last_name,
			role: 'customer',
		};
		const newUser = await this.prisma.user.create({ data: userData });

		const accountData: Prisma.AccountCreateInput = {
			user: {
				connect: {
					id: newUser.id,
				},
			},
			type: data.account_type,
			status: 'open',
			balance: 0 //Future work: allow users to create new account with a starting balance
		}

		const newAccount = await this.prisma.account.create({ data: accountData });
		return newAccount;
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
