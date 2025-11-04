import { Logger, Module } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";
import { OperatorController } from "./operator.controller";
import { OperatorService } from "./operator.service";

@Module({
	controllers: [OperatorController],
	providers: [Logger, OperatorService, PrismaService],

})
export class OperatorModule { }
