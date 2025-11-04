import { Logger, Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { PrismaService } from "src/prisma.service";
import { JwtModule } from '@nestjs/jwt';

@Module({
	imports: [
		JwtModule.register({
			global: true,
			secret: process.env.JWT_SECRET,
			signOptions: {
				expiresIn: '30d',
			},
		}),
	],
	providers: [
		Logger,
		PrismaService,
		UserService,
	],
})
export class UserModule { }
