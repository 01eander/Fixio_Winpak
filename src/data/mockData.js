export const USERS = [
    { id: 1, name: 'Admin User', role: 'ADMIN', avatar: 'https://i.pravatar.cc/150?u=admin' },
    { id: 2, name: 'Operador Juan', role: 'OPERADOR', avatar: 'https://i.pravatar.cc/150?u=juan' },
    { id: 3, name: 'Operador Maria', role: 'OPERADOR', avatar: 'https://i.pravatar.cc/150?u=maria' },
];

export const UNITS = [
    { id: 101, name: 'Extrusora Blown-Film', model: 'W&H Varex II', status: 'Active', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=400&q=80' },
    { id: 102, name: 'Impresora Flexográfica', model: 'Comexi F2', status: 'Maintenance', image: 'https://images.unsplash.com/photo-1565691081699-317df8547b79?auto=format&fit=crop&w=400&q=80' },
    { id: 103, name: 'Laminadora Solventless', model: 'Nordmeccanica Super Simplex', status: 'Active', image: 'https://images.unsplash.com/photo-1585640306359-548842af58cc?auto=format&fit=crop&w=400&q=80' },
    { id: 104, name: 'Cortadora Refiladora', model: 'Kampf Conslit', status: 'Active', image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=400&q=80' },
];

export const CATALOG = [
    { id: 1, name: 'Aceite Motor 15W40', stock: 50, cost: 120.00, isConsumable: true, category: 'Fluids', warehouseId: 1 },
    { id: 2, name: 'Filtro de Aire CAT', stock: 12, cost: 450.50, isConsumable: true, category: 'Filters', warehouseId: 1 },
    { id: 3, name: 'Taladro Percutor', stock: 5, cost: 3500.00, isConsumable: false, category: 'Tools', warehouseId: 2 },
    { id: 4, name: 'Juego de Llaves Allen', stock: 8, cost: 450.00, isConsumable: false, category: 'Tools', warehouseId: 2 },
    { id: 5, name: 'Grasa Litio (Cartucho)', stock: 100, cost: 85.00, isConsumable: true, category: 'Fluids', warehouseId: 1 },
    { id: 6, name: 'Multímetro Fluke', stock: 3, cost: 5200.00, isConsumable: false, category: 'Tools', warehouseId: 2 },
];

export const INITIAL_INTERVENTIONS = [
    {
        id: 5001,
        unitId: 101,
        operatorId: 2,
        date: '2023-10-25T08:30:00',
        status: 'COMPLETED',
        description: 'Cambio de aceite y filtros preventivo',
        itemsUsed: [
            { itemId: 1, quantity: 20, name: 'Aceite Motor 15W40' },
            { itemId: 2, quantity: 1, name: 'Filtro de Aire CAT' },
            { itemId: 99, quantity: 1, name: 'Llave de Filtro (Herramienta)' }
        ]
    },
    {
        id: 5002,
        unitId: 102,
        operatorId: 3,
        date: '2023-10-26T14:15:00',
        status: 'IN_PROGRESS',
        description: 'Revisión sistema eléctrico',
        itemsUsed: [
            { itemId: 6, quantity: 1, name: 'Multímetro Fluke' },
            { itemId: 98, quantity: 1, name: 'Destornillador Aislado (Herramienta)' }
        ]
    }
];

export const MECHANICS = [
    { id: 1, name: 'Juan Perez', specialty: 'Hidráulica', status: 'Activo', level: 'Senior' },
    { id: 2, name: 'Maria Gonzalez', specialty: 'Eléctrica', status: 'Activo', level: 'Junior' },
    { id: 3, name: 'Carlos Ruiz', specialty: 'Mecánica Gral', status: 'Vacaciones', level: 'Master' },
];

export const WAREHOUSES = [
    { id: 1, name: 'Almacén Central', location: 'Nave A', capacity: '1000 items', manager: 'Roberto Gomez' },
    { id: 2, name: 'Almacén Herramientas', location: 'Taller 1', capacity: '500 items', manager: 'Ana Torres' },
];

export const JOBS = [
    { id: 1, name: 'Cambio de Camisas (Sleeves)', type: 'Cambio Formato', estimartedHours: 2, cost: 0 },
    { id: 2, name: 'Limpieza Cabezal Extrusión', type: 'Limpieza Profunda', estimartedHours: 6, cost: 0 },
    { id: 3, name: 'Afilado de Cuchillas', type: 'Mantenimiento Rutina', estimartedHours: 1, cost: 0 },
    { id: 4, name: 'Mantenimiento Preventivo 500h', type: 'Preventivo', estimartedHours: 8, cost: 0 },
    { id: 5, name: 'Calibración de Rodillos', type: 'Calibración', estimartedHours: 3, cost: 0 },
];
