import { z } from 'zod';

export const NewTransactionSchema = z.object({
	user_id: z.number(),
	account_id: z.number(),
	type: z.string(),
	amount: z.number().min(0),
});

export type NewTransactionInput = z.infer<typeof NewTransactionSchema>;
