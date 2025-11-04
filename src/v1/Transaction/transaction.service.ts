import { Transaction } from "generated/prisma/client";
import { PrismaService } from "../../prisma.service";
import { NewTransactionInput } from "./schemas/NewTransactionSchema";
import { BadRequestException, Injectable, Logger, NotFoundException, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class TransactionService {
	constructor(private readonly prisma: PrismaService) {}

	async createWithdrawal(user_id: number, data: NewTransactionInput): Promise<Transaction> {
		return this.prisma.$transaction(async (tx) => {
			const currentBankState = await tx.bankState.findFirst();
			const withdrawalAmount = data.amount * 100;

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

			if (user_id !== account.user_id) {
				throw new UnauthorizedException('Unauthorized access. Please check credentials.');
			}

			const transaction = await tx.transaction.create({ data });

			await tx.bankState.update({
				where: { id: 1 },
				data: {
					balance: { decrement: withdrawalAmount },
				},
			});

			await tx.account.update({
				where: { id: data.account_id },
				data: {
					balance: { decrement: withdrawalAmount },
				},
			});

			return transaction;
		});
	}

	async createDeposit(user_id: number, data: NewTransactionInput): Promise<Transaction> {
		return this.prisma.$transaction(async (tx) => {
			const depositAmount = data.amount * 100;
			const account = await tx.account.findFirst({ where: {
				id: data.account_id,
			}});

			if (!account) {
				throw new NotFoundException('Unable to find account with provided account id.');
			}

			if (user_id !== account.user_id) {
				throw new UnauthorizedException('Unauthorized access');
			}

			const transaction = await tx.transaction.create({ data });
			await tx.bankState.update({ where: { id: 1 }, data: { balance: { increment: depositAmount } }});
			await tx.account.update({ where: { id: data.account_id }, data: { balance: { increment: depositAmount } }});

			return transaction;
		});
	}

	async createPayment(user_iFd: number, data: NewTransactionInput): Promise<Transaction> {
		const paymentAmount = data.amount * 100;
		return this.prisma.$transaction(async (tx) => {
			const transaction = await tx.transaction.create({ data });

			await tx.account.update({ where: { id: data.account_id }, data: {
				balance: { decrement: paymentAmount },
			}});
			await tx.bankState.update({ where: { id: 1 }, data: {
				balance: { increment: paymentAmount },
			}});

			return transaction;
		});
	}
};
