import React, { useState } from 'react';

interface Item {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export const POS = () => {
  const [items, setItems] = useState<Item[]>([
    { id: 1, name: 'Pizza', price: 12.99, quantity: 0 },
    { id: 2, name: 'Burger', price: 8.99, quantity: 0 },
    { id: 3, name: 'Pasta', price: 10.50, quantity: 0 },
    { id: 4, name: 'Salad', price: 7.25, quantity: 0 },
    { id: 5, name: 'Sandwich', price: 6.75, quantity: 0 },
  ]);

  const [cart, setCart] = useState<Item[]>([]);

  const addToCart = (item: Item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        <div style={styles.menuGrid}>
          {items.map(item => (
            <div key={item.id} style={styles.menuItem}>
              <h3 style={styles.itemName}>{item.name}</h3>
              <p style={styles.itemPrice}>${item.price.toFixed(2)}</p>
              <button
                style={styles.addButton}
                onClick={() => addToCart(item)}
              >
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.rightPanel}>
        <div style={styles.cartItems}>
          {cart.map(item => (
            <div key={item.id} style={styles.cartItem}>
              <div style={styles.cartItemInfo}>
                <h3 style={styles.itemName}>{item.name}</h3>
                <p style={styles.itemPrice}>${item.price.toFixed(2)}</p>
              </div>
              <div style={styles.quantityControls}>
                <button
                  style={styles.quantityButton}
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  -
                </button>
                <span style={styles.quantity}>{item.quantity}</span>
                <button
                  style={styles.quantityButton}
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
                <button
                  style={styles.removeButton}
                  onClick={() => removeFromCart(item.id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <div style={styles.totalSection}>
          <h3 style={styles.totalTitle}>Total:</h3>
          <p style={styles.totalAmount}>${total.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    background: '#f8f9fa',
  },
  leftPanel: {
    flex: 2,
    background: 'white',
    borderRight: '1px solid #dee2e6',
    overflowY: 'auto' as const,
  },
  rightPanel: {
    flex: 1,
    background: 'white',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  menuGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
    padding: '1rem',
  },
  menuItem: {
    background: 'white',
    padding: '1rem',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
  },
  itemName: {
    margin: '0 0 0.5rem 0',
    color: '#212529',
  },
  itemPrice: {
    margin: '0 0 1rem 0',
    color: '#6c757d',
    fontSize: '1.1rem',
    fontWeight: 'bold',
  },
  addButton: {
    background: '#dc4c39',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer',
    width: '100%',
  },
  cartItems: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '1rem',
  },
  cartItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem',
    borderBottom: '1px solid #dee2e6',
  },
  cartItemInfo: {
    flex: 1,
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  quantityButton: {
    background: '#f8f9fa',
    border: '1px solid #dee2e6',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  quantity: {
    padding: '0 0.5rem',
  },
  removeButton: {
    background: '#dc3545',
    color: 'white',
    border: 'none',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  totalSection: {
    padding: '1rem',
    borderTop: '1px solid #dee2e6',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalTitle: {
    margin: 0,
    color: '#212529',
  },
  totalAmount: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#dc4c39',
  },
}; 