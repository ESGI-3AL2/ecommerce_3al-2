import { TestingModule, Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ItemDTO } from './dtos/item.dto';

describe('AuthController', () => {
  let cartController: CartController;
  let cartService: CartService;
  let req;

  const mockCartService = {
    addItemToCart: jest.fn().mockResolvedValue({}),
    removeItemFromCart: jest.fn().mockResolvedValue({}),
    deleteCart: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        CartService,
        JwtAuthGuard,
        RolesGuard,
        {
          provide: getModelToken(ItemDTO.name),
          useValue: Model,
        },
      ],
    })
      .overrideProvider(CartService)
      .useValue(mockCartService)
      .compile();

    cartController = module.get<CartController>(CartController);
    cartService = module.get<CartService>(CartService);
    req = {
      user: {
        userId: 'userId1',
      },
    };
  });

  it('should be defined', () => {
    expect(cartController).toBeDefined();
  });

  describe('addItemToCart', () => {
    let itemDTO: ItemDTO;

    beforeEach(() => {
      itemDTO = {
        name: 'item',
        price: 100,
        productId: 'productId1',
        quantity: 2,
      };
    });

    xit('should throw an error for an unauthenticated user', async () => {
      req = { user: { undefined } };

      await expect(() => cartController.addItemToCart(req, itemDTO))
        .toThrowError
        // UnauthorizedException
        ();
    });

    it('should add an item to the cart and return it', async () => {
      const userId = req.user.userId;
      const cart = { userId, items: [], totalPrice: 0 };
      jest.spyOn(cartService, 'addItemToCart').mockResolvedValue(cart);

      const result = await cartController.addItemToCart(req, itemDTO);

      expect(cartService.addItemToCart).toHaveBeenCalledWith(userId, itemDTO);
      expect(result).toEqual(cart);
    });
  });

  describe('removeItemFromCart', () => {
    let itemDTO: ItemDTO;
    let product: { productId: string };

    beforeEach(() => {
      product = { productId: 'productId1' };
      itemDTO = {
        name: 'item',
        price: 100,
        productId: 'productId1',
        quantity: 2,
      };
    });

    it('should throw a NotFoundException if the item is not in the cart', async () => {
      jest.spyOn(cartService, 'removeItemFromCart').mockResolvedValue(null);

      await expect(
        cartController.removeItemFromCart(req, product),
      ).rejects.toThrowError(NotFoundException);
    });

    it('should remove an item from the cart', async () => {
      const userId = req.user.userId;
      const cart = { userId, items: [], totalPrice: 0 };
      jest.spyOn(cartService, 'removeItemFromCart').mockResolvedValue(cart);

      const result = await cartController.removeItemFromCart(req, product);

      expect(cartService.removeItemFromCart).toHaveBeenCalledWith(
        userId,
        product.productId,
      );
      expect(result).toEqual(cart);
    });
  });

  describe('deleteCart', () => {
    it('should throw a NotFoundException if the cart does not exist', async () => {
      const userId = req.user.userId;

      jest.spyOn(cartService, 'deleteCart').mockResolvedValue(null);

      await expect(cartController.deleteCart(userId)).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('should delete the cart and return it', async () => {
      const userId = req.user.userId;
      const cart = { userId, items: [], totalPrice: 0 };
      jest.spyOn(cartService, 'deleteCart').mockResolvedValue(cart);

      const result = await cartController.deleteCart(userId);

      expect(cartService.deleteCart).toHaveBeenCalledWith(userId);
      expect(result).toEqual(cart);
    });
  });
});
