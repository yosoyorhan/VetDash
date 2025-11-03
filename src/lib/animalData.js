export const animalData = {
  "Çiftlik Hayvanları": {
    "Sığır (İnek)": ["Simental (Simmental)", "Montofon (Brown Swiss)", "Holstein (Siyah Alaca)", "Jersey", "Limuzin (Limousin)", "Şarole (Charolais)", "Angus", "Hereford", "Yerli Kara"],
    "Koyun": ["Merinos (Merino)", "Karayaka", "Dağlıç", "Kıvırcık", "Sakız (Chios)", "İvesi (Awassi)", "Suffolk"],
    "Keçi": ["Kıl Keçisi (Yerli)", "Ankara Keçisi (Tiftik Keçisi)", "Saanen (Süt keçisi)", "Boer (Et keçisi)", "Malta Keçisi"],
    "At": ["Arap Atı", "İngiliz Atı (Thoroughbred)", "Haflinger", "Friz (Friesian)", "Rahvan (Yerli)"]
  },
  "Evcil Hayvanlar": {
    "Köpek": ["Kangal (Sivas Kangalı)", "Alman Çoban Köpeği (Alman Kurdu)", "Golden Retriever", "Labrador Retriever", "Terrier", "Poodle (Kaniş)", "Fransız Bulldog", "Pug", "Rottweiler", "Doberman"],
    "Kedi": ["Tekir (Melez)", "Van Kedisi", "Ankara Kedisi", "British Shorthair", "Scottish Fold", "Siyam (Siamese)", "İran (Persian)", "Sphynx (Sfenks)", "Ragdoll"],
    "Kuş": ["Muhabbet Kuşu", "Sultan Papağanı", "Kanarya", "Jako (Gri Papağan)", "Cennet Papağanı", "Güvercin"],
    "Kemirgenler ve Küçük Memeliler": ["Tavşan", "Hamster", "Guinea Pig (Kobay)", "Dağ Gelinciği (Ferret)"]
  },
  "Sürüngenler": {
    "Kaplumbağa": ["Su Kaplumbağası (Kırmızı Yanaklı)"],
    "Kertenkele": ["İguana", "Leopard Geko", "Sakal Ejder (Bearded Dragon)"],
    "Yılan": ["Ball Piton"]
  }
};

export const speciesList = Object.values(animalData).flatMap(category => Object.keys(category));