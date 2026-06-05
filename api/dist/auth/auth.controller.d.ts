import type { Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
declare class LoginDto {
    identifier?: string;
    username?: string;
    password: string;
}
declare class RegisterDto {
    username: string;
    password: string;
    nickname?: string;
}
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    constructor(authService: AuthService, usersService: UsersService);
    register(dto: RegisterDto, res: Response): Promise<{
        accessToken: string;
        user: {
            id: string;
            username: string;
            roles: string[];
            nickname: string;
        };
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        accessToken: string;
        user: {
            id: string;
            username: string;
            roles: string[];
            nickname: string;
        };
    }>;
    logout(res: Response): {
        ok: boolean;
    };
    me(req: any): Promise<{
        id: any;
        username: any;
        roles: any;
        nickname: any;
        earningsBalance: any;
    }>;
    becomeDeveloper(req: any): Promise<{
        ok: boolean;
    }>;
}
export {};
