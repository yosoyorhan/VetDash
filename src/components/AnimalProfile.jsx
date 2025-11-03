import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Edit, Trash2, Droplet, Syringe, HeartPulse, Stethoscope, Plus, Beef, User, Phone, Mail, Clock, CalendarCheck, Sparkles, Bot, Send, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getAnimalById, getHealthRecordsByAnimal, deleteHealthRecord, deleteAnimal, getAnimalAuditLogs, getOrCreateChatSession, addChatMessage } from '@/lib/storage';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from '@/lib/customSupabaseClient';
import { Input } from '@/components/ui/input';
import MarkdownRenderer from '@/components/MarkdownRenderer';

const InfoItem = ({ label, value, children, icon: Icon }) => (
  <div className="flex justify-between items-center py-3">
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-muted-foreground" />}
      <span className="text-sm text-muted-foreground">{label}:</span>
    </div>
    <span className="text-sm font-semibold text-foreground text-right">{children || value || 'Belirtilmemiş'}</span>
  </div>
);

const AnimatedCard = ({ children, className, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.15)" }}
    className="flex-1"
  >
    <Card className={`glass-effect transition-transform duration-300 ${className}`} {...props}>
      {children}
    </Card>
  </motion.div>
);

const AnimalProfile = ({ animalId, onBack, onViewChange }) => {
  const [animal, setAnimal] = useState(null);
  const [healthRecords, setHealthRecords] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [animalData, recordsData, logsData] = await Promise.all([
        getAnimalById(animalId),
        getHealthRecordsByAnimal(animalId),
        getAnimalAuditLogs(animalId)
      ]);
      setAnimal(animalData);
      setHealthRecords(recordsData || []);
      setAuditLogs(logsData || []);
    } catch (error) {
      toast({ title: "Veri Yüklenemedi", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [animalId]);

  useEffect(() => {
    loadData();
  }, [animalId, loadData]);

  const { treatments, vaccinations, inseminations } = useMemo(() => ({
    treatments: healthRecords.filter(r => r.event_type === 'treatment'),
    vaccinations: healthRecords.filter(r => r.event_type === 'vaccination'),
    inseminations: healthRecords.filter(r => r.event_type === 'insemination'),
  }), [healthRecords]);

  const handleAddRecord = (type) => {
    onViewChange('add-health-record', { animalId, recordType: type });
  };

  const handleEditRecord = (record) => {
    onViewChange('edit-health-record', { animalId, recordType: record.event_type, recordId: record.id });
  };

  const handleDeleteRecord = async (recordId) => {
    try {
      await deleteHealthRecord(recordId);
      toast({ title: 'Başarılı!', description: 'Kayıt silindi.' });
      await loadData();
    } catch (error) {
      toast({ title: 'Hata!', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteAnimal = async () => {
    try {
      await deleteAnimal(animalId);
      toast({ title: 'Başarıyla Silindi', description: `${animal.name || 'Hayvan'} kaydı sistemden kaldırıldı.` });
      onBack();
    } catch (error) {
      toast({ title: 'Silme Başarısız', description: error.message, variant: 'destructive' });
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>;
  if (!animal) return <div className="text-center py-12"><p className="text-foreground font-semibold">Hayvan profili bulunamadı.</p><Button onClick={onBack} className="mt-4">Listeye Dön</Button></div>;

  const lastVaccination = vaccinations[0]?.event_date;
  const lastTreatment = treatments[0]?.event_date;
  const lastInsemination = inseminations[0]?.event_date;

  const renderHealthRecordList = (records, title, type) => (
    <AnimatedCard>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title} Geçmişi</CardTitle>
        <Button size="sm" variant="action" onClick={() => handleAddRecord(type)}>
          <Plus className="w-4 h-4 mr-2" /> {title} Ekle
        </Button>
      </CardHeader>
      <CardContent>
        {records.length > 0 ? (
          <div className="space-y-3">
            {records.map((record) => (
              <motion.div
                key={record.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="p-4 bg-gradient-to-br from-background to-secondary/10 rounded-lg border border-border/50 flex justify-between items-start hover:shadow-lg transition-shadow duration-200 group"
              >
                <div>
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200">{record.treatment || record.diagnosis || record.insemination_type || 'Kayıt'}</p>
                  <p className="text-sm text-muted-foreground mt-1">Uygulayan: {record.profiles?.full_name || 'Belirtilmemiş'}</p>
                  {record.notes && <p className="text-xs text-muted-foreground mt-1 italic">"{record.notes}"</p>}
                  {record.event_type === 'insemination' && record.next_check_date && (
                    <p className="text-xs text-blue-500 mt-1 flex items-center gap-1"><CalendarCheck className="w-3 h-3" /> Gebelik Kontrolü: {new Date(record.next_check_date).toLocaleDateString('tr-TR')}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="text-sm text-muted-foreground">{record.event_date ? new Date(record.event_date).toLocaleDateString('tr-TR') : 'Tarih Yok'}</p>
                  <div className="flex gap-1 justify-end mt-1">
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-foreground hover:bg-accent hover:text-primary" onClick={() => handleEditRecord(record)}><Edit className="w-3.5 h-3.5" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-red-500 hover:text-red-600 hover:bg-red-500/10">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader><AlertDialogTitle>Kaydı Silmek Üzeresiniz</AlertDialogTitle><AlertDialogDescription>Bu işlem geri alınamaz. Bu kaydı kalıcı olarak silmek istediğinizden emin misiniz?</AlertDialogDescription></AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>İptal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteRecord(record.id)} className="bg-destructive hover:bg-destructive/90">Evet, Sil</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : <p className="text-center text-muted-foreground py-8">Bu hayvan için {title.toLowerCase()} kaydı bulunmuyor.</p>}
      </CardContent>
    </AnimatedCard>
  );

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'treatment': return <Stethoscope className="w-4 h-4 text-blue-500" />;
      case 'vaccination': return <Syringe className="w-4 h-4 text-green-500" />;
      case 'insemination': return <Droplet className="w-4 h-4 text-pink-500" />;
      default: return <HeartPulse className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Belirtilmemiş';
    try {
      return new Date(dateString).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
      return 'Geçersiz Tarih';
    }
  };

  return (
    <>
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5 text-foreground" /></Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{animal.name || 'İsimsiz'}</h1>
              <p className="text-muted-foreground font-mono">Küpe No: {animal.ear_tag_number || 'Belirtilmemiş'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-300 hover:bg-blue-500/20" onClick={() => setIsAiPanelOpen(true)}><Bot className="w-4 h-4 mr-2" /> Yapay Zeka Asistanı</Button>
            <Button variant="outline" onClick={() => onViewChange('edit-animal', animal.id)}><Edit className="w-4 h-4 mr-2" /> Düzenle</Button>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="destructive"><Trash2 className="w-4 h-4 mr-2" /> Sil</Button></AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader><AlertDialogTitle>Kaydı Silmek Üzeresiniz</AlertDialogTitle><AlertDialogDescription>Bu işlem geri alınamaz. "{animal.name}" adlı hayvanı ve ilişkili tüm kayıtları kalıcı olarak silmek istediğinizden emin misiniz?</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>İptal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteAnimal} className="bg-destructive hover:bg-destructive/90">Evet, Sil</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <AnimatedCard><CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0"><HeartPulse className="w-5 h-5 text-primary-foreground" /></div>
              <h3 className="font-semibold text-foreground text-base">Genel Bilgiler</h3>
            </div>
            <div className="divide-y divide-border/50">
              <InfoItem label="Tür" value={animal.species} />
              <InfoItem label="Irk" value={animal.breed} />
              <InfoItem label="Cinsiyet" value={animal.gender} />
              <InfoItem label="Doğum Tarihi" value={animal.dob ? formatDate(animal.dob) : null} />
            </div>
          </CardContent></AnimatedCard>
          <AnimatedCard><CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0"><Stethoscope className="w-5 h-5 text-primary-foreground" /></div>
              <h3 className="font-semibold text-foreground text-base">Sağlık Özeti</h3>
            </div>
            <div className="divide-y divide-border/50">
              <InfoItem label="Durum"><span className="font-bold text-green-600">{animal.status}</span></InfoItem>
              <InfoItem label="Ağırlık" value={animal.current_weight ? `${animal.current_weight} kg` : null} />
              <InfoItem label="Son Tedavi" value={lastTreatment ? formatDate(lastTreatment) : 'Yok'} />
              <InfoItem label="Son Aşı" value={lastVaccination ? formatDate(lastVaccination) : 'Yok'} />
            </div>
          </CardContent></AnimatedCard>
          <AnimatedCard><CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0"><Droplet className="w-5 h-5 text-primary-foreground" /></div>
              <h3 className="font-semibold text-foreground text-base">Üreme Bilgileri</h3>
            </div>
            <div className="divide-y divide-border/50">
              <InfoItem label="Son Tohumlama" value={lastInsemination ? formatDate(lastInsemination) : 'Yok'} />
              <InfoItem label="Süt Verimi" value="Bilgi Yok" />
            </div>
          </CardContent></AnimatedCard>
        </div>

        <AiAnalysisCard animal={animal} healthRecords={healthRecords} />

        <Tabs defaultValue="treatments" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-secondary">
            <TabsTrigger value="treatments" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg"><Stethoscope className="w-4 h-4 mr-2" />Tedaviler ({treatments.length})</TabsTrigger>
            <TabsTrigger value="vaccinations" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg"><Syringe className="w-4 h-4 mr-2" />Aşılar ({vaccinations.length})</TabsTrigger>
            <TabsTrigger value="inseminations" className="data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg"><Beef className="w-4 h-4 mr-2" />Tohumlamalar ({inseminations.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="treatments" className="mt-4">{renderHealthRecordList(treatments, 'Tedavi', 'treatment')}</TabsContent>
          <TabsContent value="vaccinations" className="mt-4">{renderHealthRecordList(vaccinations, 'Aşı', 'vaccination')}</TabsContent>
          <TabsContent value="inseminations" className="mt-4">{renderHealthRecordList(inseminations, 'Tohumlama', 'insemination')}</TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatedCard>
            <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" /> Son Aktiviteler</CardTitle></CardHeader>
            <CardContent>
              {(healthRecords.length === 0 && auditLogs.length === 0) ? (
                <p className="text-center text-muted-foreground py-4">Herhangi bir aktivite bulunmuyor.</p>
              ) : (
                <div className="space-y-3">
                  {auditLogs.slice(0, 3).map((log) => (
                    <div key={log.id} className="flex items-center gap-4 p-2 hover:bg-accent rounded-md transition-colors duration-200">
                      <div className="flex-shrink-0 text-blue-500"><Edit className="w-4 h-4" /></div>
                      <div className="flex-grow">
                        <p className="font-medium text-sm">Hayvan bilgisi güncellendi.</p>
                        <p className="text-xs text-muted-foreground">{formatDate(log.created_at)}</p>
                      </div>
                    </div>
                  ))}
                  {healthRecords.slice(0, 5 - auditLogs.length).map(record => (
                    <div key={record.id} className="flex items-center gap-4 p-2 hover:bg-accent rounded-md transition-colors duration-200">
                      <div className="flex-shrink-0">{getEventTypeIcon(record.event_type)}</div>
                      <div className="flex-grow">
                        <p className="font-medium capitalize text-sm">{record.treatment || record.diagnosis || record.insemination_type || record.event_type}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(record.event_date)} - {record.profiles?.full_name || 'Belirtilmemiş'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </AnimatedCard>
          <AnimatedCard>
            <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> Hayvan Sahibi</CardTitle></CardHeader>
            <CardContent>
              {animal.customers ? (
                <div className="space-y-2">
                  <InfoItem icon={User} label="İsim" value={animal.customers.full_name} />
                  <InfoItem icon={Phone} label="Telefon" value={animal.customers.phone} />
                  <InfoItem icon={Mail} label="E-posta" value={animal.customers.email} />
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">Bu hayvana atanmış bir sahip bulunmuyor.</p>
              )}
            </CardContent>
          </AnimatedCard>
        </div>
      </div>

      <AiAssistantPanel
        isOpen={isAiPanelOpen}
        onClose={() => setIsAiPanelOpen(false)}
        animal={animal}
        healthRecords={healthRecords}
      />
    </>
  );
};

const AiAnalysisCard = ({ animal, healthRecords }) => {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(true);

  const generateInsight = useCallback(async () => {
    setLoading(true);

    if (!animal) {
      setInsight("Analiz için hayvan verisi bulunamadı.");
      setLoading(false);
      return;
    }

    const data = { animal, healthRecords };
    const jsonData = JSON.stringify(data, null, 2);

    const prompt = `
            Sen, bir çiftlik hayvanı için uzman bir veteriner analistsin.
            Sana adı "${animal.name}" olan hayvanın JSON verileri aşağıda sunulmuştur.

            GÖREVİN:
            1.  Bu verileri analiz et.
            2.  Bu hayvanın genel sağlık durumu, son durumu ve kayıtlardaki en önemli (pozitif veya negatif) noktayı vurgulayan **kısa ve öz (2-3 cümlelik) profesyonel bir özet** yaz.
            3.  Hipotez kurma veya uzun önerilerde bulunma. Sadece mevcut verilere dayanarak en kritik bilgiyi özetle.
            4.  Cevabın sadece bu özet metni olsun.

            ---
            HAYVAN VERİLERİ (JSON):
            ${jsonData}
            ---

            Kısa ve öz analiz özetini şimdi yaz:
        `;

    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-insight', {
        body: { prompt },
      });

      if (error) throw error;
      setInsight(data.insight);
    } catch (error) {
      console.error("AI Insight Error:", error);
      if (error.message.includes("404")) {
        setInsight("Analiz modeli bulunamadı. Lütfen Supabase Function ayarlarınızı kontrol edin.");
      } else {
        setInsight("Analiz şu anda yapılamıyor.");
      }
    } finally {
      setLoading(false);
    }
  }, [animal, healthRecords]);

  useEffect(() => {
    if (animal) {
      generateInsight();
    }
  }, [animal, generateInsight]);

  return (
    <AnimatedCard>
      <CardHeader className="flex-row justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <CardTitle>AI Analizi</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={generateInsight} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Analiz ediliyor...</span>
          </div>
        ) : (
          <MarkdownRenderer content={insight} />
        )}
      </CardContent>
    </AnimatedCard>
  );
};

const AiAssistantPanel = ({ isOpen, onClose, animal, healthRecords }) => {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    const initializeChat = async () => {
      if (isOpen && animal) {
        setInitLoading(true);
        try {
          const chatSession = await getOrCreateChatSession(animal.id);
          setSession(chatSession);
          const initialMessages = chatSession.ai_chat_messages.length > 0
            ? chatSession.ai_chat_messages
            : [{ role: 'assistant', content: `Merhaba! Ben sizin yapay zeka asistanınızım. ${animal.name || 'Bu hayvan'} hakkında ne sormak istersiniz?` }];
          setMessages(initialMessages);
        } catch (error) {
          toast({ title: "Sohbet Yüklenemedi", description: error.message, variant: "destructive" });
          setMessages([{ role: 'assistant', content: "Sohbet oturumu başlatılamadı." }]);
        } finally {
          setInitLoading(false);
        }
      } else if (!isOpen) {
        setSession(null);
        setMessages([]);
        setInput('');
      }
    };
    initializeChat();
  }, [isOpen, animal]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading || !session) return;

    const userMessageContent = input;
    const userMessage = { role: 'user', content: userMessageContent };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      await addChatMessage(session.id, 'user', userMessageContent);

      const data = { animal, healthRecords };
      const jsonData = JSON.stringify(data, null, 2);

     const prompt = `
Sen, uzman bir veteriner hekime (kullanıcıya) asistanlık yapan, teknik bilgiye sahip ama aynı zamanda samimi bir klinik destek danışmanısın.  
Kullanıcının kendisi de bir veteriner hekim. Bu yüzden hem meslektaş seviyesinde konuş, hem de gerektiğinde yumuşak, doğal bir ton kullan.  
Cevaplarında gereksiz resmiyet ya da aşırı resmî hitaplardan kaçın — kısa, net ve gerektiğinde gülümseten bir üslup benimse.  

Kullanıcı, adı "${animal.name}" olan hayvanla ilgili sorular soracak.  
Sana bu hayvanla ait JSON verileri aşağıda sunulmuştur.  

---

### **KURALLAR:**
1. **VERİ SAĞLAMA (Net Soru):**  
   Kullanıcının sorusu ("${userMessageContent}") doğrudan JSON verisiyle yanıtlanabiliyorsa (örneğin: "son aşı ne zaman?", "kilo bilgisi?"), cevabı SADECE bu veriden al.  
   Kısa, teknik ama doğal bir dille ver. Gerekiyorsa küçük bir yorum ekle (örneğin: "gayet stabil görünüyor", "biraz dikkat etmekte fayda var" gibi).  

2. **EKSİK VERİ:**  
   Eğer soru hayvana ait bir veriyse ama JSON'da yoksa,  
   “Doktor, ${animal.name} için spesifik [konu] verisi kayıtlarda mevcut değil.” diye başla.  
   Ardından istersen kısa bir öneri veya yönlendirme ekleyebilirsin (“istersen bu parametreyi ölçüm listesine ekleyelim” gibi).  

3. **ANALİZ & PLANLAMA:**  
   Eğer kullanıcı “genel durumu yorumla”, “analiz et”, “plan çıkar” veya “ne önerirsin?” gibi bir analiz/planlama isterse,  
   \`${jsonData}\` verisini klinik açıdan değerlendirip bir özet veya plan oluştur.  
   - Kısa istenirse: sadece birkaç cümleyle durumu ve öneriyi belirt.  
   - Detay istenirse: sistematik (örneğin: “Beslenme”, “Aşı”, “Klinik Gözlem”, “Takip Planı”) başlıklarıyla yaz.  

4. **SOHBET VE TON:**  
   - Kullanıcıyla gerektiğinde kısa, ilgili sohbetler yapabilirsin (“bugün klinik yoğunsa kahve molası şart doktor 😊” gibi).  
   - Ama konudan tamamen kopma; sohbet hayvan veya klinik bağlamında kalmalı.  
   - Espri yüzdesi kullanıcı tarzına göre şekillensin (ilk mesajlardan tahmin et).  
   - Kullanıcı özel bir hitap isterse (örneğin “bana Orhan de”), o şekilde hitap et ama “veteriner asistanı” rolünden çıkma.  

---

### **HAYVAN VERİLERİ (JSON):**
${jsonData}

---

Şimdi kullanıcının şu sorusuna yukarıdaki kurallara göre cevap ver:  
"${userMessageContent}"
`;
      
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('generate-ai-insight', {
        body: { prompt },
      });

      if (aiError) throw aiError;

      const aiMessageContent = aiResponse.insight;
      const aiMessage = { role: 'assistant', content: aiMessageContent };
      await addChatMessage(session.id, 'assistant', aiMessageContent);
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("AI Chat Error:", error);
      const errorMessage = { role: 'assistant', content: "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-card z-50 flex flex-col shadow-2xl"
          >
            <header className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot className="w-6 h-6 text-primary" />
                <h2 className="text-lg font-semibold">Yapay Zeka Asistanı</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}><ArrowLeft className="w-5 h-5" /></Button>
            </header>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {initLoading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => (
                    <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center"><Bot className="w-5 h-5 text-primary-foreground" /></div>}
                      <div className={`max-w-xs md:max-w-sm p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary rounded-bl-none'}`}>
                        <MarkdownRenderer content={msg.content} />
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center"><Bot className="w-5 h-5 text-primary-foreground" /></div>
                      <div className="max-w-xs md:max-w-sm p-3 rounded-2xl bg-secondary rounded-bl-none flex items-center">
                        <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>
            <footer className="p-4 border-t">
              <form onSubmit={handleSend} className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`${animal?.name || 'Hayvan'} hakkında bir soru sorun...`}
                  className="flex-1"
                  disabled={loading || initLoading}
                />
                <Button type="submit" size="icon" disabled={loading || initLoading || !input.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </footer>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AnimalProfile;