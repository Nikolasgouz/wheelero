# Γύρνα.

Μια στροφή, μια απόφαση. Ελληνική εφαρμογή Decision Spinner για κινητό, tablet και
desktop, με εγκαταστάσιμη PWA, ανώνυμη ιδιωτική αποθήκευση και offline λειτουργία.

## Προϋποθέσεις

- Python 3.12+ (τοπικά χρησιμοποιήθηκε 3.14), Git.
- Bun 1.3+ και Node.js 22.12+ για Vite/Playwright.
- Σύγχρονος browser με Web Crypto, IndexedDB και Web Locks.
- HTTPS στην παραγωγή· το localhost επιτρέπεται για ανάπτυξη/PWA.

## Εγκατάσταση (PowerShell, από τη ρίζα)

```powershell
python -m venv .venv
./.venv/Scripts/python -m pip install -r backend/requirements.lock
Copy-Item .env.example .env
cd frontend
bun install --frozen-lockfile
bunx playwright install chromium
cd ../backend
../.venv/Scripts/python -m alembic upgrade head
cd ..
```

Σε Linux/macOS χρησιμοποιήστε `.venv/bin/python` αντί για `.venv/Scripts/python`.
Τα `backend/requirements.lock` και `frontend/bun.lock` κλειδώνουν τις εξαρτήσεις.
Ο Chromium χρειάζεται μόνο για E2E tests.

## Εκκίνηση

**Στα Windows:** κάντε διπλό κλικ στο `START_GYRNA.bat` στη ρίζα του project.
Εφαρμόζει τις migrations, δημιουργεί production build αν λείπει, ξεκινά δύο παράθυρα
για backend/frontend και ανοίγει το `http://localhost:4173` στον browser.
Για τερματισμό κλείστε και τα δύο παράθυρα. Αν η εφαρμογή τρέχει ήδη, ο launcher
σταματά με μήνυμα για τις δεσμευμένες θύρες. Μετά από αλλαγές στον frontend,
εκτελέστε `bun run build` μέσα στο `frontend/` για να ενημερώσετε την προεπισκόπηση.

Εναλλακτικά, για ανάπτυξη:

Πρώτο terminal:

```powershell
cd backend
../.venv/Scripts/python -m uvicorn app.main:app --host 127.0.0.1 --port 8017 --reload --no-access-log
```

Δεύτερο terminal:

```powershell
cd frontend
bun run dev
```

Ανοίξτε **http://localhost:5173**. Το Vite προωθεί το `/api` στη θύρα 8017.
Η 8000 αποφεύγεται γιατί χρησιμοποιούνταν ήδη από άλλο project.

OpenAPI: [Swagger UI](http://localhost:8017/docs), [ReDoc](http://localhost:8017/redoc),
[JSON](http://localhost:8017/openapi.json). Οι επιλογές τροχού αντικαθίστανται ατομικά
μέσω `PUT /api/wheels/{id}`, μαζί με τίτλο, σειρά και ρυθμίσεις.

## Περιβάλλον και βάση

Το backend διαβάζει το `.env` στη ρίζα όταν εκτελείται από το `backend/`:

| Μεταβλητή | Τοπική τιμή | Χρήση |
| --- | --- | --- |
| `DATABASE_URL` | `sqlite:///./gyrna.db` | Αρχείο στο backend· production: απόλυτη διαδρομή σε μόνιμο volume |
| `ALLOWED_ORIGINS` | localhost και 127.0.0.1 στις θύρες 5173/4173 | Ρητή λίστα στο `.env.example`, χωρίς κενά |
| `COOKIE_SECURE` | `false` | `true` υποχρεωτικά σε production HTTPS |

Μην καταγράφετε cookies, CSRF/share tokens ή ιδιωτικά δεδομένα. Το `--no-access-log`
αποφεύγει την καταγραφή share tokens μέσα στα paths.

Από `backend/`, αρχικοποίηση/αναβάθμιση και έλεγχος migration:

```powershell
../.venv/Scripts/python -m alembic upgrade head
../.venv/Scripts/python -m alembic check
```

Δεν δημιουργούνται πίνακες κατά την εκκίνηση. Αλλαγές μοντέλων απαιτούν migration:
`alembic revision --autogenerate -m "description"`, έλεγχο κώδικα και `upgrade head`.
Πριν από αναβάθμιση παραγωγής κρατήστε συνεπές backup μέσω του SQLite backup API.
Η απλή αντιγραφή ενεργού `.db` χωρίς το WAL δεν είναι ασφαλές backup.

## Έλεγχοι

```powershell
cd backend
../.venv/Scripts/python -m pytest -q
../.venv/Scripts/python -m alembic check
cd ../frontend
bun run typecheck
bun run lint
bun run test
bun run build
bun run e2e
```

Το Playwright χρησιμοποιεί το production build. Εκκινεί backend με `e2e.db` και preview
server αν οι θύρες 8017/4173 δεν εξυπηρετούν ήδη την εφαρμογή. Κάθε test έχει ξεχωριστή
browser session. Screenshots: αγνοημένος φάκελος `artifacts/`. Τα πραγματικά αποτελέσματα
και οι περιορισμοί καταγράφονται στο `PROJECT_CONTEXT.md`.

Τελευταίος πλήρης έλεγχος (24/10/2026): 22 backend tests, 3 unit tests και 16 E2E
πέρασαν, όπως και typecheck, lint, production build και έλεγχος Alembic.
Η εγκατάσταση και η χρήση σε πραγματικές συσκευές iOS/Android παραμένουν προς έλεγχο.

## Production preview και PWA

Με το backend ανοιχτό:

```powershell
cd frontend
bun run build
bun run preview --port 4173
```

Ανοίξτε **http://localhost:4173**, περιμένετε «Έτοιμο και χωρίς internet», ανανεώστε
μία φορά και ενεργοποιήστε Offline στα DevTools. Δοκιμάστε επεξεργασία, περιστροφή και
refresh. Επαναφέρετε τη σύνδεση και πατήστε «Αποθήκευση» για άμεσο συγχρονισμό.
Συγχρονισμός γίνεται επίσης στην επανασύνδεση και περιοδικά όταν η εφαρμογή είναι ήρεμη.
Ο development server δεν εγκαθιστά service worker.

Εμφανίζεται install prompt μόνο όταν το παρέχει ο browser· αλλιώς δίνονται οδηγίες.
Οι ενημερώσεις εφαρμόζονται με κουμπί αφού ολοκληρωθούν οι τοπικές εγγραφές. Η πρώτη
φόρτωση και το caching απαιτούν σύνδεση.

## Δεδομένα και χρήση

Η επεξεργασία αποθηκεύεται αυτόματα στη συσκευή. Η επιλογή γίνεται στον server όταν
είναι διαθέσιμος και με Web Crypto offline. Κάθε γραμμή έχει ίση πιθανότητα, ακόμη κι
αν επαναλαμβάνεται το ίδιο κείμενο. Τα τοπικά/εισαγμένα αποτελέσματα διακρίνονται από
τις κληρώσεις server. Σε σύγκρουση revisions δημιουργείται ξεχωριστό αντίγραφο.

Μια αβέβαιη online κλήρωση ανακτάται με το ίδιο ID στην επανασύνδεση. Τα share links
είναι ανεξάρτητα στιγμιότυπα χωρίς ιστορικό και ανακαλούνται από την κοινοποίηση.

Η συνεδρία συνδέεται με αυτόν τον browser μέσω HttpOnly cookie. Η διαγραφή του cookie
αφαιρεί την πρόσβαση στον προηγούμενο χώρο· οι εναπομείναντες τοπικοί τροχοί αντιγράφονται
σε νέο χώρο. Δεν υπάρχει λογαριασμός ή ανάκτηση από άλλη συσκευή. Χρησιμοποιείτε JSON
backups· η διαγραφή όλων των browser δεδομένων σβήνει και τα τοπικά αντίγραφα.

Εισαγωγή: format 1, έως 10 MB, 100 τροχοί, 200 επιλογές και 10.000 αποτελέσματα ανά
τροχό. Τα εισαγμένα αποτελέσματα χαρακτηρίζονται τοπικά, χωρίς πιστοποίηση server.

## Τεκμηρίωση

- [Architecture](docs/architecture.md), [Data model](docs/data-model.md)
- [Development](docs/development.md), [Deployment](docs/deployment.md)
- [Roadmap](docs/roadmap.md), [Context για συνέχεια](PROJECT_CONTEXT.md)

Δεν έχει γίνει δημόσιο deployment ή push σε remote repository.
