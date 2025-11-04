import { BadRequestException, Body, Controller, Get, Post, Req, UnauthorizedException, UseGuards } from '@nestjs/common';
import { NewAccountInput, NewAccountSchema } from './schemas/NewAccountSchema';
import { AccountService } from './account.service';
import { Account } from 'generated/prisma/client';
import zod from 'zod';
import { AuthGuard } from '../../auth.guard';

@Controller('accounts')
export class AccountController {
	constructor(private readonly accountService: AccountService) { }

	@UseGuards(AuthGuard)
	@Get('/')
	async getAccounts(@Req() req): Promise<Account[]> {
		const user_id = req.user.id;

		if (!user_id) {
			throw new UnauthorizedException('Unable to access account');
		}

		return this.accountService.getAccounts(user_id);
	}

	@Post('/new')
	async createNewAccount(@Body() body: NewAccountInput): Promise<{account: Account, token: string }> {
		const validBody = NewAccountSchema.safeParse(body);

		if (!validBody.success) {
			throw new BadRequestException(zod.treeifyError(validBody.error));
		}

		return this.accountService.createNewAccount(body);
	}

	@UseGuards(AuthGuard)
	@Post('/close')
	async closeAccount(@Body() body: { account_id: number}): Promise<Account> {
		if (!body.account_id) {
			throw new BadRequestException('account_id is required');
		}

		return this.accountService.closeAccount(body.account_id);
	}
}
