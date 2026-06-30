/* =================================================================
   Hierarchical Location Data — India
   State → District → Place with July 1, 2026 weather
   ================================================================= */

const LocationData = {
  /* Weather is based on geography + monsoon position for 1 July 2026:
     - NE India: Very heavy rain, 28-33°C, 90-97% humidity
     - Western coast (Konkan, Kerala): Heavy rain, 25-30°C, 88-95% humidity
     - North Plains (Delhi, UP, Punjab): Hot-humid, 33-37°C, 72-82% humidity, intermittent rain
     - Central India: Moderate rain, 30-34°C, 75-85%
     - Tamil Nadu: Dry (NE monsoon comes Oct-Dec), 34-37°C, 60-70%
     - Rajasthan: Monsoon just arriving, 33-38°C, 55-75%
     - Himalayan states: Rain + cool, 18-28°C, 80-92%
  */

  states: {
    'West Bengal': {
      capital: 'Kolkata', temp: 27, humidity: 88, rain: true, condition: 'Thunderstorms',
      wind: 18, aqi: 58, rainfall_24h: 45,
      aliases: ['westbengal', 'west bengal', 'wb'],
      districts: {
        'North 24 Parganas': {
          hq: 'Barasat', temp: 27, humidity: 89, rain: true, condition: 'Heavy Rain',
          aliases: ['north24pgs', 'north 24 parganas', 'north 24 pgs'],
          places: [
            { 
              name: 'Agarpara', temp: 27, humidity: 90, rain: true, condition: 'Heavy Rain', wind: 16, aqi: 55, rainfall_24h: 52, lat: 22.68, lon: 88.38,
              aliases: ['agorpara', 'agarpara'],
              subPlaces: [
                { name: 'Lhabagan', temp: 27, humidity: 91, rain: true, condition: 'Heavy Rain', wind: 15, aqi: 54, rainfall_24h: 54, lat: 22.682, lon: 88.381, aliases: ['lhabagan'], note: 'Residential area near Agarpara Station' }
              ]
            },
            { name: 'Barasat', temp: 28, humidity: 88, rain: true, condition: 'Thunderstorms', wind: 18, aqi: 60, rainfall_24h: 48, lat: 22.72, lon: 88.48 },
            { name: 'Barrackpore', temp: 27, humidity: 89, rain: true, condition: 'Heavy Rain', wind: 15, aqi: 58, rainfall_24h: 50, lat: 22.76, lon: 88.37 },
            { name: 'Dum Dum', temp: 27, humidity: 90, rain: true, condition: 'Rain', wind: 17, aqi: 62, rainfall_24h: 46, lat: 22.65, lon: 88.43 },
            { name: 'Habra', temp: 28, humidity: 87, rain: true, condition: 'Cloudy with Rain', wind: 14, aqi: 52, rainfall_24h: 38, lat: 22.84, lon: 88.66 },
            { name: 'New Barrackpore', temp: 27, humidity: 89, rain: true, condition: 'Rain', wind: 15, aqi: 56, rainfall_24h: 44, lat: 22.8, lon: 88.43 },
          ]
        },
        'South 24 Parganas': {
          hq: 'Alipore', temp: 27, humidity: 91, rain: true, condition: 'Heavy Rain',
          places: [
            { name: 'Alipore', temp: 27, humidity: 91, rain: true, condition: 'Heavy Rain', wind: 20, aqi: 54, rainfall_24h: 58, lat: 22.53, lon: 88.33 },
            { name: 'Diamond Harbour', temp: 26, humidity: 93, rain: true, condition: 'Very Heavy Rain', wind: 24, aqi: 48, rainfall_24h: 72, lat: 22.19, lon: 88.19 },
            { name: 'Baruipur', temp: 27, humidity: 90, rain: true, condition: 'Rain', wind: 16, aqi: 50, rainfall_24h: 55, lat: 22.36, lon: 88.43 },
            { name: 'Kakdwip', temp: 26, humidity: 94, rain: true, condition: 'Very Heavy Rain', wind: 28, aqi: 42, rainfall_24h: 85, lat: 21.87, lon: 88.19 },
            { name: 'Sundarbans', temp: 26, humidity: 95, rain: true, condition: 'Heavy Rain + Storm Surge', wind: 32, aqi: 38, rainfall_24h: 92, lat: 21.94, lon: 88.90 },
          ]
        },
        'Kolkata': {
          hq: 'Kolkata', temp: 27, humidity: 88, rain: true, condition: 'Thunderstorms',
          places: [
            { name: 'Salt Lake', temp: 27, humidity: 88, rain: true, condition: 'Thunderstorms', wind: 17, aqi: 60, rainfall_24h: 42, lat: 22.58, lon: 88.41 },
            { name: 'Park Street', temp: 27, humidity: 87, rain: true, condition: 'Rain', wind: 15, aqi: 65, rainfall_24h: 38, lat: 22.55, lon: 88.35 },
            { name: 'Howrah', temp: 27, humidity: 88, rain: true, condition: 'Heavy Rain', wind: 18, aqi: 62, rainfall_24h: 48, lat: 22.59, lon: 88.31 },
            { name: 'Jadavpur', temp: 27, humidity: 89, rain: true, condition: 'Rain', wind: 14, aqi: 58, rainfall_24h: 40, lat: 22.50, lon: 88.37 },
            { name: 'Alipore (Kolkata)', temp: 27, humidity: 88, rain: true, condition: 'Thunderstorms', wind: 16, aqi: 55, rainfall_24h: 45, lat: 22.53, lon: 88.34, note: 'IMD Observatory Station' },
          ]
        },
        'Darjeeling': {
          hq: 'Darjeeling', temp: 18, humidity: 92, rain: true, condition: 'Heavy Rain + Fog',
          places: [
            { name: 'Darjeeling Town', temp: 16, humidity: 94, rain: true, condition: 'Heavy Rain + Fog', wind: 22, aqi: 28, rainfall_24h: 85, lat: 27.04, lon: 88.26 },
            { name: 'Siliguri', temp: 30, humidity: 90, rain: true, condition: 'Heavy Rain', wind: 18, aqi: 52, rainfall_24h: 68, lat: 26.71, lon: 88.43, note: 'Plains city at Himalayan foothills' },
            { name: 'Kurseong', temp: 19, humidity: 93, rain: true, condition: 'Rain + Fog', wind: 20, aqi: 25, rainfall_24h: 78, lat: 26.88, lon: 88.28 },
            { name: 'Kalimpong', temp: 21, humidity: 91, rain: true, condition: 'Moderate Rain', wind: 15, aqi: 30, rainfall_24h: 62, lat: 27.06, lon: 88.47 },
            { name: 'Mirik', temp: 20, humidity: 92, rain: true, condition: 'Rain + Mist', wind: 12, aqi: 22, rainfall_24h: 55, lat: 26.89, lon: 88.18 },
          ]
        },
        'Jalpaiguri': {
          hq: 'Jalpaiguri', temp: 31, humidity: 91, rain: true, condition: 'Very Heavy Rain',
          places: [
            { name: 'Jalpaiguri Town', temp: 31, humidity: 91, rain: true, condition: 'Very Heavy Rain', wind: 20, aqi: 45, rainfall_24h: 95, lat: 26.52, lon: 88.73 },
            { name: 'Alipurduar', temp: 30, humidity: 92, rain: true, condition: 'Very Heavy Rain', wind: 22, aqi: 40, rainfall_24h: 110, lat: 26.49, lon: 89.52, note: 'Flash flood risk — Teesta river' },
            { name: 'Dooars', temp: 29, humidity: 93, rain: true, condition: 'Extremely Heavy Rain', wind: 18, aqi: 35, rainfall_24h: 125, lat: 26.75, lon: 89.0 },
          ]
        },
      }
    },

    'Assam': {
      capital: 'Dispur', temp: 31, humidity: 94, rain: true, condition: 'Very Heavy Rain — FLOOD',
      wind: 20, aqi: 42, rainfall_24h: 145,
      districts: {
        'Kamrup Metropolitan': {
          hq: 'Guwahati', temp: 31, humidity: 94, rain: true, condition: 'Very Heavy Rain',
          places: [
            { name: 'Guwahati', temp: 31, humidity: 94, rain: true, condition: 'Very Heavy Rain', wind: 22, aqi: 45, rainfall_24h: 135, lat: 26.14, lon: 91.74, note: 'Brahmaputra 2.8m above danger mark' },
            { name: 'Dispur', temp: 31, humidity: 93, rain: true, condition: 'Heavy Rain', wind: 18, aqi: 48, rainfall_24h: 128, lat: 26.14, lon: 91.79 },
            { name: 'North Guwahati', temp: 30, humidity: 95, rain: true, condition: 'Very Heavy Rain', wind: 24, aqi: 40, rainfall_24h: 142, lat: 26.19, lon: 91.72, note: 'Low-lying areas flooded' },
          ]
        },
        'Barpeta': {
          hq: 'Barpeta', temp: 30, humidity: 96, rain: true, condition: 'Extremely Heavy Rain — FLOODED',
          places: [
            { name: 'Barpeta Town', temp: 30, humidity: 96, rain: true, condition: 'Flooded', wind: 18, aqi: 38, rainfall_24h: 185, lat: 26.32, lon: 91.01, note: '⚠️ District fully submerged' },
            { name: 'Barpeta Road', temp: 30, humidity: 95, rain: true, condition: 'Flooded', wind: 20, aqi: 40, rainfall_24h: 170, lat: 26.50, lon: 90.97 },
          ]
        },
        'Nalbari': {
          hq: 'Nalbari', temp: 30, humidity: 95, rain: true, condition: 'Heavy Rain — Flooded',
          places: [
            { name: 'Nalbari Town', temp: 30, humidity: 95, rain: true, condition: 'Flooded', wind: 16, aqi: 42, rainfall_24h: 155, lat: 26.44, lon: 91.44, note: '⚠️ Relief camps activated' },
            { name: 'Tihu', temp: 30, humidity: 94, rain: true, condition: 'Heavy Rain', wind: 14, aqi: 44, rainfall_24h: 140, lat: 26.61, lon: 91.24 },
          ]
        },
        'Dibrugarh': {
          hq: 'Dibrugarh', temp: 29, humidity: 96, rain: true, condition: 'Very Heavy Rain',
          places: [
            { name: 'Dibrugarh', temp: 29, humidity: 96, rain: true, condition: 'Very Heavy Rain', wind: 20, aqi: 35, rainfall_24h: 160, lat: 27.47, lon: 94.91 },
            { name: 'Tinsukia', temp: 28, humidity: 97, rain: true, condition: 'Extremely Heavy Rain', wind: 22, aqi: 32, rainfall_24h: 180, lat: 27.49, lon: 95.36 },
          ]
        },
      }
    },

    'Maharashtra': {
      capital: 'Mumbai', temp: 29, humidity: 92, rain: true, condition: 'Heavy Rain',
      wind: 28, aqi: 45, rainfall_24h: 184,
      districts: {
        'Mumbai City': {
          hq: 'Mumbai', temp: 28, humidity: 94, rain: true, condition: 'Very Heavy Rain',
          places: [
            { name: 'Colaba', temp: 28, humidity: 95, rain: true, condition: 'Heavy Rain', wind: 32, aqi: 40, rainfall_24h: 165, lat: 18.91, lon: 72.83, note: 'IMD Observatory' },
            { name: 'Dadar', temp: 29, humidity: 93, rain: true, condition: 'Very Heavy Rain + Waterlogging', wind: 22, aqi: 48, rainfall_24h: 195, lat: 19.02, lon: 72.84, note: '⚠️ Severe waterlogging' },
            { name: 'Andheri', temp: 29, humidity: 92, rain: true, condition: 'Heavy Rain + Waterlogging', wind: 24, aqi: 50, rainfall_24h: 208, lat: 19.12, lon: 72.85, note: '⚠️ Roads flooded' },
            { name: 'Bandra', temp: 28, humidity: 93, rain: true, condition: 'Heavy Rain', wind: 28, aqi: 45, rainfall_24h: 178, lat: 19.06, lon: 72.84 },
          ]
        },
        'Mumbai Suburban': {
          hq: 'Bandra', temp: 29, humidity: 93, rain: true, condition: 'Very Heavy Rain',
          places: [
            { name: 'Borivali', temp: 29, humidity: 91, rain: true, condition: 'Heavy Rain', wind: 20, aqi: 52, rainfall_24h: 172, lat: 19.23, lon: 72.86 },
            { name: 'Malad', temp: 29, humidity: 92, rain: true, condition: 'Heavy Rain', wind: 22, aqi: 48, rainfall_24h: 180, lat: 19.19, lon: 72.85 },
            { name: 'Powai', temp: 29, humidity: 90, rain: true, condition: 'Rain', wind: 18, aqi: 55, rainfall_24h: 155, lat: 19.12, lon: 72.91 },
            { name: 'Sion', temp: 29, humidity: 94, rain: true, condition: 'Very Heavy Rain + Waterlogging', wind: 20, aqi: 52, rainfall_24h: 198, lat: 19.04, lon: 72.86, note: '⚠️ Sion hospital road flooded' },
          ]
        },
        'Pune': {
          hq: 'Pune', temp: 26, humidity: 82, rain: true, condition: 'Moderate Rain',
          places: [
            { name: 'Pune City', temp: 26, humidity: 82, rain: true, condition: 'Moderate Rain', wind: 16, aqi: 58, rainfall_24h: 45, lat: 18.52, lon: 73.86 },
            { name: 'Pimpri-Chinchwad', temp: 27, humidity: 80, rain: true, condition: 'Light Rain', wind: 14, aqi: 62, rainfall_24h: 35, lat: 18.63, lon: 73.80 },
            { name: 'Lonavala', temp: 22, humidity: 95, rain: true, condition: 'Very Heavy Rain + Fog', wind: 28, aqi: 30, rainfall_24h: 145, lat: 18.75, lon: 73.41, note: 'Hill station — heavy Western Ghat rainfall' },
            { name: 'Mahabaleshwar', temp: 19, humidity: 97, rain: true, condition: 'Extremely Heavy Rain', wind: 35, aqi: 22, rainfall_24h: 220, lat: 17.92, lon: 73.66, note: 'One of wettest spots in India during monsoon' },
          ]
        },
        'Nagpur': {
          hq: 'Nagpur', temp: 32, humidity: 78, rain: true, condition: 'Moderate Rain',
          places: [
            { name: 'Nagpur City', temp: 32, humidity: 78, rain: true, condition: 'Intermittent Rain', wind: 14, aqi: 65, rainfall_24h: 28, lat: 21.15, lon: 79.09 },
            { name: 'Wardha', temp: 33, humidity: 75, rain: true, condition: 'Cloudy', wind: 12, aqi: 68, rainfall_24h: 18, lat: 20.74, lon: 78.60 },
          ]
        },
      }
    },

    'Delhi': {
      capital: 'New Delhi', temp: 35, humidity: 78, rain: true, condition: 'Humid & Overcast',
      wind: 14, aqi: 68, rainfall_24h: 22,
      districts: {
        'New Delhi': {
          hq: 'New Delhi', temp: 35, humidity: 78, rain: true, condition: 'Humid & Overcast',
          places: [
            { name: 'India Gate', temp: 35, humidity: 78, rain: true, condition: 'Overcast, Rain by Evening', wind: 14, aqi: 68, rainfall_24h: 22, lat: 28.61, lon: 77.23 },
            { name: 'Connaught Place', temp: 36, humidity: 76, rain: false, condition: 'Humid & Hazy', wind: 12, aqi: 72, rainfall_24h: 18, lat: 28.63, lon: 77.22 },
            { name: 'Safdarjung', temp: 35, humidity: 79, rain: true, condition: 'Overcast', wind: 15, aqi: 65, rainfall_24h: 25, lat: 28.58, lon: 77.21, note: 'IMD Observatory' },
          ]
        },
        'South Delhi': {
          hq: 'Saket', temp: 35, humidity: 77, rain: false, condition: 'Humid',
          places: [
            { name: 'Saket', temp: 35, humidity: 77, rain: false, condition: 'Humid & Hot', wind: 12, aqi: 70, rainfall_24h: 15, lat: 28.52, lon: 77.22 },
            { name: 'Mehrauli', temp: 36, humidity: 75, rain: false, condition: 'Hot & Humid', wind: 10, aqi: 72, rainfall_24h: 12, lat: 28.52, lon: 77.18 },
            { name: 'Hauz Khas', temp: 35, humidity: 78, rain: true, condition: 'Light Rain', wind: 14, aqi: 68, rainfall_24h: 20, lat: 28.55, lon: 77.20 },
          ]
        },
        'North Delhi': {
          hq: 'Civil Lines', temp: 36, humidity: 76, rain: false, condition: 'Hot & Humid',
          places: [
            { name: 'Civil Lines', temp: 36, humidity: 76, rain: false, condition: 'Hot & Humid', wind: 12, aqi: 72, rainfall_24h: 10, lat: 28.68, lon: 77.22 },
            { name: 'Model Town', temp: 36, humidity: 75, rain: false, condition: 'Humid', wind: 10, aqi: 75, rainfall_24h: 8, lat: 28.72, lon: 77.19 },
            { name: 'Narela', temp: 37, humidity: 72, rain: false, condition: 'Hot', wind: 14, aqi: 78, rainfall_24h: 5, lat: 28.85, lon: 77.10 },
          ]
        },
      }
    },

    'Karnataka': {
      capital: 'Bengaluru', temp: 24, humidity: 82, rain: true, condition: 'Moderate Rain',
      wind: 16, aqi: 52, rainfall_24h: 35,
      districts: {
        'Bengaluru Urban': {
          hq: 'Bengaluru', temp: 24, humidity: 82, rain: true, condition: 'Moderate Rain',
          places: [
            { name: 'MG Road', temp: 24, humidity: 82, rain: true, condition: 'Light Rain', wind: 14, aqi: 55, rainfall_24h: 28, lat: 12.97, lon: 77.60 },
            { name: 'Whitefield', temp: 25, humidity: 80, rain: true, condition: 'Intermittent Rain', wind: 12, aqi: 58, rainfall_24h: 22, lat: 12.97, lon: 77.75 },
            { name: 'Electronic City', temp: 25, humidity: 78, rain: false, condition: 'Cloudy', wind: 14, aqi: 60, rainfall_24h: 15, lat: 12.84, lon: 77.66 },
            { name: 'Hebbal', temp: 24, humidity: 83, rain: true, condition: 'Moderate Rain', wind: 16, aqi: 52, rainfall_24h: 32, lat: 13.04, lon: 77.59 },
          ]
        },
        'Dakshina Kannada': {
          hq: 'Mangaluru', temp: 27, humidity: 92, rain: true, condition: 'Very Heavy Rain',
          places: [
            { name: 'Mangaluru', temp: 27, humidity: 92, rain: true, condition: 'Very Heavy Rain', wind: 30, aqi: 35, rainfall_24h: 145, lat: 12.87, lon: 74.88, note: 'Coastal — peak monsoon rainfall zone' },
            { name: 'Udupi', temp: 26, humidity: 94, rain: true, condition: 'Extremely Heavy Rain', wind: 32, aqi: 30, rainfall_24h: 175, lat: 13.34, lon: 74.75, note: 'Western Ghats coastal strip' },
          ]
        },
        'Kodagu': {
          hq: 'Madikeri', temp: 20, humidity: 95, rain: true, condition: 'Very Heavy Rain + Fog',
          places: [
            { name: 'Madikeri', temp: 20, humidity: 95, rain: true, condition: 'Very Heavy Rain + Fog', wind: 20, aqi: 25, rainfall_24h: 135, lat: 12.42, lon: 75.74, note: '⚠️ Landslide risk HIGH — Western Ghats' },
            { name: 'Virajpet', temp: 22, humidity: 92, rain: true, condition: 'Heavy Rain', wind: 18, aqi: 28, rainfall_24h: 110, lat: 12.20, lon: 75.80 },
          ]
        },
      }
    },

    'Tamil Nadu': {
      capital: 'Chennai', temp: 27, humidity: 82, rain: true, condition: 'Cool & Overcast',
      wind: 18, aqi: 52, rainfall_24h: 12,
      districts: {
        'Chennai': {
          hq: 'Chennai', temp: 27, humidity: 82, rain: true, condition: 'Light Rain',
          places: [
            { name: 'T. Nagar', temp: 27, humidity: 82, rain: true, condition: 'Overcast with Drizzle', wind: 18, aqi: 52, rainfall_24h: 8, lat: 13.04, lon: 80.23 },
            { name: 'Anna Nagar', temp: 28, humidity: 80, rain: true, condition: 'Cloudy', wind: 16, aqi: 55, rainfall_24h: 5, lat: 13.09, lon: 80.21 },
            { name: 'Nungambakkam', temp: 27, humidity: 83, rain: true, condition: 'Light Rain', wind: 20, aqi: 50, rainfall_24h: 12, lat: 13.06, lon: 80.24, note: 'IMD Chennai station' },
            { name: 'Marina Beach', temp: 26, humidity: 85, rain: true, condition: 'Breezy & Rain Showers', wind: 24, aqi: 48, rainfall_24h: 15, lat: 13.05, lon: 80.28, note: 'Cooling sea breeze' },
            { name: 'Tambaram', temp: 28, humidity: 78, rain: false, condition: 'Overcast', wind: 14, aqi: 58, rainfall_24h: 2, lat: 12.93, lon: 80.12 },
          ]
        },
        'Coimbatore': {
          hq: 'Coimbatore', temp: 24, humidity: 85, rain: true, condition: 'Moderate Rain',
          places: [
            { name: 'Coimbatore City', temp: 24, humidity: 85, rain: true, condition: 'Moderate Rain', wind: 14, aqi: 45, rainfall_24h: 22, lat: 11.02, lon: 76.96 },
            { name: 'Ooty', temp: 12, humidity: 95, rain: true, condition: 'Heavy Rain + Fog', wind: 20, aqi: 18, rainfall_24h: 55, lat: 11.41, lon: 76.69, note: 'Cool hill station' },
          ]
        },
        'Madurai': {
          hq: 'Madurai', temp: 28, humidity: 75, rain: true, condition: 'Intermittent Showers',
          places: [
            { name: 'Madurai City', temp: 28, humidity: 75, rain: true, condition: 'Rain Showers', wind: 16, aqi: 50, rainfall_24h: 18, lat: 9.92, lon: 78.12 },
          ]
        },
      }
    },

    'Rajasthan': {
      capital: 'Jaipur', temp: 34, humidity: 72, rain: false, condition: 'Partly Cloudy',
      wind: 18, aqi: 78, rainfall_24h: 8,
      districts: {
        'Jaipur': {
          hq: 'Jaipur', temp: 34, humidity: 72, rain: false, condition: 'Partly Cloudy',
          places: [
            { name: 'Jaipur City', temp: 34, humidity: 72, rain: false, condition: 'Partly Cloudy — Monsoon Arriving', wind: 18, aqi: 78, rainfall_24h: 8, lat: 26.91, lon: 75.79 },
            { name: 'Amer', temp: 33, humidity: 74, rain: true, condition: 'Light Rain', wind: 16, aqi: 72, rainfall_24h: 15, lat: 26.99, lon: 75.85 },
          ]
        },
        'Jodhpur': {
          hq: 'Jodhpur', temp: 37, humidity: 58, rain: false, condition: 'Hot — Monsoon Not Yet',
          places: [
            { name: 'Jodhpur City', temp: 37, humidity: 58, rain: false, condition: 'Hot & Dry', wind: 22, aqi: 85, rainfall_24h: 0, lat: 26.29, lon: 73.02 },
            { name: 'Barmer', temp: 39, humidity: 45, rain: false, condition: 'Very Hot', wind: 24, aqi: 92, rainfall_24h: 0, lat: 25.75, lon: 71.39, note: 'Thar Desert — monsoon may arrive in 5-7 days' },
          ]
        },
        'Udaipur': {
          hq: 'Udaipur', temp: 31, humidity: 78, rain: true, condition: 'Moderate Rain',
          places: [
            { name: 'Udaipur City', temp: 31, humidity: 78, rain: true, condition: 'Moderate Rain', wind: 14, aqi: 55, rainfall_24h: 35, lat: 24.58, lon: 73.68 },
            { name: 'Mount Abu', temp: 22, humidity: 90, rain: true, condition: 'Heavy Rain + Fog', wind: 22, aqi: 25, rainfall_24h: 85, lat: 24.59, lon: 72.71, note: 'Only hill station in Rajasthan' },
          ]
        },
      }
    },

    'Kerala': {
      capital: 'Thiruvananthapuram', temp: 27, humidity: 92, rain: true, condition: 'Heavy Rain',
      wind: 28, aqi: 35, rainfall_24h: 120,
      districts: {
        'Thiruvananthapuram': {
          hq: 'Thiruvananthapuram', temp: 27, humidity: 92, rain: true, condition: 'Heavy Rain',
          places: [
            { name: 'Thiruvananthapuram', temp: 27, humidity: 92, rain: true, condition: 'Heavy Rain', wind: 28, aqi: 35, rainfall_24h: 115, lat: 8.52, lon: 76.94 },
            { name: 'Kovalam', temp: 27, humidity: 93, rain: true, condition: 'Heavy Rain + Rough Sea', wind: 35, aqi: 30, rainfall_24h: 125, lat: 8.40, lon: 76.98, note: 'Fishermen warned — sea rough' },
          ]
        },
        'Ernakulam': {
          hq: 'Kochi', temp: 28, humidity: 91, rain: true, condition: 'Heavy Rain',
          places: [
            { name: 'Kochi', temp: 28, humidity: 91, rain: true, condition: 'Heavy Rain', wind: 30, aqi: 38, rainfall_24h: 105, lat: 9.93, lon: 76.27 },
            { name: 'Fort Kochi', temp: 27, humidity: 93, rain: true, condition: 'Very Heavy Rain', wind: 34, aqi: 32, rainfall_24h: 130, lat: 9.96, lon: 76.24 },
          ]
        },
        'Wayanad': {
          hq: 'Kalpetta', temp: 22, humidity: 96, rain: true, condition: 'Extremely Heavy Rain',
          places: [
            { name: 'Kalpetta', temp: 22, humidity: 96, rain: true, condition: 'Extremely Heavy Rain', wind: 22, aqi: 20, rainfall_24h: 180, lat: 11.61, lon: 76.08, note: '⚠️ LANDSLIDE ALERT — Orange' },
            { name: 'Meppadi', temp: 21, humidity: 97, rain: true, condition: 'Extremely Heavy Rain', wind: 24, aqi: 18, rainfall_24h: 210, lat: 11.56, lon: 76.14, note: '⚠️ HIGH landslide risk — evacuations ongoing' },
            { name: 'Sultan Bathery', temp: 23, humidity: 94, rain: true, condition: 'Very Heavy Rain', wind: 18, aqi: 22, rainfall_24h: 155, lat: 11.67, lon: 76.24 },
          ]
        },
      }
    },

    'Bihar': {
      capital: 'Patna', temp: 33, humidity: 85, rain: true, condition: 'Rain — Flood Alert',
      wind: 16, aqi: 62, rainfall_24h: 65,
      districts: {
        'Patna': {
          hq: 'Patna', temp: 33, humidity: 85, rain: true, condition: 'Heavy Rain',
          places: [
            { name: 'Patna City', temp: 33, humidity: 85, rain: true, condition: 'Heavy Rain', wind: 16, aqi: 62, rainfall_24h: 65, lat: 25.59, lon: 85.14 },
            { name: 'Hajipur', temp: 33, humidity: 86, rain: true, condition: 'Rain — Gandak Rising', wind: 14, aqi: 58, rainfall_24h: 72, lat: 25.69, lon: 85.22 },
          ]
        },
        'Supaul': {
          hq: 'Supaul', temp: 32, humidity: 90, rain: true, condition: 'Heavy Rain — FLOOD',
          places: [
            { name: 'Supaul Town', temp: 32, humidity: 90, rain: true, condition: 'Flooded', wind: 16, aqi: 48, rainfall_24h: 95, lat: 26.12, lon: 86.60, note: '⚠️ Kosi flood zone — evacuations' },
            { name: 'Saharsa', temp: 32, humidity: 89, rain: true, condition: 'Flood Alert', wind: 14, aqi: 52, rainfall_24h: 88, lat: 25.88, lon: 86.60, note: '⚠️ Kosi barrage gates opened' },
          ]
        },
      }
    },

    'Uttarakhand': {
      capital: 'Dehradun', temp: 28, humidity: 88, rain: true, condition: 'Heavy Rain',
      wind: 18, aqi: 42, rainfall_24h: 85,
      districts: {
        'Dehradun': {
          hq: 'Dehradun', temp: 28, humidity: 88, rain: true, condition: 'Heavy Rain',
          places: [
            { name: 'Dehradun City', temp: 28, humidity: 88, rain: true, condition: 'Heavy Rain', wind: 18, aqi: 42, rainfall_24h: 85, lat: 30.32, lon: 78.03 },
            { name: 'Mussoorie', temp: 17, humidity: 95, rain: true, condition: 'Heavy Rain + Dense Fog', wind: 28, aqi: 20, rainfall_24h: 120, lat: 30.45, lon: 78.08, note: 'Hill station — roads slippery' },
            { name: 'Rishikesh', temp: 30, humidity: 85, rain: true, condition: 'Rain — Ganga Rising', wind: 16, aqi: 45, rainfall_24h: 72, lat: 30.09, lon: 78.27 },
          ]
        },
      }
    },

    'Jammu & Kashmir': {
      capital: 'Srinagar', temp: 24, humidity: 80, rain: true, condition: 'Light Rain',
      wind: 12, aqi: 45, rainfall_24h: 15,
      aliases: ['jammu and kashmir', 'jammu kashmir', 'jk', 'j&k'],
      districts: {
        'Srinagar': {
          hq: 'Srinagar', temp: 24, humidity: 80, rain: true, condition: 'Light Rain',
          places: [
            { name: 'Srinagar', temp: 24, humidity: 80, rain: true, condition: 'Light Rain', wind: 12, aqi: 45, rainfall_24h: 15, lat: 34.08, lon: 74.80 }
          ]
        },
        'Jammu': {
          hq: 'Jammu', temp: 29, humidity: 82, rain: true, condition: 'Thunderstorms',
          places: [
            { name: 'Jammu', temp: 29, humidity: 82, rain: true, condition: 'Thunderstorms', wind: 14, aqi: 48, rainfall_24h: 28, lat: 32.73, lon: 74.87 }
          ]
        }
      }
    },
    'Himachal Pradesh': {
      capital: 'Shimla', temp: 20, humidity: 88, rain: true, condition: 'Moderate Rain',
      wind: 10, aqi: 35, rainfall_24h: 30,
      aliases: ['himachal', 'hp'],
      districts: {
        'Shimla': {
          hq: 'Shimla', temp: 20, humidity: 88, rain: true, condition: 'Moderate Rain',
          places: [
            { name: 'Shimla', temp: 20, humidity: 88, rain: true, condition: 'Moderate Rain', wind: 10, aqi: 35, rainfall_24h: 30, lat: 31.10, lon: 77.17 }
          ]
        }
      }
    },
    'Punjab': {
      capital: 'Chandigarh', temp: 30, humidity: 75, rain: true, condition: 'Intermittent Rain',
      wind: 14, aqi: 62, rainfall_24h: 18,
      aliases: ['punjab', 'pb'],
      districts: {
        'Amritsar': {
          hq: 'Amritsar', temp: 30, humidity: 75, rain: true, condition: 'Rain Showers',
          places: [
            { name: 'Amritsar', temp: 30, humidity: 75, rain: true, condition: 'Rain Showers', wind: 14, aqi: 62, rainfall_24h: 18, lat: 31.63, lon: 74.87 }
          ]
        },
        'Ludhiana': {
          hq: 'Ludhiana', temp: 31, humidity: 73, rain: false, condition: 'Cloudy',
          places: [
            { name: 'Ludhiana', temp: 31, humidity: 73, rain: false, condition: 'Cloudy & Overcast', wind: 12, aqi: 68, rainfall_24h: 5, lat: 30.90, lon: 75.85 }
          ]
        }
      }
    },
    'Haryana': {
      capital: 'Chandigarh', temp: 31, humidity: 74, rain: true, condition: 'Passing Showers',
      wind: 12, aqi: 65, rainfall_24h: 12,
      aliases: ['haryana', 'hr'],
      districts: {
        'Gurugram': {
          hq: 'Gurugram', temp: 31, humidity: 74, rain: true, condition: 'Passing Showers',
          places: [
            { name: 'Gurugram', temp: 31, humidity: 74, rain: true, condition: 'Passing Showers', wind: 12, aqi: 65, rainfall_24h: 12, lat: 28.46, lon: 77.03 }
          ]
        },
        'Faridabad': {
          hq: 'Faridabad', temp: 32, humidity: 72, rain: false, condition: 'Overcast',
          places: [
            { name: 'Faridabad', temp: 32, humidity: 72, rain: false, condition: 'Overcast', wind: 10, aqi: 70, rainfall_24h: 2, lat: 28.41, lon: 77.32 }
          ]
        }
      }
    },
    'Uttar Pradesh': {
      capital: 'Lucknow', temp: 28, humidity: 82, rain: true, condition: 'Thunderstorms',
      wind: 16, aqi: 58, rainfall_24h: 38,
      aliases: ['uttar pradesh', 'up'],
      districts: {
        'Lucknow': {
          hq: 'Lucknow', temp: 28, humidity: 82, rain: true, condition: 'Thunderstorms',
          places: [
            { name: 'Lucknow', temp: 28, humidity: 82, rain: true, condition: 'Thunderstorms', wind: 16, aqi: 58, rainfall_24h: 38, lat: 26.85, lon: 80.95 }
          ]
        },
        'Gautam Buddha Nagar': {
          hq: 'Noida', temp: 30, humidity: 78, rain: true, condition: 'Light Rain',
          aliases: ['noida', 'gb nagar'],
          places: [
            { name: 'Noida', temp: 30, humidity: 78, rain: true, condition: 'Light Rain', wind: 12, aqi: 62, rainfall_24h: 15, lat: 28.53, lon: 77.39 }
          ]
        },
        'Varanasi': {
          hq: 'Varanasi', temp: 28, humidity: 85, rain: true, condition: 'Heavy Rain',
          places: [
            { name: 'Varanasi', temp: 28, humidity: 85, rain: true, condition: 'Heavy Rain', wind: 18, aqi: 52, rainfall_24h: 45, lat: 25.32, lon: 82.99 }
          ]
        }
      }
    },
    'Sikkim': {
      capital: 'Gangtok', temp: 21, humidity: 92, rain: true, condition: 'Heavy Rain + Fog',
      wind: 12, aqi: 25, rainfall_24h: 65,
      aliases: ['sikkim', 'sk'],
      districts: {
        'East Sikkim': {
          hq: 'Gangtok', temp: 21, humidity: 92, rain: true, condition: 'Heavy Rain + Fog',
          places: [
            { name: 'Gangtok', temp: 21, humidity: 92, rain: true, condition: 'Heavy Rain + Fog', wind: 12, aqi: 25, rainfall_24h: 65, lat: 27.33, lon: 88.61 }
          ]
        }
      }
    },
    'Arunachal Pradesh': {
      capital: 'Itanagar', temp: 26, humidity: 94, rain: true, condition: 'Very Heavy Rain',
      wind: 14, aqi: 28, rainfall_24h: 90,
      aliases: ['arunachal', 'ap-north'],
      districts: {
        'Papum Pare': {
          hq: 'Itanagar', temp: 26, humidity: 94, rain: true, condition: 'Very Heavy Rain',
          places: [
            { name: 'Itanagar', temp: 26, humidity: 94, rain: true, condition: 'Very Heavy Rain', wind: 14, aqi: 28, rainfall_24h: 90, lat: 27.08, lon: 93.60 }
          ]
        }
      }
    },
    'Nagaland': {
      capital: 'Kohima', temp: 22, humidity: 92, rain: true, condition: 'Heavy Rain',
      wind: 10, aqi: 30, rainfall_24h: 55,
      aliases: ['nagaland', 'nl'],
      districts: {
        'Kohima': {
          hq: 'Kohima', temp: 22, humidity: 92, rain: true, condition: 'Heavy Rain',
          places: [
            { name: 'Kohima', temp: 22, humidity: 92, rain: true, condition: 'Heavy Rain', wind: 10, aqi: 30, rainfall_24h: 55, lat: 25.67, lon: 94.10 }
          ]
        }
      }
    },
    'Manipur': {
      capital: 'Imphal', temp: 25, humidity: 90, rain: true, condition: 'Moderate Rain',
      wind: 12, aqi: 32, rainfall_24h: 40,
      aliases: ['manipur', 'mn'],
      districts: {
        'Imphal West': {
          hq: 'Imphal', temp: 25, humidity: 90, rain: true, condition: 'Moderate Rain',
          places: [
            { name: 'Imphal', temp: 25, humidity: 90, rain: true, condition: 'Moderate Rain', wind: 12, aqi: 32, rainfall_24h: 40, lat: 24.81, lon: 93.94 }
          ]
        }
      }
    },
    'Mizoram': {
      capital: 'Aizawl', temp: 23, humidity: 92, rain: true, condition: 'Heavy Rain',
      wind: 12, aqi: 28, rainfall_24h: 60,
      aliases: ['mizoram', 'mz'],
      districts: {
        'Aizawl': {
          hq: 'Aizawl', temp: 23, humidity: 92, rain: true, condition: 'Heavy Rain',
          places: [
            { name: 'Aizawl', temp: 23, humidity: 92, rain: true, condition: 'Heavy Rain', wind: 12, aqi: 28, rainfall_24h: 60, lat: 23.73, lon: 92.72 }
          ]
        }
      }
    },
    'Tripura': {
      capital: 'Agartala', temp: 27, humidity: 88, rain: true, condition: 'Moderate Rain',
      wind: 14, aqi: 45, rainfall_24h: 35,
      aliases: ['tripura', 'tr'],
      districts: {
        'West Tripura': {
          hq: 'Agartala', temp: 27, humidity: 88, rain: true, condition: 'Moderate Rain',
          places: [
            { name: 'Agartala', temp: 27, humidity: 88, rain: true, condition: 'Moderate Rain', wind: 14, aqi: 45, rainfall_24h: 35, lat: 23.83, lon: 91.28 }
          ]
        }
      }
    },
    'Meghalaya': {
      capital: 'Shillong', temp: 21, humidity: 95, rain: true, condition: 'Heavy Rain + Fog',
      wind: 16, aqi: 22, rainfall_24h: 110,
      aliases: ['meghalaya', 'ml'],
      districts: {
        'East Khasi Hills': {
          hq: 'Shillong', temp: 21, humidity: 95, rain: true, condition: 'Heavy Rain + Fog',
          places: [
            { name: 'Shillong', temp: 21, humidity: 95, rain: true, condition: 'Heavy Rain + Fog', wind: 16, aqi: 22, rainfall_24h: 110, lat: 25.57, lon: 91.88 }
          ]
        }
      }
    },
    'Jharkhand': {
      capital: 'Ranchi', temp: 26, humidity: 85, rain: true, condition: 'Moderate Rain',
      wind: 14, aqi: 50, rainfall_24h: 28,
      aliases: ['jharkhand', 'jh'],
      districts: {
        'Ranchi': {
          hq: 'Ranchi', temp: 26, humidity: 85, rain: true, condition: 'Moderate Rain',
          places: [
            { name: 'Ranchi', temp: 26, humidity: 85, rain: true, condition: 'Moderate Rain', wind: 14, aqi: 50, rainfall_24h: 28, lat: 23.34, lon: 85.30 }
          ]
        }
      }
    },
    'Odisha': {
      capital: 'Bhubaneswar', temp: 27, humidity: 88, rain: true, condition: 'Thunderstorms',
      wind: 20, aqi: 48, rainfall_24h: 42,
      aliases: ['odisha', 'orissa', 'od'],
      districts: {
        'Khurda': {
          hq: 'Bhubaneswar', temp: 27, humidity: 88, rain: true, condition: 'Thunderstorms',
          places: [
            { name: 'Bhubaneswar', temp: 27, humidity: 88, rain: true, condition: 'Thunderstorms', wind: 20, aqi: 48, rainfall_24h: 42, lat: 20.27, lon: 85.82 }
          ]
        }
      }
    },
    'Chhattisgarh': {
      capital: 'Raipur', temp: 27, humidity: 84, rain: true, condition: 'Rain Showers',
      wind: 14, aqi: 52, rainfall_24h: 25,
      aliases: ['chhattisgarh', 'cg'],
      districts: {
        'Raipur': {
          hq: 'Raipur', temp: 27, humidity: 84, rain: true, condition: 'Rain Showers',
          places: [
            { name: 'Raipur', temp: 27, humidity: 84, rain: true, condition: 'Rain Showers', wind: 14, aqi: 52, rainfall_24h: 25, lat: 21.25, lon: 81.63 }
          ]
        }
      }
    },
    'Madhya Pradesh': {
      capital: 'Bhopal', temp: 26, humidity: 85, rain: true, condition: 'Moderate Rain',
      wind: 16, aqi: 50, rainfall_24h: 30,
      aliases: ['madhya pradesh', 'mp'],
      districts: {
        'Bhopal': {
          hq: 'Bhopal', temp: 26, humidity: 85, rain: true, condition: 'Moderate Rain',
          places: [
            { name: 'Bhopal', temp: 26, humidity: 85, rain: true, condition: 'Moderate Rain', wind: 16, aqi: 50, rainfall_24h: 30, lat: 23.25, lon: 77.41 }
          ]
        },
        'Indore': {
          hq: 'Indore', temp: 27, humidity: 82, rain: true, condition: 'Light Rain',
          places: [
            { name: 'Indore', temp: 27, humidity: 82, rain: true, condition: 'Light Rain', wind: 14, aqi: 54, rainfall_24h: 15, lat: 22.72, lon: 75.85 }
          ]
        }
      }
    },
    'Gujarat': {
      capital: 'Gandhinagar', temp: 28, humidity: 80, rain: true, condition: 'Cloudy & Rain',
      wind: 18, aqi: 58, rainfall_24h: 22,
      aliases: ['gujarat', 'gj'],
      districts: {
        'Ahmedabad': {
          hq: 'Ahmedabad', temp: 28, humidity: 80, rain: true, condition: 'Cloudy & Rain',
          places: [
            { name: 'Ahmedabad', temp: 28, humidity: 80, rain: true, condition: 'Cloudy & Rain', wind: 18, aqi: 58, rainfall_24h: 22, lat: 23.02, lon: 72.57 }
          ]
        },
        'Surat': {
          hq: 'Surat', temp: 27, humidity: 88, rain: true, condition: 'Heavy Rain',
          places: [
            { name: 'Surat', temp: 27, humidity: 88, rain: true, condition: 'Heavy Rain', wind: 22, aqi: 48, rainfall_24h: 50, lat: 21.17, lon: 72.83 }
          ]
        }
      }
    },
    'Telangana': {
      capital: 'Hyderabad', temp: 27, humidity: 82, rain: true, condition: 'Moderate Rain',
      wind: 16, aqi: 50, rainfall_24h: 20,
      aliases: ['telangana', 'tg', 'ts'],
      districts: {
        'Hyderabad': {
          hq: 'Hyderabad', temp: 27, humidity: 82, rain: true, condition: 'Moderate Rain',
          places: [
            { name: 'Charminar', temp: 27, humidity: 82, rain: true, condition: 'Moderate Rain', wind: 16, aqi: 50, rainfall_24h: 20, lat: 17.36, lon: 78.47 }
          ]
        }
      }
    },
    'Andhra Pradesh': {
      capital: 'Amaravati', temp: 29, humidity: 76, rain: true, condition: 'Intermittent Showers',
      wind: 18, aqi: 54, rainfall_24h: 15,
      aliases: ['andhra pradesh', 'andhra', 'ap'],
      districts: {
        'Visakhapatnam': {
          hq: 'Visakhapatnam', temp: 28, humidity: 82, rain: true, condition: 'Passing Showers',
          places: [
            { name: 'Visakhapatnam', temp: 28, humidity: 82, rain: true, condition: 'Passing Showers', wind: 22, aqi: 48, rainfall_24h: 18, lat: 17.68, lon: 83.21 }
          ]
        }
      }
    },
    'Goa': {
      capital: 'Panaji', temp: 26, humidity: 92, rain: true, condition: 'Heavy Rain',
      wind: 26, aqi: 30, rainfall_24h: 95,
      aliases: ['goa', 'ga'],
      districts: {
        'North Goa': {
          hq: 'Panaji', temp: 26, humidity: 92, rain: true, condition: 'Heavy Rain',
          places: [
            { name: 'Panaji', temp: 26, humidity: 92, rain: true, condition: 'Heavy Rain', wind: 26, aqi: 30, rainfall_24h: 95, lat: 15.49, lon: 73.82 }
          ]
        }
      }
    },
  },

  /* ── Handle duplicate place names & hierarchical queries ── */
  searchPlace(query) {
    const results = [];
    const q = query.toLowerCase().trim();

    // Check if it's a hierarchical search separated by -->
    if (q.includes('-->')) {
      const parts = q.split('-->').map(p => p.trim());
      // parts[0]: State, parts[1]: District, parts[2]: Place, parts[3]: SubPlace (optional)
      for (const [stateName, state] of Object.entries(this.states)) {
        const stateMatches = stateName.toLowerCase() === parts[0] || (state.aliases && state.aliases.includes(parts[0]));
        if (!stateMatches) continue;

        for (const [distName, dist] of Object.entries(state.districts)) {
          const distMatches = distName.toLowerCase() === parts[1] || (dist.aliases && dist.aliases.includes(parts[1]));
          if (!distMatches && parts[1]) continue;

          for (const place of dist.places) {
            const placeMatches = place.name.toLowerCase() === parts[2] || (place.aliases && place.aliases.includes(parts[2]));
            if (!placeMatches && parts[2]) continue;

            if (parts[3] && place.subPlaces) {
              for (const sp of place.subPlaces) {
                const spMatches = sp.name.toLowerCase() === parts[3] || (sp.aliases && sp.aliases.includes(parts[3]));
                if (spMatches) {
                  results.push({
                    ...sp,
                    parentPlace: place.name,
                    district: distName,
                    state: stateName,
                    fullPath: `${sp.name}, ${place.name}, ${distName}, ${stateName}`,
                    id: `${stateName}|${distName}|${place.name}|${sp.name}`
                  });
                }
              }
            } else if (!parts[3]) {
              results.push({
                ...place,
                district: distName,
                state: stateName,
                fullPath: `${place.name}, ${distName}, ${stateName}`,
                id: `${stateName}|${distName}|${place.name}`
              });
            }
          }
        }
      }
      if (results.length > 0) return results;
    }

    // Normal query search (matches name or aliases of place or subPlace)
    for (const [stateName, state] of Object.entries(this.states)) {
      for (const [distName, dist] of Object.entries(state.districts)) {
        for (const place of dist.places) {
          const placeMatch = place.name.toLowerCase().includes(q) || (place.aliases && place.aliases.some(a => a.includes(q)));
          if (placeMatch) {
            results.push({
              ...place,
              district: distName,
              state: stateName,
              fullPath: `${place.name}, ${distName}, ${stateName}`,
              id: `${stateName}|${distName}|${place.name}`
            });
          }
          // Search sub-places too
          if (place.subPlaces) {
            for (const sp of place.subPlaces) {
              const spMatch = sp.name.toLowerCase().includes(q) || (sp.aliases && sp.aliases.some(a => a.includes(q)));
              if (spMatch) {
                results.push({
                  ...sp,
                  parentPlace: place.name,
                  district: distName,
                  state: stateName,
                  fullPath: `${sp.name}, ${place.name}, ${distName}, ${stateName}`,
                  id: `${stateName}|${distName}|${place.name}|${sp.name}`
                });
              }
            }
          }
        }
      }
    }
    return results;
  },

  getStateList() {
    return Object.keys(this.states).map(name => ({
      name,
      ...this.states[name]
    }));
  },

  getDistricts(stateName) {
    const state = this.states[stateName];
    if (!state) return [];
    return Object.keys(state.districts).map(name => ({
      name,
      ...state.districts[name]
    }));
  },

  getPlaces(stateName, districtName) {
    const state = this.states[stateName];
    if (!state) return [];
    const district = state.districts[districtName];
    if (!district) return [];
    return district.places.map(p => ({
      ...p,
      district: districtName,
      state: stateName,
      fullPath: `${p.name}, ${districtName}, ${stateName}`,
    }));
  },

  getSubPlaces(stateName, districtName, placeName) {
    const state = this.states[stateName];
    if (!state) return [];
    const district = state.districts[districtName];
    if (!district) return [];
    const place = district.places.find(p => p.name === placeName);
    if (!place || !place.subPlaces) return [];
    return place.subPlaces.map(sp => ({
      ...sp,
      parentPlace: placeName,
      district: districtName,
      state: stateName,
      fullPath: `${sp.name}, ${placeName}, ${districtName}, ${stateName}`,
    }));
  }
};

window.LocationData = LocationData;
