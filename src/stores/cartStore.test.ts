import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './cartStore';

describe('useCartStore', () => {
  beforeEach(() => {
    // Reset the cart state before each test
    useCartStore.getState().clearCart();
  });

  it('should have initial empty state', () => {
    const state = useCartStore.getState();
    expect(state.items).toEqual([]);
    expect(state.getTotalItems()).toBe(0);
    expect(state.getTotalPrice()).toBe(0);
  });

  it('should add a new item to the cart', () => {
    const item = { id: '1', name: 'Test Product', price: 100, thumbnail_url: null };
    useCartStore.getState().addItem(item);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toEqual({ ...item, quantity: 1 });
    expect(state.getTotalItems()).toBe(1);
    expect(state.getTotalPrice()).toBe(100);
  });

  it('should increment quantity when adding an existing item', () => {
    const item = { id: '1', name: 'Test Product', price: 100, thumbnail_url: null };
    useCartStore.getState().addItem(item);
    useCartStore.getState().addItem(item);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
    expect(state.getTotalItems()).toBe(2);
    expect(state.getTotalPrice()).toBe(200);
  });

  it('should remove an item from the cart', () => {
    const item1 = { id: '1', name: 'Product 1', price: 100, thumbnail_url: null };
    const item2 = { id: '2', name: 'Product 2', price: 200, thumbnail_url: null };

    useCartStore.getState().addItem(item1);
    useCartStore.getState().addItem(item2);

    let state = useCartStore.getState();
    expect(state.items).toHaveLength(2);

    useCartStore.getState().removeItem('1');

    state = useCartStore.getState();
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe('2');
  });

  it('should update item quantity', () => {
    const item = { id: '1', name: 'Product 1', price: 100, thumbnail_url: null };
    useCartStore.getState().addItem(item);

    useCartStore.getState().updateQuantity('1', 5);

    const state = useCartStore.getState();
    expect(state.items[0].quantity).toBe(5);
    expect(state.getTotalItems()).toBe(5);
    expect(state.getTotalPrice()).toBe(500);
  });

  it('should remove item when quantity is updated to 0', () => {
    const item = { id: '1', name: 'Product 1', price: 100, thumbnail_url: null };
    useCartStore.getState().addItem(item);

    useCartStore.getState().updateQuantity('1', 0);

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
  });

  it('should clear the cart', () => {
    const item1 = { id: '1', name: 'Product 1', price: 100, thumbnail_url: null };
    const item2 = { id: '2', name: 'Product 2', price: 200, thumbnail_url: null };

    useCartStore.getState().addItem(item1);
    useCartStore.getState().addItem(item2);

    useCartStore.getState().clearCart();

    const state = useCartStore.getState();
    expect(state.items).toHaveLength(0);
    expect(state.getTotalItems()).toBe(0);
    expect(state.getTotalPrice()).toBe(0);
  });
});
