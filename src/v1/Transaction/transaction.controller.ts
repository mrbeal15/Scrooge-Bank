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
		const userId = req.body.id;
		const validBody = NewTransactionSchema.safeParse(body);

		if (!validBody.success) {
			throw new BadRequestException(zod.treeifyError(validBody.error));
		}

		return this.transactionService.createWithdrawal(userId, body);
	}

	@UseGuards(AuthGuard)
	@Post('/deposit')
	async createDepositTransaction(@Req() req, @Body() body: NewTransactionInput): Promise<Transaction> {
		const userId = req.body.id;
		const validBody = NewTransactionSchema.safeParse(body);

		if (!validBody.success) {
			throw new BadRequestException(zod.treeifyError(validBody.error));
		}

		return this.transactionService.createDeposit(userId, body);
	}

	@UseGuards(AuthGuard)
	@Post('/payment')
	async createPaymentTransaction(@Body() body: NewTransactionInput): Promise<Transaction> {
		const validBody = NewTransactionSchema.safeParse(body);

		if (!validBody.success) {
			throw new BadRequestException(zod.treeifyError(validBody.error));
		}

		return this.transactionService.createPayment(body);
	}
}
