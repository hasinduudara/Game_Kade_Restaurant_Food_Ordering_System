import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem } from './CartContext';
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../services/firebaseConfig';

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
    createdAt?: any;
};

type OrderContextType = {
    orders: Order[];
    activeOrder: Order | null;
    addOrderToHistory: (order: Order) => Promise<void>;
    setActiveOrder: (order: Order | null) => void;
    loadingOrders: boolean;
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider = ({ children }: { children: ReactNode }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [activeOrder, setActiveOrderState] = useState<Order | null>(null);
    const [loadingOrders, setLoadingOrders] = useState(true);

    // Listen to Auth State Changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchOrders(user.uid);
            } else {
                setOrders([]);
                setLoadingOrders(false);
            }
        });

        // Cleanup Function
        return () => unsubscribe();
    }, []);

    // Fetch Orders Function
    const fetchOrders = async (userId: string) => {
        setLoadingOrders(true);
        try {
            const q = query(
                collection(db, "orders"),
                where("userId", "==", userId),
                orderBy("createdAt", "desc")
            );

            const querySnapshot = await getDocs(q);
            const fetchedOrders: Order[] = [];

            querySnapshot.forEach((doc) => {
                fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
            });

            setOrders(fetchedOrders);
        } catch (error) {
            console.error("Error fetching orders: ", error);
        } finally {
            setLoadingOrders(false);
        }
    };

    // Save Order to Firebase
    const addOrderToHistory = async (order: Order) => {
        const user = auth.currentUser;
        if (!user) return;

        try {
            const orderData = {
                userId: user.uid,
                items: order.items,
                total: order.total,
                date: order.date,
                status: order.status,
                deliveryDetails: order.deliveryDetails,
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, "orders"), orderData);

            const newOrder = { ...order, id: docRef.id };
            setOrders((prev) => [newOrder, ...prev]);

        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    const setActiveOrder = (order: Order | null) => {
        setActiveOrderState(order);
    };

    return (
        <OrderContext.Provider value={{ orders, activeOrder, addOrderToHistory, setActiveOrder, loadingOrders }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrders = () => {
    const context = useContext(OrderContext);
    if (!context) throw new Error("useOrders must be used within an OrderProvider");
    return context;
};