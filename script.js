(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const money = n => n.toLocaleString('uk-UA') + ' ₴';

  /* 1. Мобільне меню */
  const burger = $('.burger');
  const nav = $('#nav');

  function setMenu(open) {
    nav.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Закрити меню' : 'Відкрити меню');
  }

  burger.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* 2. Калькулятор вартості: ціна = більше з (мінімум, площа × тариф) + додатки */
  const PLANS = {
    maintenance: { name: 'Підтримуюче прибирання', min: 1200, rate: 22 },
    general:     { name: 'Генеральне прибирання',  min: 2800, rate: 50 },
    renovation:  { name: 'Прибирання після ремонту', min: 3500, rate: 75 },
  };

  const calcForm = $('#calc-form');
  const calcType = $('#calc-type');
  const calcArea = $('#calc-area');
  const extras = [...calcForm.querySelectorAll('[type="checkbox"]')];

  function calculate() {
    const plan = PLANS[calcType.value];
    const area = Number(calcArea.value);
    const addons = extras.filter(c => c.checked).reduce((sum, c) => sum + Number(c.dataset.price), 0);
    const total = Math.max(plan.min, area * plan.rate) + addons;
    const text = `${plan.name}, ${area} м²` + (addons ? `, додатково ${money(addons)}` : '');

    $('#calc-area-out').textContent = area + ' м²';
    $('#calc-price').textContent = money(total);
    $('#calc-detail').textContent = text;
    return { total, text };
  }

  calcForm.addEventListener('input', calculate);
  calcForm.addEventListener('submit', e => e.preventDefault());
  calculate();

  /* 3. Форма заявки */
  const form = $('#order-form');
  const service = $('#f-service');
  const note = $('#order-note');
  const status = $('#form-status');

  // Кнопка в калькуляторі підставляє послугу й ціну у форму
  $('#calc-order').addEventListener('click', () => {
    const { total, text } = calculate();
    service.value = calcType.value;
    note.textContent = `Орієнтовна вартість: ${money(total)} (${text})`;
    note.hidden = false;
    status.hidden = true;
  });
  service.addEventListener('change', () => { note.hidden = true; });

  // Маска телефону: +380 XX XXX XX XX
  const phone = $('#f-phone');
  phone.addEventListener('input', () => {
    let d = phone.value.replace(/\D/g, '');
    if ('380'.startsWith(d)) d = '';            // людина ще вводить код країни
    else if (d.startsWith('380')) d = d.slice(3);
    else if (d.startsWith('0')) d = d.slice(1);
    d = d.slice(0, 9);
    const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
    phone.value = d ? '+380 ' + parts.join(' ') : '';
  });

  // Правила перевірки: true або текст помилки
  const rules = {
    name:  v => v.trim().length >= 2 || "Вкажіть ім'я (мінімум 2 літери)",
    phone: v => v.replace(/\D/g, '').length === 12 || 'Введіть номер повністю: +380 XX XXX XX XX',
  };

  function validate(key) {
    const input = $('#f-' + key);
    const result = rules[key](input.value);
    $('#err-' + key).textContent = result === true ? '' : result;
    input.setAttribute('aria-invalid', result !== true);
    return result === true;
  }

  Object.keys(rules).forEach(key => {
    $('#f-' + key).addEventListener('blur', () => validate(key));
    $('#f-' + key).addEventListener('input', () => {
      if ($('#f-' + key).getAttribute('aria-invalid') === 'true') validate(key);
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const invalid = Object.keys(rules).filter(key => !validate(key));
    if (invalid.length) { $('#f-' + invalid[0]).focus(); return; }

    const btn = $('button[type="submit"]', form);
    btn.disabled = true;
    btn.textContent = 'Надсилаємо…';

    const data = Object.fromEntries(new FormData(form));
    console.log('Заявка:', data);
    // Для справжнього сайту замініть імітацію на відправку, наприклад:
    // await fetch('https://formspree.io/f/ВАШ_ID', { method: 'POST', body: new FormData(form) });
    await new Promise(resolve => setTimeout(resolve, 800));

    status.textContent = `Дякуємо, ${data.name.trim()}! Заявку прийнято, передзвонимо протягом 15 хвилин.`;
    status.hidden = false;
    form.reset();
    note.hidden = true;
    btn.disabled = false;
    btn.textContent = 'Надіслати заявку';
  });
})();