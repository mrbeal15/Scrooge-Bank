import { Controller, Get, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { OperatorService } from "./operator.service";
import { AuthGuard } from "src/auth.guard";
import { UserRole } from "../Account/account.types";

@Controller('operator')
export class OperatorController {
	constructor(private readonly operatorService: OperatorService) {}

	@UseGuards(AuthGuard)
	@Get('/balance')
	async getBankBalace(@Req() req): Promise<{ balance: number }> {
		const user_role = req.user.user_role;
		// if (user_role !== UserRole.operator) {
		// 	throw new UnauthorizedException('Unauthorized access.');
		// }

		return this.operatorService.getBankBalance();
	}
};
