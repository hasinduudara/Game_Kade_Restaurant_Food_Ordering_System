import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem } from './CartContext';

// Order Type Definition
export type Order = {
    id: string;
    items: CartItem[];
    total: number;
    date: string;
    status: 'Pending' | 'Preparing' | 'Delivering' | 'Completed' | 'Cancelled';
    deliveryDetails?: {
        name: string;
        phone: string;
        address: string;
        paymentMethod: string;
        coordinates?: { latitude: number; longitude: number };
    };
};

type OrderContextType = {
    orders: Order[];
    activeOrder: Order | null;
    addOrderToHistory: (order: Order) => void;
    setActiveOrder: (order: Order | null) => void;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [activeOrder, setActiveOrderState] = useState<Order | null>(null);

    // Order History Function
    const addOrderToHistory = (order: Order) => {
        setOrders((prev) => [order, ...prev]);
    };

    // Active Order Function
    const setActiveOrder = (order: Order | null) => {
        setActiveOrderState(order);
    };

    return (
        <OrderContext.Provider value={{ orders, activeOrder, addOrderToHistory, setActiveOrder }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrders = () => {
    const context = useContext(OrderContext);
    if (!context) throw new Error("useOrders must be used within an OrderProvider");
    return context;
};