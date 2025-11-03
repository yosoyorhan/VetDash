import { supabase } from '@/lib/customSupabaseClient';

const getUserClinicId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.error('User not authenticated.');
        return null;
    }
    
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    if (authError) console.error("Auth error:", authError);

    const clinicIdFromMeta = authUser?.user?.user_metadata?.clinic_id;
    if(clinicIdFromMeta) return clinicIdFromMeta;

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('clinic_id')
        .eq('id', user.id)
        .single();

    if (error || !profile) {
        console.error('Error fetching user profile or clinic_id:', error?.message);
        return null;
    }

    return profile.clinic_id;
};

// ANIMAL FUNCTIONS
export const getAnimals = async () => {
  const { data, error } = await supabase
    .from('animals')
    .select('id, name, ear_tag_number, species, breed, dob, status, location, clinic_id, current_weight, microchip_id, customer_id')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching animals:', error);
    return [];
  }
  
  return data.map(animal => ({
    ...animal,
    ear_tag: animal.ear_tag_number, // backward compatibility
  }));
};

export const getAnimalById = async (animalId) => {
  const { data, error } = await supabase
    .from('animals')
    .select(`*, customers:customer_id (full_name, phone, email)`)
    .eq('id', animalId)
    .single();

  if (error) {
    console.error('Error fetching animal by ID:', error);
    throw error;
  }
  
  return data;
};

export const saveAnimal = async (animalData) => {
    const { id, customers, ...rest } = animalData;
    const { data: { user } } = await supabase.auth.getUser();
    const clinicId = await getUserClinicId();
    if (!clinicId) throw new Error("Klinik ID bulunamadı.");
    
    const cleanData = { ...rest };
    if (cleanData.current_weight === '' || cleanData.current_weight === undefined) cleanData.current_weight = null;
    if (cleanData.customer_id === '' || !cleanData.customer_id) cleanData.customer_id = null;
    
    const dataToSave = { ...cleanData, customer_id: cleanData.customer_id || null };


    let query;
    let action = 'oluşturuldu';

    if (id) {
        action = 'güncellendi';
        query = supabase.from('animals').update(dataToSave).eq('id', id);
    } else {
        query = supabase.from('animals').insert({ ...dataToSave, clinic_id: clinicId });
    }
    
    const { data, error } = await query.select().single();
    if (error) throw error;

    await supabase.from('audit_logs').insert({
        user_id: user?.id,
        action: `Hayvan kaydı ${action}`,
        target_id: data.id,
        target_table: 'animals',
        details: { changes: dataToSave },
        clinic_id: clinicId
    });

    return data;
};

export const deleteAnimal = async (animalId) => {
    const { error } = await supabase.from('animals').delete().eq('id', animalId);
    if (error) throw error;
    return true;
};

// CUSTOMER FUNCTIONS
export const getCustomersWithBalance = async () => {
    const { data, error } = await supabase.rpc('get_customers_with_balance');
    if (error) { console.error('Error fetching customers with balance:', error); throw error; }
    return data;
};

export const getCustomerById = async (customerId) => {
    const { data, error } = await supabase.from('customers').select('*').eq('id', customerId).single();
    if (error) { console.error('Error fetching customer by id:', error); return null; }
    return data;
};

export const getAnimalsByCustomer = async (customerId) => {
    if(!customerId) return [];
    const { data, error } = await supabase.from('animals').select('id, name, species').eq('customer_id', customerId);
    if (error) { console.error('Error fetching animals by customer:', error); return []; }
    return data;
};

export const getAppointmentsByCustomer = async (customerId) => {
    if(!customerId) return [];
    const { data, error } = await supabase.from('appointments').select('*').eq('customer_id', customerId).order('start_time', { ascending: false });
    if(error) { console.error('Error fetching appointments for customer:', error); return []; }
    return data;
}

export const getTransactionsByCustomer = async (customerId) => {
    if(!customerId) return [];
    const { data, error } = await supabase.from('transactions').select('*').eq('customer_id', customerId).order('transaction_date', { ascending: false });
    if (error) { console.error('Error fetching transactions:', error); return []; }
    return data;
};

export const saveCustomer = async (customerData) => {
    const clinicId = await getUserClinicId();
    if (!clinicId) throw new Error("Klinik ID bulunamadı.");
    const { id, ...rest } = customerData;
    const dataToSave = { ...rest, clinic_id: clinicId };
    let query;
    if (id) {
        query = supabase.from('customers').update(dataToSave).eq('id', id);
    } else {
        query = supabase.from('customers').insert(dataToSave);
    }
    const { data, error } = await query.select().single();
    if (error) throw error;
    return data;
};

export const saveTransaction = async (transactionData) => {
    const clinicId = await getUserClinicId();
    if (!clinicId) throw new Error("Klinik ID bulunamadı.");
    const { amount, transaction_type, ...rest } = transactionData;

    const dataToSave = { 
        ...rest,
        clinic_id: clinicId,
        amount: Math.abs(parseFloat(amount) || 0),
        transaction_type: transaction_type,
        customer_id: transactionData.customer_id || null
    };

    const { data, error } = await supabase.from('transactions').insert(dataToSave).select().single();
    if (error) {
        console.error("Error saving transaction:", error);
        throw error;
    }
    return data;
};

// HEALTH RECORDS (Unified)
export const getHealthRecordsByAnimal = async (animalId) => {
    if (!animalId) return [];
    const { data, error } = await supabase.from('health_records').select(`*, profiles(full_name)`).eq('animal_id', animalId).order('event_date', { ascending: false });
    if (error) { console.error(`Error fetching health records for animal ${animalId}:`, error); return []; }
    return data;
};

export const getHealthRecordById = async (recordId) => {
    if (!recordId) return null;
    const { data, error } = await supabase.from('health_records').select(`*, profiles(full_name)`).eq('id', recordId).single();
    if (error) { console.error(`Error fetching health record by ID ${recordId}:`, error); throw error; }
    return data;
};

export const saveHealthRecord = async (recordData) => {
    if (!recordData.animal_id) throw new Error("Hayvan ID'si zorunludur.");
    const { id, profiles, ...rest } = recordData;
    const clinicId = await getUserClinicId();
    if (!clinicId) throw new Error("Klinik ID bulunamadı.");
    const dataToSave = { ...rest };
    if (dataToSave.administered_by === '') dataToSave.administered_by = null;
    if (dataToSave.next_check_date === '' || dataToSave.next_check_date === null) dataToSave.next_check_date = null;
    let query;
    if (id) {
        query = supabase.from('health_records').update(dataToSave).eq('id', id);
    } else {
        query = supabase.from('health_records').insert({ ...dataToSave });
    }
    const { data: savedRecord, error } = await query.select().single();
    if (error) { console.error('Error saving health record:', error); throw error; }

    if (savedRecord.event_type === 'insemination' && savedRecord.next_check_date) {
        const reminderMessage = `Gebelik kontrolü - Hayvan: ${savedRecord.animal_id}`;
        const { data: existingReminder } = await supabase.from('reminders').select('id').eq('animal_id', savedRecord.animal_id).like('message', 'Gebelik kontrolü%').single();
        const reminderData = { animal_id: savedRecord.animal_id, due_date: savedRecord.next_check_date, message: reminderMessage, clinic_id: clinicId, status: 'pending' };
        if (existingReminder) {
            await supabase.from('reminders').update(reminderData).eq('id', existingReminder.id);
        } else {
            await supabase.from('reminders').insert(reminderData);
        }
    }
    return savedRecord;
};

export const deleteHealthRecord = async (recordId) => {
    const { error } = await supabase.from('health_records').delete().eq('id', recordId);
    if (error) { console.error('Error deleting health record:', error); throw error; }
    return true;
};


// APPOINTMENTS
export const getAppointments = async (date) => {
  const clinicId = await getUserClinicId();
  if (!clinicId) return [];
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  const { data, error } = await supabase.from('appointments').select(`*, customer:customers(id, full_name), animal:animals(id, name, species)`).eq('clinic_id', clinicId).gte('start_time', startOfDay.toISOString()).lte('start_time', endOfDay.toISOString()).order('start_time', { ascending: true });
  if (error) { console.error('Error fetching appointments:', error); return []; }
  return data;
};

export const getAppointmentById = async (id) => {
    const { data, error } = await supabase
        .from('appointments')
        .select(`
            id,
            start_time,
            status,
            notes,
            customer:customers (full_name, phone, email),
            animal:animals (name, species)
        `)
        .eq('id', id)
        .single();
    if (error) throw error;
    return data;
}

export const saveAppointment = async (appointmentData) => {
    const clinicId = await getUserClinicId();
    if (!clinicId) throw new Error("Klinik ID bulunamadı.");
    const { id, customer, animal, ...rest } = appointmentData;
    const startTime = new Date(rest.start_time);
    const endTime = rest.end_time ? new Date(rest.end_time) : new Date(startTime.getTime() + 60 * 60 * 1000);
    const dataToSave = { 
        ...rest, 
        clinic_id: clinicId,
        end_time: endTime.toISOString(),
        animal_id: rest.animal_id || null,
        address: rest.appointment_type === 'Yerinde' ? (rest.address || 'Belirtilmemiş') : null,
        customer_id: rest.customer_id || null,
    };
    if(!dataToSave.customer_id) throw new Error("Müşteri seçimi zorunludur.");
    let query;
    if (id) {
        query = supabase.from('appointments').update(dataToSave).eq('id', id);
    } else {
        query = supabase.from('appointments').insert(dataToSave);
    }
    const { data, error } = await query.select().single();
    if (error) { console.error('Error saving appointment:', error); throw error; }
    return data;
};

export const updateAppointmentStatus = async (id, status) => {
  const { data, error } = await supabase.from('appointments').update({ status }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

// PAYMENTS
export const savePayment = async (paymentData) => {
    const clinicId = await getUserClinicId();
    if (!clinicId) throw new Error("Klinik ID bulunamadı.");
    const dataToSave = { ...paymentData, clinic_id: clinicId, customer_id: paymentData.customer_id || null };
    const { data: payment, error: paymentError } = await supabase.from('payments').insert(dataToSave).select().single();
    if (paymentError) throw paymentError;

    const transactionToSave = {
        clinic_id: clinicId,
        customer_id: payment.customer_id,
        amount: payment.amount,
        transaction_type: 'gelir',
        category: 'Ödeme',
        description: `Ödeme - ${payment.payment_method}`,
        transaction_date: new Date(payment.payment_date).toISOString().split('T')[0],
    };
    await saveTransaction(transactionToSave);

    return payment;
};

export const getPayments = async () => {
    const clinicId = await getUserClinicId();
    if (!clinicId) return [];
    const { data, error } = await supabase.from('payments').select('*, customers(full_name)').eq('clinic_id', clinicId).order('payment_date', { ascending: false });
    if (error) { console.error('Error fetching payments:', error); throw error; }
    return data;
};

// PRODUCTS & CATEGORIES
export const saveProduct = async (productData) => {
    const clinicId = await getUserClinicId();
    if (!clinicId) throw new Error("Klinik ID bulunamadı.");
    const dataToSave = { ...productData, clinic_id: clinicId };
    const { data, error } = await supabase.from('products').insert(dataToSave).select().single();
    if (error) throw error;
    return data;
};

export const getProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('name', { ascending: true });
    if (error) { console.error('Error fetching products:', error); return []; }
    return data;
};

export const saveProductCategory = async (categoryName) => {
    const clinicId = await getUserClinicId();
    if (!clinicId) throw new Error("Klinik ID bulunamadı.");
    const { data, error } = await supabase.from('product_categories').insert({ name: categoryName, clinic_id: clinicId }).select().single();
    if (error) throw error;
    return data;
};

export const getProductCategories = async () => {
    const { data, error } = await supabase.from('product_categories').select('*').order('name', { ascending: true });
    if (error) { console.error('Error fetching product categories:', error); return []; }
    return data;
};

// AI CHAT FUNCTIONS
export const getOrCreateChatSession = async (animalId) => {
    const clinicId = await getUserClinicId();
    const { data: { user } } = await supabase.auth.getUser();
    if (!clinicId || !user) throw new Error("Kullanıcı veya klinik bilgisi bulunamadı.");

    let { data: session, error: sessionError } = await supabase
        .from('ai_chat_sessions')
        .select('id, ai_chat_messages(*)')
        .eq('animal_id', animalId)
        .eq('user_id', user.id)
        .order('created_at', { foreignTable: 'ai_chat_messages', ascending: true })
        .maybeSingle();

    if (sessionError) {
        console.error("Error fetching chat session:", sessionError);
        throw sessionError;
    }

    if (!session) {
        const { data: newSession, error: newSessionError } = await supabase
            .from('ai_chat_sessions')
            .insert({ animal_id: animalId, user_id: user.id, clinic_id: clinicId })
            .select('id')
            .single();

        if (newSessionError) {
            console.error("Error creating new chat session:", newSessionError);
            throw newSessionError;
        }
        session = { id: newSession.id, ai_chat_messages: [] };
    }
    
    return session;
};

export const addChatMessage = async (sessionId, role, content) => {
    const { data, error } = await supabase
        .from('ai_chat_messages')
        .insert({ session_id: sessionId, role, content })
        .select()
        .single();

    if (error) {
        console.error("Error adding chat message:", error);
        throw error;
    }
    return data;
};


// OTHER FUNCTIONS
export const getCustomers = async () => {
  const { data, error } = await supabase.from('customers').select('id, full_name').order('full_name', { ascending: true });
  if (error) { console.error('Error fetching customers:', error); return []; }
  return data;
};

export const getVeterinarians = async () => {
    const clinicId = await getUserClinicId();
    if (!clinicId) return [];
    const { data, error } = await supabase.from('profiles').select('id, full_name').eq('clinic_id', clinicId).or('role.eq.Veteriner,role.eq.Admin');
    if (error) { console.error('Error fetching veterinarians:', error); return []; }
    return data;
};

export const getDashboardKPIs = async () => {
    const clinicId = await getUserClinicId();
    if (!clinicId) return { totalAnimals: 0, totalCustomers: 0, recentTransactions: 0, todaysPayments: 0 };
    const { count: totalAnimals, error: animalsError } = await supabase.from('animals').select('*', { count: 'exact', head: true }).eq('clinic_id', clinicId);
    if (animalsError) console.error("Error fetching total animals:", animalsError);
    const { count: totalCustomers, error: customersError } = await supabase.from('customers').select('*', { count: 'exact', head: true }).eq('clinic_id', clinicId);
    if (customersError) console.error("Error fetching total customers:", customersError);
    const today = new Date();
    today.setHours(0,0,0,0);
    const { data: paymentsToday, error: paymentsError } = await supabase.from('payments').select('amount').eq('clinic_id', clinicId).gte('payment_date', today.toISOString());
    if (paymentsError) console.error("Error fetching today's payments:", paymentsError);
    const todaysPayments = paymentsToday?.reduce((sum, p) => sum + p.amount, 0) || 0;
    return {
        totalAnimals: totalAnimals || 0,
        totalCustomers: totalCustomers || 0,
        todaysPayments,
    };
};

export const getWeeklyRevenue = async () => ([
  { day: 'Pzt', revenue: 2400 }, { day: 'Sal', revenue: 1398 }, { day: 'Çar', revenue: 9800 },
  { day: 'Per', revenue: 3908 }, { day: 'Cum', revenue: 4800 }, { day: 'Cmt', revenue: 3800 },
  { day: 'Paz', revenue: 4300 },
]);

export const getInventory = async () => {
    const { data, error } = await supabase.from('inventory_items').select('*').order('created_at', { ascending: false });
    if (error) { console.error('Error fetching inventory:', error); return []; }
    return data.map(item => ({ ...item, name: item.item_name, lot_no: `LOT-${item.id.substring(0,4)}`, uom: 'adet' }));
};

export const getUsers = async () => {
    const clinicId = await getUserClinicId();
    if (!clinicId) return [];
    const { data, error } = await supabase.from('profiles').select('id, full_name, role').eq('clinic_id', clinicId);
    if (error) { console.error('Error fetching users:', error); return []; }
    return data.map(user => ({ id: user.id, name: user.full_name, role: user.role }));
};

export const getAnimalAuditLogs = async (animalId) => {
    if (!animalId) return [];
    const { data, error } = await supabase.from('audit_logs').select('*').eq('target_id', animalId).eq('target_table', 'animals').order('created_at', { ascending: false });
    if (error) { console.error('Error fetching animal audit logs:', error); return []; }
    return data;
};