import { createContext, useContext, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = useCallback((product, size = '', color = '', qty = 1) => {
    const key = `${product._id}-${size}-${color}`;

    setCart(prev => {
      const exists = prev.find(i => `${i._id}-${i.size}-${i.color}` === key);

      if (exists) {
        if (exists.cartQty + qty > product.quantity) {
          // Schedule toast outside of state updater to avoid setState-during-render
          setTimeout(() => toast.error(`Only ${product.quantity} in stock`), 0);
          return prev;
        }
        return prev.map(i =>
          `${i._id}-${i.size}-${i.color}` === key ? { ...i, cartQty: i.cartQty + qty } : i
        );
      }

      if (qty > product.quantity) {
        setTimeout(() => toast.error(`Only ${product.quantity} in stock`), 0);
        return prev;
      }

      // Schedule toast outside of state updater
      setTimeout(() => toast.success(`${product.name} added to cart! 🛍️`), 0);
      return [...prev, { ...product, size, color, cartQty: qty }];
    });

    // Open cart after adding
    setIsOpen(true);
  }, []);

  const removeFromCart = useCallback((productId, size, color) => {
    setCart(prev => prev.filter(i => !(i._id === productId && i.size === size && i.color === color)));
  }, []);

  const updateQty = useCallback((productId, size, color, qty) => {
    if (qty < 1) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart(prev =>
      prev.map(i =>
        i._id === productId && i.size === size && i.color === color ? { ...i, cartQty: qty } : i
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = cart.reduce((sum, i) => sum + i.sellingPrice * i.cartQty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.cartQty, 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQty, clearCart,
      cartTotal, cartCount, isOpen, setIsOpen,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
