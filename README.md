# NearMe 📍

**NearMe** é um aplicativo multiplataforma (Web, Android e iOS) que mostra todos os estabelecimentos próximos ao usuário com informações completas e rotas para todos os meios de transporte.

## Funcionalidades

### Principais
- 📍 **Localização em tempo real** — Detecta sua posição e exibe locais ao redor
- 🗂️ **20+ categorias** — Restaurantes, farmácias, bancos, hospitais, academias, parques e muito mais
- 🏠 **Cards com foto** — Cada estabelecimento exibido com imagem, avaliação, distância e status
- 📞 **Contato direto** — Ligue ou mande mensagem no WhatsApp direto do app
- 🗺️ **Mapa integrado** — Google Maps embutido na tela de cada local
- 🚗 **Rotas multimodais** — Carro, a pé, transporte público e bicicleta
- 🔍 **Busca inteligente** — Pesquise qualquer estabelecimento por nome ou tipo

### Emergências
- 🚨 **Banner de emergência sempre visível** na home
- 📞 **Discagem rápida** — SAMU (192), Bombeiros (193), Polícia (190), Defesa Civil (199), CVV (188)
- 🏥 **Hospitais, UPAs e delegacias** próximas *mesmo fora do raio de busca*
- 💊 **Farmácias 24h** mais próximas
- 💡 **Dicas de segurança** contextuais

### Diferenciais
- ❤️ **Favoritos** — Salve seus locais preferidos offline
- 🕐 **Histórico** — Acesse rapidamente os locais visitados
- 📡 **Raio ajustável** — 500m, 1km, 2km, 5km ou 10km
- 🗺️ **Visualização em mapa** — Veja todos os resultados no mapa de uma vez
- 🔀 **Ordenação** — Por distância ou avaliação
- 📤 **Compartilhar** — Compartilhe endereços com link do Google Maps

## Stack Tecnológica

| Tecnologia | Uso |
|---|---|
| React Native + Expo | Framework multiplataforma |
| TypeScript | Tipagem estática |
| React Navigation | Navegação entre telas |
| react-native-maps | Mapas Google integrados |
| expo-location | Geolocalização |
| AsyncStorage | Favoritos e histórico offline |
| Google Places API | Dados dos estabelecimentos |
| Google Directions API | Rotas multimodais |

## Configuração

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar Google Maps API
Copie `.env.example` para `.env` e insira sua chave:
```bash
cp .env.example .env
```
Edite `.env`:
```
EXPO_PUBLIC_GOOGLE_API_KEY=sua_chave_aqui
```

**APIs necessárias no Google Cloud Console:**
- Maps SDK for Android
- Maps SDK for iOS
- Places API (New)
- Directions API
- Maps Static API

### 3. Executar

```bash
# Web
npm run web

# Android
npm run android

# iOS (apenas macOS)
npm run ios

# Expo Go (escaneie o QR code)
npx expo start
```

## Estrutura do Projeto

```
src/
├── components/       # PlaceCard, RouteCard, EmergencyCard, etc.
├── constants/        # Categorias, números de emergência
├── hooks/            # useLocation, usePlaces
├── navigation/       # AppNavigator
├── screens/          # Home, PlaceList, PlaceDetail, Emergency, etc.
├── services/         # LocationService, PlacesService, StorageService
├── theme/            # Cores, tipografia, espaçamentos
└── types/            # TypeScript types
```

## Roadmap
- [ ] Modo escuro
- [ ] Notificações push de promoções próximas
- [ ] Realidade aumentada (câmera + setas para o local)
- [ ] Check-in e avaliação de locais
- [ ] Widget para tela inicial (iOS/Android)
- [ ] Modo offline com cache de dados

## Licença

MIT
