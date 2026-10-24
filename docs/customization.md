# Προσαρμογή τροχού

Αναφορά: [Wheel of Names — Customize](https://wheelofnames.com/), έκδοση 439,
επιθεώρηση 24/10/2026 με πραγματικό Chromium/Playwright. Ανοίχτηκαν οι τρεις καρτέλες,
τα dropdown ήχων, μεγέθους εικόνας, κειμένου, θεμάτων, εικόνων και χρώματος (HEX/RGB).
Ελέγχθηκαν οι διακόπτες εμφάνισης, η απενεργοποίηση popup και η εναλλαγή εμφάνισης.
Το αποθηκευμένο DOM και screenshots βρίσκονται στα τοπικά, μη tracked `artifacts/reference*`.
Δεν αντιγράφονται κώδικας, ήχοι, φωτογραφίες ή εμπορική ταυτότητα της αναφοράς.

## Αντιστοίχιση

| Επιλογή αναφοράς | Δική μας υλοποίηση | Έλεγχος | Τυχόν διαφορά |
| --- | --- | --- | --- |
| During spin / After spin / Appearance | Ίδια σειρά, ελληνικές καρτέλες, native modal, Ακύρωση / OK | E2E transactional, keyboard/layout | Ταυτότητα Γύρνα. |
| Sound during spin, none, preview | Χωρίς ήχο, ticking, τύμπανο, παλμός· έναρξη/διακοπή προεπισκόπησης | Audio E2E | Δικοί μας συνθετικοί ήχοι, μικρότερη συλλογή |
| Spin volume 0–100%, default 50% | Ανεξάρτητο gain, συνολική σίγαση υπερισχύει | Schema / audio E2E | Καμία στη ρύθμιση |
| Display duplicates, on | Σύμπτυξη ίδιου ονόματος + εικόνας μόνο στην προβολή | Exhaustive projection tests | Η αναφορά αφαιρεί διπλότυπα από την εσωτερική λίστα του τροχού. Εδώ διατηρούνται όλες οι πιθανότητες, όπως απαιτήθηκε |
| Spin slowly, off | Λιγότερες πλήρεις περιστροφές στην ίδια διάρκεια | Spin E2E / geometry | Προκαθορισμένο αποτέλεσμα API, όχι προσομοίωση φυσικής |
| Show title, on | Τίτλος πάνω από τροχό | Transactional E2E | Καμία |
| Spin time 1–60, default 10 | Διάρκεια CSS animation και αναμονής αποτελέσματος | Schema / spin E2E | Reduced motion παρακάμπτει το animation |
| Max names 4–1000, default 1000 | Παράθυρο έως 1000 εγγραφών· νικητής τοποθετείται πριν την κίνηση | 6.600 περιπτώσεις προβολής/δείκτη | Πάνω από 48 εμφανίζονται αριθμοί και αναπτυσσόμενη λίστα πλήρων ονομάτων για αναγνωσιμότητα |
| Sound after spin, subdued applause | Ήπιο χειροκρότημα, καμπανάκι, φανφάρα, χωρίς ήχο | Audio E2E | Πρωτότυποι συνθετικοί ήχοι, μικρότερη συλλογή |
| Result volume / play / stop | Ξεχωριστή ένταση και προεπισκόπηση | Audio E2E | Καμία στη συμπεριφορά |
| Animate winning entry, off | Τονισμός φέτας και ονόματος | Transactional E2E | Δικό μας animation |
| Launch confetti, on | Σωματίδια με χρώματα παλέτας | Result E2E | Χωρίς κίνηση όταν ζητείται reduced motion |
| Auto-remove after 5s, off | Ανθεκτική τοπική ουρά, ID εγγραφής, μία αφαίρεση | Auto-removal E2E με refresh και χειροκίνητη αφαίρεση | Αν εκτελείται άλλη κλήρωση, αναμένει την ολοκλήρωσή της |
| Display popup / editable message, on | Popup, μήνυμα, inline αποτέλεσμα και ιστορικό | Transactional / result E2E | Μήνυμα έως 200 χαρακτήρες αντί 100 |
| Display Remove button, on | Κρύβεται και στο popup και στο inline αποτέλεσμα | Transactional E2E | Καμία |
| Click when removed, off | Click στη χειροκίνητη και αυτόματη πραγματική αφαίρεση | Audio / auto-removal E2E | Χρήση έντασης αποτελέσματος και συνολικής σίγασης |
| One color per section / wheel background image | Αμοιβαία αποκλειόμενα πεδία | Image E2E | Καμία |
| Apply theme | Γύρνα., Ωκεανός, Ηλιοβασίλεμα, Δάσος | Transactional E2E | Τέσσερα δικά μας θέματα αντί της μεγάλης συλλογής αναφοράς |
| Customize colors / enabled colors / picker | 1–12 χρώματα, τουλάχιστον ένα ενεργό, native color picker | Schema / transactional E2E | Native picker αντί ειδικού HEX/RGB panel |
| Center image / size | Upload, συλλογή, αντικατάσταση, αφαίρεση· XS/S/M/L/XL/XXL, default S | Image / persistence E2E | Τα ποσοστά μεγέθους είναι δικά μας (10/16/24/32/42/54%) |
| Wheel image / upload / gallery | Raster upload και τρεις δικές μας εικόνες | Image / offline E2E | Δεν περιλαμβάνει Unsplash ή αναζήτηση στο internet |
| Page background / gradient, on | Φόντο λειτουργίας παρουσίασης, επιλογή gradient | Appearance E2E | Το κύριο περιβάλλον διατηρεί light/dark ταυτότητα |
| Always show / always hide / hide if image | Και οι τρεις επιλογές με εικόνες ανά εγγραφή | Image E2E | Καμία |
| Contours, off / shadow, on | Πραγματικό SVG stroke / CSS shadow | Transactional E2E | Καμία |
| Pointer changes color, on | Χρώμα φέτας κάτω από τον δείκτη κατά την κίνηση | Spin E2E | Δική μας αρχική μωβ απόχρωση |

## Δεδομένα και ασφάλεια

- `backend/app/customization.py` και `frontend/src/customization.ts`: configuration version 1,
  όρια και προεπιλογές. Τα πεδία During/After ακολουθούν τις ζητούμενες αρχικές τιμές.
- Migration `c72f1a9e4b02`: JSON configuration ανά τροχό, εικόνα ανά επιλογή,
  όριο 10.000 συμμετοχών. Διατηρεί υπάρχοντες τροχούς, αποτελέσματα και share tokens.
  Τα παλιά snapshots αποκτούν defaults. Το downgrade απαιτεί επαναφορά backup για
  να μη χαθούν ρυθμίσεις ή εγγραφές πάνω από το παλιό όριο.
- IndexedDB version 2 αναβαθμίζει παλιά δεδομένα. Οι αλλαγές του modal βρίσκονται
  μόνο στο React draft· αποθηκεύονται με μία αλλαγή στο OK, όχι από το autosave.
- Οι εικόνες είναι είτε γνωστά bundled gallery paths είτε embedded PNG/JPEG/WebP.
  Upload έως 10 MB μετατρέπεται σε WebP έως 1024px και 512 KB. Δεν επιτρέπονται
  αυθαίρετα URLs ή SVG uploads. Snapshot τροχού έως 8 MB, backup αρχείο έως 100 MB.
- Δεν υπάρχει δημόσιος φάκελος προσωπικών uploads: η εικόνα ακολουθεί την ιδιωτική
  πρόσβαση του wheel API ή το συγκεκριμένο ανακλητό snapshot. Δεν απαιτούνται
  ανεξάρτητα asset tokens. Τα backups, αντίγραφα και conflict copies περιλαμβάνουν εικόνες.
- Η RNG δέχεται όλες τις ενεργές εγγραφές. Το `lib/presentation.ts` παράγει μόνο
  την οπτική λίστα, με το πραγματικό ID νικητή. Το geometry χρησιμοποιεί τον δείκτη
  αυτής της λίστας. Καμία ρύθμιση παρουσίασης δεν αποστέλλεται ως οδηγία επιλογής νικητή.
- Η αυτόματη αφαίρεση είναι μία durable εργασία ανά result ID. Αφαιρεί μόνο το option ID
  στον αρχικό wheel ID. Χειροκίνητη αφαίρεση ακυρώνει την ίδια εκκρεμότητα. Η λειτουργία
  no-repeat πρώτα απενεργοποιεί την εγγραφή και η αφαίρεση μπορεί μετά να τη διαγράψει.

## Assets και περιορισμοί επαλήθευσης

Οι τρεις εικόνες παράγονται από δικά μας γεωμετρικά σχέδια στο
`frontend/scripts/generate-gallery.mjs`. Οι ήχοι παράγονται από Web Audio στο
`frontend/src/lib/audio.ts`. Δεν υπάρχουν τρίτες άδειες προς μεταβίβαση για αυτά τα assets.
Τα gallery assets precache-άρονται από την PWA· τα προσωπικά παραμένουν στο IndexedDB.

Η επιθεώρηση αναφοράς επιβεβαιώνει πεδία/μενού/defaults. Δεν επιβεβαιώθηκε ακουστικά κάθε
ηχογράφηση της βιβλιοθήκης της ούτε η ακριβής καμπύλη φυσικής/μέτρηση μεγέθους εικόνων.
Η εφαρμογή χρησιμοποιεί δική της κίνηση που καταλήγει στο αποτέλεσμα του backend.
Οι έλεγχοι νέων λειτουργιών βρίσκονται σε εξέλιξη· τα τελικά αποτελέσματα θα προστεθούν
στο PROJECT_CONTEXT πριν την παράδοση.
