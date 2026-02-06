import React, { createContext, useContext, useState } from 'react';
import { CATALOG, INITIAL_INTERVENTIONS, USERS, UNITS } from '../data/mockData';

const StoreContext = createContext();

export function StoreProvider({ children }) {
    const [inventory, setInventory] = useState(CATALOG);
    const [interventions, setInterventions] = useState(INITIAL_INTERVENTIONS);
    const [role, setRole] = useState('ADMIN'); // 'ADMIN' | 'OPERATOR'

    // Derived current user for demo purposes
    // ADMIN -> ID 1 (Admin User)
    // OPERATOR -> ID 2 (Operador Juan)
    const currentUserId = role === 'ADMIN' ? 1 : 2;

    // Action to add intervention and deduct stock
    const addIntervention = (interventionData) => {
        const newIntervention = {
            id: Date.now(),
            date: new Date().toISOString(),
            ...interventionData
        };

        setInterventions([newIntervention, ...interventions]);

        // Update stock only for consumables
        const itemsToUpdate = interventionData.itemsUsed || [];
        setInventory(prevInventory => {
            return prevInventory.map(item => {
                const usedItem = itemsToUpdate.find(i => i.itemId === item.id);
                if (usedItem && item.isConsumable) {
                    return { ...item, stock: Math.max(0, item.stock - usedItem.quantity) };
                }
                return item;
            });
        });
    };

    const updateInterventionStatus = (id, newStatus) => {
        setInterventions(prev => prev.map(inter =>
            inter.id === parseInt(id) ? { ...inter, status: newStatus } : inter
        ));
    };

    return (
        <StoreContext.Provider value={{
            inventory,
            interventions,
            users: USERS,
            units: UNITS,
            addIntervention,
            updateInterventionStatus,
            role,
            setRole,
            currentUserId
        }}>
            {children}
        </StoreContext.Provider>
    );
}

export const useStore = () => useContext(StoreContext);
