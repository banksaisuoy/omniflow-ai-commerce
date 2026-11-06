import { describe, it, expect, beforeEach } from 'vitest';
import { usePOSStore } from './posStore';

describe('usePOSStore', () => {
  beforeEach(() => {
    usePOSStore.getState().clear();
  });

  describe('setQty', () => {
    it('should update the quantity of an existing item', () => {
      usePOSStore.getState().addItem({ product_id: '1', name: 'Test', unit_price: 10, qty: 2 });

      usePOSStore.getState().setQty('1', 5);

      const items = usePOSStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].qty).toBe(5);
    });

    it('should remove the item when quantity is set to 0', () => {
      usePOSStore.getState().addItem({ product_id: '1', name: 'Test', unit_price: 10, qty: 2 });

      usePOSStore.getState().setQty('1', 0);

      const items = usePOSStore.getState().items;
      expect(items).toHaveLength(0);
    });

    it('should remove the item when quantity is negative', () => {
      usePOSStore.getState().addItem({ product_id: '1', name: 'Test', unit_price: 10, qty: 2 });

      usePOSStore.getState().setQty('1', -5);

      const items = usePOSStore.getState().items;
      expect(items).toHaveLength(0);
    });

    it('should not affect other items in the cart', () => {
      usePOSStore.getState().addItem({ product_id: '1', name: 'Test 1', unit_price: 10, qty: 2 });
      usePOSStore.getState().addItem({ product_id: '2', name: 'Test 2', unit_price: 20, qty: 3 });

      usePOSStore.getState().setQty('1', 5);
      usePOSStore.getState().setQty('2', 0);

      const items = usePOSStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].product_id).toBe('1');
      expect(items[0].qty).toBe(5);
    });

    it('should not throw if the item does not exist', () => {
      usePOSStore.getState().addItem({ product_id: '1', name: 'Test 1', unit_price: 10, qty: 2 });

      usePOSStore.getState().setQty('non-existent', 5);

      const items = usePOSStore.getState().items;
      expect(items).toHaveLength(1);
      expect(items[0].qty).toBe(2);
    });
  });
});
