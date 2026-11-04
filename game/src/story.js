// Source: kiss-at-the-edge-of-the-world@1e775f1, content/season-1-vertical-slice-episodes-01-02.md, S01–S06.
// M3 S06 boundary is not the end of EP02. EN falls back to RU pending verified localization.
import { s02Intro, s02People, s02Place, s02OwnChoice, s02Common } from './scenes/s02.js';
import { s65Evening } from './scenes/s65.js';
import {
  s03Intro, s03CareerPeople, s03CareerPlace, s03CareerOwn, s03Coffee,
  s03SeatDamir, s03SeatOther, s03Waterfront, s03Message, s03Silence,
} from './scenes/s03.js';
import {
  s04Intro, s04Accepted, s04Declined, s04Negotiated, s04Common,
  s04AfterMessage, s04AfterSilence,
} from './scenes/s04.js';
import { s05Intro, s05Nick, s05Erik, s05Damir, s05Common } from './scenes/s05.js';
import {
  s06Intro, s06WeatherErik, s06WeatherOther, s06CommonA,
  s06SeatEric, s06SeatOther, s06CommonB, s06FavoritePlace, s06Music,
} from './scenes/s06.js';
const t = (ru) => ({ ru, en: ru });
const beats = (prefix, prose) => prose.trim().split(/\n\s*\n/u).map((paragraph, index) => ({
  id: `${prefix}-${String(index + 1).padStart(2, '0')}`,
  type: 'dialogue',
  text: t(paragraph.trim()),
}));

const airport = `Красный чемодан Алисы появился на ленте последним и сразу попытался уехать обратно в служебный проём.

— Даже багаж понял, что это сомнительная идея, — сказала она в телефон.

Марина, её редактор, в голосовом сообщении отвечать не могла. Алиса прижала чемодан коленом, ухватила за боковую ручку и услышала за спиной:

— Помочь или это важная часть личного знакомства с Исландией?

Мужчина держал картонную табличку с расплывшейся надписью «АЛИСА, ЖУРНАЛИСТ». Дождь превратил последние буквы в серое облако. На шее у него висела камера, но объектив смотрел в пол.

— Если поможешь, я не смогу написать, что победила чемодан сама.

— Напиши, что использовала местного специалиста.

— Ты не местный.

— Уже провалил первое собеседование.

Он протянул руку, но не коснулся ручки.

— Ник. Можно?

Алиса кивнула. Чемодан легко сошёл с ленты, словно всё это время ждал человека с правильным уровнем самоуверенности.

— Ты снимаешь встречу? — спросила она.

— Нет. Эрик сказал, что после перелёта люди похожи на собственные неудачные фотографии в паспорте. Я решил не разрушать отношения в первые тридцать секунд.

— Разумный Эрик.

— Не спеши. Он ещё заставит тебя пересчитать носки.

За стеклянными дверями аэропорта дождь летел почти горизонтально. Возле выхода стоял высокий мужчина в тёмной куртке, без таблички и камеры. Он разговаривал с сотрудником проката и одновременно следил за тем, как ветер толкал пустую багажную тележку к дороге. Поймал её одной рукой, вернул под навес и только тогда посмотрел на Алису.

— Эрик. Добро пожаловать. Машина в десяти минутах, если Ник не поведёт вас короткой дорогой.

— Там была дверь, — возразил Ник.

— На склад.

— Всё равно короче.

Улыбка у Эрика появилась не на губах, а в глазах — быстро и будто без разрешения. Алиса успела заметить её прежде, чем он принял у Ника чемодан и поставил рядом с остальными сумками.

— Вас четверо? — спросила она.

— Нас, — поправил Ник. — Ты уже внутри бедствия.

Четвёртый участник стоял у автомата с кофе. Алиса узнала его раньше, чем он повернулся. По тому, как он держал бумажный стакан — большим пальцем у самого края, будто тот мог внезапно выскользнуть. По серому шарфу, который она когда-то подарила ему на день рождения и который совершенно точно не собиралась узнавать через два года.

Дамир увидел её и замер ровно на один вдох.

— Привет, — сказал он.

Ник перевёл взгляд с него на Алису и безошибочно понял, что камера сейчас особенно не нужна.

— Вы знакомы? — спросил Эрик.

— Были, — ответила Алиса.

Дамир поставил кофе на подоконник.

— Я не знал, что журналистка — ты.

— А я не знала, что врач — ты. Отлично составленные анкеты.

— В списке от организатора было только название издания. Без твоего имени.

— А мне — только «врач на встречу с клиникой».

Ник тихо поднял табличку и посмотрел на размокшее имя, словно пытался найти там инструкцию для чрезвычайной ситуации.

Эрик не стал спрашивать, насколько плохо они расстались и не нужно ли срочно менять состав группы. Он взглянул на часы.

— До Рейкьявика около пятидесяти километров. По дороге есть остановка. Можем выпить кофе там или сначала уехать отсюда.

Алиса посмотрела на Дамира. Тот не делал шаг навстречу, и за это она была ему почти благодарна.`;

const withEric = `— Можно вперёд? — спросила Алиса.

— Конечно. Куртку лучше снять: печка со стороны пассажира работает слишком усердно.

Она устроилась рядом с картой. Эрик показал ей ручку двери, которую надо было чуть приподнять, чтобы закрыть, и молча дождался, пока Алиса сама справится.

— Ты можешь говорить, если я смотрю не туда, — сказала она.

— Сейчас смотришь туда. Выезд справа.

Алиса улыбнулась и открыла на телефоне карту. Из заднего ряда Ник спросил, считается ли место спереди служебным повышением. Эрик ответил лишь после того, как влился в поток:

— Там лучше видно дорогу.

Алиса заметила, что он дал ей короткий честный ответ, не пытаясь разрядить встречу с Дамиром.`;

const withNick = `Ник отвёл для неё место у окна в последнем ряду и, когда она села, положил табличку между ними надписью вниз.

— Я могу просто помолчать, — сказал он.

— Не уверена, что тебе это по силам.

— Проверим до первого съезда.

Он действительно молчал. Потом заметил, что ремень её чемодана оказался под сиденьем, и подтянул сумку ногой, не касаясь Алисы.

— Спасибо, — сказала она.

— Пожалуйста.

Это оказалось приятнее его первых шуток.`;

const withDamir = `Алиса сама открыла заднюю дверь. Дамир убрал с соседнего сиденья свой рюкзак.

— Ты уверена? — спросил он.

— В том, что могу выбрать место, да.

Он кивнул и больше не спрашивал. Когда машина тронулась, его чашка с кофе качнулась в подстаканнике; Алиса придержала её, как делала прежде, и тут же отпустила.

— Я могу пересесть на остановке, — сказал Дамир.

— Пока не надо.

Он повернулся к окну. Их плечи не соприкасались, но поездка уже не могла притворяться встречей незнакомых людей.`;

const common = `За окном тянулись чёрные поля лавы и низкое небо; океан то появлялся, то исчезал за стеной дождя. Ник перевернул табличку с её именем и написал на обороте: «ГРУППА, КОТОРАЯ ЕЩЁ НЕ ПЕРЕДУМАЛА». Затем убрал её под сиденье. Алиса впервые за утро смогла смотреть не на пассажиров, а на дорогу.`;

export const assets = {};
export const catalogData = { schemaVersion: 1, interactions: [] };
export const graphData = { schemaVersion: 1, id: 'kiss-s01-m2', startSceneId: 's01-airport', scenes: [
  { id: 's01-airport', beats: [
    ...beats('s01-airport', airport),
    { id: 's01-seat-choice', type: 'choice', choices: [
      { id: 'front-eric', label: t('Сесть впереди рядом с Эриком'), targetSceneId: 's01-eric',
        effects: [{ op: 'flag_set', id: 's01-seat-eric', value: true }] },
      { id: 'back-nick', label: t('Сесть с Ником'), targetSceneId: 's01-nick',
        effects: [{ op: 'flag_set', id: 's01-seat-nick', value: true }] },
      { id: 'back-damir', label: t('Сесть рядом с Дамиром'), targetSceneId: 's01-damir',
        effects: [{ op: 'flag_set', id: 's01-seat-damir', value: true }] },
    ] },
  ] },
  { id: 's01-eric', beats: beats('s01-eric', withEric), nextSceneId: 's01-common' },
  { id: 's01-nick', beats: beats('s01-nick', withNick), nextSceneId: 's01-common' },
  { id: 's01-damir', beats: beats('s01-damir', withDamir), nextSceneId: 's01-common' },
  { id: 's01-common', beats: beats('s01-common', common), nextSceneId: 's02-road' },
  { id: 's02-road', beats: [
    ...beats('s02-road', s02Intro),
    { id: 's02-career-choice', type: 'choice', choices: [
      { id: 'people', label: t('Сначала наблюдать за людьми'), targetSceneId: 's02-people',
        effects: [{ op: 'flag_set', id: 'career-thesis-people', value: true }] },
      { id: 'place', label: t('Начать с места'), targetSceneId: 's02-place',
        effects: [{ op: 'flag_set', id: 'career-thesis-place', value: true }] },
      { id: 'own-choice', label: t('Спросить Дамира о решении'), targetSceneId: 's02-own-choice',
        effects: [
          { op: 'flag_set', id: 'career-thesis-own-choice', value: true },
          { op: 'flag_set', id: 'damir-direct', value: true },
        ] },
    ] },
  ] },
  { id: 's02-people', beats: beats('s02-people', s02People), nextSceneId: 's02-common' },
  { id: 's02-place', beats: beats('s02-place', s02Place), nextSceneId: 's02-common' },
  { id: 's02-own-choice', beats: beats('s02-own-choice', s02OwnChoice), nextSceneId: 's02-common' },
  { id: 's02-common', beats: beats('s02-common', s02Common), nextSceneId: 's65-guesthouse' },
  { id: 's65-guesthouse', beats: beats('s65-guesthouse', s65Evening), nextSceneId: 's03-editorial' },
  { id: 's03-editorial', beats: [
    ...beats('s03-editorial', s03Intro),
    // Engine N1 1.2.2 has no conditional automatic nextSceneId: these are
    // mutually exclusive technical Continue actions, not literary player choices.
    { id: 's03-career-dispatch', type: 'choice', choices: [
      { id: 'people', label: t('Продолжить'), targetSceneId: 's03-career-people',
        when: { flag: 'career-thesis-people' } },
      { id: 'place', label: t('Продолжить'), targetSceneId: 's03-career-place',
        when: { flag: 'career-thesis-place' } },
      { id: 'own-choice', label: t('Продолжить'), targetSceneId: 's03-career-own',
        when: { flag: 'career-thesis-own-choice' } },
    ] },
  ] },
  { id: 's03-career-people', beats: beats('s03-career-people', s03CareerPeople), nextSceneId: 's03-coffee' },
  { id: 's03-career-place', beats: beats('s03-career-place', s03CareerPlace), nextSceneId: 's03-coffee' },
  { id: 's03-career-own', beats: beats('s03-career-own', s03CareerOwn), nextSceneId: 's03-coffee' },
  { id: 's03-coffee', beats: [
    ...beats('s03-coffee', s03Coffee),
    { id: 's03-seat-dispatch', type: 'choice', choices: [
      { id: 'damir', label: t('Продолжить'), targetSceneId: 's03-seat-damir',
        when: { flag: 's01-seat-damir' } },
      { id: 'other', label: t('Продолжить'), targetSceneId: 's03-seat-other',
        when: { any: [{ flag: 's01-seat-eric' }, { flag: 's01-seat-nick' }] } },
    ] },
  ] },
  { id: 's03-seat-damir', beats: beats('s03-seat-damir', s03SeatDamir), nextSceneId: 's03-waterfront' },
  { id: 's03-seat-other', beats: beats('s03-seat-other', s03SeatOther), nextSceneId: 's03-waterfront' },
  { id: 's03-waterfront', beats: [
    ...beats('s03-waterfront', s03Waterfront),
    { id: 's03-after-pharmacy-choice', type: 'choice', choices: [
      { id: 'message', label: t('Написать ему короткое сообщение'), targetSceneId: 's03-message',
        effects: [{ op: 'flag_set', id: 's03-damir-message', value: true }] },
      { id: 'silence', label: t('Оставить эту прогулку без продолжения'), targetSceneId: 's03-silence',
        effects: [{ op: 'flag_set', id: 's03-damir-silence', value: true }] },
    ] },
  ] },
  { id: 's03-message', beats: beats('s03-message', s03Message), nextSceneId: 's04-intro' },
  { id: 's03-silence', beats: beats('s03-silence', s03Silence), nextSceneId: 's04-intro' },
  { id: 's04-intro', beats: [
    ...beats('s04-intro', s04Intro),
    { id: 's04-camera-consent-choice', type: 'choice', choices: [
      { id: 'accepted', label: t('Разрешить короткий общий кадр'), targetSceneId: 's04-accepted',
        effects: [{ op: 'flag_set', id: 'consent-camera-accepted', value: true }] },
      { id: 'declined', label: t('Попросить убрать камеру'), targetSceneId: 's04-declined',
        effects: [{ op: 'flag_set', id: 'consent-camera-declined-respected', value: true }] },
      { id: 'negotiated', label: t('Предложить снимок всей группы'), targetSceneId: 's04-negotiated',
        effects: [{ op: 'flag_set', id: 'consent-camera-negotiated', value: true }] },
    ] },
  ] },
  { id: 's04-accepted', beats: beats('s04-accepted', s04Accepted), nextSceneId: 's04-common' },
  { id: 's04-declined', beats: beats('s04-declined', s04Declined), nextSceneId: 's04-common' },
  { id: 's04-negotiated', beats: beats('s04-negotiated', s04Negotiated), nextSceneId: 's04-common' },
  { id: 's04-common', beats: [
    ...beats('s04-common', s04Common),
    // Only one prior S03 message outcome is eligible. This is a technical,
    // state-derived continuation, not a new literary choice.
    { id: 's04-s03-dispatch', type: 'choice', choices: [
      { id: 'message', label: t('Продолжить'), targetSceneId: 's04-after-message',
        when: { flag: 's03-damir-message' } },
      { id: 'silence', label: t('Продолжить'), targetSceneId: 's04-after-silence',
        when: { flag: 's03-damir-silence' } },
    ] },
  ] },
  { id: 's04-after-message', beats: beats('s04-after-message', s04AfterMessage), nextSceneId: 's05-intro' },
  { id: 's04-after-silence', beats: beats('s04-after-silence', s04AfterSilence), nextSceneId: 's05-intro' },
  { id: 's05-intro', beats: [
    ...beats('s05-intro', s05Intro),
    { id: 's05-weather-choice', type: 'choice', choices: [
      { id: 'nick', label: t('Помочь Нику'), targetSceneId: 's05-nick',
        effects: [{ op: 'flag_set', id: 'weather-choice-nick', value: true }] },
      { id: 'erik', label: t('Попросить Эрика объяснить перемену'), targetSceneId: 's05-erik',
        effects: [{ op: 'flag_set', id: 'weather-choice-erik', value: true }] },
      { id: 'damir', label: t('Сесть рядом с Дамиром'), targetSceneId: 's05-damir',
        effects: [{ op: 'flag_set', id: 'weather-choice-damir', value: true }] },
    ] },
  ] },
  { id: 's05-nick', beats: beats('s05-nick', s05Nick), nextSceneId: 's05-common' },
  { id: 's05-erik', beats: beats('s05-erik', s05Erik), nextSceneId: 's05-common' },
  { id: 's05-damir', beats: beats('s05-damir', s05Damir), nextSceneId: 's05-common' },
  { id: 's05-common', beats: beats('s05-common', s05Common), nextSceneId: 's06-intro' },
  { id: 's06-intro', beats: [
    ...beats('s06-intro', s06Intro),
    // Branch derived from the earlier S05 weather decision; not a new paid/player choice.
    { id: 's06-weather-dispatch', type: 'choice', choices: [
      { id: 'erik', label: t('Продолжить'), targetSceneId: 's06-weather-erik',
        when: { flag: 'weather-choice-erik' } },
      { id: 'other', label: t('Продолжить'), targetSceneId: 's06-weather-other',
        when: { any: [{ flag: 'weather-choice-nick' }, { flag: 'weather-choice-damir' }] } },
    ] },
  ] },
  { id: 's06-weather-erik', beats: beats('s06-weather-erik', s06WeatherErik), nextSceneId: 's06-common-a' },
  { id: 's06-weather-other', beats: beats('s06-weather-other', s06WeatherOther), nextSceneId: 's06-common-a' },
  { id: 's06-common-a', beats: [
    ...beats('s06-common-a', s06CommonA),
    // Another state-derived continuation, based on the S01 seat choice.
    { id: 's06-seat-dispatch', type: 'choice', choices: [
      { id: 'eric', label: t('Продолжить'), targetSceneId: 's06-seat-eric',
        when: { flag: 's01-seat-eric' } },
      { id: 'other', label: t('Продолжить'), targetSceneId: 's06-seat-other',
        when: { any: [{ flag: 's01-seat-nick' }, { flag: 's01-seat-damir' }] } },
    ] },
  ] },
  { id: 's06-seat-eric', beats: beats('s06-seat-eric', s06SeatEric), nextSceneId: 's06-common-b' },
  { id: 's06-seat-other', beats: beats('s06-seat-other', s06SeatOther), nextSceneId: 's06-common-b' },
  { id: 's06-common-b', beats: [
    ...beats('s06-common-b', s06CommonB),
    { id: 's06-eric-choice', type: 'choice', choices: [
      { id: 'favorite-place', label: t('Попросить показать его любимое место на тропе'),
        targetSceneId: 's06-favorite-place',
        effects: [{ op: 'flag_set', id: 'eric-map-favorite-place', value: true }] },
      { id: 'music', label: t('Предложить ему выбрать музыку для обратной дороги'),
        targetSceneId: 's06-music',
        effects: [{ op: 'flag_set', id: 'eric-map-music', value: true }] },
    ] },
  ] },
  { id: 's06-favorite-place', beats: beats('s06-favorite-place', s06FavoritePlace), nextSceneId: 's06-m3-end' },
  { id: 's06-music', beats: beats('s06-music', s06Music), nextSceneId: 's06-m3-end' },
  { id: 's06-m3-end', beats: [
    { id: 's06-m3-end-beat', type: 'ending', endingId: 'm3-s06-only',
      text: t('Технический фрагмент завершён. История продолжится в S07.') },
  ] },
] };
export const labels = { intent: {}, tone: {}, recipient: {}, journal: {} };
export const relationFacts = [];
