import { Logger, Module } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { TransactionService } from "./transaction.service";
import { TransactionController } from "./transaction.controller";

@Module({
	controllers: [TransactionController],
	providers: [Logger, TransactionService, PrismaService],

})
export class TransactionModule { }
