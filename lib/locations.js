export const COUNTRIES = [
  // Europe
  'Albania','Austria','Belgium','Bosnia Herzegovina','Bulgaria','Croatia','Cyprus',
  'Czech Republic','Denmark','Estonia','Finland','France','Germany','Greece',
  'Hungary','Iceland','Ireland','Italy','Latvia','Lithuania','Luxembourg',
  'Malta','Netherlands','Norway','Poland','Portugal','Romania','Russia',
  'Serbia','Slovakia','Slovenia','Spain','Sweden','Switzerland','Turkey',
  'Ukraine','United Kingdom',
  // Americas
  'Argentina','Brazil','Canada','Chile','Mexico','United States','Venezuela',
  // Africa
  'Algeria','Angola','Benin','Cameroon','Côte d\'Ivoire','Egypt','Gabon',
  'Gambia','Ghana','Guinea','Israel','Morocco','Nigeria','Senegal',
  'South Africa','Togo','Tunisia',
  // Middle East & Asia
  'India','Saudi Arabia','United Arab Emirates',
].sort()

export const LOCATIONS = {
  // ── EUROPE ──────────────────────────────────────────────────────────────────
  'France': {
    ports: ['Le Havre','Marseille','Dunkerque','Nantes Saint-Nazaire','Bordeaux','Rouen','La Rochelle','Sète','Brest','Calais'],
    airports: ['Paris CDG','Paris Orly','Lyon Saint-Exupéry','Marseille Provence','Nice Côte d\'Azur','Bordeaux Mérignac'],
  },
  'Belgium': {
    ports: ['Antwerp','Ghent','Zeebrugge','Liège','Brussels'],
    airports: ['Brussels Airport','Liège Airport','Charleroi Airport'],
  },
  'Netherlands': {
    ports: ['Rotterdam','Amsterdam','Moerdijk','Vlissingen','Dordrecht','Terneuzen'],
    airports: ['Amsterdam Schiphol','Rotterdam The Hague Airport','Eindhoven Airport'],
  },
  'Germany': {
    ports: ['Hamburg','Bremen / Bremerhaven','Duisburg','Rostock','Lübeck','Kiel','Wilhelmshaven'],
    airports: ['Frankfurt Airport','Munich Airport','Hamburg Airport','Düsseldorf Airport','Berlin Brandenburg','Cologne Bonn Airport'],
  },
  'United Kingdom': {
    ports: ['Felixstowe','Southampton','London Gateway','Tilbury','Liverpool','Bristol','Hull','Grimsby','Immingham','Dover'],
    airports: ['London Heathrow','London Gatwick','Manchester Airport','Birmingham Airport','Edinburgh Airport','Glasgow Airport'],
  },
  'Spain': {
    ports: ['Algeciras','Valencia','Barcelona','Bilbao','Las Palmas','Tenerife','Cartagena','Tarragona','Vigo','Huelva'],
    airports: ['Madrid Barajas','Barcelona El Prat','Palma de Mallorca','Malaga Airport','Alicante Airport'],
  },
  'Italy': {
    ports: ['Genoa','La Spezia','Livorno','Naples','Gioia Tauro','Taranto','Venice','Trieste','Ravenna','Palermo'],
    airports: ['Rome Fiumicino','Milan Malpensa','Milan Linate','Venice Marco Polo','Naples Capodichino','Turin Airport'],
  },
  'Portugal': {
    ports: ['Lisbon','Leixões / Porto','Sines','Setubal','Aveiro','Figueira da Foz'],
    airports: ['Lisbon Airport','Porto Airport','Faro Airport'],
  },
  'Greece': {
    ports: ['Piraeus','Thessaloniki','Patra','Volos','Igoumenitsa','Heraklion'],
    airports: ['Athens International','Thessaloniki Airport','Heraklion Airport'],
  },
  'Poland': {
    ports: ['Gdansk','Gdynia','Szczecin','Swinoujscie'],
    airports: ['Warsaw Chopin','Krakow Airport','Gdansk Airport','Wroclaw Airport'],
  },
  'Sweden': {
    ports: ['Gothenburg','Stockholm','Helsingborg','Malmö','Trelleborg','Gävle'],
    airports: ['Stockholm Arlanda','Gothenburg Landvetter','Malmö Airport'],
  },
  'Norway': {
    ports: ['Oslo','Bergen','Stavanger','Kristiansand','Ålesund','Tromsø'],
    airports: ['Oslo Gardermoen','Bergen Airport','Stavanger Airport'],
  },
  'Denmark': {
    ports: ['Copenhagen','Aarhus','Esbjerg','Fredericia','Aalborg','Odense'],
    airports: ['Copenhagen Airport','Aarhus Airport','Billund Airport'],
  },
  'Finland': {
    ports: ['Helsinki','Turku','Kotka','Hamina','Rauma','Oulu'],
    airports: ['Helsinki Vantaa','Turku Airport','Oulu Airport'],
  },
  'Russia': {
    ports: ['St. Petersburg','Novorossiysk','Vladivostok','Murmansk','Kaliningrad','Nakhodka'],
    airports: ['Moscow Sheremetyevo','Moscow Domodedovo','St. Petersburg Pulkovo','Novosibirsk Airport'],
  },
  'Turkey': {
    ports: ['Istanbul Ambarlı','Mersin','Izmir','Gemlik','Derince','Samsun','Trabzon'],
    airports: ['Istanbul Airport','Istanbul Sabiha Gokcen','Ankara Esenboga','Izmir Adnan Menderes','Antalya Airport'],
  },
  'Ukraine': {
    ports: ['Odessa','Chornomorsk','Yuzhne','Mariupol','Kherson','Mykolaiv'],
    airports: ['Kyiv Boryspil','Odessa Airport','Lviv Airport'],
  },
  'Romania': {
    ports: ['Constanta','Galati','Braila','Tulcea'],
    airports: ['Bucharest Henri Coanda','Cluj-Napoca Airport','Timisoara Airport'],
  },
  'Bulgaria': {
    ports: ['Varna','Burgas'],
    airports: ['Sofia Airport','Varna Airport','Burgas Airport'],
  },
  'Croatia': {
    ports: ['Rijeka','Split','Ploce','Zadar','Dubrovnik'],
    airports: ['Zagreb Airport','Split Airport','Dubrovnik Airport'],
  },
  'Malta': {
    ports: ['Valletta','Marsaxlokk'],
    airports: ['Malta International Airport'],
  },
  'Cyprus': {
    ports: ['Limassol','Larnaca','Famagusta'],
    airports: ['Larnaca International','Paphos Airport'],
  },
  'Albania': {
    ports: ['Durres','Vlore','Sarande'],
    airports: ['Tirana International Airport'],
  },
  'Austria': {
    ports: ['Vienna (Danube)','Linz (Danube)'],
    airports: ['Vienna International Airport','Salzburg Airport','Graz Airport'],
  },
  'Switzerland': {
    ports: ['Basel (Rhine)'],
    airports: ['Zurich Airport','Geneva Airport','Basel-Mulhouse Airport'],
  },
  'Ireland': {
    ports: ['Dublin','Cork','Waterford','Limerick','Rosslare'],
    airports: ['Dublin Airport','Cork Airport','Shannon Airport'],
  },
  'Estonia': {
    ports: ['Tallinn','Muuga','Paldiski'],
    airports: ['Tallinn Airport'],
  },
  'Latvia': {
    ports: ['Riga','Ventspils','Liepaja'],
    airports: ['Riga International Airport'],
  },
  'Lithuania': {
    ports: ['Klaipeda'],
    airports: ['Vilnius Airport','Kaunas Airport'],
  },
  'Czech Republic': {
    ports: [],
    airports: ['Prague Vaclav Havel Airport','Brno Airport','Ostrava Airport'],
  },
  'Hungary': {
    ports: ['Budapest (Danube)'],
    airports: ['Budapest Ferenc Liszt Airport'],
  },
  'Slovakia': {
    ports: ['Bratislava (Danube)'],
    airports: ['Bratislava Airport','Kosice Airport'],
  },
  'Slovenia': {
    ports: ['Koper'],
    airports: ['Ljubljana Joze Pucnik Airport'],
  },
  'Serbia': {
    ports: ['Belgrade (Danube)','Novi Sad (Danube)'],
    airports: ['Belgrade Nikola Tesla Airport'],
  },
  'Bosnia Herzegovina': {
    ports: ['Ploce (access)'],
    airports: ['Sarajevo International Airport'],
  },
  'Luxembourg': {
    ports: [],
    airports: ['Luxembourg Findel Airport'],
  },
  'Iceland': {
    ports: ['Reykjavik','Akureyri','Hafnarfjordur'],
    airports: ['Keflavik International Airport'],
  },

  // ── AMERICAS ────────────────────────────────────────────────────────────────
  'United States': {
    ports: ['Los Angeles / Long Beach','New York / New Jersey','Savannah','Houston','Seattle / Tacoma','Charleston','Baltimore','Miami','New Orleans','Norfolk'],
    airports: ['JFK New York','Los Angeles LAX','Chicago O\'Hare','Houston Bush','Miami International','Atlanta Hartsfield','Dallas Fort Worth'],
  },
  'Canada': {
    ports: ['Vancouver','Montreal','Halifax','Prince Rupert','Toronto','Saint John'],
    airports: ['Toronto Pearson','Vancouver International','Montreal Trudeau','Calgary Airport'],
  },
  'Mexico': {
    ports: ['Manzanillo','Lazaro Cardenas','Veracruz','Altamira','Ensenada','Tuxpan'],
    airports: ['Mexico City NAICM','Cancun Airport','Guadalajara Airport','Monterrey Airport'],
  },
  'Brazil': {
    ports: ['Santos','Paranaguá','Itajai','Rio de Janeiro','Suape','Manaus','Fortaleza','Salvador','Vitória'],
    airports: ['São Paulo Guarulhos','São Paulo Congonhas','Rio de Janeiro Galeão','Brasilia Airport','Manaus Airport'],
  },
  'Argentina': {
    ports: ['Buenos Aires','Rosario','Bahia Blanca','Mar del Plata','Ushuaia'],
    airports: ['Buenos Aires Ezeiza','Buenos Aires Aeroparque','Mendoza Airport','Cordoba Airport'],
  },
  'Chile': {
    ports: ['San Antonio','Valparaiso','Iquique','Antofagasta','Puerto Montt','Arica'],
    airports: ['Santiago Arturo Merino Benitez','Iquique Airport','Antofagasta Airport'],
  },
  'Venezuela': {
    ports: ['Puerto Cabello','La Guaira','Maracaibo','Guanta','Barcelona'],
    airports: ['Caracas Simon Bolivar','Maracaibo Airport','Valencia Airport'],
  },

  // ── AFRICA ──────────────────────────────────────────────────────────────────
  'Morocco': {
    ports: ['Tanger Med','Casablanca','Agadir','Nador','Safi','Kenitra'],
    airports: ['Casablanca Mohammed V','Marrakech Menara','Agadir Al Massira','Fes Saiss','Tanger Ibn Batouta'],
  },
  'Algeria': {
    ports: ['Algiers','Oran','Annaba','Skikda','Bejaia','Djen Djen'],
    airports: ['Algiers Houari Boumediene','Oran Ahmed Ben Bella','Constantine Airport','Annaba Airport'],
  },
  'Tunisia': {
    ports: ['Tunis Rades','Sfax','Bizerte','Sousse','Gabes'],
    airports: ['Tunis Carthage','Monastir Airport','Sfax Airport','Djerba Airport'],
  },
  'Egypt': {
    ports: ['Port Said','Alexandria','Damietta','Sokhna','Suez','Ain Sokhna'],
    airports: ['Cairo International','Luxor Airport','Hurghada Airport','Sharm El Sheikh Airport','Alexandria Airport'],
  },
  'Senegal': {
    ports: ['Dakar','Ziguinchor','Kaolack'],
    airports: ['Dakar Blaise Diagne','Ziguinchor Airport','Saint-Louis Airport'],
  },
  'Gambia': {
    ports: ['Banjul'],
    airports: ['Banjul International Airport'],
  },
  'Guinea': {
    ports: ['Conakry','Kamsar','Boke'],
    airports: ['Conakry Gbessia International'],
  },
  'Côte d\'Ivoire': {
    ports: ['Abidjan','San Pedro'],
    airports: ['Abidjan Felix Houphouet-Boigny','San Pedro Airport','Bouake Airport'],
  },
  'Ghana': {
    ports: ['Tema','Takoradi','Accra'],
    airports: ['Accra Kotoka International','Kumasi Airport','Tamale Airport'],
  },
  'Togo': {
    ports: ['Lome'],
    airports: ['Lome Gnassingbe Eyadema International'],
  },
  'Benin': {
    ports: ['Cotonou'],
    airports: ['Cotonou Cadjehoun Airport'],
  },
  'Nigeria': {
    ports: ['Lagos Apapa','Lagos Tin Can','Port Harcourt','Calabar','Onne','Warri'],
    airports: ['Lagos Murtala Muhammed','Abuja Nnamdi Azikiwe','Port Harcourt Airport','Kano Airport'],
  },
  'Cameroon': {
    ports: ['Douala','Kribi','Limbe'],
    airports: ['Douala International','Yaounde Nsimalen','Garoua Airport'],
  },
  'Gabon': {
    ports: ['Libreville','Port-Gentil','Owendo'],
    airports: ['Libreville Leon Mba','Port-Gentil Airport'],
  },
  'Angola': {
    ports: ['Luanda','Lobito','Namibe','Soyo','Cabinda'],
    airports: ['Luanda Quatro de Fevereiro','Lubango Airport','Benguela Airport'],
  },
  'South Africa': {
    ports: ['Durban','Cape Town','Port Elizabeth','East London','Richards Bay','Saldanha Bay'],
    airports: ['Johannesburg OR Tambo','Cape Town International','Durban King Shaka','Port Elizabeth Airport'],
  },

  // ── MIDDLE EAST ─────────────────────────────────────────────────────────────
  'Israel': {
    ports: ['Haifa','Ashdod','Eilat'],
    airports: ['Tel Aviv Ben Gurion','Eilat Ramon Airport','Haifa Airport'],
  },
  'Saudi Arabia': {
    ports: ['Jeddah Islamic Port','King Abdullah Port','Dammam','Jubail','Yanbu','Ras Tanura'],
    airports: ['Riyadh King Khalid','Jeddah King Abdulaziz','Dammam King Fahd','Medina Prince Mohammed'],
  },
  'United Arab Emirates': {
    ports: ['Jebel Ali','Abu Dhabi','Dubai','Sharjah','Fujairah','Khalifa Port'],
    airports: ['Dubai International','Abu Dhabi International','Sharjah International','Al Maktoum International'],
  },

  // ── ASIA ────────────────────────────────────────────────────────────────────
  'India': {
    ports: ['Nhava Sheva / JNPT','Mundra','Chennai','Kolkata','Vishakhapatnam','Cochin','Kandla','Pipavav'],
    airports: ['Mumbai Chhatrapati Shivaji','Delhi Indira Gandhi','Chennai International','Kolkata Netaji Subhas','Bangalore Kempegowda'],
  },
}

export const getLocationsForCountry = (country) => {
  if (!country || !LOCATIONS[country]) return { ports: [], airports: [] }
  return LOCATIONS[country]
}

export const searchLocations = (query) => {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase()
  const results = []
  Object.entries(LOCATIONS).forEach(([country, data]) => {
    if (country.toLowerCase().includes(q)) {
      results.push({type:'country', name:country, country})
    }
    data.ports.forEach(port => {
      if (port.toLowerCase().includes(q)) {
        results.push({type:'port', name:port, country, icon:'⚓'})
      }
    })
    data.airports.forEach(airport => {
      if (airport.toLowerCase().includes(q)) {
        results.push({type:'airport', name:airport, country, icon:'✈️'})
      }
    })
  })
  return results.slice(0, 10)
}
