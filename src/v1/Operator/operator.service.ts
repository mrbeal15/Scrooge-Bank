import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class OperatorService {
	constructor(private readonly prisma: PrismaService) { }

	async getBankBalance(): Promise<{ balance: number }> {
		const currentBankState = await this.prisma.bankState.findFirst();
		return {
			balance: (currentBankState.balance / 100)
		};
	}
};
