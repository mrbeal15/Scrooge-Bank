import { z } from 'zod';
// import { AccountType, UserRole } from '../account.types';

export const NewAccountSchema = z.object({
	first_name: z.string(),
	last_name: z.string(),
	role: z.string().optional(),
	// role: z.enum(UserRole), TODO: Fix
	account_type: z.string(),
	// account_type: z.enum(AccountType), TODO: Fix
});

export type NewAccountInput = z.infer<typeof NewAccountSchema>;
