export interface Plan {
    id: string;
    name: string;
    price: number;
    priceId: string;
    paymentLink: string;
    features: string[];
    highlighted?: boolean;
    icon: string;
}

export const PLANS: Plan[] = [
    {
        id: 'basico',
        name: 'Básico',
        price: 9.99,
        priceId: 'price_1T7jrtRtfeCjDhyD4RfBhSKi',
        paymentLink: 'https://buy.stripe.com/28E28teACbwC6yuaXEeQM01',
        icon: 'storefront',
        features: [
            'Perfil de negocio publicado',
            'Hasta 3 eventos por mes',
            'Hasta 2 promociones activas',
            'Listado en búsquedas',
            'Estadísticas básicas',
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 24.99,
        priceId: 'price_1T7jrvRtfeCjDhyDVDc0IyyU',
        paymentLink: 'https://buy.stripe.com/14A3cxeACfMSaOK4zgeQM02',
        icon: 'rocket_launch',
        highlighted: true,
        features: [
            'Todo lo del plan Básico',
            'Eventos ilimitados',
            'Promociones ilimitadas',
            'Destacado en búsquedas',
            'Estadísticas avanzadas',
            'Badge "Negocio Pro"',
        ],
    },
    {
        id: 'premium',
        name: 'Premium',
        price: 49.99,
        priceId: 'price_1T7jryRtfeCjDhyD12B9i9j5',
        paymentLink: 'https://buy.stripe.com/4gMaEZ78aasyf50e9QeQM03',
        icon: 'diamond',
        features: [
            'Todo lo del plan Pro',
            'Posición prioritaria #1',
            'Soporte prioritario 24/7',
            'Badge "Verificado"',
            'Anuncios destacados gratis',
            'Reportes mensuales PDF',
        ],
    },
];
