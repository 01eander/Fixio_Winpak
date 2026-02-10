import React, { createContext, useContext, useState, useEffect } from 'react';
import { CATALOG, INITIAL_INTERVENTIONS, USERS, UNITS } from '../data/mockData';

const StoreContext = createContext();

export function StoreProvider({ children }) {
    const [inventory, setInventory] = useState(CATALOG);
    const [interventions, setInterventions] = useState(INITIAL_INTERVENTIONS);
    const [role, setRole] = useState('ADMIN'); // 'ADMIN' | 'OPERATOR'
    const [dbUsers, setDbUsers] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3000/api/users')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setDbUsers(data);
            })
            .catch(err => console.error('Error loading users for auth simulation:', err));
    }, []);

    // Derived current user for demo purposes
    // ADMIN -> ID of first user in DB
    // OPERATOR -> ID of second user in DB (or first if only one)
    const currentUserId = role === 'ADMIN'
        ? (dbUsers.length > 0 ? dbUsers[0].id : null)
        : (dbUsers.length > 1 ? dbUsers[1].id : (dbUsers.length > 0 ? dbUsers[0].id : null));

    const [currentUser, setCurrentUser] = useState(null);

    const refreshUser = async () => {
        if (!currentUserId) return;
        try {
            const res = await fetch(`http://localhost:3000/api/users/${currentUserId}`);
            const data = await res.json();
            if (data && !data.error) setCurrentUser(data);
        } catch (err) {
            console.error('Error fetching current user:', err);
        }
    };

    useEffect(() => {
        refreshUser();
    }, [currentUserId]);

    // Settings State
    const [settings, setSettings] = useState({ theme: 'dark', language: 'es', notifications_enabled: true });

    useEffect(() => {
        if (currentUserId) {
            fetch(`http://localhost:3000/api/user-settings/${currentUserId}`)
                .then(res => res.json())
                .then(data => {
                    if (data && !data.error) {
                        setSettings({
                            theme: data.theme || 'dark',
                            language: data.language || 'es',
                            notifications_enabled: data.notifications_enabled !== false
                        });

                        const root = document.documentElement;
                        if (data.theme === 'light') {
                            root.classList.add('light-mode');
                        } else {
                            root.classList.remove('light-mode');
                        }
                    }
                })
                .catch(err => console.error('Error fetching settings:', err));
        }
    }, [currentUserId]);

    const updateSettings = async (newSettings) => {
        if (!currentUserId) return;

        const updated = { ...settings, ...newSettings };
        setSettings(updated);

        const root = document.documentElement;
        if (updated.theme === 'light') {
            root.classList.add('light-mode');
        } else {
            root.classList.remove('light-mode');
        }

        try {
            await fetch(`http://localhost:3000/api/user-settings/${currentUserId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSettings)
            });
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    };

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
            currentUserId,
            currentUser,
            refreshUser,
            settings,
            updateSettings
        }}>
            {children}
        </StoreContext.Provider>
    );
}

export const useStore = () => useContext(StoreContext);
