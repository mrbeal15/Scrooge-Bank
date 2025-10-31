import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { NewAccountInput, NewAccountSchema } from './schemas/NewAccountSchema';
import { AccountService } from './account.service';
import { Account } from 'generated/prisma/client';
import zod from 'zod';

@Controller('accounts')
export class AccountController {
	constructor(private readonly accountService: AccountService) { }

	@Post('/new')
	async createNewAccount(@Body() body: NewAccountInput): Promise<Account> {
		const validBody = NewAccountSchema.safeParse(body);

		if (!validBody.success) {
			throw new BadRequestException(zod.treeifyError(validBody.error));
		}

		return this.accountService.createNewAccount(body);
	}

	@Post('/close')
	async closeAccount(@Body() body: { account_id: string}): Promise<Account> {
		if (!body.account_id) {
			throw new BadRequestException('account_id is required');
		}

		return this.accountService.closeAccount(body.account_id);
	}
}
