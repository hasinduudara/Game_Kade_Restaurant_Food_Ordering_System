import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem } from './CartContext';

export type Order = {
    id: string;
    items: CartItem[];
    total: number;
    date: string;
    status: 'Pending' | 'Completed' | 'Cancelled';
};

type OrderContextType = {
    orders: Order[];
    addOrder: (items: CartItem[], total: number) => void;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
    const [orders, setOrders] = useState<Order[]>([]);

    const addOrder = (items: CartItem[], total: number) => {
        const newOrder: Order = {
            id: Math.random().toString(36).substr(2, 9),
            items: items,
            total: total,
            date: new Date().toLocaleString(),
            status: 'Pending',
        };
        // Add new order to the beginning of the list
        setOrders((prev) => [newOrder, ...prev]);
    };

    return (
        <OrderContext.Provider value={{ orders, addOrder }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrders = () => {
    const context = useContext(OrderContext);
    if (!context) throw new Error("useOrders must be used within an OrderProvider");
    return context;
};