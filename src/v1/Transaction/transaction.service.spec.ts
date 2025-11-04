// src/v1/Transaction/transaction.service.spec.ts
import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { TransactionService } from './transaction.service';

describe('TransactionService', () => {
	let service: TransactionService;
	let prisma: any;
	let tx: any;

	beforeEach(() => {
		tx = {
			bankState: {
				findFirst: jest.fn(),
				update: jest.fn(),
			},
			account: {
				findUnique: jest.fn(),
				findFirst: jest.fn(),
				update: jest.fn(),
			},
			transaction: {
				create: jest.fn(),
			},
		};

		prisma = {
			$transaction: jest.fn((cb: any) => cb(tx)),
		};

		service = new TransactionService(prisma as unknown as PrismaService);
	});

	describe('createWithdrawal', () => {
		const baseBody = { user_id: 42, account_id: 7, amount: 123, type: 'withdrawal' };

		it('throws if bank has insufficient balance', async () => {
			tx.bankState.findFirst.mockResolvedValueOnce({ id: 1, balance: 10 });
			tx.account.findUnique.mockResolvedValue({ id: 7, user_id: 42, balance: 999999 });

			await expect(service.createWithdrawal(42, baseBody)).rejects.toBeInstanceOf(BadRequestException);
			expect(tx.transaction.create).not.toHaveBeenCalled();
		});

		it('throws if account has insufficient funds', async () => {
			tx.bankState.findFirst.mockResolvedValueOnce({ id: 1, balance: 999_999_99 });
			tx.account.findUnique.mockResolvedValueOnce({ id: 7, user_id: 42, balance: 50 });

			await expect(service.createWithdrawal(42, baseBody)).rejects.toBeInstanceOf(BadRequestException);
		});

		it('throws if user does not own the account', async () => {
			tx.bankState.findFirst.mockResolvedValueOnce({ id: 1, balance: 999_999_99 });
			tx.account.findUnique.mockResolvedValueOnce({ id: 7, user_id: 99, balance: 999_999_99 });

			await expect(service.createWithdrawal(42, baseBody)).rejects.toBeInstanceOf(UnauthorizedException);
		});

		it('creates transaction and decrements balances on success', async () => {
			const txn = { id: 500, account_id: 7, user_id: 42, type: 'withdrawal', amount: 123 };
			tx.bankState.findFirst.mockResolvedValueOnce({ id: 1, balance: 999_999_99 });
			tx.account.findUnique.mockResolvedValueOnce({ id: 7, user_id: 42, balance: 999_999_99 });
			tx.transaction.create.mockResolvedValueOnce(txn);

			const res = await service.createWithdrawal(42, baseBody);

			expect(tx.transaction.create).toHaveBeenCalledWith({ data: baseBody });
			expect(tx.bankState.update).toHaveBeenCalledWith({
				where: { id: 1 },
				data: { balance: { decrement: baseBody.amount * 100 } },
			});
			expect(tx.account.update).toHaveBeenCalledWith({
				where: { id: baseBody.account_id },
				data: { balance: { decrement: baseBody.amount * 100 } },
			});
			expect(res).toEqual(txn);
		});
	});

	describe('createDeposit', () => {
		const body = { user_id: 42, account_id: 10, amount: 50, type: 'deposit' };

		it('throws if account not found', async () => {
			tx.transaction.create.mockResolvedValueOnce({ id: 1, ...body, user_id: 1 });
			tx.account.findFirst.mockResolvedValueOnce(null);

			await expect(service.createDeposit(42, body)).rejects.toBeInstanceOf(NotFoundException);
		});

		it('throws if unauthorized (not owner)', async () => {
			tx.transaction.create.mockResolvedValueOnce({ id: 1, ...body, user_id: 1 });
			tx.account.findFirst.mockResolvedValueOnce({ id: 10, user_id: 99, balance: 0 });

			await expect(service.createDeposit(42, body)).rejects.toBeInstanceOf(UnauthorizedException);
		});

		it('creates transaction and increments balances on success', async () => {
			const txn = { id: 900, ...body, user_id: 42 };
			tx.transaction.create.mockResolvedValueOnce(txn);
			tx.account.findFirst.mockResolvedValueOnce({ id: 10, user_id: 42, balance: 1000 });

			const res = await service.createDeposit(42, body);

			expect(tx.transaction.create).toHaveBeenCalledWith({ data: body });
			// your code increments by depositAmount (amount*100) here:
			expect(tx.bankState.update).toHaveBeenCalledWith({
				where: { id: 1 },
				data: { balance: { increment: body.amount * 100 } },
			});
			expect(tx.account.update).toHaveBeenCalledWith({
				where: { id: body.account_id },
				data: { balance: { increment: body.amount * 100 } },
			});
			expect(res).toEqual(txn);
		});
	});

	describe('createPayment', () => {
		const body = { user_id: 42, account_id: 3, amount: 25, type: 'payment' };

		it('creates transaction, decrements account & increments bank', async () => {
			const txn = { id: 321, ...body, user_id: 77 };
			tx.transaction.create.mockResolvedValueOnce(txn);

			const res = await service.createPayment(42, body);

			expect(tx.transaction.create).toHaveBeenCalledWith({ data: body });
			expect(tx.account.update).toHaveBeenCalledWith({
				where: { id: body.account_id },
				data: { balance: { decrement: body.amount * 100 } },
			});
			expect(tx.bankState.update).toHaveBeenCalledWith({
				where: { id: 1 },
				data: { balance: { increment: body.amount * 100 } },
			});
			expect(res).toEqual(txn);
		});
	});
});
