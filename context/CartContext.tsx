import React, { createContext, useContext, useState, ReactNode } from 'react';

export type CartItem = {
    id: number | string;
    name: string;
    price: string;
    image: any;
    quantity: number;
};

type CartContextType = {
    items: CartItem[];
    addToCart: (item: any, qty?: number) => void;
    removeFromCart: (id: number | string) => void;
    updateQuantity: (id: number | string, action: 'increase' | 'decrease') => void;
    clearCart: () => void;
    getTotalPrice: () => number;
    cartCount: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>([]);

    const addToCart = (product: any, qty: number = 1) => {
        setItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id);

            if (existingItem) {
                return prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + qty }
                        : item
                );
            } else {
                return [...prevItems, { ...product, quantity: qty }];
            }
        });
    };

    const removeFromCart = (id: number | string) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: number | string, action: 'increase' | 'decrease') => {
        setItems((prevItems) => {
            return prevItems.map((item) => {
                if (item.id === id) {
                    if (action === 'increase') return { ...item, quantity: item.quantity + 1 };
                    if (action === 'decrease') return { ...item, quantity: Math.max(1, item.quantity - 1) };
                }
                return item;
            });
        });
    };

    // Implement clearCart function
    const clearCart = () => {
        setItems([]);
    };

    const getTotalPrice = () => {
        return items.reduce((total, item) => {
            let cleanPrice = item.price.toLowerCase().replace('rs.', '').replace('rs', '');
            cleanPrice = cleanPrice.replace(/[^0-9.]/g, '');
            const priceNumber = parseFloat(cleanPrice) || 0;
            return total + (priceNumber * item.quantity);
        }, 0);
    };

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getTotalPrice,
            cartCount: items.length
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error("useCart must be used within a CartProvider");
    return context;
};