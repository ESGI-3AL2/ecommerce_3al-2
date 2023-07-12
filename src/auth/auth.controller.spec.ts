import { TestingModule, Test } from "@nestjs/testing";
import { User } from "../user/schemas/user.schema";
import { UserService } from "../user/user.service";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { Role } from "./enums/role.enum";
import { JwtAuthGuard } from "./guards/jwt.guard";
import { RolesGuard } from "./guards/roles.guard";

describe('AuthController', () => {
    let authController: AuthController;
    let authService: AuthService;
    let userService: UserService;
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [AuthController],
        providers: [AuthService, UserService, JwtAuthGuard, RolesGuard],
      }).compile();
  
      authController = module.get<AuthController>(AuthController);
      authService = module.get<AuthService>(AuthService);
      userService = module.get<UserService>(UserService);
    });
  
    it('should be defined', () => {
      expect(authController).toBeDefined();
    });
  
    describe('/register', () => {
        it('should register a new user', async () => {
            const userDto = { 
                username: 'test', 
                email: 'test@test.com', 
                password: 'test', 
                roles: [Role.User]
            };

            const createdUser: User = {
                username: userDto.username,
                email: userDto.email,
                password: userDto.password,
                roles: userDto.roles,
            };

            jest.spyOn(userService, 'addUser').mockImplementation(() => Promise.resolve(createdUser));
            expect(await authController.register(userDto)).toBe(createdUser);
        });
   
      });
  
  });