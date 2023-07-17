import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { ItemDTO } from './dtos/item.dto';

describe('CartService', () => {
  let cartService: CartService;
  let cartModel: Model<CartDocument>;

  const mockCartModel = () => ({
    create: jest.fn(),
    findOne: jest.fn(),
    findOneAndRemove: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getModelToken('Cart'),
          useFactory: mockCartModel,
        },
      ],
    }).compile();

    cartService = module.get<CartService>(CartService);
    cartModel = module.get<Model<CartDocument>>(getModelToken('Cart'));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // describe('createCart', () => {
  //   it('should create a new cart', async () => {
  //     const userId = 'user123';
  //     const itemDTO: ItemDTO = {
  //       productId: 'product123',
  //       quantity: 2,
  //       price: 10,
  //     };
  //     const subTotalPrice = itemDTO.quantity * itemDTO.price;
  //     const totalPrice = 0;
  //
  //     const createdCart: Cart = {
  //       _id: 'cart123',
  //       userId,
  //       items: [{ ...itemDTO, subTotalPrice }],
  //       totalPrice,
  //     };
  //
  //     jest.spyOn(cartModel, 'create').mockResolvedValue(createdCart);
  //
  //     const result = await cartService.createCart(
  //       userId,
  //       itemDTO,
  //       subTotalPrice,
  //       totalPrice,
  //     );
  //
  //     expect(cartModel.create).toHaveBeenCalledWith({
  //       userId,
  //       items: [{ ...itemDTO, subTotalPrice }],
  //       totalPrice,
  //     });
  //     expect(result).toEqual(createdCart);
  //   });
  // });

  describe('getCart', () => {
    it('should get the cart for a specific user', async () => {
      const userId = 'userId1';
      const cart: Cart = {
        userId,
        items: [],
        totalPrice: 0,
      };

      jest.spyOn(cartModel, 'findOne').mockResolvedValue(cart);

      const result = await cartService.getCart(userId);

      expect(cartModel.findOne).toHaveBeenCalledWith({ userId });
      expect(result).toEqual(cart);
    });
  });

  // describe('deleteCart', () => {
  //   it('should delete the cart for a specific user', async () => {
  //     const userId = 'user123';
  //
  //     const deletedCart: Cart = {
  //       _id: 'cart123',
  //       userId,
  //       items: [],
  //       totalPrice: 0,
  //     };
  //
  //     jest.spyOn(cartModel, 'findOneAndRemove').mockResolvedValue(deletedCart);
  //
  //     const result = await cartService.deleteCart(userId);
  //
  //     expect(cartModel.findOneAndRemove).toHaveBeenCalledWith({ userId });
  //     expect(result).toEqual(deletedCart);
  //   });
  // });

  // describe('addItemToCart', () => {
  //   it('should add an item to the cart if the cart exists', async () => {
  //     const userId = 'user123';
  //     const itemDTO: ItemDTO = {
  //       productId: 'product123',
  //       quantity: 2,
  //       price: 10,
  //     };
  //     const subTotalPrice = itemDTO.quantity * itemDTO.price;
  //
  //     const existingCart: Cart = {
  //       _id: 'cart123',
  //       userId,
  //       items: [],
  //       totalPrice: 0,
  //     };
  //
  //     const updatedCart: Cart = {
  //       _id: 'cart123',
  //       userId,
  //       items: [{ ...itemDTO, subTotalPrice }],
  //       totalPrice: subTotalPrice,
  //     };
  //
  //     jest.spyOn(cartService, 'getCart').mockResolvedValue(existingCart);
  //     jest.spyOn(cartModel, 'save').mockResolvedValue(updatedCart);
  //
  //     const result = await cartService.addItemToCart(userId, itemDTO);
  //
  //     expect(cartService.getCart).toHaveBeenCalledWith(userId);
  //     expect(existingCart.items).toEqual([{ ...itemDTO, subTotalPrice }]);
  //     expect(existingCart.totalPrice).toBe(subTotalPrice);
  //     expect(cartModel.save).toHaveBeenCalledWith();
  //     expect(result).toEqual(updatedCart);
  //   });
  //
  //   it('should create a new cart and add an item if the cart does not exist', async () => {
  //     const userId = 'user123';
  //     const itemDTO: ItemDTO = {
  //       productId: 'product123',
  //       quantity: 2,
  //       price: 10,
  //     };
  //     const subTotalPrice = itemDTO.quantity * itemDTO.price;
  //     const totalPrice = itemDTO.price;
  //
  //     const newCart: Cart = {
  //       _id: 'cart123',
  //       userId,
  //       items: [{ ...itemDTO, subTotalPrice }],
  //       totalPrice,
  //     };
  //
  //     jest.spyOn(cartService, 'getCart').mockResolvedValue(null);
  //     jest.spyOn(cartService, 'createCart').mockResolvedValue(newCart);
  //
  //     const result = await cartService.addItemToCart(userId, itemDTO);
  //
  //     expect(cartService.getCart).toHaveBeenCalledWith(userId);
  //     expect(cartService.createCart).toHaveBeenCalledWith(
  //       userId,
  //       itemDTO,
  //       subTotalPrice,
  //       totalPrice,
  //     );
  //     expect(result).toEqual(newCart);
  //   });
  // });

  // describe('removeItemFromCart', () => {
  //   it('should remove an item from the cart', async () => {
  //     const userId = 'user123';
  //     const productId = 'product123';
  //
  //     const cart: Cart = {
  //       _id: 'cart123',
  //       userId,
  //       items: [
  //         { productId: 'product123', quantity: 2, price: 10, subTotalPrice: 20 },
  //         { productId: 'product456', quantity: 1, price: 5, subTotalPrice: 5 },
  //       ],
  //       totalPrice: 25,
  //     };
  //
  //     jest.spyOn(cartService, 'getCart').mockResolvedValue(cart);
  //     jest.spyOn(cartModel, 'save').mockResolvedValue(cart);
  //
  //     const result = await cartService.removeItemFromCart(userId, productId);
  //
  //     expect(cartService.getCart).toHaveBeenCalledWith(userId);
  //     expect(cart.items.length).toBe(1);
  //     expect(cart.items).not.toContainEqual(
  //       expect.objectContaining({ productId }),
  //     );
  //     expect(cartModel.save).toHaveBeenCalledWith();
  //     expect(result).toEqual(cart);
  //   });
  //
  //   it('should not remove anything if the item does not exist in the cart', async () => {
  //     const userId = 'user123';
  //     const productId = 'product123';
  //
  //     const cart: Cart = {
  //       _id: 'cart123',
  //       userId,
  //       items: [
  //         { productId: 'product456', quantity: 1, price: 5, subTotalPrice: 5 },
  //       ],
  //       totalPrice: 5,
  //     };
  //
  //     jest.spyOn(cartService, 'getCart').mockResolvedValue(cart);
  //
  //     const result = await cartService.removeItemFromCart(userId, productId);
  //
  //     expect(cartService.getCart).toHaveBeenCalledWith(userId);
  //     expect(cart.items.length).toBe(1);
  //     expect(cartModel.save).not.toHaveBeenCalled();
  //     expect(result).toBeUndefined();
  //   });
  // });
});
