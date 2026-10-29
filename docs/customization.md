# Προσαρμογή τροχού

Ενημέρωση 26/10/2026: η ενεργή εφαρμογή είναι στατική, χωρίς backend/API. Οι ρυθμίσεις,
εικόνες και τροχοί αποθηκεύονται τοπικά στο IndexedDB v10. Η κοινοποίηση περιέχει αντίγραφο
μέσα στο URL fragment, χωρίς ιστορικό ή ανάκληση. Μεγάλες λίστες/εικόνες μοιράζονται ως JSON.
Οι παρακάτω αναφορές σε server sync/SQLite αφορούν την ιστορική υλοποίηση. Οι τρέχοντες
έλεγχοι προσαρμογής τρέχουν με τοπική αποθήκευση και χωρίς server.

Η προεπιλεγμένη παλέτα Wheelero χρησιμοποιεί πλέον έντονο μωβ, κοραλί, τιρκουάζ,
χρυσαφί, μπλε και φούξια. Τα πρόσθετα μοναδικά χρώματα έχουν μεγαλύτερο κορεσμό,
με μαύρο ή λευκό κείμενο ανάλογα με την αντίθεση. Οι παλιοί ιδιωτικοί τροχοί με
ακριβώς την αρχική παλέτα αναβαθμίζονται μέσω Alembic b25c7e1f346d / IndexedDB v8.
Προσωπικές παλέτες, απενεργοποιημένα χρώματα και δημόσια snapshots διατηρούνται.

Πρόσβαση: το εικονίδιο γραναζιού **Customize** δίπλα στον ήχο και το fullscreen, επάνω
από τον τροχό, σε υπολογιστή και κινητό. Στα Entries μένουν Shuffle/Sort/Clear.
Η πλήρης επεξεργασία είναι στο
**More options** και διατηρεί επίσης συντόμευση για Customize.
Η μετακίνηση δεν αλλάζει τις ρυθμίσεις ή τη συμπεριφορά OK/Ακύρωση.
Ο επανέλεγχος του γραναζιού στις 25/10/2026 πέρασε 6 σχετικά E2E, typecheck, lint και build,
με έλεγχο πρόσβασης στο νέο σημείο στα 360/390/768/1440px.

Αναφορά: [Wheel of Names — Customize](https://wheelofnames.com/), έκδοση 439,
επιθεώρηση 24/10/2026 με πραγματικό Chromium/Playwright. Ανοίχτηκαν οι τρεις καρτέλες,
τα dropdown ήχων, μεγέθους εικόνας, κειμένου, θεμάτων, εικόνων και χρώματος (HEX/RGB).
Ελέγχθηκαν οι διακόπτες εμφάνισης, η απενεργοποίηση popup και η εναλλαγή εμφάνισης.
Το αποθηκευμένο DOM και screenshots βρίσκονται στα τοπικά, μη tracked `artifacts/reference*`.
Δεν αντιγράφονται κώδικας, ήχοι, φωτογραφίες ή εμπορική ταυτότητα της αναφοράς.

Στις 25/10/2026 εξετάστηκε ξανά η αρχική της αναφοράς σε Chromium (1440×900).
Αυξήθηκε το μέγεθος του δικού μας τροχού και των ονομάτων, με λεπτότερο εξωτερικό
πλαίσιο. Τα δικά μας χρώματα και ο δείκτης επάνω διατηρούνται. Τα περιγράμματα
των τμημάτων εξακολουθούν να ελέγχονται από το **Segment borders**.

Η αρχική έχει πλέον **Click to spin** στο κέντρο και αργή αναμονή (μία περιστροφή
ανά 30 δευτερόλεπτα), χωρίς κουμπί Pause. Πρόκειται για κίνηση παρουσίασης ανεξάρτητη
από το **Slow spin**, που ελέγχει την κανονική κλήρωση. Η αναμονή σέβεται το reduced
motion και δεν επιλέγει αποτέλεσμα. Μετά την άφιξη στον νικητή, η αργή κίνηση συνεχίζεται
μέχρι το επόμενο spin, χωρίς να αλλάζει το αποτέλεσμα ή το ιστορικό.

## Αντιστοίχιση

### Όλες οι ρυθμίσεις εξαρχής — 25/10/2026

Όλες οι ρυθμίσεις εμφανίζονται άμεσα στις καρτέλες During spin, After spin και Appearance.
Το More options/Fewer options αφαιρέθηκε κατόπιν αιτήματος. Το modal διατηρεί πλάτος
620px, κύλιση, ομαδοποίηση πεδίων και σταθερά προσβάσιμα Cancel/OK στο κάτω μέρος.
Η λειτουργία χρωμάτων/εικόνας εξακολουθεί να καθορίζει τα σχετικά πεδία εμφάνισης.
Αποθήκευση, ακύρωση, offline λειτουργία και κοινοποίηση διατηρούνται χωρίς migration.

Οι τρεις καρτέλες της αναφοράς εξετάστηκαν σε Chromium στις 25/10/2026· screenshots
υπάρχουν στα μη tracked `artifacts/reference-simplify-*`. Δεν επανελέγχθηκαν ακουστικά
όλοι οι ήχοι ή κάθε dropdown. Ο παρακάτω πίνακας καλύπτει τις διαθέσιμες ρυθμίσεις.

Κατόπιν αιτήματος, το popup νικητή περιέχει μόνο **Close / Remove winner**.
Δεν εμφανίζει ένδειξη προέλευσης στο popup. Στο ιστορικό οι κληρώσεις του browser
σημειώνονται ως **Device draw / import**, είτε υπάρχει σύνδεση είτε όχι.
Το προεπιλεγμένο μήνυμα του popup είναι **And The Winner is...**.
Η migration `e92f4b8c013a` και το IndexedDB v5 αντικαθιστούν μόνο τα παλιά defaults
`WE HAVE A WINNER` / `Η ΤΥΧΗ ΔΙΑΛΕΞΕ` στους υπάρχοντες ιδιωτικούς τροχούς.
Τα προσαρμοσμένα μηνύματα και τα ήδη δημοσιευμένα στιγμιότυπα παραμένουν ως έχουν.
Το Close κλείνει το παράθυρο και το Remove winner αφαιρεί τη συγκεκριμένη εγγραφή
και κλείνει το παράθυρο. Η ρύθμιση Remove button εξακολουθεί να το κρύβει.
Το μόνιμο inline αποτέλεσμα και οι ενέργειές του αφαιρέθηκαν κατόπιν αιτήματος.
Η επόμενη περιστροφή ξεκινά από το κέντρο του τροχού. Το ιστορικό στα Results
παραμένει διαθέσιμο ακόμη και χωρίς popup. Το New round διατηρείται στην εξάντληση.

| Επιλογή αναφοράς | Δική μας υλοποίηση | Έλεγχος | Τυχόν διαφορά |
| --- | --- | --- | --- |
| During spin / After spin / Appearance | Ίδια σειρά, αγγλικές καρτέλες, native modal, Cancel / OK | E2E transactional, keyboard/layout | Ταυτότητα Wheelero |
| Sound during spin, none, preview | 8 έτοιμοι ήχοι, χωρίς ήχο, έναρξη/διακοπή προεπισκόπησης | Audio E2E | Δικοί μας συνθετικοί ήχοι, μικρότερη συλλογή |
| Spin volume 0–100%, default 50% | Ανεξάρτητο gain, συνολική σίγαση υπερισχύει | Schema / audio E2E | Καμία στη ρύθμιση |
| Display duplicates, on | Σύμπτυξη ίδιου ονόματος + εικόνας μόνο στην προβολή | Exhaustive projection tests | Η αναφορά αφαιρεί διπλότυπα από την εσωτερική λίστα του τροχού. Εδώ διατηρούνται όλες οι πιθανότητες, όπως απαιτήθηκε |
| Spin slowly, off | Λιγότερες πλήρεις περιστροφές στην ίδια διάρκεια | Spin E2E / geometry | Προκαθορισμένο αποτέλεσμα API, όχι προσομοίωση φυσικής |
| Show title, on | Τίτλος πάνω από τροχό | Transactional E2E | Καμία |
| Spin time 1–60, default 10 | Διάρκεια CSS animation και αναμονής αποτελέσματος | Schema / spin E2E | Reduced motion παρακάμπτει το animation |
| Max names 4–1000, default 1000 | Παράθυρο έως 1000 εγγραφών· νικητής τοποθετείται πριν την κίνηση | 6.600 περιπτώσεις προβολής/δείκτη | Πάνω από 48 εμφανίζονται αριθμοί και αναπτυσσόμενη λίστα πλήρων ονομάτων για αναγνωσιμότητα |
| Sound after spin, subdued applause | 8 πανηγυρικοί ήχοι, χωρίς ήχο· default Crowd applause | Audio E2E | Κατόπιν αιτήματος πιο έντονο στερεοφωνικό χειροκρότημα· πρωτότυποι συνθετικοί ήχοι, μικρότερη συλλογή |
| Result volume / play / stop | Ξεχωριστή ένταση και προεπισκόπηση | Audio E2E | Καμία στη συμπεριφορά |
| Animate winning entry, off | Τονισμός φέτας και ονόματος | Transactional E2E | Δικό μας animation |
| Launch confetti, on | Σωματίδια με χρώματα παλέτας | Result E2E | Χωρίς κίνηση όταν ζητείται reduced motion |
| Auto-remove after 5s, off | Ανθεκτική τοπική ουρά, ID εγγραφής, μία αφαίρεση | E2E με refresh, χειροκίνητη αφαίρεση, εξάντληση no-repeat και conflict copy | Αν εκτελείται άλλη κλήρωση, αναμένει την ολοκλήρωσή της |
| Display popup / editable message, on | Popup, μήνυμα και ιστορικό στα Results | Transactional / result E2E | Μήνυμα έως 200 χαρακτήρες αντί 100· χωρίς μόνιμο inline αποτέλεσμα |
| Display Remove button, on | Κρύβεται στο popup | Transactional E2E | Καμία |
| Click when removed, off | Click στη χειροκίνητη και αυτόματη πραγματική αφαίρεση | Audio / auto-removal E2E | Χρήση έντασης αποτελέσματος και συνολικής σίγασης |
| One color per section / wheel background image | Αμοιβαία αποκλειόμενα πεδία | Image E2E | Καμία |
| Apply theme | 16 θέματα: Wheelero, Ocean, Sunset, Forest, Rainbow, Candy, Tropical, Lavender, Rose garden, Midnight, Neon, Autumn, Ice, Earth tones, Coral reef, Retro | Transactional E2E / validation και μοναδικότητα χρωμάτων | Δική μας συλλογή |
| Customize colors / enabled colors / picker | 1–12 αρχικά χρώματα, τουλάχιστον ένα ενεργό, native color picker· αυτόματη επέκταση με μοναδικό χρώμα ανά φέτα | Schema / transactional E2E και έλεγχος μοναδικότητας έως 1000 φέτες | Κατόπιν αιτήματος, η παλέτα δεν επαναλαμβάνεται· ίδια αρχικά χρώματα χρησιμοποιούνται μία φορά. Native picker αντί ειδικού HEX/RGB panel |
| Center image / size | Αφαιρέθηκε πλήρως κατόπιν αιτήματος | Migration / import / renderer checks | Δεν προσφέρεται πλέον· παραμένει το Click to spin |
| Wheel image / upload / gallery | Raster upload και 12 δικές μας εικόνες, ονομαστικές μικρογραφίες με κύλιση | Image / offline E2E | Δεν περιλαμβάνει Unsplash ή αναζήτηση στο internet |
| Page background / gradient, on | Φόντο λειτουργίας παρουσίασης, επιλογή gradient | Appearance E2E | Το κύριο περιβάλλον διατηρεί light/dark ταυτότητα |
| Always show / always hide / hide if image | Και οι τρεις επιλογές με εικόνες ανά εγγραφή | Image E2E | Καμία |
| Contours, off / shadow, on | Πραγματικό SVG stroke / CSS shadow | Transactional E2E | Καμία |
| Pointer changes color, on | Χρώμα φέτας κάτω από τον δείκτη κατά την κίνηση | Spin E2E | Δική μας αρχική μωβ απόχρωση |

## Δεδομένα και ασφάλεια

Το μενού γλώσσας στην κύρια οθόνη μεταφράζει τις τρεις καρτέλες, τα πεδία,
τις επιλογές ήχου και τις προσβάσιμες ετικέτες. Οι ρυθμίσεις και τα προσωπικά
μηνύματα παραμένουν ίδια. Δείτε [localization.md](localization.md) για γλώσσες και όρια.

- `backend/app/customization.py` και `frontend/src/customization.ts`: configuration version 2,
  όρια και προεπιλογές. Τα πεδία During/After ακολουθούν τις ζητούμενες αρχικές τιμές.
- Η κεντρική εικόνα και το μέγεθός της αφαιρέθηκαν πλήρως στις 25/10/2026.
  Migration `a14b6d0e235c` αναβαθμίζει τροχούς και δημόσια snapshots σε version 2.
  IndexedDB v7 και εισαγωγή παλιών JSON backups κάνουν την ίδια μετατροπή,
  διατηρώντας τις εικόνες φόντου/εγγραφών. Το API δέχεται μόνο τη νέα μορφή.
  Πέρασαν 41 pytest, 10 unit και 14 customization E2E, typecheck/lint/build,
  μαζί με άμεσο έλεγχο SQLite, παλιού IndexedDB, backup import/export και offline reload.
- Migration `c72f1a9e4b02`: JSON configuration ανά τροχό, εικόνα ανά επιλογή,
  όριο 10.000 συμμετοχών. Διατηρεί υπάρχοντες τροχούς, αποτελέσματα και share tokens.
  Τα παλιά snapshots αποκτούν defaults. Το downgrade απαιτεί επαναφορά backup για
  να μη χαθούν ρυθμίσεις ή εγγραφές πάνω από το παλιό όριο.
- IndexedDB version 3 διατηρεί τις παλιές ρυθμίσεις και προσθέτει μία φορά το νέο παράδειγμα ονομάτων. Οι αλλαγές του modal βρίσκονται
  μόνο στο React draft· αποθηκεύονται με μία αλλαγή στο OK, όχι από το autosave.
  Το OK περιμένει να ολοκληρωθούν uploads και εγγραφή στο IndexedDB πριν κλείσει.
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
  στον αντίστοιχο wheel ID. Αν ο συγχρονισμός δημιουργήσει αντίγραφο λόγω σύγκρουσης ή
  απώλειας συνεδρίας, η εργασία ακολουθεί το αντίγραφο. Η εκτέλεση διαβάζει την τελευταία
  κατάσταση μέσα στο ίδιο Web Lock. Χειροκίνητη αφαίρεση ακυρώνει την ίδια εκκρεμότητα.
  Το no-repeat πρώτα απενεργοποιεί την εγγραφή και η αφαίρεση μπορεί μετά να τη διαγράψει.
  Επιτρέπεται η τελευταία μοναδική εγγραφή σε ήδη ξεκινημένο γύρο no-repeat.

## Assets και περιορισμοί επαλήθευσης

Έλεγχος ηχογράφησης 26/10/2026: typecheck/lint/build, 10 unit tests και 3 σχετικά E2E
πέρασαν. Επιβεβαιώθηκαν πραγματικό στερεοφωνικό buffer έξι δευτερολέπτων χωρίς clipping,
έναρξη μετά την περιστροφή, offline χρήση, ένταση, προεπισκόπηση, φυσικό τέλος και σίγαση.
Η διακοπή πριν ολοκληρωθεί το download δεν επιτρέπει καθυστερημένη αναπαραγωγή·
αποτυχία φόρτωσης εμφανίζει σφάλμα και επιτρέπει νέα προσπάθεια. Δεν έγινε ανθρώπινη ακρόαση.

Έτοιμοι ήχοι περιστροφής: Wheel clicks, Suspense drumroll, Tension pulse, Roulette clicks,
Spinning rattle, Racing heartbeat, Suspense countdown και Rising suspense. Τα κλικ
αραιώνουν προς το τέλος, οι ρυθμοί αγωνίας επιταχύνονται με crescendo και το riser ανεβάζει
τόνο. Ακολουθούν τη διάρκεια της περιστροφής, όχι κάθε πέρασμα φέτας από τον δείκτη.
Αποτελέσματος: Crowd applause, Winner chimes, Victory fanfare, Champion anthem,
Celebration sparkle, Celebration bells, Jackpot! και Grand finale. Από 26/10/2026 το
Crowd applause χρησιμοποιεί πραγματική στερεοφωνική ηχογράφηση έξι δευτερολέπτων,
με fade-out. Πηγή: [eXpl0it3r / OpenGameArt, CC0](https://opengameart.org/content/applause-in-a-large-hall-or-church).
Το ID applause δεν αλλάζει. Η ηχογράφηση αποθηκεύεται τοπικά, precache-άρεται και
φορτώνεται πριν χρειαστεί. Η διακοπή ακυρώνει και εκκρεμή αναπαραγωγή κατά τη φόρτωση.
Τα υπόλοιπα μουσικά cues παραμένουν συνθετικά, με τις υπάρχουσες ρυθμίσεις έντασης.
Τα υπάρχοντα IDs διατηρούνται, με νέες συνθέσεις αντί απλής μετονομασίας. Δεν απαιτείται upload.
Επανέλεγχος νέων συνθέσεων: typecheck/lint/build και 3 σχετικά E2E πέρασαν, με επιπλέον
επανέλεγχο audio μετά την τελική ρύθμιση έντασης. Παρήχθησαν πραγματικά samples και για
τους 8 ήχους αποτελέσματος χωρίς clipping στο 100%. Μετρήθηκαν επιβράδυνση κλικ,
επιτάχυνση drumroll, αυτόματο stop και έναρξη χειροκροτήματος μετά την κλήρωση.
Δεν έγινε ακρόαση σε φυσικά ηχεία/ακουστικά.
Τα νέα IDs προστέθηκαν στα επιτρεπτά enum και των δύο schemas. Η επέκταση ήχων
δεν άλλαξε τη δομή JSON και δεν χρειάστηκε migration. Η μεταγενέστερη αφαίρεση
κεντρικής εικόνας χρησιμοποιεί version 2. Παραμένουν τα defaults ticking/χειροκρότημα. Ο συνολικός ήχος
ξεκινά απενεργοποιημένος σε νέο browser. Η ρητή επιλογή ενεργοποίησης/σίγασης
αποθηκεύεται τοπικά· οι επιλογές No sound και έντασης στο Customize διατηρούνται.
Επαλήθευση επέκτασης 25/10/2026: 41 backend tests και 9 στοχευμένοι E2E πέρασαν,
καθώς και typecheck/lint/build/Alembic check. Το audio E2E ασκεί και τους 16 ήχους
και αποθήκευση νέων επιλογών μετά από refresh. Ελέγχθηκαν επιπλέον σίγαση, stop,
ένταση, αντίγραφα, offline συγχρονισμός, παρουσίαση και κεντράρισμα στα τέσσερα πλάτη.

Οι 12 εικόνες (Aurora, Sunset, Confetti, Ocean waves, Starry night, Mountains,
Tropical, Candy swirl, Nebula, Golden glow, Mosaic, Blossom) παράγονται από δικά μας γεωμετρικά σχέδια στο
`frontend/scripts/generate-gallery.mjs`. Οι ήχοι παράγονται από Web Audio στο
`frontend/src/lib/audio.ts`, εκτός από την ηχογράφηση Crowd applause. Τα στοιχεία της
ηχογράφησης και η άδεια βρίσκονται στο `frontend/public/audio/CREDITS.txt`.
Τα gallery assets precache-άρονται από την PWA· τα προσωπικά παραμένουν στο IndexedDB.
Η ίδια συλλογή είναι διαθέσιμη και για εικόνες εγγραφών. Η κεντρική εικόνα έχει αφαιρεθεί.
Οι νέες διαδρομές επιτρέπονται ρητά στο backend και στο frontend. Δεν αλλάζει το
σχήμα δεδομένων: αποθηκεύονται χρώματα/διαδρομές, όχι IDs θεμάτων. Δεν χρειάζεται migration.
Έλεγχος επέκτασης 25/10/2026: 41 pytest και 14 customization E2E πέρασαν, μαζί με
typecheck/lint/build. Ελέγχθηκαν όλα τα θέματα, οι 12 εικόνες, αποθήκευση/refresh,
φόρτωση όλων των εικόνων offline και συγχρονισμός νέου φόντου μετά την επανασύνδεση.
Η PWA περιλαμβάνει πλέον 33 precached assets. Τα νέα σχέδια και η συλλογή ελέγχθηκαν οπτικά.

Η επιθεώρηση αναφοράς επιβεβαιώνει πεδία/μενού/defaults. Δεν επιβεβαιώθηκε ακουστικά κάθε
ηχογράφηση της βιβλιοθήκης της ούτε η ακριβής καμπύλη φυσικής/μέτρηση μεγέθους εικόνων.
Η εφαρμογή χρησιμοποιεί δική της κίνηση που καταλήγει στο αποτέλεσμα του browser
(Web Crypto με rejection sampling). Το παλιό API κλήρωσης διατηρείται για API clients.
Τελικός έλεγχος 24/10/2026: 41 pytest, 10 unit tests και 30 Chromium E2E πέρασαν
(η πλήρης εκτέλεση E2E ολοκληρώθηκε σε 2,4 λεπτά). Πέρασαν επίσης typecheck, lint,
production build και Alembic check. Οι έλεγχοι περιλαμβάνουν όλες τις καρτέλες,
πραγματικό audio graph/σίγαση, upload/αντικατάσταση/αφαίρεση εικόνων, refresh,
παλιά SQLite/IndexedDB δεδομένα, JSON/share/copy, offline reload/συγχρονισμό,
αυτόματη αφαίρεση με refresh/χειροκίνητη αφαίρεση/conflict copy και τελευταία συμμετοχή.
Πέρασαν axe WCAG A/AA, πληκτρολόγιο, reduced motion και layout στα 360/390/768/1440px.
Επιθεωρήθηκαν screenshots των τεσσάρων πλατών και dark mode. Δεν πραγματοποιήθηκαν
έλεγχοι σε φυσικές συσκευές, ανθρώπινη ακρόαση ή χρήση με πραγματικό screen reader.


## Latest UI simplification (2026-10-29)

Removed the global-mute notice, equal-chance/duplicate-display paragraph and duplicated
Templates heading/inspiration subtitle in all languages. Customize Play explicitly
previews either sound even with wheel mute enabled, without changing that preference.
Stop, selected volume (including 0%), No sound, tab-change and modal-close cleanup remain.
Browser/OS-level mute is outside the application's control. Standard library JSON export
and import are removed; TXT result export and legacy migration recovery remain. Large
share links report their size limit instead of suggesting removed JSON controls.
