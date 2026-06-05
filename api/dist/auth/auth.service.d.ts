import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private readonly users;
    private readonly jwt;
    constructor(users: UsersService, jwt: JwtService);
    login(identifier: string, password: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            username: string;
            roles: string[];
            nickname: string;
        };
    }>;
    register(body: {
        username: string;
        password: string;
        nickname?: string;
    }): Promise<{
        accessToken: string;
        user: {
            id: string;
            username: string;
            roles: string[];
            nickname: string;
        };
    }>;
    private issue;
    private webAuth;
}
