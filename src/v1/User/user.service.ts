import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { AuthUtil } from "./auth.util";
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from "@nestjs/config";

@Injectable()
export class UserService {
	constructor(
		private prisma: PrismaService,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
	) { }

	async login(email: string, password: string): Promise<{ token: string }> {
		const user = await this.prisma.user.findUnique({
			where: {
				email,
			},
		});

		if (!user) {
			throw new UnauthorizedException(`Unable to find user with the provided email: ${email}`);
		}

		const validUser = await AuthUtil.checkIsValidUser(user, password);

		if (!validUser) {
			throw new UnauthorizedException('Invalid email and/or password');
		}

		const secret = this.configService.get('JWT_SECRET');
		const token = await this.jwtService.signAsync(user, { expiresIn: '30d', secret });

		return { token };
	}
}
