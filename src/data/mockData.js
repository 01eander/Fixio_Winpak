export const USERS = [
    { id: 1, name: 'Admin User', role: 'ADMIN', avatar: 'https://i.pravatar.cc/150?u=admin' },
    { id: 2, name: 'Operador Juan', role: 'OPERADOR', avatar: 'https://i.pravatar.cc/150?u=juan' },
    { id: 3, name: 'Operador Maria', role: 'OPERADOR', avatar: 'https://i.pravatar.cc/150?u=maria' },
];

export const UNITS = [
    { id: 101, name: 'Extrusora Blown-Film', model: 'W&H Varex II', status: 'Active', areaId: 1, image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=400&q=80' },
    { id: 102, name: 'Impresora Flexográfica', model: 'Comexi F2', status: 'Maintenance', areaId: 2, image: 'https://images.unsplash.com/photo-1565691081699-317df8547b79?auto=format&fit=crop&w=400&q=80' },
    { id: 103, name: 'Laminadora Solventless', model: 'Nordmeccanica Super Simplex', status: 'Active', areaId: 3, image: 'https://images.unsplash.com/photo-1585640306359-548842af58cc?auto=format&fit=crop&w=400&q=80' },
    { id: 104, name: 'Cortadora Refiladora', model: 'Kampf Conslit', status: 'Active', areaId: 4, image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=400&q=80' },
];

export const AREAS = [
    { id: 1, name: 'Extrusión', description: 'Área de producción de película plástica', manager: 'Ing. Roberto Méndez', image: 'https://images.unsplash.com/photo-1624823183491-9efb4260aa2a?auto=format&fit=crop&w=400&q=80' },
    { id: 2, name: 'Impresión', description: 'Impresión Flexográfica y Rotograbado', manager: 'Lic. Ana Solares', image: 'https://images.unsplash.com/photo-1565691081699-317df8547b79?auto=format&fit=crop&w=400&q=80' },
    { id: 3, name: 'Laminación', description: 'Proceso de laminado solventless y base solvente', manager: 'Ing. Carlos Ruiz', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80' },
    { id: 4, name: 'Corte y Refilado', description: 'Corte de bobinas a medida del cliente', manager: 'Ing. Pedro Torres', image: 'https://images.unsplash.com/photo-1531297461136-82lw8z0e?auto=format&fit=crop&w=400&q=80' },
    { id: 5, name: 'Bolseo / Confección', description: 'Manufactura de bolsas y pouches', manager: 'Lic. Sofia Ramos', image: 'https://images.unsplash.com/photo-1590606626685-6184cc1be6cb?auto=format&fit=crop&w=400&q=80' },
    { id: 6, name: 'Almacén de Materia Prima', description: 'Resinas, tintas y adhesivos', manager: 'Lic. Juan Pérez', image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80' },
    { id: 7, name: 'Mantenimiento General', description: 'Taller de reparaciones y refacciones', manager: 'Ing. David López', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=400&q=80' },
    { id: 8, name: 'Control de Calidad', description: 'Laboratorio de pruebas físicas y químicas', manager: 'QFB. Maria González', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=80' },
];

export const COMPONENTS = [
    // Components for Unit 101 (Extrusora)
    { id: 1001, equipoId: 101, parentId: null, name: 'Cabezal de Extrusión', sku: 'EXT-HEAD-001', description: 'Cabezal principal de 3 capas', quantity: 1 },
    { id: 1002, equipoId: 101, parentId: 1001, name: 'Boquilla (Die)', sku: 'EXT-DIE-300', description: 'Boquilla de 300mm', quantity: 1 },
    { id: 1003, equipoId: 101, parentId: 1001, name: 'Calentador Cerámico', sku: 'HEAT-CER-500', description: 'Banda calefactora 500W', quantity: 6 },
    { id: 1004, equipoId: 101, parentId: null, name: 'Panel de Control', sku: 'PNL-MAIN-X1', description: 'HMI y PLC principal', quantity: 1 },
    { id: 1005, equipoId: 101, parentId: 1004, name: 'Módulo PLC CPU', sku: 'SIEMENS-S7-1500', description: 'CPU de seguridad', quantity: 1 },

    // Components for Unit 102 (Impresora)
    { id: 2001, equipoId: 102, parentId: null, name: 'Tambor Central', sku: 'IMP-DRUM-20', description: 'Tambor de contrapresión', quantity: 1 },
    { id: 2002, equipoId: 102, parentId: null, name: 'Unidad de Secado', sku: 'DRY-SYS-01', description: 'Sistema de secado entre colores', quantity: 1 },
    { id: 2003, equipoId: 102, parentId: 2002, name: 'Ventilador Centrifugo', sku: 'FAN-HV-50', description: 'Motor 5HP', quantity: 2 },
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
        technicianId: 1, // Asignado a Admin (ID 1) u otro
        date: '2026-02-05T08:30:00',
        status: 'COMPLETED',
        orderType: 'PREVENTIVE',
        description: 'Cambio de aceite y filtros preventivo',
        activities: ['Drenado de aceite usado', 'Cambio de filtro de aire', 'Relleno de aceite nuevo'],
        itemsUsed: [
            { itemId: 1, quantity: 20, name: 'Aceite Motor 15W40', isTool: false },
            { itemId: 2, quantity: 1, name: 'Filtro de Aire CAT', isTool: false },
            { itemId: 99, quantity: 1, name: 'Llave de Filtro', isTool: true }
        ]
    },
    {
        id: 5002,
        unitId: 102,
        operatorId: 3,
        technicianId: 2, // Asignado a Operador Juan (ID 2)
        date: '2026-02-06T14:15:00',
        status: 'IN_PROGRESS',
        orderType: 'CORRECTIVE',
        description: 'Revisión sistema eléctrico por fallo en panel',
        activities: ['Diagnóstico de falla a tierra', 'Reemplazo de fusible principal'],
        itemsUsed: [
            { itemId: 6, quantity: 1, name: 'Multímetro Fluke', isTool: true },
            { itemId: 98, quantity: 1, name: 'Fusible 10A (Consumible)', isTool: false }
        ]
    },
    {
        id: 5003,
        unitId: 101, // Extrusora
        operatorId: 2,
        technicianId: 1,
        date: '2026-02-07T09:00:00',
        status: 'PENDING',
        orderType: 'PREVENTIVE',
        description: 'Lubricación general de rodamientos y cadenas',
        activities: ['Limpieza de puntos de engrase', 'Aplicación de grasa de litio', 'Verificación de temperaturas'],
        itemsUsed: [{ itemId: 5, quantity: 2, name: 'Grasa Litio (Cartucho)', isTool: false }]
    },
    {
        id: 5004,
        unitId: 103, // Laminadora
        operatorId: 3,
        technicianId: 2,
        date: '2026-02-08T08:00:00',
        status: 'PENDING',
        orderType: 'PREVENTIVE',
        description: 'Limpieza y ajuste de rodillos de laminación',
        activities: ['Desmontaje de guardas', 'Limpieza con solvente', 'Ajuste de presión'],
        itemsUsed: []
    },
    {
        id: 5005,
        unitId: 102, // Impresora
        operatorId: 2,
        technicianId: 3,
        date: '2026-02-09T10:30:00',
        status: 'PENDING',
        orderType: 'PREVENTIVE',
        description: 'Cambio de filtros de tinta y limpieza de bombas',
        activities: ['Drenado de sistema', 'Reemplazo de filtros', 'Purga de bombas'],
        itemsUsed: [{ itemId: 2, quantity: 4, name: 'Filtro de Aire CAT', isTool: false }] // Mock filter usage
    },
    {
        id: 5006,
        unitId: 104, // Cortadora
        operatorId: 3,
        technicianId: 1,
        date: '2026-02-10T07:45:00',
        status: 'PENDING',
        orderType: 'PREVENTIVE',
        description: 'Afilado y calibración de cuchillas de corte',
        activities: ['Desmontaje de cuchillas', 'Afilado', 'Calibración de separación'],
        itemsUsed: [{ itemId: 4, quantity: 1, name: 'Juego de Llaves Allen', isTool: true }]
    },
    {
        id: 5007,
        unitId: 101, // Extrusora
        operatorId: 2,
        technicianId: 2,
        date: '2026-02-10T14:00:00',
        status: 'PENDING',
        orderType: 'PREVENTIVE',
        description: 'Revisión y torque de tornillos del cabezal',
        activities: ['Inspección visual', 'Torqueo según especificación', 'Prueba de fugas'],
        itemsUsed: [{ itemId: 3, quantity: 1, name: 'Taladro Percutor', isTool: true }]
    },
    {
        id: 5008,
        unitId: 103, // Laminadora
        operatorId: 3,
        technicianId: 3,
        date: '2026-02-11T09:15:00',
        status: 'PENDING',
        orderType: 'PREVENTIVE',
        description: 'Inspección termográfica de tableros eléctricos',
        activities: ['Apertura de tableros', 'Escaneo termográfico', 'Reporte de puntos calientes'],
        itemsUsed: [{ itemId: 6, quantity: 1, name: 'Multímetro Fluke', isTool: true }]
    },
    {
        id: 5009,
        unitId: 102, // Impresora
        operatorId: 2,
        technicianId: 1,
        date: '2026-02-12T11:00:00',
        status: 'PENDING',
        orderType: 'PREVENTIVE',
        description: 'Limpieza de túneles de secado',
        activities: ['Apagado de equipos', 'Limpieza de resistencias', 'Verificación de flujo de aire'],
        itemsUsed: []
    },
    {
        id: 5010,
        unitId: 104, // Cortadora
        operatorId: 3,
        technicianId: 2,
        date: '2026-02-13T08:30:00',
        status: 'PENDING',
        orderType: 'PREVENTIVE',
        description: 'Revisión de frenos y tensión de bobinas',
        activities: ['Prueba de frenado', 'Ajuste de celdas de carga', 'Calibración de tensión'],
        itemsUsed: []
    },
    {
        id: 5011,
        unitId: 101, // Extrusora
        operatorId: 2,
        technicianId: 3,
        date: '2026-02-14T15:00:00',
        status: 'PENDING',
        orderType: 'PREVENTIVE',
        description: 'Cambio de sellos en sistema hidráulico',
        activities: ['Despresurización', 'Cambio de O-rings', 'Prueba de presión'],
        itemsUsed: [{ itemId: 1, quantity: 5, name: 'Aceite Motor 15W40', isTool: false }]
    },
    {
        id: 5012,
        unitId: 103, // Laminadora
        operatorId: 3,
        technicianId: 1,
        date: '2026-02-15T10:00:00',
        status: 'PENDING',
        orderType: 'PREVENTIVE',
        description: 'Mantenimiento a sistema de dosificación de adhesivo',
        activities: ['Limpieza de mangueras', 'Calibración de mezcla', 'Cambio de filtros de línea'],
        itemsUsed: [{ itemId: 2, quantity: 2, name: 'Filtro de Aire CAT', isTool: false }]
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
    { id: 1, name: 'Cambio de Camisas (Sleeves)', type: 'Cambio Formato', time: 2, cost: 0 },
    { id: 2, name: 'Limpieza Cabezal Extrusión', type: 'Limpieza Profunda', time: 6, cost: 0 },
    { id: 3, name: 'Afilado de Cuchillas', type: 'Mantenimiento Rutina', time: 1, cost: 0 },
    { id: 4, name: 'Mantenimiento Preventivo 500h', type: 'Preventivo', time: 8, cost: 0 },
    { id: 5, name: 'Calibración de Rodillos', type: 'Calibración', time: 3, cost: 0 },
    // Nuevos trabajos importados
    { id: 6, name: 'Lubricación de cierres rápidos', type: 'Lubricación', time: 0.5, cost: 0 },
    { id: 7, name: 'Lubricación husillo brazo empalme', type: 'Lubricación', time: 1, cost: 0 },
    { id: 8, name: 'Revisión de serretas de corte', type: 'Inspección', time: 1, cost: 0 },
    { id: 9, name: 'Engrase engranajes transmisión giro torreta', type: 'Lubricación', time: 2, cost: 0 },
    { id: 10, name: 'Revisión elementos neumáticos y eléctricos', type: 'Inspección', time: 3, cost: 0 },
    { id: 11, name: 'Revisión estado y posición de sensores', type: 'Calibración', time: 2, cost: 0 },
    { id: 12, name: 'Prueba paros de emergencia', type: 'Seguridad', time: 0.5, cost: 0 },
    { id: 13, name: 'Prueba barreras fotoeléctricas', type: 'Seguridad', time: 0.5, cost: 0 },
    { id: 14, name: 'Inspección rodillos guía', type: 'Inspección', time: 1, cost: 0 },
    { id: 15, name: 'Inspección estado de motores', type: 'Preventivo', time: 2, cost: 0 },
    { id: 16, name: 'Revisión sensores seguridad brazo empalme', type: 'Seguridad', time: 1, cost: 0 },
    { id: 17, name: 'Verificación lector diámetro bobina', type: 'Calibración', time: 0.5, cost: 0 },
    { id: 18, name: 'Sustitución filtros aire armario eléctrico', type: 'Preventivo', time: 1, cost: 0 },
    { id: 19, name: 'Nivel aceite motorreductor torreta', type: 'Inspección', time: 0.5, cost: 0 },
    { id: 20, name: 'Inspección correas dentadas', type: 'Inspección', time: 1, cost: 0 },
    { id: 21, name: 'Engrase rodamiento giro torreta', type: 'Lubricación', time: 1.5, cost: 0 },
];
