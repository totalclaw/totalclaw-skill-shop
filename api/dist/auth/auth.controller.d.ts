import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
declare class CredentialsDto {
    username: string;
    password: string;
}
export declare class AuthController {
    private readonly authService;
    private readonly usersService;
    constructor(authService: AuthService, usersService: UsersService);
    register(dto: CredentialsDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            username: any;
            roles: any;
        };
    }>;
    login(dto: CredentialsDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            username: any;
            roles: any;
        };
    }>;
    me(req: any): Promise<{
        id: any;
        username: any;
        roles: any;
        nickname: string;
        earningsBalance: number;
    }>;
    becomeDeveloper(req: any): Promise<{
        ok: boolean;
    }>;
}
export {};
