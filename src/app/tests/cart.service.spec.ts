import { TestBed } from '@angular/core/testing';
import {CartService} from "../orion/services/cart.service";

describe('CartService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CartService = TestBed.inject(CartService);
    expect(service).toBeTruthy();
  });
});
