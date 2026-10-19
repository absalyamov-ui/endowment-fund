// Подменю главного меню: [подпись RU, KZ, EN, ссылка]. Якоря — id секций (см. SEC_IDS в build.js)
const S = (ru, kz, en, href) => ({ ru, kz, en, href });
module.exports = {
  'about.html': [
    S('Миссия и ценности', 'Миссия және құндылықтар', 'Mission and values', 'about.html#mission'),
    S('История фонда', 'Қордың тарихы', 'Our history', 'about.html#history'),
    S('Попечительский совет', 'Қамқоршылық кеңес', 'Board of Trustees', 'about.html#board'),
    S('Руководство', 'Басшылық', 'Management', 'about.html#team'),
    S('Документы фонда', 'Қор құжаттары', 'Fund documents', 'about.html#docs'),
    S('Наш логотип', 'Біздің логотип', 'Our logo', 'brand.html'),
    S('Вакансии', 'Бос орындар', 'Careers', 'careers.html'),
    S('Что такое эндаумент-фонд', 'Эндаумент-қор деген не', 'What is an endowment fund', 'endowment-kazakhstan.html'),
  ],
  'programs.html': [
    S('Три направления поддержки', 'Қолдаудың үш бағыты', 'Three areas of support', 'programs.html#directions'),
    S('Направления финансирования', 'Қаржыландыру бағыттары', 'Funding areas', 'programs.html#funding'),
    S('AI Sana', 'AI Sana', 'AI Sana', 'programs.html#ai-sana'),
    S('Программы в цифрах', 'Бағдарламалар сандармен', 'Programmes in numbers', 'programs.html#numbers'),
  ],
  'grants.html': [
    S('Кто может подать заявку', 'Кім өтінім бере алады', 'Who can apply', 'grants.html#who'),
    S('Этапы конкурса', 'Конкурс кезеңдері', 'Competition stages', 'grants.html#stages'),
    S('Что подготовить', 'Не дайындау керек', 'What to prepare', 'grants.html#apply'),
    S('Частые вопросы', 'Жиі қойылатын сұрақтар', 'FAQ', 'grants.html#faq'),
  ],
  'donate.html': [
    S('Почему выбирают фонд', 'Неге қорды таңдайды', 'Why choose the Fund', 'donate.html#why'),
    S('Форматы участия', 'Қатысу форматтары', 'Ways to contribute', 'donate.html#formats'),
    S('Реквизиты', 'Деректемелер', 'Bank details', 'donate.html#requisites'),
    S('Частые вопросы', 'Жиі қойылатын сұрақтар', 'FAQ', 'donate.html#faq'),
    S('Стать вкладчиком', 'Салымшы болу', 'Become a contributor', 'donate.html#apply'),
    S('Партнёры фонда', 'Қор серіктестері', 'Our partners', 'partners.html'),
  ],
  'reports.html': [
    S('Ключевые показатели', 'Негізгі көрсеткіштер', 'Key figures', 'reports.html#kpi'),
    S('Отчёты', 'Есептер', 'Reports', 'reports.html#archive'),
    S('Документы фонда', 'Қор құжаттары', 'Fund documents', 'about.html#docs'),
  ],
  'press.html': [
    S('Публикации', 'Жарияланымдар', 'Publications', 'press.html#news'),
    S('Пресс-служба', 'Баспасөз қызметі', 'Press office', 'press.html#press-office'),
    S('Наш логотип', 'Біздің логотип', 'Our logo', 'brand.html'),
  ],
};
