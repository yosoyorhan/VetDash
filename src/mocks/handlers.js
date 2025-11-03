import { http, HttpResponse } from 'msw';

const customers = [
  {
    id: 1,
    name: 'Ali Yılmaz',
    email: 'ali.yilmaz@example.com',
    phone: '555-123-4567',
    avatar: 'AY',
    animalCount: 2,
    lastAppointment: '2024-10-15',
    tags: ['Sadık Müşteri', 'Kedi'],
    balance: 150.0,
    spendingHistory: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 50, 120, 150],
  },
  {
    id: 2,
    name: 'Veli Demir',
    email: 'veli.demir@example.com',
    phone: '555-987-6543',
    avatar: 'VD',
    animalCount: 1,
    lastAppointment: '2024-09-22',
    tags: ['Yeni Müşteri', 'Köpek'],
    balance: 0,
    spendingHistory: [5, 15, 25, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
  },
  {
    id: 3,
    name: 'Ayşe Kaya',
    email: 'ayse.kaya@example.com',
    phone: '555-555-5555',
    avatar: 'AK',
    animalCount: 3,
    lastAppointment: '2024-08-01',
    tags: ['Riskli', 'Kuş'],
    balance: -450.0,
    spendingHistory: [200, 180, 150, 120, 100, 80, 60, 40, 20, 0, -50, -100, -200],
  },
  {
    id: 4,
    name: 'Fatma Öztürk',
    email: 'fatma.ozturk@example.com',
    phone: '555-111-2222',
    avatar: 'FÖ',
    animalCount: 1,
    lastAppointment: '2024-10-20',
    tags: ['Sadece Mama Alır', 'Kedi'],
    balance: 50.75,
    spendingHistory: [5, 10, 15, 20, 25, 30, 25, 20, 15, 10, 5, 10, 15],
  },
  {
    id: 5,
    name: 'Mehmet Çelik',
    email: 'mehmet.celik@example.com',
    phone: '555-333-4444',
    avatar: 'MÇ',
    animalCount: 2,
    lastAppointment: '2024-07-11',
    tags: ['Sadık Müşteri', 'Köpek'],
    balance: 320.5,
    spendingHistory: [10, 30, 50, 70, 90, 110, 130, 150, 170, 190, 210, 230, 250],
  },
  {
    id: 6,
    name: 'Zeynep Arslan',
    email: 'zeynep.arslan@example.com',
    phone: '555-666-7777',
    avatar: 'ZA',
    animalCount: 1,
    lastAppointment: '2024-10-05',
    tags: ['Yeni Müşteri'],
    balance: 0,
    spendingHistory: [0, 0, 10, 20, 15, 10, 5, 0, 5, 10, 15, 20, 25],
  },
  {
    id: 7,
    name: 'Mustafa Doğan',
    email: 'mustafa.dogan@example.com',
    phone: '555-888-9999',
    avatar: 'MD',
    animalCount: 4,
    lastAppointment: '2024-06-18',
    tags: ['VIP', 'Çiftlik Hayvanları'],
    balance: 1250.0,
    spendingHistory: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300],
  },
  {
    id: 8,
    name: 'Emine Şahin',
    email: 'emine.sahin@example.com',
    phone: '555-000-1111',
    avatar: 'EŞ',
    animalCount: 1,
    lastAppointment: '2023-12-25',
    tags: ['Pasif', 'Kedi'],
    balance: 0,
    spendingHistory: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10],
  },
  {
    id: 9,
    name: 'Hüseyin Kurt',
    email: 'huseyin.kurt@example.com',
    phone: '555-222-3333',
    avatar: 'HK',
    animalCount: 2,
    lastAppointment: '2024-09-30',
    tags: ['Köpek', 'Kedi'],
    balance: 75.0,
    spendingHistory: [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70],
  },
];

export const handlers = [
  http.get('/api/customers', ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    console.log(`[MSW] Fecthing customers for page: ${page}`);
    return HttpResponse.json({
      page: parseInt(page),
      totalPages: 1,
      totalCustomers: customers.length,
      customers,
    });
  }),

  http.get('/api/customers/:id', ({ params }) => {
    const { id } = params;
    const customer = customers.find((c) => c.id === parseInt(id));
    if (!customer) {
      return new HttpResponse(null, { status: 404 });
    }
    console.log(`[MSW] Fecthing customer with id: ${id}`);
    return HttpResponse.json(customer);
  }),

  http.post('/api/customers/:id/actions/message', async ({ request, params }) => {
    const { id } = params;
    const body = await request.json();
    console.log(`[MSW] Sending message to customer ${id}:`, body.message);
    return HttpResponse.json({ success: true, message: 'Message sent!' });
  }),

  http.post('/api/customers/:id/actions/charge', async ({ request, params }) => {
    const { id } = params;
    const body = await request.json();
    console.log(`[MSW] Charging customer ${id} with amount:`, body.amount);
    const customer = customers.find((c) => c.id === parseInt(id));
    if (customer) {
      customer.balance += body.amount;
    }
    return HttpResponse.json({ success: true, message: 'Charge successful!' });
  }),
];
