import { BadRequestException, Body, Controller, Logger, Post, Req, UseGuards } from '@nestjs/common';
import zod from 'zod';
import { AuthGuard } from '../../auth.guard';
import { NewTransactionInput, NewTransactionSchema } from './schemas/NewTransactionSchema';
import { Transaction } from 'generated/prisma/browser';
import { TransactionService } from './transaction.service';

@Controller('transactions')
export class TransactionController {
	constructor(
		private readonly transactionService: TransactionService,
	) {}

	@UseGuards(AuthGuard)
	@Post('/withdrawal')
	async createWithdrawalTransaction(@Req() req, @Body() body: NewTransactionInput): Promise<Transaction> {
		const user_id = req.user.id;
		const validBody = NewTransactionSchema.safeParse(body);

		if (!validBody.success) {
			throw new BadRequestException(zod.treeifyError(validBody.error));
		}

		return this.transactionService.createWithdrawal(user_id, body);
	}

	@UseGuards(AuthGuard)
	@Post('/deposit')
	async createDepositTransaction(@Req() req, @Body() body: NewTransactionInput): Promise<Transaction> {
		const user_id = req.user.id;
		const validBody = NewTransactionSchema.safeParse(body);

		if (!validBody.success) {
			throw new BadRequestException(zod.treeifyError(validBody.error));
		}

		return this.transactionService.createDeposit(user_id, body);
	}

	@UseGuards(AuthGuard)
	@Post('/payment')
	async createPaymentTransaction(@Req() req, @Body() body: NewTransactionInput): Promise<Transaction> {
		const user_id = req.user.id;
		const validBody = NewTransactionSchema.safeParse(body);

		if (!validBody.success) {
			throw new BadRequestException(zod.treeifyError(validBody.error));
		}

		return this.transactionService.createPayment(user_id, body);
	}
}
