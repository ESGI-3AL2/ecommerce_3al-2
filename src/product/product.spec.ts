import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { ProductService } from './product.service';
import { ProductDocument, Product } from './schemas/product.schema';
import { CreateProductDTO } from './dtos/create-product.dto';
import { never } from 'rxjs';

describe('ProductService', () => {
  let productService: ProductService;
  let productModel: Model<ProductDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: 'ProductModel',
          useValue: {
            find: jest.fn(),
            findById: jest.fn(),
            create: jest.fn().mockResolvedValue({
              save: jest.fn().mockResolvedValue({}),
            }),
            findByIdAndUpdate: jest.fn(),
            findByIdAndRemove: jest.fn(),
          },
        },
      ],
    }).compile();

    productService = module.get<ProductService>(ProductService);
    productModel = module.get<Model<ProductDocument>>('ProductModel');
  });

  describe('getFilteredProducts', () => {
    it('should return filtered products based on category', async () => {
      const filterProductDTO = { category: 'electronics', search: 'Product 1' };
      const products: Product[] = [
        {
          name: 'Product 1',
          description: 'Description 1',
          price: 10,
          category: 'electronics',
        },
      ];

      jest.spyOn(productService, 'getAllProducts').mockResolvedValue(products);

      const result = await productService.getFilteredProducts(filterProductDTO);

      expect(result).toEqual(products);
    });

    it('should return filtered products based on search', async () => {
      const filterProductDTO = { search: 'Product 1', category: 'electronics' };
      const products: Product[] = [
        {
          name: 'Product 1',
          description: 'Description 1',
          price: 10,
          category: 'electronics',
        },
        {
          name: 'Product 2',
          description: 'Description 2',
          price: 20,
          category: 'fashion',
        },
      ];

      jest.spyOn(productService, 'getAllProducts').mockResolvedValue(products);

      const result = await productService.getFilteredProducts(filterProductDTO);

      expect(result).toEqual([products[0]]);
    });
  });

  describe('getAllProducts', () => {
    it('should return all products', async () => {
      const products: Product[] = [
        {
          name: 'Product 1',
          description: 'Description 1',
          price: 10,
          category: 'electronics',
        },
        {
          name: 'Product 2',
          description: 'Description 2',
          price: 20,
          category: 'fashion',
        },
      ];

      jest.spyOn(productModel, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValue(products),
      } as any);

      const result = await productService.getAllProducts();

      expect(result).toEqual(products);
    });
  });

  describe('getProduct', () => {
    it('should return a product by ID', async () => {
      const product: Product = {
        name: 'Product 1',
        description: 'Description 1',
        price: 10,
        category: 'electronics',
      };

      jest.spyOn(productModel, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValue(product),
      } as any);

      const result = await productService.getProduct('1');

      expect(result).toEqual(product);
    });
  });

  describe('addProduct', () => {
    it('should add a new product', async () => {
      const createProductDTO: CreateProductDTO = {
        name: 'New Product',
        description: 'New Description',
        price: 30,
        category: 'fashion',
      };

      const newProduct: Partial<Product> = {
        name: 'New Product',
        description: 'New Description',
        price: 30,
        category: 'fashion',
      } as never;

      jest.spyOn(productModel, 'create').mockResolvedValue(newProduct as never);

      jest.spyOn(newProduct, 'save').mockReturnValue({});

      const result = await productService.addProduct(createProductDTO);

      expect(productModel.create).toHaveBeenCalledWith(createProductDTO);

      expect(result).toEqual(newProduct);
    });
  });

  describe('updateProduct', () => {
    it('should update a product', async () => {
      const id = '1';
      const createProductDTO: CreateProductDTO = {
        name: 'Updated Product',
        description: 'Updated Description',
        price: 40,
        category: 'electronics',
      };

      const updatedProduct: Product = {
        name: 'Updated Product',
        description: 'Updated Description',
        price: 40,
        category: 'electronics',
      };

      jest
        .spyOn(productModel, 'findByIdAndUpdate')
        .mockResolvedValue(updatedProduct as any);

      const result = await productService.updateProduct(id, createProductDTO);

      expect(result).toEqual(updatedProduct);
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      const id = '1';
      const deletedProduct: Product = {
        name: 'Product 1',
        description: 'Description 1',
        price: 10,
        category: 'electronics',
      };

      jest
        .spyOn(productModel, 'findByIdAndRemove')
        .mockResolvedValue(deletedProduct as any);

      const result = await productService.deleteProduct(id);

      expect(result).toEqual(deletedProduct);
    });
  });
});
