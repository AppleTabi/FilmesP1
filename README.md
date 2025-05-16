# FilmStream Alkalmazás

Egy egyszerű film feltöltő és kezelő alkalmazás, ahol a felhasználók filmeket tölthetnek fel, böngészhetnek és törölhetnek.

## Előfeltételek

- Node.js (v14 vagy újabb)
- MySQL szerver
- npm vagy yarn

## Telepítés

1. Klónozd le a repository-t:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Telepítsd a függőségeket mind a frontend, mind a backend részhez:
```bash
# Frontend függőségek telepítése
cd vite-project
npm install

# Backend függőségek telepítése és adatbázis inicializálása
cd backend
npm run setup
```

## Konfiguráció

Az alkalmazás alapértelmezetten a következő beállításokkal működik:
- MySQL kapcsolat: 
  - Host: localhost
  - User: root
  - Password: (üres)
  - Database: filmfeltolto
- Backend port: 3000
- Frontend port: 5173

Ha módosítani szeretnéd ezeket a beállításokat, a következő fájlokat kell szerkesztened:
- Backend MySQL kapcsolat: `backend/index.js`
- Backend port: `backend/index.js`
- Frontend API URL: `vite-project/src/main.js`

## Futtatás

1. Indítsd el a backend szervert:
```bash
cd backend
npm start
```

2. Új terminál ablakban indítsd el a frontend fejlesztői szervert:
```bash
cd vite-project
npm run dev
```

3. Nyisd meg a böngészőben: http://localhost:5173

## Funkciók

- Filmek feltöltése címmel, leírással, hosszal és kategóriával
- Borítókép és videófájl feltöltése
- Filmek listázása
- Keresés cím és leírás alapján
- Szűrés kategória szerint
- Filmek törlése

## Mappák létrehozása

Az alkalmazás automatikusan létrehozza a következő mappákat a backend könyvtárban:
- `uploads/`
- `uploads/images/` (borítóképeknek)
- `uploads/videos/` (videófájloknak)

## Hibaelhárítás

1. Ha a MySQL kapcsolat nem működik:
   - Ellenőrizd, hogy fut-e a MySQL szerver
   - Ellenőrizd a felhasználónevet és jelszót
   - Ellenőrizd, hogy létezik-e az adatbázis

2. Ha a fájlfeltöltés nem működik:
   - Ellenőrizd az `uploads` mappák jogosultságait
   - Ellenőrizd a fájlméret korlátokat

3. Ha a frontend nem éri el a backend-et:
   - Ellenőrizd, hogy fut-e a backend szerver
   - Ellenőrizd a portokat és URL-eket 