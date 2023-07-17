import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductDTO } from './dtos/create-product.dto';
import { FilterProductDTO } from './dtos/filter-product.dto';
import { Product } from './schemas/product.schema';

describe('ProductController', () => {
  let productController: ProductController;
  let productService: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: {
            getFilteredProducts: jest.fn(),
            getAllProducts: jest.fn(),
            getProduct: jest.fn(),
            addProduct: jest.fn(),
            updateProduct: jest.fn(),
            deleteProduct: jest.fn(),
          },
        },
      ],
    }).compile();

    productController = module.get<ProductController>(ProductController);
    productService = module.get<ProductService>(ProductService);
  });

  it('should return all products', async () => {
    const result: Product[] = [];
    jest.spyOn(productService, 'getAllProducts').mockImplementation(() => Promise.resolve(result));
    expect(await productController.getProducts({} as FilterProductDTO)).toBe(result);
  });
  
  it('should return filtered products', async () => {
    const filterDto: FilterProductDTO = { category: 'electronics', search: 'phone' };
    const result: Product[] = [];
    jest.spyOn(productService, 'getFilteredProducts').mockImplementation(() => Promise.resolve(result));
    expect(await productController.getProducts(filterDto)).toBe(result);
  });
  

  it('should throw an error when a product does not exist', async () => {
    jest.spyOn(productService, 'getProduct').mockImplementation(() => Promise.resolve(null));
    await expect(productController.getProduct('a1')).rejects.toThrow(NotFoundException);
  });

  it('should return a product by id', async () => {
    const result: Product = { name: 'product1', category: 'electronics', price: 100, description: 'Sample description' };
    jest.spyOn(productService, 'getProduct').mockImplementation(() => Promise.resolve(result));
    expect(await productController.getProduct('a1')).toBe(result);
  });

  it('should add a product', async () => {
    const dto: CreateProductDTO = { name: 'product1', category: 'electronics', price: 100, description: 'Sample description' };
    const result: Product = dto;
    jest.spyOn(productService, 'addProduct').mockImplementation(() => Promise.resolve(result));
    expect(await productController.addProduct(dto)).toBe(result);
  });

  it('should update a product', async () => {
    const dto: CreateProductDTO = { name: 'product1', category: 'electronics', price: 100, description: 'Sample description' };
    const result: Product = dto;
    jest.spyOn(productService, 'updateProduct').mockImplementation(() => Promise.resolve(result));
    expect(await productController.updateProduct('a1', dto)).toBe(result);
  });

  it('should delete a product', async () => {
    const result: Product = { name: 'product1', category: 'electronics', price: 100, description: 'Sample description' };
    jest.spyOn(productService, 'deleteProduct').mockImplementation(() => Promise.resolve(result));
    expect(await productController.deleteProduct('a1')).toBe(result);
  });

  it('should throw an error when deleting a product that does not exist', async () => {
    jest.spyOn(productService, 'deleteProduct').mockImplementation(() => Promise.resolve(null));
    await expect(productController.deleteProduct('a1')).rejects.toThrow(NotFoundException);
  });
});
