import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(username: string, password: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            username: any;
            roles: any;
        };
    }>;
    login(username: string, password: string): Promise<{
        accessToken: string;
        user: {
            id: string;
            username: any;
            roles: any;
        };
    }>;
    private sign;
}
