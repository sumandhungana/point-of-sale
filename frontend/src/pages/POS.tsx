import React, { useState } from 'react';
import '../styles/POS.css';

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
    <div className="pos-container">
      <div className="pos-left-panel">
        <div className="pos-menu-grid">
          {items.map(item => (
            <div key={item.id} className="pos-menu-item">
              <h3 className="pos-item-name">{item.name}</h3>
              <p className="pos-item-price">${item.price.toFixed(2)}</p>
              <button
                className="pos-add-button"
                onClick={() => addToCart(item)}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add to Cart
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="pos-right-panel">
        <div className="pos-cart-items">
          {cart.map(item => (
            <div key={item.id} className="pos-cart-item">
              <div className="pos-cart-item-info">
                <h3 className="pos-item-name">{item.name}</h3>
                <p className="pos-item-price">${item.price.toFixed(2)}</p>
              </div>
              <div className="pos-quantity-controls">
                <button
                  className="pos-quantity-button"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  <i className="bi bi-dash"></i>
                </button>
                <span className="pos-quantity">{item.quantity}</span>
                <button
                  className="pos-quantity-button"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  <i className="bi bi-plus"></i>
                </button>
                <button
                  className="pos-remove-button"
                  onClick={() => removeFromCart(item.id)}
                >
                  <i className="bi bi-trash me-1"></i>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="pos-total-section">
          <h3 className="pos-total-title">
            <i className="bi bi-cart-check me-2"></i>
            Total:
          </h3>
          <p className="pos-total-amount">${total.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}; 