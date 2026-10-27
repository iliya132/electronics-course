# Ревью реализации сайта — задания на исправление

> Документ адресован исполнителю (нейросети). Контент уроков в этом ревью **не рассматривается** — только код сайта:
> `server/`, `public/` (JS/CSS/HTML), `package.json`, тесты. Задачи независимы, делай по одной, в порядке из раздела 2.

## 0. Правила работы

1. Одна задача (`S-NN`) — один коммит: `fix S-NN: <что сделано>`.
2. После каждой задачи: `npm test` и `npm run validate` должны остаться зелёными. Если тест падает из-за того, что **старое поведение было неправильным** (так отмечено в задаче), поправь тест, а не код задачи. В остальных случаях чини код.
3. Не добавляй npm-библиотеки, не переходи на TypeScript/сборщик (запрещено TASK, раздел 2).
4. Код в проекте написан очень плотно (строки до 700 символов, несколько операторов в строке). **Не переформатируй файлы целиком** — это раздует diff и спрячет ошибки. Но функцию, которую ты правишь, записывай нормально: один оператор — одна строка.
5. Каждая задача содержит: *Проблема* → *Как проверить, что она есть* → *Что сделать* (с кодом) → *Готово, когда*. Если код в задаче расходится с файлом (поменялся номер строки, имя) — ориентируйся на имя функции, а не на строку.
6. Не меняй счётчики (183 занятия, 17 экзаменов и т. п.) и содержимое `content/`.

## 1. Итог ревью

**Что проверено и работает хорошо** (не ломай):
- `npm run validate` — OK; `npm test` — 23/23 зелёных.
- Прогон в браузере по всем 183 урокам на ширине 360 px: нет горизонтального переполнения, нет ошибок JS, нет `NaN/Infinity` в выводе виджетов. Страницы `#/`, `#/topic/*`, `#/review`, `#/glossary`, `#/search`, `#/settings`, `#/exam/*`, `#/summary` на 360 px тоже без переполнения.
- Полный сценарий экзамена в браузере (старт → ответы → экран «Проверь ответы» → сдача → разбор ошибок) работает; правильные ответы до `finish` клиенту не отдаются.
- Безопасность: сервер слушает только `127.0.0.1`, CSP `default-src 'self'`, проверка `Origin` на небезопасных методах, Markdown без сырого HTML, текст вставляется через `textContent`/`esc`, импорт резервной копии валидируется и применяется транзакцией.
- Контраст текста и акцентов в светлой и тёмной теме ≥ 4,5:1 (проверено расчётом).
- Мобильная вёрстка, фокус-кольцо, `aria-live` у ответов, `prefers-reduced-motion`, печать — на месте.

**Что нужно исправить** — 25 пунктов, сгруппированы по важности:

| Важность | Задачи |
|---|---|
| P1 — реальные баги | S-01 … S-08 |
| P2 — расхождения с постановкой / UX | S-09 … S-17 |
| P3 — качество и поддерживаемость | S-18 … S-25 |

## 2. Порядок выполнения

S-01 → S-02 → S-05 → S-06 → S-07 → S-03 → S-04 → S-08 → (P2 по порядку) → (P3 по порядку).
Первые пять — по 5–15 минут каждая.

---

## 3. P1 — реальные баги

### S-01. Запрос без тела или без `Content-Type: application/json` даёт 500 и стек в консоли

**Проблема.** В Express 5 `req.body` равен `undefined`, если тело не распарсено. Обработчики делают `const {scroll_pos}=req.body` или `req.body.confirm` и падают с `TypeError`; клиент получает «Внутренняя ошибка сервера» вместо понятного 400.

**Проверка.** Запусти сервер и выполни:
```powershell
curl.exe -s -X POST http://localhost:3000/api/reset
curl.exe -s -X POST http://localhost:3000/api/lessons/ohm-law/progress
```
Сейчас оба возвращают `{"error":"Внутренняя ошибка сервера"}` и в консоли сервера печатается стек. Должно быть 400 с осмысленным текстом.

**Что сделать.**
1. В `server/app.js` сразу после строки `app.use(express.json({limit:'10mb'}));` добавь:
```js
 app.use((req,_res,next)=>{req.body??={};next();});
```
2. В `server/routes/lessons.js`, обработчик `POST /lessons/:id/progress`: ограничь позицию прокрутки. В условии `check(...)` замени `scroll_pos>=0` на `scroll_pos>=0&&scroll_pos<=1e7`.
3. Добавь тест в `test/api.test.js` (по образцу соседних): `POST /api/reset` без тела → статус 400; `POST /api/lessons/ohm-law/progress` без тела → 400.

**Готово, когда** обе команды выше возвращают 400 и JSON с полем `error` на русском, стек в консоли не печатается, новый тест зелёный.

---

### S-02. Не проверяется заголовок `Host` (уязвимость к DNS-rebinding)

**Проблема.** Защита от чужих сайтов проверяет только `Origin` и только если он есть. Сайт-злоумышленник может «перепривязать» своё доменное имя на `127.0.0.1` и читать/менять прогресс (`GET /api/export`, `POST /api/reset` с телом `{"confirm":"СБРОСИТЬ"}`) — у запроса не будет `Origin` из чужого источника, а `Host` будет чужим. Проверено: запрос с `Host: evil.example` возвращает 200.

**Что сделать.** В `server/app.js` в самый первый `app.use((req,res,next)=>{...})` (где ставится `X-Content-Type-Options`) добавь в начало, до остального кода:
```js
 const hostAllowed=/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;
 if(!hostAllowed.test(req.get('host')||''))return res.status(403).json({error:'Недопустимый Host'});
```
Вынеси регулярное выражение за пределы функции `createApp` не нужно — оставь внутри, как есть.

**Тест.** В `test/api.test.js`: `request(app).get('/api/course').set('Host','evil.example')` → 403; обычный запрос supertest (Host `127.0.0.1:порт`) → 200.

**Готово, когда** тест зелёный, сайт в браузере по `http://localhost:3000` и `http://127.0.0.1:3000` работает как раньше.

---

### S-03. Ответ на вопрос «Вспомним» затирает ответ в исходном уроке

**Проблема.** Блок `recall` показывает вопросы из пройденных уроков, но ответ отправляется на `POST /api/lessons/<исходный урок>/answer`. Сервер делает `UPSERT` в `block_answers` исходного урока: `attempts` растёт, а `is_correct` перезаписывается. Если ответить на повторении неверно, у уже завершённого урока хранится «неверно» (проверено: `is_correct` 1 → 0, `attempts` 1 → 2). Кроме того, у вопросов повторения не работает кнопка «Подсказка»: функция `publicQuestion` вырезает поле `hint`, а в пул `recall` оно не возвращено.

**Что сделать.**
1. `server/routes/lessons.js`, в обработчике `GET /lessons/:id`, ветка `b.type==='recall'`: в `map` замени
`({...publicQuestion(q),source_lesson:old.id})` на `({...publicQuestion(q),hint:q.hint,source_lesson:old.id})`.
2. В том же файле перед `return r;` добавь маршрут, который только проверяет ответ и (при ошибке) создаёт карточку повторения, но **не пишет** в `block_answers`:
```js
 r.post('/recall/answer',(req,res)=>{
  const {lesson_id,block_id,answer}=req.body;
  const l=lesson(lesson_id);
  const b=required(l.blocks.find(x=>x.id===block_id&&x.type==='quiz'),'Вопрос не найден');
  check(progress(db,l.id).status==='completed','Урок ещё не пройден');
  check(validAnswer(b,answer),'Ответ имеет неверный формат');
  const correct=grade(b,answer);
  if(!correct)mistakeCard(db,'quiz:'+l.id+':'+b.id,'quiz',l.id);
  res.json({is_correct:correct,answer:b.answer,explanation:b.explanation});
 });
```
3. `public/js/blocks/quiz.js`, функция `mountQuiz`: добавь в деструктуризацию параметров `recall=false` (`{lessonId,saved,onAnswered=()=>{},recall=false}={}`) и замени вызов API на:
```js
   const data=recall
    ?await api('/recall/answer','POST',{lesson_id:lessonId,block_id:q.id,answer})
    :await api('/lessons/'+lessonId+'/answer','POST',{block_id:q.id,answer});
```
4. `public/js/blocks/render.js`, ветка `recall`: `mountQuiz(box,q,{lessonId:q.source_lesson,recall:true})`.
5. Тест в `test/api.test.js`: пройти урок, затем `POST /api/recall/answer` с неверным ответом → `block_answers.is_correct` и `attempts` исходного блока не изменились, а в `cards` появилась карточка `quiz:<урок>:<блок>`.

**Готово, когда** тест зелёный, в браузере на вопросе «Вспомним» работает «Подсказка», а ответ в исходном уроке после этого остаётся прежним.

---

### S-04. Брошенные попытки экзамена портят подбор вопросов и копятся в истории

**Проблема.** `POST /exams/:id/start` каждый раз создаёт новую попытку. Если закрыть вкладку посреди экзамена и нажать «Начать» снова, в истории остаются две «Продолжить попытку». Хуже: `selectQuestions` (файл `server/exam-engine.js`) считает **незавершённые** попытки «увиденными» и «последними», поэтому вопросы брошенной попытки при следующей сдаче отодвигаются, хотя пользователь их не завершил.

**Что сделать.**
1. `server/exam-engine.js`, функция `selectQuestions`: в запросе попыток добавь фильтр
`'SELECT * FROM exam_attempts WHERE exam_id=? AND finished_at IS NOT NULL ORDER BY id DESC'`.
2. `server/routes/exams.js`, обработчик `POST /exams/:examId/start`: после проверки `examState(...).available` и до `selectQuestions` добавь возобновление:
```js
  const open=db.prepare('SELECT * FROM exam_attempts WHERE exam_id=? AND finished_at IS NULL ORDER BY id DESC').get(exam.id);
  if(open){
   return res.json({attemptId:open.id,resumed:true,
    questions:examPublic(hydrateQuestions(exam,JSON.parse(open.question_ids_json)))});
  }
```
3. `public/js/views/exam.js`, функция `exam`: если в `info.attempts` есть попытка с `finished_at===null`, поставь на кнопку текст `Продолжить попытку` (иначе `Начать экзамен`). Остальное не меняй: `start.onclick` уже переходит на `#/attempt/<id>`.
4. Запусти `npm test`. Если какой-то тест стартует экзамен дважды подряд **без** `finish` и ждёт две разные попытки — поправь тест: сначала заверши первую попытку (в тестах уже есть код завершения).

**Готово, когда** два подряд `start` без `finish` возвращают один и тот же `attemptId`, а после `finish` следующий `start` создаёт новую попытку.

---

### S-05. Заголовок вкладки «залипает» на названии последнего урока

**Проблема.** `document.title` ставится только в `public/js/views/lesson.js`. После перехода на главную, в экзамен, настройки вкладка продолжает называться «Закон Ома — Электроника». Проверено в браузере.

**Что сделать.** В `public/js/router.js`, в начале функции `navigate`, сразу после `const version=++revision;` добавь `document.title='Электроника';`. Урок после этого сам выставит своё название (он делает это после загрузки). По желанию задай заголовки: в `views/settings.js` — `document.title='Настройки — Электроника'`, аналогично для `review`, `glossary`, `search`, `exam`, `attempt`, `summary` (одна строка в начале каждой функции).

**Готово, когда** при переходе `#/lesson/ohm-law` → `#/` заголовок вкладки меняется на «Электроника».

---

### S-06. Одна ошибка в блоке урока ломает весь урок

**Проблема.** В `public/js/views/lesson.js` блоки рисуются циклом `for(const b of l.blocks)await renderBlock(...)` без `try/catch`. Если не загрузился один рисунок (404) или упал один виджет, исключение уходит в `router.js`, и вместо урока на экране остаётся одна строка с текстом ошибки.

**Что сделать.** Замени цикл на:
```js
 for(const b of l.blocks){
  try{
   await renderBlock(article,b,{lessonId:id,answers:l.answers,disposers,onAnswered:key=>{answered.add(key);update();}});
  }catch(e){
   article.append(el('aside',{class:'callout warning',text:'Не удалось показать блок «'+b.type+'»: '+e.message}));
  }
 }
```
Дополнительно в `public/js/router.js` в `catch(e)` замени `main.textContent=e.message;` на вывод со ссылкой назад (понадобится `import {esc} from './dom.js';`):
```js
 }catch(e){main.innerHTML='<p>'+esc(e.message)+'</p><p><a href="#/">← К курсу</a></p>';}
```

**Проверка.** Временно переименуй любой `public/figures/<урок>/model.svg`, открой урок: весь текст урока на месте, на месте рисунка — жёлтая выноска. Верни файл обратно.

**Готово, когда** урок с отсутствующим рисунком открывается целиком, а страницы 404 имеют ссылку «К курсу».

---

### S-07. `npm run dev` не перезапускается при правке контента

**Проблема.** `"dev": "node --watch server/index.js"` следит только за импортируемыми JS-модулями. Файлы `content/**/*.md|yml` читаются через `fs` и не отслеживаются, а контент кэшируется при старте (README сам об этом пишет). Автору приходится вручную перезапускать сервер.

**Что сделать.** В `package.json` замени скрипт:
```json
"dev": "node --watch --watch-path=./server --watch-path=./content server/index.js"
```
Проверено: Node 24 принимает эти флаги и перезапускает сервер при изменении файлов в `content/`. В `README.md`, раздел «Команды проверки», пункт `dev`, замени фразу про ручной перезапуск на: «`dev`: перезапуск сервера при изменении `server/` и `content/`».

**Готово, когда** при `npm run dev` правка любого `.md` в `content/` приводит к строке `Restarting 'server/index.js'` в консоли.

---

### S-08. Часовой пояс «Москва» зашит в код

**Проблема.** `server/db.js` (`recordActivity`) и `server/routes/misc.js` (`/stats`, функция `fmt`) считают «сегодня» по `Europe/Moscow`, а не по времени компьютера пользователя. Для человека в другом часовом поясе серия дней и «за неделю» сбиваются около полуночи. Это решение записано в `NOTES.md`, но спецификация (TASK, 12.6) этого не требует.

**Что сделать.**
1. В `server/helpers.js` добавь:
```js
export const dayKey=(date=new Date())=>new Intl.DateTimeFormat('sv-SE').format(date);
```
(без `timeZone` — берётся часовой пояс процесса Node, то есть компьютера пользователя).
2. `server/db.js`: импортируй `dayKey` из `./helpers.js` и в `recordActivity` замени вычисление `day` на `const day=dayKey(date);`.
3. `server/routes/misc.js`: в `/stats` замени `fmt=d=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Moscow'}).format(d)` на `fmt=dayKey` (импортируй из `../helpers.js`).
4. В `NOTES.md` исправь строку про Europe/Moscow: «Даты активности считаются в локальном часовом поясе компьютера».
5. Запусти `npm test`. Если тест зависел от московской даты — поправь его на `dayKey(...)`.

**Готово, когда** в коде нет строки `Europe/Moscow`, тесты зелёные.

---

## 4. P2 — расхождения с постановкой и UX

### S-09. Подсказки глоссария не показываются с клавиатуры и на телефоне

**Проблема.** `public/js/blocks/glossary.js` кладёт определение в атрибут `title`. Нативный `title` не показывается ни при фокусе с клавиатуры, ни при касании на телефоне. TASK 12.3 требует подсказку «при наведении/фокусе». Кроме того, термин находится только в точной форме: «ток» подсвечен, а «тока», «током» — нет (границы слова проверяет `wordIndex`).

**Что сделать.**
1. В `applyTerms` замени строку с `abbr.title=...` на запись определения в `data`-атрибут (атрибут `aria-label` оставь):
```js
abbr.dataset.definition=match.t.definition;
```
2. В `public/css/components.css` дополни правило `.term` и добавь:
```css
.term{position:relative}
.term:hover::after,.term:focus::after{content:attr(data-definition);position:absolute;left:0;top:100%;z-index:30;width:max-content;max-width:min(300px,80vw);padding:10px 12px;margin-top:6px;background:var(--surface);color:var(--text);border:1px solid var(--border-strong,var(--border));border-radius:var(--radius);font-size:14px;font-weight:400;line-height:1.45;text-decoration:none;white-space:normal}
```
3. Формы слова. В `server`-данных: в `content/glossary.yml` для самых частых терминов можно добавить необязательное поле `forms: [тока, током, токе]`. В `applyTerms` строй список кандидатов: для каждого термина `[t.term,...(t.forms||[])]`, ищи любой из них функцией `wordIndex`, подсвечивай найденный текст (длину бери по найденной форме). Если не хочешь править `glossary.yml` — пропусти этот подпункт, он необязателен.

**Проверка.** В уроке «Закон Ома» наведи мышь и перейди клавишей Tab на подчёркнутое слово — появляется рамка с определением. В DevTools-эмуляции телефона касание тоже показывает её.

---

### S-10. Экзамен: ошибка ввода видна только мимолётной плашкой; нет подсказки для multi

**Проблема.** В `public/js/views/exam.js` при неверном числе (например, `abc`) сервер отвечает 400, пользователь остаётся на вопросе, а причина показана лишь плашкой `#status` в углу экрана на 6 секунд. На телефоне её легко пропустить. Для вопросов `multi` нигде не написано «можно выбрать несколько».

**Что сделать.**
1. В `render()` создай `const error=el('p',{class:'feedback incorrect',role:'alert'});` и добавь его в корень после формы. В обработчиках `back.onclick`/`next.onclick` вместо `act(...)` используй обёртку, которая пишет сообщение в `error.textContent` (и очищает его перед действием):
```js
const guard=fn=>async()=>{error.textContent='';try{await fn();}catch(e){error.textContent=e.message;}};
```
2. После `legend` вопроса, если тип вопроса `multi` (`(q.question_type||q.type)==='multi'`), добавь `el('p',{class:'muted',text:'Можно выбрать несколько вариантов.'})`. То же самое — в `public/js/blocks/quiz.js` внутри `mountQuiz` для блоков `quiz` типа `multi`.

**Готово, когда** ввод `abc` в числовой вопрос и нажатие «Далее» показывают красное сообщение прямо под вопросом.

---

### S-11. Шапка урока не показывает «Урок N из M» и название темы

**Проблема.** В макете (TASK 11.3) вверху урока: `← Тема «Основы»` и `Урок 3 из 5`. Сейчас ссылка называется просто «← К теме», номера урока нет.

**Что сделать.**
1. `server/routes/lessons.js`, `GET /lessons/:id`: перед `res.json` найди тему: `const topic=c.topics.find(t=>t.id===l.topic);` и добавь в объект ответа поля `topic_title:topic.title, position:topic.lessons.indexOf(l)+1, topic_count:topic.lessons.length`.
2. `public/js/views/lesson.js`: в первой строке `root.innerHTML` замени `'← К теме'` на `'← Тема «'+esc(l.topic_title)+'»'`, а в строку `<p class="eyebrow">` добавь `Урок '+l.position+' из '+l.topic_count+' · ` перед минутами.

**Готово, когда** на странице урока видно «Урок 4 из 7» и название темы в ссылке.

---

### S-12. «Продолжить» и кнопка «Следующий урок» не ведут к экзамену темы

**Проблема.** В `server/routes/course.js` поле `next` — первый незавершённый урок, **включая необязательные ◇**. После обязательных уроков темы пользователя уводит в необязательный урок, а об экзамене темы не напоминает. На странице урока «Следующий урок →» ведёт в следующую тему, минуя экзамен.

**Что сделать.**
1. `server/routes/course.js`: `next` выбирай так: сначала урок `in_progress`; затем первый незавершённый **обязательный** (`!l.optional`); если обязательных нет — первый незавершённый любой.
```js
const next=lessons.find(l=>l.status==='in_progress')||lessons.find(l=>l.status!=='completed'&&!l.optional)||lessons.find(l=>l.status!=='completed');
```
2. `GET /lessons/:id` в `lessons.js`: добавь в ответ `topic_exam` — `null`, если у темы нет экзамена или текущий урок не последний обязательный урок темы; иначе `{id:topic.exam,passed:<есть ли сданная попытка>}`. «Последний обязательный» — последний элемент `topic.lessons.filter(x=>!x.optional)`.
3. `public/js/views/lesson.js`: если `l.topic_exam&&!l.topic_exam.passed`, добавь к кнопкам ссылку-кнопку `Экзамен темы →` на `#/exam/<id>`.

**Готово, когда** после завершения последнего обязательного урока темы на странице урока есть кнопка экзамена темы.

---

### S-13. Виджеты: параметры из Markdown игнорируются, переключатель — ползунок, мёртвый код

**Проблема (и что сделать — по пунктам).**
1. **`params` игнорируются.** В уроках пишут `params: { u_min: 0, u_max: 12, r_min: 10, r_max: 1000 }` (так в TASK, раздел 5.2), но `controls()` в `public/js/widgets/controls.js` берёт из `initial` только значение `initial[key]`. Исправь: в цикле `for(const [key,label,min,max,step,value]of spec)` вычисляй `const lo=initial[key+'_min']??min, hi=initial[key+'_max']??max;`, используй `lo`/`hi` в `el('input',{type:'range',min:lo,max:hi,...})` и ограничь стартовое значение: `state[key]=Math.min(hi,Math.max(lo,initial[key]??value));`.
2. **Переключатель «последовательно/параллельно».** В `configs.js` виджет `series-parallel` использует ползунок 0…1 с длинной подписью. В `controls()` добавь ветку: если `max-min===1&&step===1`, создавай `<input type="checkbox">` вместо ползунка (`input.checked=state[key]===max; input.onchange=()=>{state[key]=input.checked?max:min;onChange(state);}`) и в подписи убери «0 …, 1 …» — напиши `'Соединение параллельное (выкл. — последовательное)'`. Аналогично подпись `'0 заряд / 1 разряд'`.
3. **Мёртвый код.** В `configs.js` записи `'ohm-slider'`, `'rc-charge'`, `'bridge-rectifier'` не используются: у этих виджетов есть собственные модули (`ohm-slider.js`, `rc-charge.js`, `bridge-rectifier.js`), которые не читают `configs`. Удали эти три записи из `configs`. Записи с теми же именами в `math.js` **не трогай** — их проверяют тесты.
4. **H-мост** (`h-bridge.js`): по TASK сквозной ток должен «подсвечиваться», а сейчас меняется только текст. Нарисуй четыре отрезка мотора-моста отдельными `<path>` и подсвечивай включённые ключи (`stroke="var(--accent)"`, а при состоянии `short` — `stroke="var(--bad)"` с толщиной 4). Отрезки: A — `M100 30V120`, B — `M300 30V120`, C — `M100 120V210`, D — `M300 120V210`. Включённый ключ — цветной, выключенный — `currentColor` с `opacity:.35`.
5. **Распиновка ESP32** (`pinout-esp32.js`): по TASK — «кликабельная распиновка», сейчас — выпадающий список. Это «по желанию» (раздел 7.3), поэтому делай **последним** и только если остальные задачи закрыты: нарисуй SVG-колонку выводов (две колонки по 19), каждый вывод — кнопка (`role="button" tabindex="0"`, Enter/Space), по клику показывать тот же текст, что и сейчас в `show()`.
6. **Размер шрифта графиков.** В `controls.js` функция `chart` использует `font-size="14"` в `viewBox` 480 px: на экране 360 px это ≈10,5 px. Подними до `font-size="18"` и проверь, что подписи осей не наезжают друг на друга (если наезжают — оставь подписи делений 16).

**Готово, когда** виджет `ohm-slider` с `params: { u_max: 6 }` показывает ползунок напряжения до 6 В; `series-parallel` имеет флажок; `npm test` зелёный.

---

### S-14. Рамки полей ввода почти не видны (контраст 1,25:1)

**Проблема.** Граница полей, вариантов ответа и кнопок — `--border` (`#e3e6ea` на белом = 1,25:1; в тёмной теме 1,8:1). WCAG 1.4.11 требует ≥ 3:1 для границ элементов управления.

**Что сделать.**
1. В `public/css/tokens.css` добавь токен:
 - в `:root`: `--border-strong:#7d8796;` (3,6:1 на белом),
 - в блок тёмной темы (оба места: `@media(prefers-color-scheme:dark)` и `:root[data-theme="dark"]`): `--border-strong:#6b7686;` (3,9:1).
2. В `public/css/base.css` правило `input,select,textarea{border:1px solid var(--border)...}` — замени `var(--border)` на `var(--border-strong)`. В `components.css` для `.choice` — так же. Для `button,.button` — также.
3. Декоративные границы (карточки, разделители, прогресс-бар) оставь как есть.

**Готово, когда** поля ввода и варианты ответа заметно обведены в светлой теме.

---

### S-15. Выноски `fact`/`board` выглядят как `tip`; у `safety` нет значка

**Проблема.** TASK 11.4: `fact` и `board` — серая полоса (`--muted`), `safety` — красная **с иконкой**. В `components.css` определены только `mistake`, `safety` (красный), `warning`; остальные получают акцентную синюю полосу.

**Что сделать.** В `components.css` добавь:
```css
.callout.fact,.callout.board{border-color:var(--muted)}
.callout.safety>strong::before{content:'';display:inline-block;width:18px;height:18px;margin-right:8px;vertical-align:-3px;background:currentColor;-webkit-mask:url(/icons/triangle-alert.svg) center/contain no-repeat;mask:url(/icons/triangle-alert.svg) center/contain no-repeat}
```
(иконка `triangle-alert.svg` в `lucide-static` есть; CSP `img-src 'self'` допускает локальную маску).

**Готово, когда** выноска «Безопасность» имеет красную полосу и треугольный значок, «Где это на плате» — серую полосу.

---

### S-16. Мигание темы при загрузке

**Проблема.** Тема и размер шрифта применяются только после `await api('/settings')` в `app.js`. Пользователь с тёмной темой, выбранной вручную при светлой системе, на мгновение видит светлую страницу.

**Что сделать.**
1. Создай `public/js/theme-init.js` (обычный скрипт, **не** модуль):
```js
try{
 const s=JSON.parse(localStorage.getItem('prefs')||'{}');
 if(s.theme&&s.theme!=='system')document.documentElement.dataset.theme=s.theme;
 if(s.font_size)document.documentElement.style.setProperty('--font-size',s.font_size+'px');
}catch{}
```
2. В `public/index.html` в `<head>` перед таблицами стилей: `<script src="/js/theme-init.js"></script>` (внешний файл разрешён CSP `script-src 'self'`).
3. В `public/js/views/settings.js`, функция `applySettings(s)`: в конце добавь `try{localStorage.setItem('prefs',JSON.stringify({theme:s.theme,font_size:s.font_size}));}catch{}`. Источник правды остаётся в SQLite, `localStorage` — только кэш для первого кадра.

**Готово, когда** при выбранной тёмной теме страница сразу открывается тёмной, без белой вспышки.

---

### S-17. Новые карточки Лейтнера сразу «к повторению»

**Проблема.** `addCard` в `server/srs.js` создаёт карточку с `due_at = сейчас`, поэтому сразу после завершения урока главная показывает «N карточек к повторению» (на проверке после 7 уроков и одного проваленного экзамена было 27). Принцип интервального повторения: первое повторение — через интервал коробки 1 (1 день). Сейчас пользователь повторяет то, что только что прочитал.

**Что сделать.**
1. `server/srs.js`, `addCard`: вычисляй срок как `now + intervals[0]` суток:
```js
 const due=new Date(now);due.setUTCDate(due.getUTCDate()+intervals[0]);
 db.prepare('INSERT OR IGNORE INTO cards(card_id,source,lesson_id,due_at) VALUES (?,?,?,?)').run(id,source,lesson,due.toISOString());
```
2. `mistakeCard` оставь как есть: карточки по ошибкам должны быть доступны сразу (он перезаписывает `due_at` на «сейчас»).
3. Тесты, которые ожидали сразу доступные карточки после завершения урока (`test/full-course.test.js`, `test/api.test.js`) — поправь: для проверки повторения используй карточку, созданную через ошибку, либо сдвинь `due_at` прямым SQL-запросом в тесте.

**Готово, когда** свежезавершённый урок не увеличивает счётчик «Повторение», а ошибка в вопросе — увеличивает.

---

## 5. P3 — качество и поддерживаемость

### S-18. Читаемость кода

**Проблема.** Максимальная длина строки: 729 символов (`bridge-rectifier.js`), 531 (`exam.js`), 512 (`course.js`). Несколько операторов в строке, отступ в один пробел. Слабой модели и человеку трудно править такой код безопасно.

**Что сделать (постепенно, без массового переформатирования).** Правило: **любую функцию, которую ты открыл ради другой задачи, оформляй нормально** (один оператор в строке, отступ 2 пробела, длина строки ≤ 120). Отдельным коммитом отформатируй только три самых тяжёлых файла: `public/js/widgets/bridge-rectifier.js`, `public/js/views/exam.js`, `public/js/views/course.js`. Перед коммитом: `npm test` и ручной прогон страницы (главная, экзамен, виджет моста). Поведение не менять.

---

### S-19. Быстрее собирать прогресс для `/api/course`

**Проблема.** `lessonSummary` вызывает `progress()` и делает отдельный SQL-запрос на каждый из 183 уроков, `examState` — ещё запросы. Главная и страница темы вызывают `/api/course`, а событие `course:update` запускает ещё и `/review/queue` при каждой смене страницы. Для одного пользователя терпимо, но легко упростить.

**Что сделать.** В `server/helpers.js` добавь `export function progressMap(db){return new Map(db.prepare('SELECT * FROM lesson_progress').all().map(r=>[r.lesson_id,r]));}`; в `server/routes/course.js` один раз получи `const all=progressMap(db)` и передавай в `lessonSummary(db,l,all)`, где `progress` берётся как `all.get(id)||{lesson_id:id,status:'not_started',scroll_pos:0,time_spent_sec:0}`. Остальные вызовы `progress(db,id)` не меняй.

**Готово, когда** `/api/course` делает ≈ 20 запросов вместо ≈ 200 (проверить временным счётчиком вызовов `db.prepare`), тесты зелёные.

---

### S-20. Импорт резервной копии: ссылочная целостность

**Проблема.** `server/backup.js` проверяет форму строк, но не проверяет, что `block_answers.block_id` существует в уроке, `exam_answers.attempt_id` есть в импортируемых `exam_attempts`, а `card_id` соответствует известному формату. Некорректная, но «правильная по форме» копия создаст мусорные строки.

**Что сделать.** В `importProgress` в цикле по строкам добавь проверки (после уже существующих `check(...)`):
- `block_answers`: `check(c.lessonById.get(row.lesson_id).blocks.some(b=>b.id===row.block_id),'Неизвестный блок')`;
- `exam_answers`: `check(data.tables.exam_attempts.some(a=>a.id===row.attempt_id),'Ответ без попытки')`;
- `cards`: `check(/^(lesson:[a-z0-9-]+:\d+|quiz:[a-z0-9-]+:[a-z0-9-]+|q:[A-Za-z0-9-]+)$/.test(row.card_id),'Неверный card_id')`.
Тест: копия с неизвестным `block_id` отклоняется статусом 400, данные не изменились (по образцу существующего теста «Неверные настройки резервной копии не заменяют данные»).

---

### S-21. Формулировка кнопки предсказания

**Проблема.** После ответа на `predict` кнопка называется «Проверить ещё раз» — как у обычного вопроса. Смысл «сначала предскажи» теряется: пользователь видит объяснение и может сразу поменять прогноз.

**Что сделать.** `public/js/blocks/quiz.js`, в `show`: `submit.textContent=q.type==='predict'?'Изменить прогноз':'Проверить ещё раз';`. Больше ничего не менять.

---

### S-22. Подпись оси Y наезжает на подпись деления (рисунки)

**Проблема.** В `scripts/lib/plot.js` подпись оси Y рисуется `text(8,52,yLabel)`, а верхнее деление — `text(left-10, Y(y)+5, …)` ≈ `(60, 49)`. На рисунке «Модель и единицы» урока про buck подпись «Uвых, В» слилась с цифрой «12». Видно в браузере.

**Что сделать.** В `plot.js` замени `text(8,52,yLabel)` на `text(left,top-10,yLabel)` (подпись над осью, слева от заголовка нет конфликта: заголовок по центру на `y=24`, подпись на `y=34`). Если подпись длинная (> 12 символов), сократи единицу в вызывающем коде. Затем `npm run figures` и проверь 3 рисунка вручную: `buck/model.svg`, `ohm-law/model.svg`, `rc-charge/model.svg`.
Тест `test/figures.test.js` («Графики детерминированы») должен остаться зелёным; если он сравнивает с эталоном по хэшу — обнови эталон.

---

### S-23. Тесты интерфейса отсутствуют

**Проблема.** Тесты интерфейса ограничены проверкой синтаксиса модулей и математики виджетов. Регрессии вроде S-05, S-06 никто не заметит.

**Что сделать (без новых библиотек).** Добавь файл `docs/BROWSER-CHECKLIST.md` и положи в него ручной чек-лист + этот скрипт, который запускается в консоли браузера на открытом сайте и проверяет все страницы (на ширине 360 px эмуляцией в DevTools):
```js
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const course=await (await fetch('/api/course')).json();
const routes=['#/','#/review','#/glossary','#/search','#/settings','#/summary',
 ...course.topics.map(t=>'#/topic/'+t.id),...course.topics.flatMap(t=>t.lessons.map(l=>'#/lesson/'+l.id))];
const bad=[];
for(const r of routes){
 const ready=new Promise(res=>{const h=()=>{document.removeEventListener('route:ready',h);res(true)};document.addEventListener('route:ready',h);setTimeout(()=>res(false),4000)});
 location.hash=r;const ok=await ready;await sleep(50);
 if(!ok)bad.push(r+': не загрузилась');
 if(document.documentElement.scrollWidth>innerWidth+1)bad.push(r+': горизонтальная прокрутка');
 if(/NaN|Infinity|undefined/.test(document.getElementById('main').innerText))bad.push(r+': NaN/undefined в тексте');
}
console.log(bad.length?bad:'Все '+routes.length+' страниц в порядке');
```
Чек-лист ручной: пройти урок, сдать экзамен темы (провал → пересдача → успех), повторение, смена темы/шрифта, экспорт/импорт, сброс. Каждый пункт — одна строка с ожидаемым результатом.

---

### S-24. Прочие мелочи (делай одним коммитом)

1. `public/js/blocks/render.js` и `quiz.js`: убери неиспользуемые импорты `esc` (проверь поиском по файлу, что имя нигде не используется).
2. `public/js/views/exam.js`: в `showResult` кнопка «Пересдать» ведёт на страницу-интро. Оставь, но если у темы уже есть сданная попытка, подпись замени на `Пересдать для улучшения результата`.
3. Страница `#/summary` («Курс пройден»): TASK 11.6 требует «число уроков и минут, слабые места, что дальше (идеи проектов)». Сейчас «что дальше» — один общий абзац со ссылкой на тему `capstone`. Добавь в `views/study.js` перечень 5 итоговых проектов: загрузить `GET /api/course`, взять `topics.find(t=>t.id==='capstone').lessons` и вывести ссылкой каждый (`lessonRow` из `dom.js`).
4. `scripts/browser-qa.js` и `scripts/widget-preview.js` — служебные скрипты с жёстко заданными портами 3003/3002 без описания в README. Допиши в README одну строку про каждый (зачем нужен, как запускать) либо удали, если не используются.

---

### S-25. Обновить документацию после правок

В `README.md` и `NOTES.md` отрази: поведение `dev` (S-07), локальный часовой пояс (S-08), возобновление попытки экзамена (S-04), первая проверка карточек через сутки (S-17), проверку `Host` (S-02). В `ACCEPTANCE.md` не пиши «23 теста» вручную — укажи актуальное число после правок, скопировав из вывода `npm test`.

---

## 6. Финальная проверка (после всех задач)

1. `npm run validate` → `OK: 19 тем, 183 уроков, 17 экзаменов`.
2. `npm test` → 0 ошибок (число тестов вырастет — добавлены новые).
3. `npm start`, открыть `http://localhost:3000` и пройти `docs/BROWSER-CHECKLIST.md` на ширинах 360 / 768 / 1280 px, в светлой и тёмной теме.
4. В Network (DevTools) нет запросов к внешним хостам.
5. `git status` чистый, коммиты по одной задаче.
