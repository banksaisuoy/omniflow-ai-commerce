import { describe, it, expect, beforeEach } from 'vitest';
import { usePOSStore } from '../posStore';

describe('usePOSStore', () => {
  const initialStoreState = usePOSStore.getState();

  beforeEach(() => {
    usePOSStore.setState(initialStoreState, true);
  });

  it('should have correct initial state', () => {
    const state = usePOSStore.getState();
    expect(state.items).toEqual([]);
    expect(state.discountTotal).toBe(0);
    expect(state.notes).toBe('');
    expect(state.subtotal()).toBe(0);
    expect(state.total()).toBe(0);
  });

  describe('addItem', () => {
    it('should add a new item with default qty 1', () => {
      const item = { product_id: 'p1', name: 'Product 1', unit_price: 100 };
      usePOSStore.getState().addItem(item);

      const state = usePOSStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual({
        ...item,
        qty: 1,
        line_discount: 0,
      });
    });

    it('should add a new item with specified qty', () => {
      const item = { product_id: 'p1', name: 'Product 1', unit_price: 100, qty: 5 };
      usePOSStore.getState().addItem(item);

      const state = usePOSStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual({
        ...item,
        qty: 5,
        line_discount: 0,
      });
    });

    it('should increment qty if item already exists', () => {
      const item = { product_id: 'p1', name: 'Product 1', unit_price: 100 };
      usePOSStore.getState().addItem(item);
      usePOSStore.getState().addItem({ ...item, qty: 2 });

      const state = usePOSStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].qty).toBe(3);
    });
  });

  describe('setQty', () => {
    it('should update item quantity', () => {
      const item = { product_id: 'p1', name: 'Product 1', unit_price: 100 };
      usePOSStore.getState().addItem(item);
      usePOSStore.getState().setQty('p1', 5);

      const state = usePOSStore.getState();
      expect(state.items[0].qty).toBe(5);
    });

    it('should remove item if quantity is set to 0', () => {
      const item = { product_id: 'p1', name: 'Product 1', unit_price: 100 };
      usePOSStore.getState().addItem(item);
      usePOSStore.getState().setQty('p1', 0);

      const state = usePOSStore.getState();
      expect(state.items).toHaveLength(0);
    });

    it('should not allow negative quantity and should remove item instead', () => {
      const item = { product_id: 'p1', name: 'Product 1', unit_price: 100 };
      usePOSStore.getState().addItem(item);
      usePOSStore.getState().setQty('p1', -1);

      const state = usePOSStore.getState();
      expect(state.items).toHaveLength(0);
    });
  });

  describe('removeItem', () => {
    it('should remove item by product_id', () => {
      usePOSStore.getState().addItem({ product_id: 'p1', name: 'Product 1', unit_price: 100 });
      usePOSStore.getState().addItem({ product_id: 'p2', name: 'Product 2', unit_price: 200 });

      usePOSStore.getState().removeItem('p1');

      const state = usePOSStore.getState();
      expect(state.items).toHaveLength(1);
      expect(state.items[0].product_id).toBe('p2');
    });
  });

  describe('setLineDiscount', () => {
    it('should update line discount for specific item', () => {
      usePOSStore.getState().addItem({ product_id: 'p1', name: 'Product 1', unit_price: 100 });
      usePOSStore.getState().setLineDiscount('p1', 20);

      const state = usePOSStore.getState();
      expect(state.items[0].line_discount).toBe(20);
    });

    it('should not allow negative line discount', () => {
      usePOSStore.getState().addItem({ product_id: 'p1', name: 'Product 1', unit_price: 100 });
      usePOSStore.getState().setLineDiscount('p1', -10);

      const state = usePOSStore.getState();
      expect(state.items[0].line_discount).toBe(0);
    });
  });

  describe('setDiscountTotal', () => {
    it('should set discount total', () => {
      usePOSStore.getState().setDiscountTotal(50);
      expect(usePOSStore.getState().discountTotal).toBe(50);
    });

    it('should not allow negative discount total', () => {
      usePOSStore.getState().setDiscountTotal(-50);
      expect(usePOSStore.getState().discountTotal).toBe(0);
    });
  });

  describe('setNotes', () => {
    it('should set notes', () => {
      usePOSStore.getState().setNotes('Some notes here');
      expect(usePOSStore.getState().notes).toBe('Some notes here');
    });
  });

  describe('clear', () => {
    it('should reset state to initial', () => {
      usePOSStore.getState().addItem({ product_id: 'p1', name: 'Product 1', unit_price: 100 });
      usePOSStore.getState().setDiscountTotal(50);
      usePOSStore.getState().setNotes('Notes');

      usePOSStore.getState().clear();

      const state = usePOSStore.getState();
      expect(state.items).toEqual([]);
      expect(state.discountTotal).toBe(0);
      expect(state.notes).toBe('');
    });
  });

  describe('Calculations (subtotal and total)', () => {
    beforeEach(() => {
      usePOSStore.getState().addItem({ product_id: 'p1', name: 'Product 1', unit_price: 100, qty: 2 }); // 200
      usePOSStore.getState().addItem({ product_id: 'p2', name: 'Product 2', unit_price: 50, qty: 3 }); // 150
      // subtotal should be 350
    });

    it('should calculate correct subtotal without line discounts', () => {
      expect(usePOSStore.getState().subtotal()).toBe(350);
    });

    it('should calculate correct subtotal with line discounts', () => {
      usePOSStore.getState().setLineDiscount('p1', 20); // 200 - 20 = 180
      usePOSStore.getState().setLineDiscount('p2', 10); // 150 - 10 = 140

      expect(usePOSStore.getState().subtotal()).toBe(320);
    });

    it('should calculate correct total with discount total', () => {
      usePOSStore.getState().setDiscountTotal(50);
      expect(usePOSStore.getState().total()).toBe(300);
    });

    it('should calculate correct total with both line discounts and discount total', () => {
      usePOSStore.getState().setLineDiscount('p1', 20);
      usePOSStore.getState().setDiscountTotal(50);
      // Subtotal: 350 - 20 = 330
      // Total: 330 - 50 = 280
      expect(usePOSStore.getState().total()).toBe(280);
    });

    it('should not return negative total if discount exceeds subtotal', () => {
      usePOSStore.getState().setDiscountTotal(400); // More than 350
      expect(usePOSStore.getState().total()).toBe(0);
    });
  });
});
