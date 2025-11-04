import { Transaction } from "generated/prisma/client";
import { PrismaService } from "../../prisma.service";
import { NewTransactionInput } from "./schemas/NewTransactionSchema";
import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class TransactionService {
	constructor(private readonly prisma: PrismaService) {}

	async createWithdrawal(userId: number, data: NewTransactionInput): Promise<Transaction> {
		return this.prisma.$transaction(async (tx) => {
			const currentBankState = await tx.bankState.findFirst();
			const withdrawalAmount = data.amount;

			if (withdrawalAmount > currentBankState.balance) {
				throw new BadRequestException('Unable to withdrawl amount. Please see bank admin.');
			}

			const account = await tx.account.findUnique({
				where: {
					id: data.account_id,
				}
			});

			if (withdrawalAmount > account.balance) {
				throw new BadRequestException('Insufficient Funds. Please make a deposit.');
			}

			if (userId !== account.user_id) {
				throw new UnauthorizedException('Unauthorized access. Please check credentials.');
			}

			const transaction = await tx.transaction.create({ data });

			await tx.bankState.update({
				where: { id: 1 },
				data: {
					balance: { decrement: data.amount },
				},
			});

			await tx.account.update({
				where: { id: data.account_id },
				data: {
					balance: { decrement: data.amount },
				},
			});

			return transaction;
		});
	}

	async createDeposit(userId: number, data: NewTransactionInput): Promise<Transaction> {
		return this.prisma.$transaction(async (tx) => {
			const transaction = await tx.transaction.create({ data });
			const account = await tx.account.findFirst({ where: {
				id: data.account_id,
			}});

			if (!account) {
				throw new NotFoundException('Unable to find account with provided account id.');
			}

			if (userId !== account.user_id) {
				throw new UnauthorizedException('Unauthorized access');
			}

			await tx.bankState.update({ where: { id: 1 }, data: { balance: { increment: data.amount } }});
			await tx.account.update({ where: { id: data.account_id }, data: { balance: { increment: data.amount } }});

			return transaction;
		});
	}

	async createPayment(data: NewTransactionInput): Promise<Transaction> {
		return this.prisma.$transaction(async (tx) => {
			const transaction = await tx.transaction.create({ data });

			await tx.account.update({ where: { id: data.account_id }, data: {
				balance: { decrement: data.amount },
			}});
			await tx.bankState.update({ where: { id: 1 }, data: {
				balance: { increment: data.amount },
			}});

			return transaction;
		});
	}
};
