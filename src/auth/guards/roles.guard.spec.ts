import { RolesGuard } from './roles.guard';
import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';

describe('RolesGuard', () => {
    let rolesGuard: RolesGuard;
    let reflector: Reflector;
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          RolesGuard,
          Reflector,
        ],
      }).compile();
  
      rolesGuard = module.get<RolesGuard>(RolesGuard);
      reflector = module.get<Reflector>(Reflector);
    });
  
    it('should be defined', () => {
      expect(rolesGuard).toBeDefined();
    });
  
    it('should allow user with role', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.User]);
      const ctx = {
        switchToHttp: () => ({
          getRequest: () => ({ user: { roles: [Role.User] } }),
        }),
        getHandler: () => {}, // mock impl
        getClass: () => {}, // mock impl
      } as unknown as ExecutionContext;
      expect(rolesGuard.canActivate(ctx)).toEqual(true);
    });
  
    it('should not allow user without role', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([Role.Admin]);
      const ctx = {
        switchToHttp: () => ({
          getRequest: () => ({ user: { roles: [Role.User] } }),
        }),
        getHandler: () => {}, // mock impl
        getClass: () => {}, // mock impl
      } as unknown as ExecutionContext;
      expect(rolesGuard.canActivate(ctx)).toEqual(false);
    });
  });
  
