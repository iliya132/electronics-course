import { api } from '../api.js';
import { esc, progressBar, lessonRow } from '../dom.js';
const topicHues = [215, 265, 170, 28, 335, 195, 145, 8, 245, 52];
export async function home(root) {
  const [c, stats, queue] = await Promise.all([api('/course'), api('/stats'), api('/review/queue')]);
  const cardWord = { one: 'карточка', few: 'карточки', many: 'карточек', other: 'карточки' }[new Intl.PluralRules('ru').select(queue.length)];
  root.innerHTML = "<section class=\"hero\"><p class=\"eyebrow\">Практический курс • в своём темпе</" +
    "p><h1>От первого тока<br><span class=\"hl\">до собственной платы.</span></h1><p class=\"intro\">Разберис" +
    "ь, как работает электроника. Считай, проверяй себя и собирай устройства — от" +
    " простой цепи до ESP32.</p>" +
    '<div class="course-progress"><div class="row spread"><span>Прогресс курса</span><span class="muted">' + c.completed + ' из ' + c.total +
    ' уроков · ' + c.percent + ' %</span></div>' + progressBar(c.percent) + '</div></section>' + (c.next ?
    '<section class="continue"><div><span class="eyebrow">Твой следующий шаг</span><h3>' + esc(c.next.title) +
    '</h3><p class="muted">' + esc(c.next.summary) + '</p></div><a class="button primary" href="#/lesson/' +
    c.next.id + '">' + (c.next.status === 'in_progress' ? 'Продолжить' : 'Начать урок') + ' →</a></section>' :
    "<section class=\"continue\"><h3>Все уроки завершены</h3><a class=\"button prima" +
    "ry\" href=\"#/exam/final\">Итоговый экзамен →</a></section>") +
    ("<div class=\"course-grid\"><section><h2>Программа курса</h2><p class=\"muted\">О" +
    "т простого к сложному. Любой урок можно открыть сразу.</p>") + c.topics.map((t,
    i) => '<details class="topic-item" style="--hue:' + topicHues[i % topicHues.length] + '"><summary><span class="topic-number">' + String(i + 1).padStart(2, '0') +
    '</span><span><strong>' + esc(t.title) + '</strong><small>' + esc(t.summary) + '</small><span class="topic-meter"><i><b style="width:' + Math.round(100 * t.completed / (t.lessons.length || 1)) +
    '%"></b></i>' + t.completed + ' из ' + t.lessons.length + '</span></span></summary><div class="topic-lessons">' + t.lessons.map(lessonRow).join('') +
    '<a href="#/topic/' + t.id + '">О теме и экзамене →</a></div></details>').join('') +
    ("<section class=\"panel\"><span class=\"eyebrow\">Проверка знаний</span><h3>Итого" +
    "вый экзамен</h3><p class=\"muted\">") + (c.final_exam.available ? '30 вопросов по пройденным темам.' :
    'Откроется после сдачи всех экзаменов тем.') +
    '</p><a class="button" href="#/exam/final">К экзамену →</a></section></section>' +
    '<aside class="aside-card"><p class="eyebrow">Закрепи сегодня</p><h3>' + queue.length +
    (' ' + cardWord + "</h3><p>Короткое повторение помогает сохранить знания надолго.</p><" +
    "a class=\"button\" href=\"#/review\">Повторить →</a><hr><p>Серия: ") + stats.streak + ' дн.<br>За неделю: ' +
    stats.minutes_week + ' мин.</p><a href="#/glossary">Словарь терминов →</a></aside></div>';
}
export async function topic(root, id) {
  const c = await api('/course');
  const t = c.topics.find(t => t.id === id);
  if (!t) {
    throw Error('Тема не найдена');
  }
  root.innerHTML = '<a href="#/">← Программа курса</a><h1>' + esc(t.title) + '</h1><p class="muted">' +
    esc(t.summary) + '</p>' + progressBar(t.percent) + '<p class="muted">' + t.completed + ' из ' + t.lessons.length +
    ' уроков завершено</p>' + t.lessons.map(lessonRow).join('') + (t.exam ?
    '<section class="panel"><h2>Экзамен темы</h2><p>' + (t.exam.passed ? 'Сдан · лучший результат ' +
    t.exam.best.toFixed(0) + ' %' : t.exam.available ? 'Можно начинать' : 'Осталось обязательных уроков: ' +
    t.exam.remaining) + '</p><a class="button" href="#/exam/' + t.exam.id + '">Открыть экзамен →</a></section>' :
    '<p class="muted">У этой темы нет отдельного экзамена.</p>');
}
