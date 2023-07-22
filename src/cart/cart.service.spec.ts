import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument } from './schemas/cart.schema';
import { ItemDTO } from './dtos/item.dto';
import { Item } from './schemas/item.schema';

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
      expect(result.userId).toEqual(userId);
      expect(result.items.length).toEqual(0);
      expect(result.items).toEqual([]);
      expect(result.totalPrice).toEqual(0);
      expect(result).toEqual(cart);
    });
  });

  describe('addItemToCart', () => {
    const userId = 'userId1';
    let itemDTO: ItemDTO;

    beforeEach(() => {
      itemDTO = {
        productId: 'productId1',
        name: 'product 1',
        quantity: 2,
        price: 20,
      };
    });

    it('should create a new cart and add an item if the cart does not exist', async () => {
      // arrange
      const item: Item = {
        ...itemDTO,
        subTotalPrice: 20,
      };
      const subTotalPrice = item.quantity * item.price;
      const totalPrice = subTotalPrice;
      const newCart: Cart = {
        userId,
        items: [{ ...item }],
        totalPrice,
      };
      jest.spyOn(cartService, 'getCart').mockResolvedValue(null);
      jest.spyOn(cartService, 'createCart').mockResolvedValue(newCart);

      // act
      const result = await cartService.addItemToCart(userId, item);

      // assert
      expect(cartService.getCart).toHaveBeenCalledWith(userId);
      expect(cartService.createCart).toHaveBeenCalledWith(
        userId,
        item,
        subTotalPrice,
        item.price,
      );
      expect(result.userId).toEqual(userId);
      expect(result.items.length).toEqual(1);
      expect(result.items).toEqual([item]);
      expect(result.totalPrice).toEqual(totalPrice);
      expect(result).toEqual(newCart);
    });

    it('should add a first item to the cart if the cart exists', async () => {
      // arrange
      const subTotalPrice = itemDTO.quantity * itemDTO.price;

      const updatedItems = [{ ...itemDTO, subTotalPrice }];
      const updatedCart: Cart = {
        userId,
        items: [...updatedItems],
        totalPrice: subTotalPrice,
      };

      const existingCart = {
        userId,
        items: [],
        totalPrice: 0,
        save: jest.fn().mockResolvedValue(updatedCart),
      } as any as CartDocument;

      jest
        .spyOn(cartService, 'getCart')
        .mockImplementation(() =>
          Promise.resolve(existingCart as CartDocument),
        );

      // act
      const result = await cartService.addItemToCart(userId, itemDTO);

      // assert
      expect(cartService.getCart).toHaveBeenCalledWith(userId);
      expect(existingCart.save).toBeCalled();
      expect(result.userId).toEqual(userId);
      expect(result.items.length).toEqual(1);
      expect(result.items).toEqual(updatedItems);
      expect(result.totalPrice).toEqual(subTotalPrice);
    });

    it('should add recalculate the cart when adding an existing item', async () => {
      // arrange
      itemDTO = {
        productId: 'productId1',
        name: 'product 1',
        quantity: 10,
        price: 20,
      };

      const existingItems = [
        {
          productId: 'productId1',
          name: 'product 1',
          quantity: 2,
          price: 10,
          subTotalPrice: 20,
        },
        {
          productId: 'productId2',
          name: 'product 2',
          quantity: 100,
          price: 10,
          subTotalPrice: 1000,
        },
      ];

      const updatedCardItems: Item[] = [
        {
          ...existingItems[0],
          quantity: itemDTO.quantity + existingItems[0].quantity,
          subTotalPrice:
            itemDTO.quantity * existingItems[0].price +
            existingItems[0].price * existingItems[0].quantity,
        },
        {
          ...existingItems[1],
          subTotalPrice: existingItems[1].price * existingItems[1].quantity,
        },
      ];
      const updatedCart: Cart = {
        userId,
        items: [...updatedCardItems],
        totalPrice:
          updatedCardItems[0].subTotalPrice + updatedCardItems[1].subTotalPrice,
      };

      const existingCart = {
        userId,
        items: [...existingItems],
        totalPrice:
          existingItems[0].subTotalPrice + existingItems[1].subTotalPrice,
        save: jest.fn().mockResolvedValue({ ...updatedCart }),
      } as any as CartDocument;

      jest
        .spyOn(cartService, 'getCart')
        .mockImplementation(() =>
          Promise.resolve(existingCart as CartDocument),
        );

      // act
      const result = await cartService.addItemToCart(userId, itemDTO);

      // assert
      expect(cartService.getCart).toHaveBeenCalledWith(userId);
      expect(existingCart.save).toBeCalled();
      expect(result.userId).toEqual(userId);
      expect(result.items.length).toEqual(2);
      expect(result.items).toEqual(updatedCardItems);
      expect(result.totalPrice).toEqual(1120);
    });
  });
});
