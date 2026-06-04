import type { Response } from 'express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
declare class LoginDto {
    identifier?: string;
    username?: string;
    password: string;
}
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    constructor(authService: AuthService, usersService: UsersService);
    register(): Promise<void>;
    login(dto: LoginDto, res: Response): Promise<any>;
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
