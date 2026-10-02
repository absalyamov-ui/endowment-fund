// Партнёры фонда для страницы partners.html
// logo: локальный файл (assets/img/partners/...) или внешний URL; mono — монограмма, если логотипа нет / не загрузился
const L = f => 'local:' + f;
module.exports = {
  groups: [
    { id: 'alageum', ru: 'Группа компаний Alageum', kz: 'Alageum компаниялар тобы', en: 'Alageum Group of Companies' },
    { id: 'gov', ru: 'Государство, наука и образование', kz: 'Мемлекет, ғылым және білім', en: 'Government, science and education' },
    { id: 'fin', ru: 'Финансовые партнёры', kz: 'Қаржы серіктестері', en: 'Financial partners' },
    { id: 'uni', ru: 'Университеты', kz: 'Университеттер', en: 'Universities' },
    { id: 'end', ru: 'Эндаумент-фонды и благотворительные фонды', kz: 'Эндаумент-қорлар және қайырымдылық қорлары', en: 'Endowment funds and foundations' },
  ],
  items: [
    // Alageum
    { g: 'alageum', mono: 'AE', logo: L('alageum.png'), ru: 'ТОО «Alageum Electric»', kz: '«Alageum Electric» ЖШС', en: 'Alageum Electric LLP' },
    { g: 'alageum', mono: 'КТЗ', ru: 'АО «Кентауский трансформаторный завод»', kz: '«Кентау трансформатор зауыты» АҚ', en: 'Kentau Transformer Plant JSC' },
    { g: 'alageum', mono: 'AT', ru: 'ТОО «Asia Trafo»', kz: '«Asia Trafo» ЖШС', en: 'Asia Trafo LLP' },
    { g: 'alageum', mono: 'ЭЛМО', ru: 'АО «Электромонтаж» (ЭЛМО)', kz: '«Электромонтаж» АҚ (ЭЛМО)', en: 'Elektromontazh JSC (ELMO)' },
    { g: 'alageum', mono: 'AS', ru: 'ТОО «Alageum Sales»', kz: '«Alageum Sales» ЖШС', en: 'Alageum Sales LLP' },
    { g: 'alageum', mono: 'УТЗ', ru: 'ТОО «Уральский трансформаторный завод»', kz: '«Орал трансформатор зауыты» ЖШС', en: 'Uralsk Transformer Plant LLP' },
    { g: 'alageum', mono: 'АЭМЗ', ru: 'ТОО «Алматинский электромеханический завод»', kz: '«Алматы электромеханикалық зауыты» ЖШС', en: 'Almaty Electromechanical Plant LLP' },
    { g: 'alageum', mono: 'ПЭТЗ', ru: 'ТОО «Петропавловский электротехнический завод»', kz: '«Петропавл электротехникалық зауыты» ЖШС', en: 'Petropavlovsk Electrotechnical Plant LLP' },
    { g: 'alageum', mono: 'BE', ru: 'ТОО «Batys Electric»', kz: '«Batys Electric» ЖШС', en: 'Batys Electric LLP' },
    // Государство, наука, образование
    { g: 'gov', mono: 'МНВО', logo: L('mnvo.png'), ru: 'Министерство науки и высшего образования Республики Казахстан', kz: 'Қазақстан Республикасы Ғылым және жоғары білім министрлігі', en: 'Ministry of Science and Higher Education of the Republic of Kazakhstan' },
    { g: 'gov', mono: 'НАН', ru: 'Национальная академия наук Республики Казахстан при Президенте Республики Казахстан', kz: 'Қазақстан Республикасы Президентінің жанындағы Қазақстан Республикасының Ұлттық ғылым академиясы', en: 'National Academy of Sciences of the Republic of Kazakhstan under the President of the Republic of Kazakhstan' },
    { g: 'gov', mono: 'ФН', logo: 'https://science-fund.kz/wp-content/uploads/2022/06/cropped-512x512-1-270x270.png', ru: 'АО «Фонд науки»', kz: '«Ғылым қоры» АҚ', en: 'Science Fund JSC' },
    { g: 'gov', mono: 'НЦРВО', ru: 'Национальный центр развития высшего образования', kz: 'Жоғары білімді дамыту ұлттық орталығы', en: 'National Center for Higher Education Development' },
    { g: 'gov', mono: 'AH', logo: 'https://cdn.astanahub.com/static/img_v2/logo-mobile.svg', ru: 'Astana Hub', kz: 'Astana Hub', en: 'Astana Hub' },
    { g: 'gov', mono: 'AI', ru: 'Программа AI Sana', kz: 'AI Sana бағдарламасы', en: 'AI Sana Program' },
    { g: 'gov', mono: 'ИЗ', logo: 'https://zool.kz/wp-content/uploads/2023/03/cropped-logo-classic-without_text-270x270.png', ru: 'Институт зоологии Комитета науки МНВО РК', kz: 'ҚР ҒЖБМ Ғылым комитетінің Зоология институты', en: 'Institute of Zoology, Science Committee of the MSHE RK' },
    { g: 'gov', mono: 'МКШ', ru: 'КГУ «Малокомплектная общеобразовательная школа имени С. Кожанова»', kz: '«С. Қожанов атындағы шағын жинақты жалпы білім беретін мектеп» КММ', en: 'S. Kozhanov Small Rural Secondary School' },
    // Финансы
    { g: 'fin', mono: 'FF', logo: L('freedom.png'), ru: 'АО «Фридом Финанс»', kz: '«Фридом Финанс» АҚ', en: 'Freedom Finance JSC' },
    { g: 'fin', mono: 'FFG', logo: L('freedom.png'), ru: 'Freedom Finance Global PLC', kz: 'Freedom Finance Global PLC', en: 'Freedom Finance Global PLC' },
    // Университеты
    { g: 'uni', mono: 'ЕНУ', logo: 'https://enu.kz/_nuxt/logo30t.BJQsH-tE.svg', ru: 'Евразийский национальный университет имени Л.Н. Гумилева', kz: 'Л.Н. Гумилев атындағы Еуразия ұлттық университеті', en: 'L.N. Gumilyov Eurasian National University' },
    { g: 'uni', mono: 'SDU', logo: L('sdu.png'), ru: 'SDU University', kz: 'SDU University', en: 'SDU University' },
    // Эндаумент-фонды
    { g: 'end', mono: 'НАЭФ', ru: 'Национальная ассоциация эндаумент-фондов Казахстана', kz: 'Қазақстанның эндаумент-қорлары ұлттық қауымдастығы', en: 'National Association of Endowment Funds of Kazakhstan' },
    { g: 'end', mono: 'iQ', logo: 'https://iqanat.kz/iqanat/images/iqanat-logo-2023.svg', ru: 'Образовательный фонд iQanat', kz: 'iQanat білім беру қоры', en: 'iQanat Endowment Foundation' },
    { g: 'end', mono: 'ENU', logo: 'https://enu.kz/_nuxt/logo30t.BJQsH-tE.svg', ru: 'ENU Endowment Fund', kz: 'ENU Endowment Fund', en: 'ENU Endowment Fund' },
    { g: 'end', mono: 'SEF', ru: 'Shoqan Endowment Fund', kz: 'Shoqan Endowment Fund', en: 'Shoqan Endowment Fund' },
    { g: 'end', mono: 'YEF', logo: 'https://yessenovfoundation.org/wp-content/themes/yessenovfoundation/images/logo_new.png', ru: 'Yessenov Endowment Fund', kz: 'Yessenov Endowment Fund', en: 'Yessenov Endowment Fund' },
    { g: 'end', mono: 'ISEF', logo: 'https://inclusive-endowment.kz/wp-content/uploads/2026/04/Artboard-1.svg', ru: 'Inclusive Sport Endowment Foundation', kz: 'Inclusive Sport Endowment Foundation', en: 'Inclusive Sport Endowment Foundation' },
    { g: 'end', mono: 'AIU', logo: 'https://aiu.kz/logo/logo_1.svg', ru: 'Фонд целевого капитала Astana International University', kz: 'Astana International University нысаналы капитал қоры', en: 'Astana International University Endowment Fund' },
    { g: 'end', mono: 'АА', ru: 'Корпоративный фонд «Аврора-Ала»', kz: '«Аврора-Ала» корпоративтік қоры', en: 'Aurora-Ala Corporate Foundation' },
    { g: 'end', mono: 'KNMU', logo: 'https://cdn.village.ai/avatar/company/li__kaznmu.webp', ru: 'KAZNMU Endowment', kz: 'KAZNMU Endowment', en: 'KAZNMU Endowment' },
    { g: 'end', mono: 'ATU', logo: 'https://atu.edu.kz/templates/release/images/logo.svg', ru: 'КФ «Эндаумент АТУ»', kz: '«АТУ Эндаумент» КҚ', en: 'ATU Endowment' },
    { g: 'end', mono: 'QH', ru: 'Endowment Qazaqstan Halqyna', kz: 'Endowment Qazaqstan Halqyna', en: 'Endowment Qazaqstan Halqyna' },
    { g: 'end', mono: 'FEF', ru: 'Fizmat Endowment Fund', kz: 'Fizmat Endowment Fund', en: 'Fizmat Endowment Fund' },
    { g: 'end', mono: 'HCF', ru: 'Heart Center Foundation', kz: 'Heart Center Foundation', en: 'Heart Center Foundation' },
    { g: 'end', mono: 'KIMEP', logo: 'https://www.kimep.kz/wp-content/themes/kimep/img/logo-main.svg', ru: 'KIMEP Alumni Endowment Fund', kz: 'KIMEP Alumni Endowment Fund', en: 'KIMEP Alumni Endowment Fund' },
    { g: 'end', mono: 'TOU', logo: 'https://tou.edu.kz/templates/psu2020/images/logo/logo2022en.png', ru: 'Toraighyrov University Alumni Association Endowment', kz: 'Toraighyrov University Alumni Association Endowment', en: 'Toraighyrov University Alumni Association Endowment' },
    { g: 'end', mono: 'ZKU', logo: 'https://www.topuniversities.com/sites/default/files/profiles/logos/250911063252am607413%D0%9B%D0%BE%D0%B3%D0%BE%D1%82%D0%B8%D0%BF-200x200.jpg', ru: 'Zhangir Khan University Endowment', kz: 'Zhangir Khan University Endowment', en: 'Zhangir Khan University Endowment' },
    { g: 'end', mono: 'KazNU', ru: 'KazNU Alumni Association Endowment', kz: 'KazNU Alumni Association Endowment', en: 'KazNU Alumni Association Endowment' },
    { g: 'end', mono: 'KBTU', logo: 'https://www.topuniversities.com/sites/default/files/profiles/logos/240107014016pm243256KBTU-LOGO-Short-Blue-RGB-200x200.jpg', ru: 'KBTU Endowment', kz: 'KBTU Endowment', en: 'KBTU Endowment' },
    { g: 'end', mono: 'SU', ru: 'Satbayev University Private Endowment', kz: 'Satbayev University Private Endowment', en: 'Satbayev University Private Endowment' },
    { g: 'end', mono: 'UE', ru: 'Urpaq Endowment', kz: 'Urpaq Endowment', en: 'Urpaq Endowment' },
    { g: 'end', mono: 'BEF', ru: 'Bolashaq Endowment Fund', kz: 'Bolashaq Endowment Fund', en: 'Bolashaq Endowment Fund' },
    { g: 'end', mono: 'KA', logo: 'https://www.topuniversities.com/sites/default/files/profiles/logos/230630124404pm923301LOGO-Korkyt-ata-univer-200x200.jpg', ru: 'Korkyt Ata Endowment', kz: 'Korkyt Ata Endowment', en: 'Korkyt Ata Endowment' },
    { g: 'end', mono: 'QT', ru: 'Qazaq Tili Endowment Qory', kz: 'Qazaq Tili Endowment Qory', en: 'Qazaq Tili Endowment Qory' },
  ],
};
