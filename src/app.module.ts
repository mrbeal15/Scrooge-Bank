import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AccountModule } from './v1/Account/account.module';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './v1/User/user.module';
import { UserService } from './v1/User/user.service';
import { TransactionModule } from './v1/Transaction/transaction.module';
import { OperatorModule } from './v1/Operator/operator.module';

@Module({
	imports: [
		ConfigModule.forRoot({
		isGlobal: true,
		}),
		AccountModule,
		OperatorModule,
		TransactionModule,
		UserModule,
	],
	controllers: [AppController],
	providers: [Logger, PrismaService, UserService],
	exports: [PrismaService]
})
export class AppModule {}
