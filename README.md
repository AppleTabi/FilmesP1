# Film Feltöltő Platform

## Telepítés

1. Klónozd le a repository-t:
```bash
git clone [repository-url]
cd [repository-name]
```

2. Telepítsd a függőségeket:
```bash
npm install
```

3. Indítsd el a szervert:
```bash
cd backend
npm start
```

4. Indítsd el a frontend-et:
```bash
cd ..
npm run dev
```

## Használat

1. Nyisd meg a böngészőben: http://localhost:5173
2. Regisztrálj egy felhasználót (az első regisztrált felhasználó admin lesz)
3. Jelentkezz be
4. Kezdj el filmeket feltölteni!

## Előfeltételek

- Node.js (v14 vagy újabb)
- MySQL szerver
- npm vagy yarn

## Funkciók

- Filmek feltöltése címmel, leírással, hosszal és kategóriával
- Borítókép és videófájl feltöltése
- Filmek listázása
- Keresés cím és leírás alapján
- Szűrés kategória szerint
- Filmek törlése
- Felhasználói jogosultságok (admin, moderátor, felhasználó)

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