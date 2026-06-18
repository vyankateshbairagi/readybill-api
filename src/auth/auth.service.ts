import {
    Injectable,
    BadRequestException,
    UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        const existing = await this.usersService.findByMobile(dto.mobile);

        if (existing) {
            throw new BadRequestException('Mobile already exists');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.usersService.create({
            name: dto.name,
            mobile: dto.mobile,
            password: hashedPassword,
        });

        const { password, ...safeUser } = user;

        return {
            message: 'User created successfully',
            user: safeUser,
        };
    }
    async login(dto: LoginDto) {
        const user = await this.usersService.findByMobile(dto.mobile);

        console.log('LOGIN DTO =>', dto);
        console.log('USER FROM DB =>', user);

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        console.log('DTO PASSWORD =>', dto.password);
        console.log('DB PASSWORD =>', user.password);

        const valid = await bcrypt.compare(
            dto.password,
            user.password,
        );

        if (!valid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const token = this.jwtService.sign({
            sub: user.id,
            mobile: user.mobile,
        });

        const { password, ...safeUser } = user;

        return {
            accessToken: token,
            user: safeUser,
        };
    }

}