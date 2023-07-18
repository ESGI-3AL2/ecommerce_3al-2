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
      expect(result).toEqual(cart);
    });
  });

  it('should create a new cart and add an item if the cart does not exist', async () => {
    const userId = 'userId1';
    const itemDTO: Item = {
      productId: 'productId1',
      name: 'product name',
      quantity: 2,
      price: 10,
      subTotalPrice: 20,
    };
    const subTotalPrice = itemDTO.quantity * itemDTO.price;
    const totalPrice = subTotalPrice;
    const newCart: Cart = {
      userId,
      items: [itemDTO],
      totalPrice,
    };
    jest.spyOn(cartService, 'getCart').mockResolvedValue(null);
    jest.spyOn(cartService, 'createCart').mockResolvedValue(newCart);

    const result = await cartService.addItemToCart(userId, itemDTO);

    expect(cartService.getCart).toHaveBeenCalledWith(userId);
    expect(cartService.createCart).toHaveBeenCalledWith(
      userId,
      itemDTO,
      subTotalPrice,
      itemDTO.price,
    );
    expect(result).toEqual(newCart);
  });
});
