import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AccountModule } from './v1/Account/account.module';
import { PrismaService } from './prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
	imports: [
		ConfigModule.forRoot({
		isGlobal: true, // so it's available everywhere
		}),
		AccountModule
	],
	controllers: [AppController],
	providers: [PrismaService],
	exports: [PrismaService]
})
export class AppModule {}
