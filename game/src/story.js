// Source: kiss-at-the-edge-of-the-world@1e775f1, canonical S01–S66 and literary episodes 3–7 through Eric S28/S49 and Nick S29/S52.
// M3 scene boundaries are not release endings. EN falls back to RU pending verified localization.
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
import {
  s07Intro, s07WeatherNick, s07SeatNick, s07CommonA,
  s07CameraAccepted, s07CameraDeclined, s07CameraNegotiated,
  s07CommonB, s07ArchiveNick, s07ArchiveGroup, s07ArchivePrivate,
  s07CommonC, s07EricFavorite, s07EricMusic,
} from './scenes/s07.js';
import { s08Intro, s08WeatherDamir, s08Common, s08Warm, s08Neutral, s08Personal } from './scenes/s08.js';
import {
  s66Intro, s66DamirWarm, s66DamirNeutral, s66DamirPersonal,
  s66CommonA, s66CareerPeople, s66CareerPlace, s66CareerOwn, s66CommonB,
} from './scenes/s66.js';
import {
  s09Intro, s09Erik, s09Nick, s09Damir,
  s09CommonA, s09CareerPeople, s09CareerPlace, s09CareerOwn, s09CommonB,
} from './scenes/s09.js';
import {
  s10Intro, s10SeatEric, s10SeatOther, s10Playful, s10Quiet, s10Common,
} from './scenes/s10.js';
import {
  s11Intro, s11CameraAccepted, s11CameraDeclined, s11CameraNegotiated,
  s11CommonA, s11SafePoint, s11LeaveWater, s11CheckRules, s11CommonB,
} from './scenes/s11.js';
import {
  s12Intro, s12CareWarm, s12CareNeutral, s12CarePersonal, s12CommonA,
  s12VoiceDamir, s12VoiceOther, s12CommonB, s12PastListen, s12PastPause,
  s12CommonC, s12DraftDamir, s12DraftPrivate, s12CommonD,
  s12ReturnChocolate, s12ReturnAlone,
} from './scenes/s12.js';
import {
  s13Intro, s13VoiceEric, s13VoiceNick, s13VoiceDamir,
  s13CommonA, s13WorkEditor, s13WorkShared, s13CommonB,
  s13ReturnChocolate, s13ReturnAlone,
} from './scenes/s13.js';
import {
  s14Intro, s14TonePlayful, s14ToneQuiet, s14CommonA,
  s14PaceSlow, s14PaceShort, s14CommonB, s14GestureWalk, s14GesturePhoto,
} from './scenes/s14.js';
import {
  s15Intro, s15NickVoice, s15OtherVoice, s15CommonA,
  s15Privacy, s15Observed, s15SharedFile, s15CommonB,
  s15EveningWalk, s15EveningPhoto,
} from './scenes/s15.js';
import { s16Intro, s16Tea, s16Room, s16Common } from './scenes/s16.js';
import {
  s17Intro, s17NickPrivate, s17NickObserved, s17NickShared, s17CommonA,
  s17Editor, s17Shared, s17DamirTea, s17DamirRoom, s17GroupPlan,
  s17GroupLaundry, s17GroupKitchen, s17GroupBreak, s17CommonB,
} from './scenes/s17.js';
import {
  s18Intro, s18Kiss, s18Stay, s18Leave, s18Common,
  s18PayoffK, s18PayoffS, s18PayoffL, s18Postcards, s18Song,
} from './scenes/s18.js';
import {
  s19Intro, s19PrivatePhoto, s19NoPhoto, s19AskTomorrow, s19CommonA,
  s19Kiss, s19Hug, s19Distance, s19CommonB,
  s19PhotoA, s19PhotoB, s19PhotoC, s19Day10,
  s19KissPayoff, s19HugPayoff, s19DistancePayoff,
  s19CameraFree, s19Breakfast,
} from './scenes/s19.js';
import {
  s20Intro, s20Kiss, s20Tea, s20Leave, s20Common,
  s20PayoffK, s20PayoffT, s20PayoffL, s20Breakfast, s20Waterfront,
} from './scenes/s20.js';
import {
  s21Intro, s21ChoiceNote, s21People, s21Place, s21Own, s21Common,
  s21ReplyA, s21ReplyB, s21ReplyC, s21Friend, s21Bookstore,
} from './scenes/s21.js';
import {
  s61Intro, s61ReplyA, s61ReplyB, s61ReplyC, s61CommonA,
  s61StayAlone, s61Rejoin, s61CommonB, s61FriendPayoff, s61BookstorePayoff,
} from './scenes/s61.js';
import {
  s22Intro, s22WeatherNick, s22WeatherErik, s22WeatherDamir,
  s22CommonA, s22RepairRoles, s22RepairAnger, s22CommonB,
  s22StopGroup, s22StopNotes,
} from './scenes/s22.js';
import {
  s23Intro, s23EveningEric, s23EveningNick, s23EveningDamir, s23EveningAlice,
  s23ContactKiss, s23ContactStay, s23ContactLeave, s23CommonA,
  s23ChoiceRead, s23ChoiceTrial, s23CommonB, s23RepairRoles, s23RepairAnger,
  s23StopGroup, s23StopNotes, s23FollowupPostcards, s23FollowupSong,
} from './scenes/s23.js';
import {
  s24Intro, s24EveningEric, s24EveningNick, s24EveningDamir, s24EveningAlice,
  s24ContactKiss, s24ContactHug, s24ContactDistance, s24CommonA,
  s24ChoiceLimited, s24ChoiceNoReview, s24CommonB,
  s24FollowupCameraFree, s24FollowupBreakfast,
} from './scenes/s24.js';
import {
  s25Intro, s25EveningEric, s25EveningNick, s25EveningDamir, s25EveningAlice,
  s25ContactKiss, s25ContactTea, s25ContactLeave, s25CommonA,
  s25ChoiceScheduled, s25ChoiceWait, s25CommonB,
  s25EricPage, s25EricReaders, s25FollowupShopping, s25FollowupWaterfront,
} from './scenes/s25.js';
import {
  s58Intro, s58ChoiceEric, s58ChoiceNick, s58ChoiceDamir, s58ChoiceAlone,
  s58CommonA, s58PayoffDamir, s58PayoffOther, s58CommonB,
} from './scenes/s58.js';
import * as s26 from './scenes/s26.js';
import * as s27 from './scenes/s27.js';
import * as s59 from './scenes/s59.js';
import * as s28 from './scenes/s28.js';
import * as s49 from './scenes/s49.js';
import * as s29 from './scenes/s29.js';
import * as s52 from './scenes/s52.js';
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
  { id: 's06-favorite-place', beats: beats('s06-favorite-place', s06FavoritePlace), nextSceneId: 's07-intro' },
  { id: 's06-music', beats: beats('s06-music', s06Music), nextSceneId: 's07-intro' },
  { id: 's07-intro', beats: [
    ...beats('s07-intro', s07Intro),
    // Optional S05 Nick callback; no prose is added for weather choice Erik/Damir.
    { id: 's07-weather-dispatch', type: 'choice', choices: [
      { id: 'nick', label: t('Продолжить'), targetSceneId: 's07-weather-nick',
        when: { flag: 'weather-choice-nick' } },
      { id: 'other', label: t('Продолжить'), targetSceneId: 's07-seat-dispatch',
        when: { any: [{ flag: 'weather-choice-erik' }, { flag: 'weather-choice-damir' }] } },
    ] },
  ] },
  { id: 's07-weather-nick', beats: beats('s07-weather-nick', s07WeatherNick), nextSceneId: 's07-seat-dispatch' },
  { id: 's07-seat-dispatch', beats: [
    // Conditional continuation for the optional S01 Nick paragraph.
    { id: 's07-seat-dispatch', type: 'choice', choices: [
      { id: 'nick', label: t('Продолжить'), targetSceneId: 's07-seat-nick',
        when: { flag: 's01-seat-nick' } },
      { id: 'other', label: t('Продолжить'), targetSceneId: 's07-common-a',
        when: { any: [{ flag: 's01-seat-eric' }, { flag: 's01-seat-damir' }] } },
    ] },
  ] },
  { id: 's07-seat-nick', beats: beats('s07-seat-nick', s07SeatNick), nextSceneId: 's07-common-a' },
  { id: 's07-common-a', beats: [
    ...beats('s07-common-a', s07CommonA),
    // Reuse the exact prior camera consent state; no implied recording consent.
    { id: 's07-consent-dispatch', type: 'choice', choices: [
      { id: 'accepted', label: t('Продолжить'), targetSceneId: 's07-camera-accepted',
        when: { flag: 'consent-camera-accepted' } },
      { id: 'declined', label: t('Продолжить'), targetSceneId: 's07-camera-declined',
        when: { flag: 'consent-camera-declined-respected' } },
      { id: 'negotiated', label: t('Продолжить'), targetSceneId: 's07-camera-negotiated',
        when: { flag: 'consent-camera-negotiated' } },
    ] },
  ] },
  { id: 's07-camera-accepted', beats: beats('s07-camera-accepted', s07CameraAccepted), nextSceneId: 's07-common-b' },
  { id: 's07-camera-declined', beats: beats('s07-camera-declined', s07CameraDeclined), nextSceneId: 's07-common-b' },
  { id: 's07-camera-negotiated', beats: beats('s07-camera-negotiated', s07CameraNegotiated), nextSceneId: 's07-common-b' },
  { id: 's07-common-b', beats: [
    ...beats('s07-common-b', s07CommonB),
    { id: 's07-archive-choice', type: 'choice', choices: [
      { id: 'nick', label: t('Снимок Ника у стола'), targetSceneId: 's07-archive-nick',
        effects: [{ op: 'flag_set', id: 'kitchen-archive-nick', value: true }] },
      { id: 'group', label: t('Групповой кадр с таймером'), targetSceneId: 's07-archive-group',
        effects: [{ op: 'flag_set', id: 'kitchen-archive-group', value: true }] },
      { id: 'private', label: t('Ничего не сохранять'), targetSceneId: 's07-archive-private',
        effects: [{ op: 'flag_set', id: 'kitchen-archive-private', value: true }] },
    ] },
  ] },
  { id: 's07-archive-nick', beats: beats('s07-archive-nick', s07ArchiveNick), nextSceneId: 's07-common-c' },
  { id: 's07-archive-group', beats: beats('s07-archive-group', s07ArchiveGroup), nextSceneId: 's07-common-c' },
  { id: 's07-archive-private', beats: beats('s07-archive-private', s07ArchivePrivate), nextSceneId: 's07-common-c' },
  { id: 's07-common-c', beats: [
    ...beats('s07-common-c', s07CommonC),
    // Authored S06-C2 payoff after the archive scene.
    { id: 's07-s06-dispatch', type: 'choice', choices: [
      { id: 'favorite', label: t('Продолжить'), targetSceneId: 's07-eric-favorite',
        when: { flag: 'eric-map-favorite-place' } },
      { id: 'music', label: t('Продолжить'), targetSceneId: 's07-eric-music',
        when: { flag: 'eric-map-music' } },
    ] },
  ] },
  { id: 's07-eric-favorite', beats: beats('s07-eric-favorite', s07EricFavorite), nextSceneId: 's08-intro' },
  { id: 's07-eric-music', beats: beats('s07-eric-music', s07EricMusic), nextSceneId: 's08-intro' },
  { id: 's08-intro', beats: [
    ...beats('s08-intro', s08Intro),
    { id: 's08-weather-dispatch', type: 'choice', choices: [
      { id: 'damir', label: t('Продолжить'), targetSceneId: 's08-weather-damir',
        when: { flag: 'weather-choice-damir' } },
      { id: 'other', label: t('Продолжить'), targetSceneId: 's08-common',
        when: { any: [{ flag: 'weather-choice-nick' }, { flag: 'weather-choice-erik' }] } },
    ] },
  ] },
  { id: 's08-weather-damir', beats: beats('s08-weather-damir', s08WeatherDamir), nextSceneId: 's08-common' },
  { id: 's08-common', beats: [
    ...beats('s08-common', s08Common),
    { id: 's08-damir-care-choice', type: 'choice', choices: [
      { id: 'warm', label: t('Предложить Дамиру кофе'), targetSceneId: 's08-warm',
        effects: [{ op: 'flag_set', id: 'damir-care-warm', value: true }] },
      { id: 'neutral', label: t('Поблагодарить и уйти'), targetSceneId: 's08-neutral',
        effects: [{ op: 'flag_set', id: 'damir-care-neutral', value: true }] },
      { id: 'personal', label: t('Спросить о Брюсселе'), targetSceneId: 's08-personal',
        effects: [{ op: 'flag_set', id: 'damir-care-personal', value: true }] },
    ] },
  ] },
  { id: 's08-warm', beats: beats('s08-warm', s08Warm), nextSceneId: 's66-intro' },
  { id: 's08-neutral', beats: beats('s08-neutral', s08Neutral), nextSceneId: 's66-intro' },
  { id: 's08-personal', beats: beats('s08-personal', s08Personal), nextSceneId: 's66-intro' },
  { id: 's66-intro', beats: [
    ...beats('s66-intro', s66Intro),
    // Ludory N1 conditional choices are technical Continue actions, not authored decisions.
    { id: 's66-damir-dispatch', type: 'choice', choices: [
      { id: 'warm', label: t('Продолжить'), targetSceneId: 's66-damir-warm',
        when: { flag: 'damir-care-warm' } },
      { id: 'neutral', label: t('Продолжить'), targetSceneId: 's66-damir-neutral',
        when: { flag: 'damir-care-neutral' } },
      { id: 'personal', label: t('Продолжить'), targetSceneId: 's66-damir-personal',
        when: { flag: 'damir-care-personal' } },
    ] },
  ] },
  { id: 's66-damir-warm', beats: beats('s66-damir-warm', s66DamirWarm), nextSceneId: 's66-common-a' },
  { id: 's66-damir-neutral', beats: beats('s66-damir-neutral', s66DamirNeutral), nextSceneId: 's66-common-a' },
  { id: 's66-damir-personal', beats: beats('s66-damir-personal', s66DamirPersonal), nextSceneId: 's66-common-a' },
  { id: 's66-common-a', beats: [
    ...beats('s66-common-a', s66CommonA),
    { id: 's66-career-dispatch', type: 'choice', choices: [
      { id: 'people', label: t('Продолжить'), targetSceneId: 's66-career-people',
        when: { flag: 'career-thesis-people' } },
      { id: 'place', label: t('Продолжить'), targetSceneId: 's66-career-place',
        when: { flag: 'career-thesis-place' } },
      { id: 'own-choice', label: t('Продолжить'), targetSceneId: 's66-career-own',
        when: { flag: 'career-thesis-own-choice' } },
    ] },
  ] },
  { id: 's66-career-people', beats: beats('s66-career-people', s66CareerPeople), nextSceneId: 's66-common-b' },
  { id: 's66-career-place', beats: beats('s66-career-place', s66CareerPlace), nextSceneId: 's66-common-b' },
  { id: 's66-career-own', beats: beats('s66-career-own', s66CareerOwn), nextSceneId: 's66-common-b' },
  { id: 's66-common-b', beats: beats('s66-common-b', s66CommonB), nextSceneId: 's09-intro' },
  { id: 's09-intro', beats: [
    ...beats('s09-intro', s09Intro),
    { id: 's09-voice-choice', type: 'choice', choices: [
      { id: 'eric', label: t('Попросить Эрика показать место, которое он сам запомнил'),
        targetSceneId: 's09-eric', effects: [{ op: 'flag_set', id: 'skogafoss-voice-eric', value: true }] },
      { id: 'nick', label: t('Попросить Ника назвать то, что камера пропустила'),
        targetSceneId: 's09-nick', effects: [{ op: 'flag_set', id: 'skogafoss-voice-nick', value: true }] },
      { id: 'damir', label: t('Попросить Дамира вспомнить момент подъёма'),
        targetSceneId: 's09-damir', effects: [{ op: 'flag_set', id: 'skogafoss-voice-damir', value: true }] },
    ] },
  ] },
  { id: 's09-eric', beats: beats('s09-eric', s09Erik), nextSceneId: 's09-common-a' },
  { id: 's09-nick', beats: beats('s09-nick', s09Nick), nextSceneId: 's09-common-a' },
  { id: 's09-damir', beats: beats('s09-damir', s09Damir), nextSceneId: 's09-common-a' },
  { id: 's09-common-a', beats: [
    ...beats('s09-common-a', s09CommonA),
    // Technical state-dependent Continue; not another authored choice.
    { id: 's09-career-dispatch', type: 'choice', choices: [
      { id: 'people', label: t('Продолжить'), targetSceneId: 's09-career-people',
        when: { flag: 'career-thesis-people' } },
      { id: 'place', label: t('Продолжить'), targetSceneId: 's09-career-place',
        when: { flag: 'career-thesis-place' } },
      { id: 'own-choice', label: t('Продолжить'), targetSceneId: 's09-career-own',
        when: { flag: 'career-thesis-own-choice' } },
    ] },
  ] },
  { id: 's09-career-people', beats: beats('s09-career-people', s09CareerPeople), nextSceneId: 's09-common-b' },
  { id: 's09-career-place', beats: beats('s09-career-place', s09CareerPlace), nextSceneId: 's09-common-b' },
  { id: 's09-career-own', beats: beats('s09-career-own', s09CareerOwn), nextSceneId: 's09-common-b' },
  { id: 's09-common-b', beats: beats('s09-common-b', s09CommonB), nextSceneId: 's10-intro' },
  { id: 's10-intro', beats: [
    ...beats('s10-intro', s10Intro),
    // Previously authored S01 seat preference chooses exactly one S10 callback.
    { id: 's10-seat-dispatch', type: 'choice', choices: [
      { id: 'eric', label: t('Продолжить'), targetSceneId: 's10-seat-eric',
        when: { flag: 's01-seat-eric' } },
      { id: 'other', label: t('Продолжить'), targetSceneId: 's10-seat-other',
        when: { any: [{ flag: 's01-seat-nick' }, { flag: 's01-seat-damir' }] } },
    ] },
  ] },
  { id: 's10-seat-eric', beats: beats('s10-seat-eric', s10SeatEric), nextSceneId: 's10-choice' },
  { id: 's10-seat-other', beats: beats('s10-seat-other', s10SeatOther), nextSceneId: 's10-choice' },
  { id: 's10-choice', beats: [
    { id: 's10-tone-choice', type: 'choice', choices: [
      { id: 'playful', label: t('Подхватить игру'), targetSceneId: 's10-playful',
        effects: [{ op: 'flag_set', id: 'eric-tone-playful', value: true }] },
      { id: 'quiet', label: t('Оставить момент тихим'), targetSceneId: 's10-quiet',
        effects: [{ op: 'flag_set', id: 'eric-tone-quiet', value: true }] },
    ] },
  ] },
  { id: 's10-playful', beats: beats('s10-playful', s10Playful), nextSceneId: 's10-common' },
  { id: 's10-quiet', beats: beats('s10-quiet', s10Quiet), nextSceneId: 's10-common' },
  { id: 's10-common', beats: beats('s10-common', s10Common), nextSceneId: 's11-intro' },
  { id: 's11-intro', beats: [
    ...beats('s11-intro', s11Intro),
    // S04 camera consent chooses the opening callback, but cannot authorize new recording.
    { id: 's11-consent-dispatch', type: 'choice', choices: [
      { id: 'accepted', label: t('Продолжить'), targetSceneId: 's11-camera-accepted',
        when: { flag: 'consent-camera-accepted' } },
      { id: 'declined', label: t('Продолжить'), targetSceneId: 's11-camera-declined',
        when: { flag: 'consent-camera-declined-respected' } },
      { id: 'negotiated', label: t('Продолжить'), targetSceneId: 's11-camera-negotiated',
        when: { flag: 'consent-camera-negotiated' } },
    ] },
  ] },
  { id: 's11-camera-accepted', beats: beats('s11-camera-accepted', s11CameraAccepted), nextSceneId: 's11-common-a' },
  { id: 's11-camera-declined', beats: beats('s11-camera-declined', s11CameraDeclined), nextSceneId: 's11-common-a' },
  { id: 's11-camera-negotiated', beats: beats('s11-camera-negotiated', s11CameraNegotiated), nextSceneId: 's11-common-a' },
  { id: 's11-common-a', beats: [
    ...beats('s11-common-a', s11CommonA),
    // Canonical S11-C1 is about a safe camera response, not romantic route or new consent.
    { id: 's11-safety-choice', type: 'choice', choices: [
      { id: 'a', label: t('Предложить безопасную точку для того же замысла'), targetSceneId: 's11-safe-point',
        effects: [
          { op: 'flag_set', id: 'beach-footage-safe-only', value: true },
          { op: 'flag_set', id: 'nick-safety-changed-position', value: true },
        ] },
      { id: 'b', label: t('Попросить всех уйти от воды, не обсуждая кадр сейчас'), targetSceneId: 's11-leave-water',
        effects: [
          { op: 'flag_set', id: 'beach-footage-none', value: true },
          { op: 'flag_set', id: 'nick-safety-deleted', value: true },
        ] },
      { id: 'c', label: t('Предложить сначала разобраться с правилами, затем решить вопрос о съёмке'), targetSceneId: 's11-check-rules',
        effects: [
          { op: 'flag_set', id: 'beach-footage-safe-only', value: true },
          { op: 'flag_set', id: 'nick-safety-asked-then-reframed', value: true },
        ] },
    ] },
  ] },
  { id: 's11-safe-point', beats: beats('s11-safe-point', s11SafePoint), nextSceneId: 's11-common-b' },
  { id: 's11-leave-water', beats: beats('s11-leave-water', s11LeaveWater), nextSceneId: 's11-common-b' },
  { id: 's11-check-rules', beats: beats('s11-check-rules', s11CheckRules), nextSceneId: 's11-common-b' },
  { id: 's11-common-b', beats: beats('s11-common-b', s11CommonB), nextSceneId: 's12-intro' },
  { id: 's12-intro', beats: [
    ...beats('s12-intro', s12Intro),
    // The S08-C1 care decision changes only S12's corresponding authored callback.
    { id: 's12-care-dispatch', type: 'choice', choices: [
      { id: 'warm', label: t('Продолжить'), targetSceneId: 's12-care-warm',
        when: { flag: 'damir-care-warm' } },
      { id: 'neutral', label: t('Продолжить'), targetSceneId: 's12-care-neutral',
        when: { flag: 'damir-care-neutral' } },
      { id: 'personal', label: t('Продолжить'), targetSceneId: 's12-care-personal',
        when: { flag: 'damir-care-personal' } },
    ] },
  ] },
  { id: 's12-care-warm', beats: beats('s12-care-warm', s12CareWarm), nextSceneId: 's12-common-a' },
  { id: 's12-care-neutral', beats: beats('s12-care-neutral', s12CareNeutral), nextSceneId: 's12-common-a' },
  { id: 's12-care-personal', beats: beats('s12-care-personal', s12CarePersonal), nextSceneId: 's12-common-a' },
  { id: 's12-common-a', beats: [
    ...beats('s12-common-a', s12CommonA),
    // S09-C1 is a historical voice preference, not a new player decision.
    { id: 's12-voice-dispatch', type: 'choice', choices: [
      { id: 'damir', label: t('Продолжить'), targetSceneId: 's12-voice-damir',
        when: { flag: 'skogafoss-voice-damir' } },
      { id: 'other', label: t('Продолжить'), targetSceneId: 's12-voice-other',
        when: { any: [{ flag: 'skogafoss-voice-eric' }, { flag: 'skogafoss-voice-nick' }] } },
    ] },
  ] },
  { id: 's12-voice-damir', beats: beats('s12-voice-damir', s12VoiceDamir), nextSceneId: 's12-common-b' },
  { id: 's12-voice-other', beats: beats('s12-voice-other', s12VoiceOther), nextSceneId: 's12-common-b' },
  { id: 's12-common-b', beats: [
    ...beats('s12-common-b', s12CommonB),
    { id: 's12-past-choice', type: 'choice', choices: [
      { id: 'listen', label: t('Спросить о людях, которые теперь рядом с ним'), targetSceneId: 's12-past-listen',
        effects: [{ op: 'flag_set', id: 'damir-past-listen', value: true }] },
      { id: 'pause', label: t('Попросить оставить разговор на сегодня'), targetSceneId: 's12-past-pause',
        effects: [{ op: 'flag_set', id: 'damir-past-pause', value: true }] },
    ] },
  ] },
  { id: 's12-past-listen', beats: beats('s12-past-listen', s12PastListen), nextSceneId: 's12-common-c' },
  { id: 's12-past-pause', beats: beats('s12-past-pause', s12PastPause), nextSceneId: 's12-common-c' },
  { id: 's12-common-c', beats: [
    ...beats('s12-common-c', s12CommonC),
    { id: 's12-draft-choice', type: 'choice', choices: [
      { id: 'damir', label: t('Показать две строки'), targetSceneId: 's12-draft-damir',
        effects: [{ op: 'flag_set', id: 'draft-shared-damir', value: true }] },
      { id: 'private', label: t('Оставить черновик у себя'), targetSceneId: 's12-draft-private',
        effects: [{ op: 'flag_set', id: 'draft-shared-private', value: true }] },
    ] },
  ] },
  { id: 's12-draft-damir', beats: beats('s12-draft-damir', s12DraftDamir), nextSceneId: 's12-common-d' },
  { id: 's12-draft-private', beats: beats('s12-draft-private', s12DraftPrivate), nextSceneId: 's12-common-d' },
  { id: 's12-common-d', beats: [
    ...beats('s12-common-d', s12CommonD),
    // Pinned EP03 source places its third authored S12 choice after the common evening.
    // Retain that order verbatim; editorial continuity is noted for a later review.
    { id: 's12-return-choice', type: 'choice', choices: [
      { id: 'chocolate', label: t('Позвать его зайти за горячим шоколадом'), targetSceneId: 's12-return-chocolate',
        effects: [{ op: 'flag_set', id: 's12-return-chocolate', value: true }] },
      { id: 'alone', label: t('Вернуться к группе одной'), targetSceneId: 's12-return-alone',
        effects: [{ op: 'flag_set', id: 's12-return-alone', value: true }] },
    ] },
  ] },
  { id: 's12-return-chocolate', beats: beats('s12-return-chocolate', s12ReturnChocolate), nextSceneId: 's13-intro' },
  { id: 's12-return-alone', beats: beats('s12-return-alone', s12ReturnAlone), nextSceneId: 's13-intro' },
  { id: 's13-intro', beats: [
    ...beats('s13-intro', s13Intro),
    // The exact S09-C1 waterfall voice appears here in three distinct authored variants.
    { id: 's13-voice-dispatch', type: 'choice', choices: [
      { id: 'eric', label: t('Продолжить'), targetSceneId: 's13-voice-eric',
        when: { flag: 'skogafoss-voice-eric' } },
      { id: 'nick', label: t('Продолжить'), targetSceneId: 's13-voice-nick',
        when: { flag: 'skogafoss-voice-nick' } },
      { id: 'damir', label: t('Продолжить'), targetSceneId: 's13-voice-damir',
        when: { flag: 'skogafoss-voice-damir' } },
    ] },
  ] },
  { id: 's13-voice-eric', beats: beats('s13-voice-eric', s13VoiceEric), nextSceneId: 's13-common-a' },
  { id: 's13-voice-nick', beats: beats('s13-voice-nick', s13VoiceNick), nextSceneId: 's13-common-a' },
  { id: 's13-voice-damir', beats: beats('s13-voice-damir', s13VoiceDamir), nextSceneId: 's13-common-a' },
  { id: 's13-common-a', beats: [
    ...beats('s13-common-a', s13CommonA),
    { id: 's13-work-choice', type: 'choice', choices: [
      { id: 'editor', label: t('Вести заметку самой и отвечать за согласие каждого'),
        targetSceneId: 's13-work-editor',
        effects: [{ op: 'flag_set', id: 'alice-leads-editor', value: true }] },
      { id: 'shared', label: t('Отказаться от роли распорядителя и договориться о равном сборе материала'),
        targetSceneId: 's13-work-shared',
        effects: [{ op: 'flag_set', id: 'alice-leads-shared', value: true }] },
    ] },
  ] },
  { id: 's13-work-editor', beats: beats('s13-work-editor', s13WorkEditor), nextSceneId: 's13-common-b' },
  { id: 's13-work-shared', beats: beats('s13-work-shared', s13WorkShared), nextSceneId: 's13-common-b' },
  { id: 's13-common-b', beats: [
    ...beats('s13-common-b', s13CommonB),
    // Authored S12-C3 callbacks appear after this shared S13 passage in the manuscript.
    { id: 's13-return-dispatch', type: 'choice', choices: [
      { id: 'chocolate', label: t('Продолжить'), targetSceneId: 's13-return-chocolate',
        when: { flag: 's12-return-chocolate' } },
      { id: 'alone', label: t('Продолжить'), targetSceneId: 's13-return-alone',
        when: { flag: 's12-return-alone' } },
    ] },
  ] },
  { id: 's13-return-chocolate', beats: beats('s13-return-chocolate', s13ReturnChocolate), nextSceneId: 's14-intro' },
  { id: 's13-return-alone', beats: beats('s13-return-alone', s13ReturnAlone), nextSceneId: 's14-intro' },
  { id: 's14-intro', beats: [
    ...beats('s14-intro', s14Intro),
    // A historical S10-C1 tone selects one authored callback, not another choice.
    { id: 's14-tone-dispatch', type: 'choice', choices: [
      { id: 'playful', label: t('Продолжить'), targetSceneId: 's14-tone-playful',
        when: { flag: 'eric-tone-playful' } },
      { id: 'quiet', label: t('Продолжить'), targetSceneId: 's14-tone-quiet',
        when: { flag: 'eric-tone-quiet' } },
    ] },
  ] },
  { id: 's14-tone-playful', beats: beats('s14-tone-playful', s14TonePlayful), nextSceneId: 's14-common-a' },
  { id: 's14-tone-quiet', beats: beats('s14-tone-quiet', s14ToneQuiet), nextSceneId: 's14-common-a' },
  { id: 's14-common-a', beats: [
    ...beats('s14-common-a', s14CommonA),
    { id: 's14-pace-choice', type: 'choice', choices: [
      { id: 'slow', label: t('Попросить идти медленнее и назвать причину'),
        targetSceneId: 's14-pace-slow',
        effects: [{ op: 'flag_set', id: 'eric-pace-slow', value: true }] },
      { id: 'short', label: t('Предложить короткий возврат и взять на себя решение'),
        targetSceneId: 's14-pace-short',
        effects: [{ op: 'flag_set', id: 'eric-pace-short', value: true }] },
    ] },
  ] },
  { id: 's14-pace-slow', beats: beats('s14-pace-slow', s14PaceSlow), nextSceneId: 's14-common-b' },
  { id: 's14-pace-short', beats: beats('s14-pace-short', s14PaceShort), nextSceneId: 's14-common-b' },
  { id: 's14-common-b', beats: [
    ...beats('s14-common-b', s14CommonB),
    // S14-C2 appears in the pinned prose but not in the episode's technical state table.
    // Preserve the authored gesture without invented romantic or publishing effects.
    { id: 's14-gesture-choice', type: 'choice', choices: [
      { id: 'walk', label: t('Самой предложить прогуляться вдвоём после ужина'),
        targetSceneId: 's14-gesture-walk',
        effects: [{ op: 'flag_set', id: 'eric-gesture-walk', value: true }] },
      { id: 'photo', label: t('Поделиться с ним забавной находкой с маршрута'),
        targetSceneId: 's14-gesture-photo',
        effects: [{ op: 'flag_set', id: 'eric-gesture-photo', value: true }] },
    ] },
  ] },
  { id: 's14-gesture-walk', beats: beats('s14-gesture-walk', s14GestureWalk), nextSceneId: 's15-intro' },
  { id: 's14-gesture-photo', beats: beats('s14-gesture-photo', s14GesturePhoto), nextSceneId: 's15-intro' },
  { id: 's15-intro', beats: [
    ...beats('s15-intro', s15Intro),
    // S09's Nick narrator has distinct authored prose; Eric and Damir share another.
    { id: 's15-voice-dispatch', type: 'choice', choices: [
      { id: 'nick', label: t('Продолжить'), targetSceneId: 's15-nick-voice',
        when: { flag: 'skogafoss-voice-nick' } },
      { id: 'eric', label: t('Продолжить'), targetSceneId: 's15-other-voice',
        when: { flag: 'skogafoss-voice-eric' } },
      { id: 'damir', label: t('Продолжить'), targetSceneId: 's15-other-voice',
        when: { flag: 'skogafoss-voice-damir' } },
    ] },
  ] },
  { id: 's15-nick-voice', beats: beats('s15-nick-voice', s15NickVoice), nextSceneId: 's15-common-a' },
  { id: 's15-other-voice', beats: beats('s15-other-voice', s15OtherVoice), nextSceneId: 's15-common-a' },
  { id: 's15-common-a', beats: [
    ...beats('s15-common-a', s15CommonA),
    { id: 's15-privacy-choice', type: 'choice', choices: [
      { id: 'a', label: t('Защитить приватность: оставить разговор только между ними'),
        targetSceneId: 's15-privacy', effects: [
          { op: 'flag_set', id: 'nick-failure-private', value: true },
          { op: 'flag_set', id: 'private-text-declined', value: true },
        ] },
      { id: 'b', label: t('Оставить честный материал, но назвать Нику точные границы'),
        targetSceneId: 's15-observed', effects: [
          { op: 'flag_set', id: 'nick-failure-observed', value: true },
          { op: 'flag_set', id: 'private-text-limited', value: true },
        ] },
      { id: 'c', label: t('Предложить совместно выбрать один фрагмент и право остановить его'),
        targetSceneId: 's15-shared-file', effects: [
          { op: 'flag_set', id: 'nick-failure-shared-file', value: true },
          { op: 'flag_set', id: 'private-text-pending', value: true },
        ] },
    ] },
  ] },
  { id: 's15-privacy', beats: beats('s15-privacy', s15Privacy), nextSceneId: 's15-common-b' },
  { id: 's15-observed', beats: beats('s15-observed', s15Observed), nextSceneId: 's15-common-b' },
  { id: 's15-shared-file', beats: beats('s15-shared-file', s15SharedFile), nextSceneId: 's15-common-b' },
  { id: 's15-common-b', beats: [
    ...beats('s15-common-b', s15CommonB),
    // Explicitly authored S15 evening payoff of S14-C2; no romance or consent change.
    { id: 's15-gesture-dispatch', type: 'choice', choices: [
      { id: 'walk', label: t('Продолжить'), targetSceneId: 's15-evening-walk',
        when: { flag: 'eric-gesture-walk' } },
      { id: 'photo', label: t('Продолжить'), targetSceneId: 's15-evening-photo',
        when: { flag: 'eric-gesture-photo' } },
    ] },
  ] },
  { id: 's15-evening-walk', beats: beats('s15-evening-walk', s15EveningWalk), nextSceneId: 's16-intro' },
  { id: 's15-evening-photo', beats: beats('s15-evening-photo', s15EveningPhoto), nextSceneId: 's16-intro' },
  { id: 's16-intro', beats: [
    ...beats('s16-intro', s16Intro),
    { id: 's16-care-choice', type: 'choice', choices: [
      { id: 'a', label: t('Подойти с конкретной заботой и не требовать разговора'),
        targetSceneId: 's16-tea',
        effects: [{ op: 'flag_set', id: 'damir-space-tea', value: true }] },
      { id: 'b', label: t('Дать ему пространство и ясно назвать, когда увидятся снова'),
        targetSceneId: 's16-room',
        effects: [{ op: 'flag_set', id: 'damir-space-room', value: true }] },
    ] },
  ] },
  { id: 's16-tea', beats: beats('s16-tea', s16Tea), nextSceneId: 's16-common' },
  { id: 's16-room', beats: beats('s16-room', s16Room), nextSceneId: 's16-common' },
  { id: 's16-common', beats: beats('s16-common', s16Common), nextSceneId: 's17-intro' },
  { id: 's17-intro', beats: beats('s17-intro', s17Intro), nextSceneId: 's17-n-dispatch' },
  { id: 's17-n-dispatch', beats: [
    { id: 's17-n-dispatch', type: 'choice', choices: [
      { id: 'a', label: t('Продолжить'), targetSceneId: 's17-n-a',
        when: { flag: 'nick-failure-private' } },
      { id: 'b', label: t('Продолжить'), targetSceneId: 's17-n-b',
        when: { flag: 'nick-failure-observed' } },
      { id: 'c', label: t('Продолжить'), targetSceneId: 's17-n-c',
        when: { flag: 'nick-failure-shared-file' } },
    ] },
  ] },
  { id: 's17-n-a', beats: beats('s17-n-a', s17NickPrivate), nextSceneId: 's17-common-a' },
  { id: 's17-n-b', beats: beats('s17-n-b', s17NickObserved), nextSceneId: 's17-common-a' },
  { id: 's17-n-c', beats: beats('s17-n-c', s17NickShared), nextSceneId: 's17-common-a' },
  { id: 's17-common-a', beats: beats('s17-common-a', s17CommonA), nextSceneId: 's17-e-dispatch' },
  { id: 's17-e-dispatch', beats: [
    { id: 's17-e-dispatch', type: 'choice', choices: [
      { id: 'a', label: t('Продолжить'), targetSceneId: 's17-e-a',
        when: { flag: 'alice-leads-editor' } },
      { id: 'b', label: t('Продолжить'), targetSceneId: 's17-e-b',
        when: { flag: 'alice-leads-shared' } },
    ] },
  ] },
  { id: 's17-e-a', beats: beats('s17-e-a', s17Editor), nextSceneId: 's17-d-dispatch' },
  { id: 's17-e-b', beats: beats('s17-e-b', s17Shared), nextSceneId: 's17-d-dispatch' },
  { id: 's17-d-dispatch', beats: [
    { id: 's17-d-dispatch', type: 'choice', choices: [
      { id: 'a', label: t('Продолжить'), targetSceneId: 's17-d-a',
        when: { flag: 'damir-space-tea' } },
      { id: 'b', label: t('Продолжить'), targetSceneId: 's17-d-b',
        when: { flag: 'damir-space-room' } },
    ] },
  ] },
  { id: 's17-d-a', beats: beats('s17-d-a', s17DamirTea), nextSceneId: 's17-group-choice-scene' },
  { id: 's17-d-b', beats: beats('s17-d-b', s17DamirRoom), nextSceneId: 's17-group-choice-scene' },
  { id: 's17-group-choice-scene', beats: [
    { id: 's17-group-choice', type: 'choice', choices: [
      { id: 'a', label: t('Помочь Эрику с планом завтрашнего дня'),
        targetSceneId: 's17-group-a',
        effects: [{ op: 'flag_set', id: 's17-group-plan', value: true }] },
      { id: 'b', label: t('Разобрать бельё вместе с Ником'),
        targetSceneId: 's17-group-b',
        effects: [{ op: 'flag_set', id: 's17-group-laundry', value: true }] },
      { id: 'c', label: t('Договориться о кухне с Дамиром'),
        targetSceneId: 's17-group-c',
        effects: [{ op: 'flag_set', id: 's17-group-kitchen', value: true }] },
      { id: 'd', label: t('Раздать дела всем, оставив себе паузу'),
        targetSceneId: 's17-group-d',
        effects: [{ op: 'flag_set', id: 's17-group-break', value: true }] },
    ] },
  ] },
  { id: 's17-group-a', beats: beats('s17-group-a', s17GroupPlan), nextSceneId: 's17-common-b' },
  { id: 's17-group-b', beats: beats('s17-group-b', s17GroupLaundry), nextSceneId: 's17-common-b' },
  { id: 's17-group-c', beats: beats('s17-group-c', s17GroupKitchen), nextSceneId: 's17-common-b' },
  { id: 's17-group-d', beats: beats('s17-group-d', s17GroupBreak), nextSceneId: 's17-common-b' },
  { id: 's17-common-b', beats: [
    ...beats('s17-common-b', s17CommonB),
    { id: 's17-evening-choice', type: 'choice', choices: [
      { id: 'eric', label: t('Пойти с Эриком к маяку'),
        targetSceneId: 's18-intro',
        effects: [{ op: 'flag_set', id: 's17-evening-eric', value: true }] },
      { id: 'nick', label: t('Пойти с Ником в бассейн'),
        targetSceneId: 's19-intro',
        effects: [{ op: 'flag_set', id: 's17-evening-nick', value: true }] },
      { id: 'damir', label: t('Принять приглашение Дамира на завтрашний вечер'),
        targetSceneId: 's20-intro',
        effects: [{ op: 'flag_set', id: 's17-evening-damir', value: true }] },
      { id: 'self', label: t('Оставить время себе'),
        targetSceneId: 's21-intro',
        effects: [{ op: 'flag_set', id: 's17-evening-self', value: true }] },
    ] },
  ] },
  { id: 's18-intro', beats: [
    ...beats('s18-intro', s18Intro),
    { id: 's18-contact-choice', type: 'choice', choices: [
      { id: 'kiss', label: t('Поцеловать Эрика'),
        targetSceneId: 's18-kiss',
        effects: [{ op: 'flag_set', id: 'eric-contact-kiss', value: true }] },
      { id: 'stay-without-kiss', label: t('Остаться рядом без поцелуя'),
        targetSceneId: 's18-stay',
        effects: [{ op: 'flag_set', id: 'eric-contact-stay-without-kiss', value: true }] },
      { id: 'leave', label: t('Попросить закончить прогулку'),
        targetSceneId: 's18-leave',
        effects: [{ op: 'flag_set', id: 'eric-contact-leave', value: true }] },
    ] },
  ] },
  { id: 's18-kiss', beats: beats('s18-kiss', s18Kiss), nextSceneId: 's18-common' },
  { id: 's18-stay', beats: beats('s18-stay', s18Stay), nextSceneId: 's18-common' },
  { id: 's18-leave', beats: beats('s18-leave', s18Leave), nextSceneId: 's18-common' },
  { id: 's18-common', beats: beats('s18-common', s18Common), nextSceneId: 's18-payoff-dispatch' },
  { id: 's18-payoff-dispatch', beats: [
    { id: 's18-payoff-dispatch-choice', type: 'choice', choices: [
      { id: 'k', label: t('Продолжить'), targetSceneId: 's18-k',
        when: { flag: 'eric-contact-kiss' } },
      { id: 's', label: t('Продолжить'), targetSceneId: 's18-s',
        when: { flag: 'eric-contact-stay-without-kiss' } },
      { id: 'l', label: t('Продолжить'), targetSceneId: 's18-l',
        when: { flag: 'eric-contact-leave' } },
    ] },
  ] },
  { id: 's18-k', beats: beats('s18-k', s18PayoffK), nextSceneId: 's18-followup-choice-scene' },
  { id: 's18-s', beats: beats('s18-s', s18PayoffS), nextSceneId: 's18-followup-choice-scene' },
  { id: 's18-l', beats: beats('s18-l', s18PayoffL), nextSceneId: 's18-followup-choice-scene' },
  // S18-C2 appears *after* the S22 transition note in EP05; preserve authored order.
  { id: 's18-followup-choice-scene', beats: [
    { id: 's18-followup-choice', type: 'choice', choices: [
      { id: 'postcards', label: t('Спросить о дедушкиных открытках'),
        targetSceneId: 's18-postcards',
        effects: [{ op: 'flag_set', id: 'eric-followup-postcards', value: true }] },
      { id: 'song', label: t('Предложить ему выбрать песню для дороги'),
        targetSceneId: 's18-song',
        effects: [{ op: 'flag_set', id: 'eric-followup-song', value: true }] },
    ] },
  ] },
  { id: 's18-postcards', beats: beats('s18-postcards', s18Postcards), nextSceneId: 's22-intro' },
  { id: 's18-song', beats: beats('s18-song', s18Song), nextSceneId: 's22-intro' },
  // Only the Nick option in S17-C2 enters the exclusive S19 evening.
  { id: 's19-intro', beats: [
    ...beats('s19-intro', s19Intro),
    { id: 's19-photo-choice', type: 'choice', choices: [
      { id: 'alice-private-photo', label: t('Снять тени на телефон Алисы'),
        targetSceneId: 's19-private-photo',
        effects: [{ op: 'flag_set', id: 'nick-photo-alice-private', value: true }] },
      { id: 'no-photo', label: t('Не снимать совсем'),
        targetSceneId: 's19-no-photo',
        effects: [{ op: 'flag_set', id: 'nick-photo-none', value: true }] },
      { id: 'ask-tomorrow', label: t('Предложить сделать снимок завтра днём, если захочется обоим'),
        targetSceneId: 's19-ask-tomorrow',
        effects: [{ op: 'flag_set', id: 'nick-photo-ask-tomorrow', value: true }] },
    ] },
  ] },
  { id: 's19-private-photo', beats: beats('s19-private-photo', s19PrivatePhoto), nextSceneId: 's19-common-a' },
  { id: 's19-no-photo', beats: beats('s19-no-photo', s19NoPhoto), nextSceneId: 's19-common-a' },
  { id: 's19-ask-tomorrow', beats: beats('s19-ask-tomorrow', s19AskTomorrow), nextSceneId: 's19-common-a' },
  { id: 's19-common-a', beats: [
    ...beats('s19-common-a', s19CommonA),
    { id: 's19-contact-choice', type: 'choice', choices: [
      { id: 'kiss', label: t('Самой предложить поцелуй'),
        targetSceneId: 's19-kiss',
        effects: [{ op: 'flag_set', id: 'nick-contact-kiss', value: true }] },
      { id: 'hug', label: t('Обнять его и оставить вечер без поцелуя'),
        targetSceneId: 's19-hug',
        effects: [{ op: 'flag_set', id: 'nick-contact-hug', value: true }] },
      { id: 'distance', label: t('Сохранить дистанцию'),
        targetSceneId: 's19-distance',
        effects: [{ op: 'flag_set', id: 'nick-contact-distance', value: true }] },
    ] },
  ] },
  { id: 's19-kiss', beats: beats('s19-kiss', s19Kiss), nextSceneId: 's19-common-b' },
  { id: 's19-hug', beats: beats('s19-hug', s19Hug), nextSceneId: 's19-common-b' },
  { id: 's19-distance', beats: beats('s19-distance', s19Distance), nextSceneId: 's19-common-b' },
  { id: 's19-common-b', beats: beats('s19-common-b', s19CommonB), nextSceneId: 's19-photo-payoff-dispatch' },
  // The saved photo decision cannot grant publication rights: these are read-only authorial callbacks.
  { id: 's19-photo-payoff-dispatch', beats: [
    { id: 's19-photo-payoff-choice', type: 'choice', choices: [
      { id: 'a', label: t('Продолжить'), targetSceneId: 's19-p-a',
        when: { flag: 'nick-photo-alice-private' } },
      { id: 'b', label: t('Продолжить'), targetSceneId: 's19-p-b',
        when: { flag: 'nick-photo-none' } },
      { id: 'c', label: t('Продолжить'), targetSceneId: 's19-p-c',
        when: { flag: 'nick-photo-ask-tomorrow' } },
    ] },
  ] },
  { id: 's19-p-a', beats: beats('s19-p-a', s19PhotoA), nextSceneId: 's19-day10' },
  { id: 's19-p-b', beats: beats('s19-p-b', s19PhotoB), nextSceneId: 's19-day10' },
  { id: 's19-p-c', beats: beats('s19-p-c', s19PhotoC), nextSceneId: 's19-day10' },
  { id: 's19-day10', beats: beats('s19-day10', s19Day10), nextSceneId: 's19-contact-payoff-dispatch' },
  { id: 's19-contact-payoff-dispatch', beats: [
    { id: 's19-contact-payoff-choice', type: 'choice', choices: [
      { id: 'k', label: t('Продолжить'), targetSceneId: 's19-k',
        when: { flag: 'nick-contact-kiss' } },
      { id: 'h', label: t('Продолжить'), targetSceneId: 's19-h',
        when: { flag: 'nick-contact-hug' } },
      { id: 'd', label: t('Продолжить'), targetSceneId: 's19-d',
        when: { flag: 'nick-contact-distance' } },
    ] },
  ] },
  { id: 's19-k', beats: beats('s19-k', s19KissPayoff), nextSceneId: 's19-followup-choice-scene' },
  { id: 's19-h', beats: beats('s19-h', s19HugPayoff), nextSceneId: 's19-followup-choice-scene' },
  { id: 's19-d', beats: beats('s19-d', s19DistancePayoff), nextSceneId: 's19-followup-choice-scene' },
  // S19-C3 occurs *after* the technical S22 transition in source; preserve both written responses.
  { id: 's19-followup-choice-scene', beats: [
    { id: 's19-followup-choice', type: 'choice', choices: [
      { id: 'camera-free', label: t('Провести часть завтрашнего дня без камер'),
        targetSceneId: 's19-camera-free',
        effects: [{ op: 'flag_set', id: 'nick-followup-camera-free', value: true }] },
      { id: 'breakfast', label: t('Найти место с самым необычным местным завтраком'),
        targetSceneId: 's19-breakfast',
        effects: [{ op: 'flag_set', id: 'nick-followup-breakfast', value: true }] },
    ] },
  ] },
  { id: 's19-camera-free', beats: beats('s19-camera-free', s19CameraFree),
    nextSceneId: 's22-intro' },
  { id: 's19-breakfast', beats: beats('s19-breakfast', s19Breakfast),
    nextSceneId: 's22-intro' },
  // S17-C2 Damir enters this exclusive day-10 dinner; no reconciliation is implied.
  { id: 's20-intro', beats: [
    ...beats('s20-intro', s20Intro),
    { id: 's20-dinner-choice', type: 'choice', choices: [
      { id: 'new-kiss', label: t('Остаться на чай и предложить новый поцелуй'),
        targetSceneId: 's20-kiss',
        effects: [{ op: 'flag_set', id: 'damir-dinner-new-kiss', value: true }] },
      { id: 'tea-without-touch', label: t('Остаться на чай без прикосновения'),
        targetSceneId: 's20-tea',
        effects: [{ op: 'flag_set', id: 'damir-dinner-tea-without-touch', value: true }] },
      { id: 'leave', label: t('Уйти, сохранив честность разговора'),
        targetSceneId: 's20-leave',
        effects: [{ op: 'flag_set', id: 'damir-dinner-leave', value: true }] },
    ] },
  ] },
  { id: 's20-kiss', beats: beats('s20-kiss', s20Kiss), nextSceneId: 's20-common' },
  { id: 's20-tea', beats: beats('s20-tea', s20Tea), nextSceneId: 's20-common' },
  { id: 's20-leave', beats: beats('s20-leave', s20Leave), nextSceneId: 's20-common' },
  { id: 's20-common', beats: beats('s20-common', s20Common), nextSceneId: 's20-payoff-dispatch' },
  { id: 's20-payoff-dispatch', beats: [
    { id: 's20-payoff-choice', type: 'choice', choices: [
      { id: 'k', label: t('Продолжить'), targetSceneId: 's20-k',
        when: { flag: 'damir-dinner-new-kiss' } },
      { id: 't', label: t('Продолжить'), targetSceneId: 's20-t',
        when: { flag: 'damir-dinner-tea-without-touch' } },
      { id: 'l', label: t('Продолжить'), targetSceneId: 's20-l',
        when: { flag: 'damir-dinner-leave' } },
    ] },
  ] },
  { id: 's20-k', beats: beats('s20-k', s20PayoffK), nextSceneId: 's20-followup-choice-scene' },
  { id: 's20-t', beats: beats('s20-t', s20PayoffT), nextSceneId: 's20-followup-choice-scene' },
  { id: 's20-l', beats: beats('s20-l', s20PayoffL), nextSceneId: 's20-followup-choice-scene' },
  // S20-C2 follows the source's S22 transition note; preserve both authored responses.
  { id: 's20-followup-choice-scene', beats: [
    { id: 's20-followup-choice', type: 'choice', choices: [
      { id: 'shopping', label: t('Сходить вместе за продуктами для следующего завтрака'),
        targetSceneId: 's20-breakfast',
        effects: [{ op: 'flag_set', id: 'damir-followup-shopping', value: true }] },
      { id: 'waterfront', label: t('Прогуляться до воды без разговора о прошлом'),
        targetSceneId: 's20-waterfront',
        effects: [{ op: 'flag_set', id: 'damir-followup-waterfront', value: true }] },
    ] },
  ] },
  { id: 's20-breakfast', beats: beats('s20-breakfast', s20Breakfast),
    nextSceneId: 's22-intro' },
  { id: 's20-waterfront', beats: beats('s20-waterfront', s20Waterfront),
    nextSceneId: 's22-intro' },
  // The independent evening is a fully authored S21 → mandatory S61 pair.
  { id: 's21-intro', beats: beats('s21-intro', s21Intro), nextSceneId: 's21-choice-note' },
  { id: 's21-choice-note', beats: [
    ...beats('s21-choice-note', s21ChoiceNote),
    { id: 's21-letter-choice', type: 'choice', choices: [
      { id: 'people', label: t('Начать с людей'), targetSceneId: 's21-people',
        effects: [{ op: 'flag_set', id: 'alice-letter-people', value: true }] },
      { id: 'place', label: t('Начать с места'), targetSceneId: 's21-place',
        effects: [{ op: 'flag_set', id: 'alice-letter-place', value: true }] },
      { id: 'own', label: t('Начать с собственного решения'), targetSceneId: 's21-own',
        effects: [{ op: 'flag_set', id: 'alice-letter-own', value: true }] },
    ] },
  ] },
  { id: 's21-people', beats: beats('s21-people', s21People), nextSceneId: 's21-common' },
  { id: 's21-place', beats: beats('s21-place', s21Place), nextSceneId: 's21-common' },
  { id: 's21-own', beats: beats('s21-own', s21Own), nextSceneId: 's21-common' },
  { id: 's21-common', beats: beats('s21-common', s21Common), nextSceneId: 's21-reply-dispatch' },
  { id: 's21-reply-dispatch', beats: [
    { id: 's21-reply-choice', type: 'choice', choices: [
      { id: 'a', label: t('Продолжить'), targetSceneId: 's21-m-a',
        when: { flag: 'alice-letter-people' } },
      { id: 'b', label: t('Продолжить'), targetSceneId: 's21-m-b',
        when: { flag: 'alice-letter-place' } },
      { id: 'c', label: t('Продолжить'), targetSceneId: 's21-m-c',
        when: { flag: 'alice-letter-own' } },
    ] },
  ] },
  { id: 's21-m-a', beats: beats('s21-m-a', s21ReplyA), nextSceneId: 's21-followup-choice-scene' },
  { id: 's21-m-b', beats: beats('s21-m-b', s21ReplyB), nextSceneId: 's21-followup-choice-scene' },
  { id: 's21-m-c', beats: beats('s21-m-c', s21ReplyC), nextSceneId: 's21-followup-choice-scene' },
  // S21-C2 is appended after the S61 transition marker in the source manuscript.
  { id: 's21-followup-choice-scene', beats: [
    { id: 's21-followup-choice', type: 'choice', choices: [
      { id: 'friend', label: t('Написать подруге о неожиданно приятном вечере'),
        targetSceneId: 's21-friend',
        effects: [{ op: 'flag_set', id: 'alice-self-friend', value: true }] },
      { id: 'bookstore', label: t('Найти на завтра книжный магазин для себя'),
        targetSceneId: 's21-bookstore',
        effects: [{ op: 'flag_set', id: 'alice-self-bookstore', value: true }] },
    ] },
  ] },
  { id: 's21-friend', beats: beats('s21-friend', s21Friend), nextSceneId: 's61-intro' },
  { id: 's21-bookstore', beats: beats('s21-bookstore', s21Bookstore), nextSceneId: 's61-intro' },
  // S61 is mandatory and continues the same sent-letter provenance.
  { id: 's61-intro', beats: beats('s61-intro', s61Intro), nextSceneId: 's61-editor-dispatch' },
  { id: 's61-editor-dispatch', beats: [
    { id: 's61-editor-choice', type: 'choice', choices: [
      { id: 'a', label: t('Продолжить'), targetSceneId: 's61-r-a',
        when: { flag: 'alice-letter-people' } },
      { id: 'b', label: t('Продолжить'), targetSceneId: 's61-r-b',
        when: { flag: 'alice-letter-place' } },
      { id: 'c', label: t('Продолжить'), targetSceneId: 's61-r-c',
        when: { flag: 'alice-letter-own' } },
    ] },
  ] },
  { id: 's61-r-a', beats: beats('s61-r-a', s61ReplyA), nextSceneId: 's61-common-a' },
  { id: 's61-r-b', beats: beats('s61-r-b', s61ReplyB), nextSceneId: 's61-common-a' },
  { id: 's61-r-c', beats: beats('s61-r-c', s61ReplyC), nextSceneId: 's61-common-a' },
  { id: 's61-common-a', beats: [
    ...beats('s61-common-a', s61CommonA),
    { id: 's61-day-choice', type: 'choice', choices: [
      { id: 'alone-longer', label: t('Остаться одной ещё на час'),
        targetSceneId: 's61-stay-alone',
        effects: [{ op: 'flag_set', id: 'alice-day-alone-longer', value: true }] },
      { id: 'return-to-group', label: t('Вернуться к группе сейчас'),
        targetSceneId: 's61-rejoin',
        effects: [{ op: 'flag_set', id: 'alice-day-return-to-group', value: true }] },
    ] },
  ] },
  { id: 's61-stay-alone', beats: beats('s61-stay-alone', s61StayAlone),
    nextSceneId: 's61-common-b' },
  { id: 's61-rejoin', beats: beats('s61-rejoin', s61Rejoin),
    nextSceneId: 's61-common-b' },
  // The source embeds an S22 technical marker after the final shared paragraph;
  // it is stripped from s61CommonB rather than shown as authorial dialogue.
  { id: 's61-common-b', beats: beats('s61-common-b', s61CommonB),
    nextSceneId: 's61-followup-dispatch' },
  // S21-C2's two day-10/11 callbacks are appended after S61's S22 marker in source.
  { id: 's61-followup-dispatch', beats: [
    { id: 's61-followup-payoff-choice', type: 'choice', choices: [
      { id: 'friend', label: t('Продолжить'), targetSceneId: 's61-friend',
        when: { flag: 'alice-self-friend' } },
      { id: 'bookstore', label: t('Продолжить'), targetSceneId: 's61-bookstore',
        when: { flag: 'alice-self-bookstore' } },
    ] },
  ] },
  { id: 's61-friend', beats: beats('s61-friend', s61FriendPayoff),
    nextSceneId: 's22-intro' },
  { id: 's61-bookstore', beats: beats('s61-bookstore', s61BookstorePayoff),
    nextSceneId: 's22-intro' },
  // The four authored EP05 evening/day arcs converge only after their full callbacks.
  { id: 's22-intro', beats: beats('s22-intro', s22Intro), nextSceneId: 's22-weather-dispatch' },
  { id: 's22-weather-dispatch', beats: [
    { id: 's22-weather-choice', type: 'choice', choices: [
      { id: 'nick', label: t('Продолжить'), targetSceneId: 's22-weather-nick',
        when: { flag: 'weather-choice-nick' } },
      { id: 'erik', label: t('Продолжить'), targetSceneId: 's22-weather-erik',
        when: { flag: 'weather-choice-erik' } },
      { id: 'damir', label: t('Продолжить'), targetSceneId: 's22-weather-damir',
        when: { flag: 'weather-choice-damir' } },
    ] },
  ] },
  { id: 's22-weather-nick', beats: beats('s22-weather-nick', s22WeatherNick),
    nextSceneId: 's22-common-a' },
  { id: 's22-weather-erik', beats: beats('s22-weather-erik', s22WeatherErik),
    nextSceneId: 's22-common-a' },
  { id: 's22-weather-damir', beats: beats('s22-weather-damir', s22WeatherDamir),
    nextSceneId: 's22-common-a' },
  { id: 's22-common-a', beats: [
    ...beats('s22-common-a', s22CommonA),
    { id: 's22-repair-choice', type: 'choice', choices: [
      { id: 'roles', label: t('Взять на себя свои разговоры, не обещая за других'),
        targetSceneId: 's22-repair-roles',
        effects: [{ op: 'flag_set', id: 's22-repair-roles', value: true }] },
      { id: 'anger', label: t('Назвать свою злость и затем распределить работу'),
        targetSceneId: 's22-repair-anger',
        effects: [{ op: 'flag_set', id: 's22-repair-anger', value: true }] },
    ] },
  ] },
  { id: 's22-repair-roles', beats: beats('s22-repair-roles', s22RepairRoles),
    nextSceneId: 's22-common-b' },
  { id: 's22-repair-anger', beats: beats('s22-repair-anger', s22RepairAnger),
    nextSceneId: 's22-common-b' },
  { id: 's22-common-b', beats: [
    ...beats('s22-common-b', s22CommonB),
    // S22-C2 was appended after the written arrival/end-of-day paragraph;
    // preserve it without inventing a new date or publication consent.
    { id: 's22-stop-choice', type: 'choice', choices: [
      { id: 'group', label: t('Пойти к воде вместе с группой'),
        targetSceneId: 's22-stop-group',
        effects: [{ op: 'flag_set', id: 's22-stop-group', value: true }] },
      { id: 'notes', label: t('Остаться на несколько минут с собственными заметками'),
        targetSceneId: 's22-stop-notes',
        effects: [{ op: 'flag_set', id: 's22-stop-notes', value: true }] },
    ] },
  ] },
  { id: 's22-stop-group', beats: beats('s22-stop-group', s22StopGroup),
    nextSceneId: 's23-intro' },
  { id: 's22-stop-notes', beats: beats('s22-stop-notes', s22StopNotes),
    nextSceneId: 's23-intro' },
  // S23 has four mutually exclusive eveningState callbacks, sourced from S17.
  { id: 's23-intro', beats: beats('s23-intro', s23Intro),
    nextSceneId: 's23-evening-dispatch' },
  { id: 's23-evening-dispatch', beats: [
    { id: 's23-evening-choice', type: 'choice', choices: [
      { id: 'eric', label: t('Продолжить'), targetSceneId: 's23-evening-eric',
        when: { flag: 's17-evening-eric' } },
      { id: 'nick', label: t('Продолжить'), targetSceneId: 's23-evening-nick',
        when: { flag: 's17-evening-nick' } },
      { id: 'damir', label: t('Продолжить'), targetSceneId: 's23-evening-damir',
        when: { flag: 's17-evening-damir' } },
      { id: 'alice', label: t('Продолжить'), targetSceneId: 's23-evening-alice',
        when: { flag: 's17-evening-self' } },
    ] },
  ] },
  { id: 's23-evening-eric', beats: beats('s23-evening-eric', s23EveningEric),
    nextSceneId: 's23-contact-dispatch' },
  { id: 's23-evening-nick', beats: beats('s23-evening-nick', s23EveningNick),
    nextSceneId: 's23-contact-dispatch' },
  { id: 's23-evening-damir', beats: beats('s23-evening-damir', s23EveningDamir),
    nextSceneId: 's23-contact-dispatch' },
  { id: 's23-evening-alice', beats: beats('s23-evening-alice', s23EveningAlice),
    nextSceneId: 's23-contact-dispatch' },
  // The S18 contact variant only belongs to Eric's evening route.
  { id: 's23-contact-dispatch', beats: [
    { id: 's23-contact-choice', type: 'choice', choices: [
      { id: 'k', label: t('Продолжить'), targetSceneId: 's23-contact-kiss',
        when: { flag: 'eric-contact-kiss' } },
      { id: 's', label: t('Продолжить'), targetSceneId: 's23-contact-stay',
        when: { flag: 'eric-contact-stay-without-kiss' } },
      { id: 'l', label: t('Продолжить'), targetSceneId: 's23-contact-leave',
        when: { flag: 'eric-contact-leave' } },
      { id: 'skip', label: t('Продолжить'), targetSceneId: 's23-common-a',
        when: { any: [
          { flag: 's17-evening-nick' }, { flag: 's17-evening-damir' },
          { flag: 's17-evening-self' },
        ] } },
    ] },
  ] },
  { id: 's23-contact-kiss', beats: beats('s23-contact-kiss', s23ContactKiss),
    nextSceneId: 's23-common-a' },
  { id: 's23-contact-stay', beats: beats('s23-contact-stay', s23ContactStay),
    nextSceneId: 's23-common-a' },
  { id: 's23-contact-leave', beats: beats('s23-contact-leave', s23ContactLeave),
    nextSceneId: 's23-common-a' },
  { id: 's23-common-a', beats: [
    ...beats('s23-common-a', s23CommonA),
    { id: 's23-open-choice', type: 'choice', choices: [
      { id: 'read-page', label: t('Прочитать первую страницу за завтраком'),
        targetSceneId: 's23-choice-read',
        effects: [{ op: 'flag_set', id: 'eric-open-read-page', value: true }] },
      { id: 'trial-readers', label: t('Предложить пробный разбор с будущими учениками'),
        targetSceneId: 's23-choice-trial',
        effects: [{ op: 'flag_set', id: 'eric-open-trial-readers', value: true }] },
    ] },
  ] },
  { id: 's23-choice-read', beats: beats('s23-choice-read', s23ChoiceRead),
    nextSceneId: 's23-common-b' },
  { id: 's23-choice-trial', beats: beats('s23-choice-trial', s23ChoiceTrial),
    nextSceneId: 's23-common-b' },
  { id: 's23-common-b', beats: beats('s23-common-b', s23CommonB),
    nextSceneId: 's23-repair-dispatch' },
  // EP06 appends S22-C1 and S22-C2 callbacks after S23's common ending.
  { id: 's23-repair-dispatch', beats: [
    { id: 's23-repair-choice', type: 'choice', choices: [
      { id: 'roles', label: t('Продолжить'), targetSceneId: 's23-repair-roles',
        when: { flag: 's22-repair-roles' } },
      { id: 'anger', label: t('Продолжить'), targetSceneId: 's23-repair-anger',
        when: { flag: 's22-repair-anger' } },
    ] },
  ] },
  { id: 's23-repair-roles', beats: beats('s23-repair-roles', s23RepairRoles),
    nextSceneId: 's23-stop-dispatch' },
  { id: 's23-repair-anger', beats: beats('s23-repair-anger', s23RepairAnger),
    nextSceneId: 's23-stop-dispatch' },
  { id: 's23-stop-dispatch', beats: [
    { id: 's23-stop-choice', type: 'choice', choices: [
      { id: 'group', label: t('Продолжить'), targetSceneId: 's23-stop-group',
        when: { flag: 's22-stop-group' } },
      { id: 'notes', label: t('Продолжить'), targetSceneId: 's23-stop-notes',
        when: { flag: 's22-stop-notes' } },
    ] },
  ] },
  { id: 's23-stop-group', beats: beats('s23-stop-group', s23StopGroup),
    nextSceneId: 's23-followup-dispatch' },
  { id: 's23-stop-notes', beats: beats('s23-stop-notes', s23StopNotes),
    nextSceneId: 's23-followup-dispatch' },
  // These S18-C2 callbacks are only reachable after an Eric evening.
  { id: 's23-followup-dispatch', beats: [
    { id: 's23-followup-choice', type: 'choice', choices: [
      { id: 'postcards', label: t('Продолжить'), targetSceneId: 's23-followup-postcards',
        when: { flag: 'eric-followup-postcards' } },
      { id: 'song', label: t('Продолжить'), targetSceneId: 's23-followup-song',
        when: { flag: 'eric-followup-song' } },
      { id: 'skip', label: t('Продолжить'), targetSceneId: 's24-intro',
        when: { any: [
          { flag: 's17-evening-nick' }, { flag: 's17-evening-damir' },
          { flag: 's17-evening-self' },
        ] } },
    ] },
  ] },
  { id: 's23-followup-postcards', beats: beats('s23-followup-postcards', s23FollowupPostcards),
    nextSceneId: 's24-intro' },
  { id: 's23-followup-song', beats: beats('s23-followup-song', s23FollowupSong),
    nextSceneId: 's24-intro' },
  // All four day-11 arcs continue into mandatory S24 without a route lock.
  { id: 's24-intro', beats: beats('s24-intro', s24Intro),
    nextSceneId: 's24-evening-dispatch' },
  { id: 's24-evening-dispatch', beats: [
    { id: 's24-evening-choice', type: 'choice', choices: [
      { id: 'eric', label: t('Продолжить'), targetSceneId: 's24-evening-eric',
        when: { flag: 's17-evening-eric' } },
      { id: 'nick', label: t('Продолжить'), targetSceneId: 's24-evening-nick',
        when: { flag: 's17-evening-nick' } },
      { id: 'damir', label: t('Продолжить'), targetSceneId: 's24-evening-damir',
        when: { flag: 's17-evening-damir' } },
      { id: 'alice', label: t('Продолжить'), targetSceneId: 's24-evening-alice',
        when: { flag: 's17-evening-self' } },
    ] },
  ] },
  { id: 's24-evening-eric', beats: beats('s24-evening-eric', s24EveningEric),
    nextSceneId: 's24-contact-dispatch' },
  { id: 's24-evening-nick', beats: beats('s24-evening-nick', s24EveningNick),
    nextSceneId: 's24-contact-dispatch' },
  { id: 's24-evening-damir', beats: beats('s24-evening-damir', s24EveningDamir),
    nextSceneId: 's24-contact-dispatch' },
  { id: 's24-evening-alice', beats: beats('s24-evening-alice', s24EveningAlice),
    nextSceneId: 's24-contact-dispatch' },
  // Nick-only S19-C2 callback; watching footage is not consent to share it.
  { id: 's24-contact-dispatch', beats: [
    { id: 's24-contact-choice', type: 'choice', choices: [
      { id: 'k', label: t('Продолжить'), targetSceneId: 's24-contact-kiss',
        when: { flag: 'nick-contact-kiss' } },
      { id: 'h', label: t('Продолжить'), targetSceneId: 's24-contact-hug',
        when: { flag: 'nick-contact-hug' } },
      { id: 'd', label: t('Продолжить'), targetSceneId: 's24-contact-distance',
        when: { flag: 'nick-contact-distance' } },
      { id: 'skip', label: t('Продолжить'), targetSceneId: 's24-common-a',
        when: { any: [
          { flag: 's17-evening-eric' }, { flag: 's17-evening-damir' },
          { flag: 's17-evening-self' },
        ] } },
    ] },
  ] },
  { id: 's24-contact-kiss', beats: beats('s24-contact-kiss', s24ContactKiss),
    nextSceneId: 's24-common-a' },
  { id: 's24-contact-hug', beats: beats('s24-contact-hug', s24ContactHug),
    nextSceneId: 's24-common-a' },
  { id: 's24-contact-distance', beats: beats('s24-contact-distance', s24ContactDistance),
    nextSceneId: 's24-common-a' },
  { id: 's24-common-a', beats: [
    ...beats('s24-common-a', s24CommonA),
    { id: 's24-nick-choice', type: 'choice', choices: [
      { id: 'limited-review', label: t('Проверить свои кадры вместе с Ником десять минут'),
        targetSceneId: 's24-choice-limited',
        effects: [{ op: 'flag_set', id: 'nick-choice-limited-review', value: true }] },
      { id: 'no-review', label: t('Отказаться от просмотра, остаться на кофе'),
        targetSceneId: 's24-choice-no-review',
        effects: [{ op: 'flag_set', id: 'nick-choice-no-review', value: true }] },
    ] },
  ] },
  { id: 's24-choice-limited', beats: beats('s24-choice-limited', s24ChoiceLimited),
    nextSceneId: 's24-common-b' },
  { id: 's24-choice-no-review', beats: beats('s24-choice-no-review', s24ChoiceNoReview),
    nextSceneId: 's24-common-b' },
  { id: 's24-common-b', beats: beats('s24-common-b', s24CommonB),
    nextSceneId: 's24-followup-dispatch' },
  // Original EP06 appends these S19-C3 callbacks after S24 shared prose.
  { id: 's24-followup-dispatch', beats: [
    { id: 's24-followup-choice', type: 'choice', choices: [
      { id: 'camera-free', label: t('Продолжить'), targetSceneId: 's24-followup-camera-free',
        when: { flag: 'nick-followup-camera-free' } },
      { id: 'breakfast', label: t('Продолжить'), targetSceneId: 's24-followup-breakfast',
        when: { flag: 'nick-followup-breakfast' } },
      { id: 'skip', label: t('Продолжить'), targetSceneId: 's25-intro',
        when: { any: [
          { flag: 's17-evening-eric' }, { flag: 's17-evening-damir' },
          { flag: 's17-evening-self' },
        ] } },
    ] },
  ] },
  { id: 's24-followup-camera-free', beats: beats('s24-followup-camera-free', s24FollowupCameraFree),
    nextSceneId: 's25-intro' },
  { id: 's24-followup-breakfast', beats: beats('s24-followup-breakfast', s24FollowupBreakfast),
    nextSceneId: 's25-intro' },
  // S25: compulsory professional relocation news, no promise to reconcile.
  { id: 's25-intro', beats: beats('s25-intro', s25Intro),
    nextSceneId: 's25-evening-dispatch' },
  { id: 's25-evening-dispatch', beats: [
    { id: 's25-evening-choice', type: 'choice', choices: [
      { id: 'eric', label: t('Продолжить'), targetSceneId: 's25-evening-eric',
        when: { flag: 's17-evening-eric' } },
      { id: 'nick', label: t('Продолжить'), targetSceneId: 's25-evening-nick',
        when: { flag: 's17-evening-nick' } },
      { id: 'damir', label: t('Продолжить'), targetSceneId: 's25-evening-damir',
        when: { flag: 's17-evening-damir' } },
      { id: 'alice', label: t('Продолжить'), targetSceneId: 's25-evening-alice',
        when: { flag: 's17-evening-self' } },
    ] },
  ] },
  { id: 's25-evening-eric', beats: beats('s25-evening-eric', s25EveningEric),
    nextSceneId: 's25-contact-dispatch' },
  { id: 's25-evening-nick', beats: beats('s25-evening-nick', s25EveningNick),
    nextSceneId: 's25-contact-dispatch' },
  { id: 's25-evening-damir', beats: beats('s25-evening-damir', s25EveningDamir),
    nextSceneId: 's25-contact-dispatch' },
  { id: 's25-evening-alice', beats: beats('s25-evening-alice', s25EveningAlice),
    nextSceneId: 's25-contact-dispatch' },
  // Damir-only S20-C1 callbacks must not be displayed on other evenings.
  { id: 's25-contact-dispatch', beats: [
    { id: 's25-contact-choice', type: 'choice', choices: [
      { id: 'kiss', label: t('Продолжить'), targetSceneId: 's25-contact-kiss',
        when: { flag: 'damir-dinner-new-kiss' } },
      { id: 'tea', label: t('Продолжить'), targetSceneId: 's25-contact-tea',
        when: { flag: 'damir-dinner-tea-without-touch' } },
      { id: 'leave', label: t('Продолжить'), targetSceneId: 's25-contact-leave',
        when: { flag: 'damir-dinner-leave' } },
      { id: 'skip', label: t('Продолжить'), targetSceneId: 's25-common-a',
        when: { any: [
          { flag: 's17-evening-eric' }, { flag: 's17-evening-nick' },
          { flag: 's17-evening-self' },
        ] } },
    ] },
  ] },
  { id: 's25-contact-kiss', beats: beats('s25-contact-kiss', s25ContactKiss),
    nextSceneId: 's25-common-a' },
  { id: 's25-contact-tea', beats: beats('s25-contact-tea', s25ContactTea),
    nextSceneId: 's25-common-a' },
  { id: 's25-contact-leave', beats: beats('s25-contact-leave', s25ContactLeave),
    nextSceneId: 's25-common-a' },
  { id: 's25-common-a', beats: [
    ...beats('s25-common-a', s25CommonA),
    { id: 's25-damir-choice', type: 'choice', choices: [
      { id: 'scheduled-talk', label: t('Договориться о разговоре после собеседования'),
        targetSceneId: 's25-choice-scheduled',
        effects: [{ op: 'flag_set', id: 'damir-choice-scheduled-talk', value: true }] },
      { id: 'wait-with-boundary', label: t('Дать время, не обещая ждать'),
        targetSceneId: 's25-choice-wait',
        effects: [{ op: 'flag_set', id: 'damir-choice-wait-with-boundary', value: true }] },
    ] },
  ] },
  { id: 's25-choice-scheduled', beats: beats('s25-choice-scheduled', s25ChoiceScheduled),
    nextSceneId: 's25-common-b' },
  { id: 's25-choice-wait', beats: beats('s25-choice-wait', s25ChoiceWait),
    nextSceneId: 's25-common-b' },
  { id: 's25-common-b', beats: beats('s25-common-b', s25CommonB),
    nextSceneId: 's25-eric-dispatch' },
  // Source S23-C1 is a prior professional program decision, not affection.
  { id: 's25-eric-dispatch', beats: [
    { id: 's25-eric-choice', type: 'choice', choices: [
      { id: 'page', label: t('Продолжить'), targetSceneId: 's25-eric-page',
        when: { flag: 'eric-open-read-page' } },
      { id: 'readers', label: t('Продолжить'), targetSceneId: 's25-eric-readers',
        when: { flag: 'eric-open-trial-readers' } },
    ] },
  ] },
  { id: 's25-eric-page', beats: beats('s25-eric-page', s25EricPage),
    nextSceneId: 's25-followup-dispatch' },
  { id: 's25-eric-readers', beats: beats('s25-eric-readers', s25EricReaders),
    nextSceneId: 's25-followup-dispatch' },
  // Original EP06 places S20-C2 callbacks after S25 shared returning-home prose.
  { id: 's25-followup-dispatch', beats: [
    { id: 's25-followup-choice', type: 'choice', choices: [
      { id: 'shopping', label: t('Продолжить'), targetSceneId: 's25-followup-shopping',
        when: { flag: 'damir-followup-shopping' } },
      { id: 'waterfront', label: t('Продолжить'), targetSceneId: 's25-followup-waterfront',
        when: { flag: 'damir-followup-waterfront' } },
      { id: 'skip', label: t('Продолжить'), targetSceneId: 's58-intro',
        when: { any: [
          { flag: 's17-evening-eric' }, { flag: 's17-evening-nick' },
          { flag: 's17-evening-self' },
        ] } },
    ] },
  ] },
  { id: 's25-followup-shopping', beats: beats('s25-followup-shopping', s25FollowupShopping),
    nextSceneId: 's58-intro' },
  { id: 's25-followup-waterfront', beats: beats('s25-followup-waterfront', s25FollowupWaterfront),
    nextSceneId: 's58-intro' },
  // EP06 S58 is mandatory regardless of previous romance or dinner choice.
  { id: 's58-intro', beats: [
    ...beats('s58-intro', s58Intro),
    { id: 's58-shop-choice', type: 'choice', choices: [
      { id: 'eric', label: t('Пойти с Эриком за хлебом'), targetSceneId: 's58-choice-eric',
        effects: [{ op: 'flag_set', id: 's58-shop-eric', value: true }] },
      { id: 'nick', label: t('Пойти с Ником за зеленью'), targetSceneId: 's58-choice-nick',
        effects: [{ op: 'flag_set', id: 's58-shop-nick', value: true }] },
      { id: 'damir', label: t('Пойти с Дамиром за картофелем'), targetSceneId: 's58-choice-damir',
        effects: [{ op: 'flag_set', id: 's58-shop-damir', value: true }] },
      { id: 'alone', label: t('Выбрать продукты самостоятельно'), targetSceneId: 's58-choice-alone',
        effects: [{ op: 'flag_set', id: 's58-shop-alone', value: true }] },
    ] },
  ] },
  { id: 's58-choice-eric', beats: beats('s58-choice-eric', s58ChoiceEric),
    nextSceneId: 's58-common-a' },
  { id: 's58-choice-nick', beats: beats('s58-choice-nick', s58ChoiceNick),
    nextSceneId: 's58-common-a' },
  { id: 's58-choice-damir', beats: beats('s58-choice-damir', s58ChoiceDamir),
    nextSceneId: 's58-common-a' },
  { id: 's58-choice-alone', beats: beats('s58-choice-alone', s58ChoiceAlone),
    nextSceneId: 's58-common-a' },
  { id: 's58-common-a', beats: beats('s58-common-a', s58CommonA),
    nextSceneId: 's58-payoff-dispatch' },
  // Damir's potato callback is only shown if the player picked his shopping line.
  { id: 's58-payoff-dispatch', beats: [
    { id: 's58-payoff-choice', type: 'choice', choices: [
      { id: 'damir', label: t('Продолжить'), targetSceneId: 's58-payoff-damir',
        when: { flag: 's58-shop-damir' } },
      { id: 'other', label: t('Продолжить'), targetSceneId: 's58-payoff-other',
        when: { any: [
          { flag: 's58-shop-eric' }, { flag: 's58-shop-nick' },
          { flag: 's58-shop-alone' },
        ] } },
    ] },
  ] },
  { id: 's58-payoff-damir', beats: beats('s58-payoff-damir', s58PayoffDamir),
    nextSceneId: 's58-common-b' },
  { id: 's58-payoff-other', beats: beats('s58-payoff-other', s58PayoffOther),
    nextSceneId: 's58-common-b' },
  { id: 's58-common-b', beats: beats('s58-common-b', s58CommonB),
    nextSceneId: 's26-intro' },
  // S26 is the sole conscious four-way route lock. Previous evenings do not gate it.
  { id: 's26-intro', beats: [
    ...beats('s26-intro', s26.s26Intro),
    { id: 's26-route-choice', type: 'choice', choices: [
      { id: 'eric', label: t('Выбрать Эрика'), targetSceneId: 's26-choice-eric',
        effects: [{ op: 'route_intent', id: 'eric' }, { op: 'route_lock', id: 'eric' }] },
      { id: 'nick', label: t('Выбрать Ника'), targetSceneId: 's26-choice-nick',
        effects: [{ op: 'route_intent', id: 'nick' }, { op: 'route_lock', id: 'nick' }] },
      { id: 'damir', label: t('Выбрать Дамира'), targetSceneId: 's26-choice-damir',
        effects: [{ op: 'route_intent', id: 'damir' }, { op: 'route_lock', id: 'damir' }] },
      { id: 'alice', label: t('Выбрать самостоятельный путь Алисы'), targetSceneId: 's26-choice-alice',
        effects: [{ op: 'route_intent', id: 'alice' }, { op: 'route_lock', id: 'alice' }] },
    ] },
  ] },
  { id: 's26-choice-eric', beats: beats('s26-choice-eric', s26.s26ChoiceEric),
    nextSceneId: 's26-eric-evening-dispatch' },
  { id: 's26-eric-evening-dispatch', beats: [
    { id: 's26-eric-evening-choice', type: 'choice', choices: [
      { id: 'eric', label: t('Продолжить'),
        targetSceneId: 's26-callback-eric-eric', when: { flag: 's17-evening-eric' } },
      { id: 'nick', label: t('Продолжить'),
        targetSceneId: 's26-callback-eric-nick', when: { flag: 's17-evening-nick' } },
      { id: 'damir', label: t('Продолжить'),
        targetSceneId: 's26-callback-eric-damir', when: { flag: 's17-evening-damir' } },
      { id: 'self', label: t('Продолжить'),
        targetSceneId: 's26-callback-eric-self', when: { flag: 's17-evening-self' } },
    ] },
  ] },
  { id: 's26-callback-eric-eric',
    beats: beats('s26-callback-eric-eric', s26.s26CallbackEricEric),
    nextSceneId: 's26-common-eric' },
  { id: 's26-callback-eric-nick',
    beats: beats('s26-callback-eric-nick', s26.s26CallbackEricNick),
    nextSceneId: 's26-common-eric' },
  { id: 's26-callback-eric-damir',
    beats: beats('s26-callback-eric-damir', s26.s26CallbackEricDamir),
    nextSceneId: 's26-common-eric' },
  { id: 's26-callback-eric-self',
    beats: beats('s26-callback-eric-self', s26.s26CallbackEricSelf),
    nextSceneId: 's26-common-eric' },
  { id: 's26-common-eric', beats: beats('s26-common-eric', s26.s26CommonEric),
    nextSceneId: 's27-intro' },
  { id: 's26-choice-nick', beats: beats('s26-choice-nick', s26.s26ChoiceNick),
    nextSceneId: 's26-nick-evening-dispatch' },
  { id: 's26-nick-evening-dispatch', beats: [
    { id: 's26-nick-evening-choice', type: 'choice', choices: [
      { id: 'eric', label: t('Продолжить'),
        targetSceneId: 's26-callback-nick-eric', when: { flag: 's17-evening-eric' } },
      { id: 'nick', label: t('Продолжить'),
        targetSceneId: 's26-callback-nick-nick', when: { flag: 's17-evening-nick' } },
      { id: 'damir', label: t('Продолжить'),
        targetSceneId: 's26-callback-nick-damir', when: { flag: 's17-evening-damir' } },
      { id: 'self', label: t('Продолжить'),
        targetSceneId: 's26-callback-nick-self', when: { flag: 's17-evening-self' } },
    ] },
  ] },
  { id: 's26-callback-nick-eric',
    beats: beats('s26-callback-nick-eric', s26.s26CallbackNickEric),
    nextSceneId: 's26-common-nick' },
  { id: 's26-callback-nick-nick',
    beats: beats('s26-callback-nick-nick', s26.s26CallbackNickNick),
    nextSceneId: 's26-common-nick' },
  { id: 's26-callback-nick-damir',
    beats: beats('s26-callback-nick-damir', s26.s26CallbackNickDamir),
    nextSceneId: 's26-common-nick' },
  { id: 's26-callback-nick-self',
    beats: beats('s26-callback-nick-self', s26.s26CallbackNickSelf),
    nextSceneId: 's26-common-nick' },
  { id: 's26-common-nick', beats: beats('s26-common-nick', s26.s26CommonNick),
    nextSceneId: 's27-intro' },
  { id: 's26-choice-damir', beats: beats('s26-choice-damir', s26.s26ChoiceDamir),
    nextSceneId: 's26-damir-evening-dispatch' },
  { id: 's26-damir-evening-dispatch', beats: [
    { id: 's26-damir-evening-choice', type: 'choice', choices: [
      { id: 'eric', label: t('Продолжить'),
        targetSceneId: 's26-callback-damir-eric', when: { flag: 's17-evening-eric' } },
      { id: 'nick', label: t('Продолжить'),
        targetSceneId: 's26-callback-damir-nick', when: { flag: 's17-evening-nick' } },
      { id: 'damir', label: t('Продолжить'),
        targetSceneId: 's26-callback-damir-damir', when: { flag: 's17-evening-damir' } },
      { id: 'self', label: t('Продолжить'),
        targetSceneId: 's26-callback-damir-self', when: { flag: 's17-evening-self' } },
    ] },
  ] },
  { id: 's26-callback-damir-eric',
    beats: beats('s26-callback-damir-eric', s26.s26CallbackDamirEric),
    nextSceneId: 's26-common-damir' },
  { id: 's26-callback-damir-nick',
    beats: beats('s26-callback-damir-nick', s26.s26CallbackDamirNick),
    nextSceneId: 's26-common-damir' },
  { id: 's26-callback-damir-damir',
    beats: beats('s26-callback-damir-damir', s26.s26CallbackDamirDamir),
    nextSceneId: 's26-common-damir' },
  { id: 's26-callback-damir-self',
    beats: beats('s26-callback-damir-self', s26.s26CallbackDamirSelf),
    nextSceneId: 's26-common-damir' },
  { id: 's26-common-damir', beats: beats('s26-common-damir', s26.s26CommonDamir),
    nextSceneId: 's27-intro' },
  { id: 's26-choice-alice', beats: beats('s26-choice-alice', s26.s26ChoiceAlice),
    nextSceneId: 's26-alice-evening-dispatch' },
  { id: 's26-alice-evening-dispatch', beats: [
    { id: 's26-alice-evening-choice', type: 'choice', choices: [
      { id: 'eric', label: t('Продолжить'),
        targetSceneId: 's26-callback-alice-eric', when: { flag: 's17-evening-eric' } },
      { id: 'nick', label: t('Продолжить'),
        targetSceneId: 's26-callback-alice-nick', when: { flag: 's17-evening-nick' } },
      { id: 'damir', label: t('Продолжить'),
        targetSceneId: 's26-callback-alice-damir', when: { flag: 's17-evening-damir' } },
      { id: 'self', label: t('Продолжить'),
        targetSceneId: 's26-callback-alice-self', when: { flag: 's17-evening-self' } },
    ] },
  ] },
  { id: 's26-callback-alice-eric',
    beats: beats('s26-callback-alice-eric', s26.s26CallbackAliceEric),
    nextSceneId: 's26-common-alice' },
  { id: 's26-callback-alice-nick',
    beats: beats('s26-callback-alice-nick', s26.s26CallbackAliceNick),
    nextSceneId: 's26-common-alice' },
  { id: 's26-callback-alice-damir',
    beats: beats('s26-callback-alice-damir', s26.s26CallbackAliceDamir),
    nextSceneId: 's26-common-alice' },
  { id: 's26-callback-alice-self',
    beats: beats('s26-callback-alice-self', s26.s26CallbackAliceSelf),
    nextSceneId: 's26-common-alice' },
  { id: 's26-common-alice', beats: beats('s26-common-alice', s26.s26CommonAlice),
    nextSceneId: 's27-intro' },
  // S27 is a shared volunteer workday regardless of the locked S26 route.
  { id: 's27-intro', beats: [
    ...beats('s27-intro', s27.s27Intro),
    { id: 's27-work-choice', type: 'choice', choices: [
      { id: 'inga', label: t('Остаться с Ингой и закончить настил'),
        targetSceneId: 's27-work-inga' },
      { id: 'nick', label: t('Помочь Нику со съёмкой, не мешая работе'),
        targetSceneId: 's27-work-nick' },
      { id: 'bags', label: t('Отнести полные мешки и вернуться за остальными'),
        targetSceneId: 's27-work-bags' },
    ] },
  ] },
  { id: 's27-work-inga', beats: beats('s27-work-inga', s27.s27WorkInga),
    nextSceneId: 's27-common' },
  { id: 's27-work-nick', beats: beats('s27-work-nick', s27.s27WorkNick),
    nextSceneId: 's27-common' },
  { id: 's27-work-bags', beats: beats('s27-work-bags', s27.s27WorkBags),
    nextSceneId: 's27-common' },
  { id: 's27-common', beats: beats('s27-common', s27.s27Common),
    nextSceneId: 's59-intro' },
  // S59 remains common to all four routes; song selection is local and free.
  { id: 's59-intro', beats: [
    ...beats('s59-intro', s59.s59Intro),
    { id: 's59-song-choice', type: 'choice', choices: [
      { id: 'eric', label: t('Детскую считалку Эрика'), targetSceneId: 's59-song-eric' },
      { id: 'nick', label: t('Неудачную рекламную мелодию Ника'), targetSceneId: 's59-song-nick' },
      { id: 'damir', label: t('Песню из детства Алисы и Дамира'), targetSceneId: 's59-song-damir' },
    ] },
  ] },
  { id: 's59-song-eric', beats: beats('s59-song-eric', s59.s59SongEric),
    nextSceneId: 's59-common' },
  { id: 's59-song-nick', beats: beats('s59-song-nick', s59.s59SongNick),
    nextSceneId: 's59-common' },
  { id: 's59-song-damir', beats: beats('s59-song-damir', s59.s59SongDamir),
    nextSceneId: 's59-common' },
  { id: 's59-common', beats: beats('s59-common', s59.s59Common),
    nextSceneId: 's59-route-dispatch' },
  // A route-scoped technical navigation gate: never offer a second route choice.
  // Native N1 validates routeId against the S26 routeLock both in UI and action replay.
  { id: 's59-route-dispatch', beats: [
    { id: 's59-route-choice', type: 'choice', choices: [
      { id: 'eric', label: t('Продолжить'), routeId: 'eric', targetSceneId: 's28-intro' },
      { id: 'nick', label: t('Продолжить'), routeId: 'nick', targetSceneId: 's29-intro' },
      { id: 'damir', label: t('Продолжить'), routeId: 'damir', targetSceneId: 's59-after-m3-end' },
      { id: 'alice', label: t('Продолжить'), routeId: 'alice', targetSceneId: 's59-after-m3-end' },
    ] },
  ] },
  // Eric-exclusive day-14 arc: two free local S28 choices and one free S49 choice.
  { id: 's28-intro', beats: [
    ...beats('s28-intro', s28.s28Intro),
    { id: 's28-c1-choice', type: 'choice', choices: [
      { id: 'a', label: t('Попросить Эрика показать более спокойную дорогу'), targetSceneId: 's28-c1-a' },
      { id: 'b', label: t('Предложить ему идти рядом и не выбирать лидера'), targetSceneId: 's28-c1-b' },
    ] },
  ] },
  { id: 's28-c1-a', beats: beats('s28-c1-a', s28.s28C1A), nextSceneId: 's28-common' },
  { id: 's28-c1-b', beats: beats('s28-c1-b', s28.s28C1B), nextSceneId: 's28-common' },
  { id: 's28-common', beats: [
    ...beats('s28-common', s28.s28Common),
    { id: 's28-c2-choice', type: 'choice', choices: [
      { id: 'a', label: t('Поставить ту самую песню и пригласить его на танец'),
        targetSceneId: 's28-c2-a', effects: [{ op: 'flag_set', id: 's28-evening-dance', value: true }] },
      { id: 'b', label: t('Провести вместе тихий вечер без планов'),
        targetSceneId: 's28-c2-b', effects: [{ op: 'flag_set', id: 's28-evening-quiet', value: true }] },
    ] },
  ] },
  { id: 's28-c2-a', beats: beats('s28-c2-a', s28.s28C2A), nextSceneId: 's49-intro' },
  { id: 's28-c2-b', beats: beats('s28-c2-b', s28.s28C2B), nextSceneId: 's49-intro' },
  { id: 's49-intro', beats: [
    ...beats('s49-intro', s49.s49Intro),
    { id: 's49-c1-choice', type: 'choice', choices: [
      { id: 'a', label: t('Пригласить Эрика на второй танец'), targetSceneId: 's49-c1-a' },
      { id: 'b', label: t('Предложить выйти к озеру вдвоём'), targetSceneId: 's49-c1-b' },
    ] },
  ] },
  { id: 's49-c1-a', beats: beats('s49-c1-a', s49.s49C1A), nextSceneId: 's49-common' },
  { id: 's49-c1-b', beats: beats('s49-c1-b', s49.s49C1B), nextSceneId: 's49-common' },
  { id: 's49-common', beats: beats('s49-common', s49.s49Common),
    nextSceneId: 's49-callback-dispatch' },
  { id: 's49-callback-dispatch', beats: [
    { id: 's49-callback-choice', type: 'choice', choices: [
      { id: 'a', label: t('Продолжить'), targetSceneId: 's49-callback-a',
        when: { flag: 's28-evening-dance' } },
      { id: 'b', label: t('Продолжить'), targetSceneId: 's49-callback-b',
        when: { flag: 's28-evening-quiet' } },
    ] },
  ] },
  { id: 's49-callback-a', beats: beats('s49-callback-a', s49.s49CallbackA),
    nextSceneId: 's49-after-m3-end' },
  { id: 's49-callback-b', beats: beats('s49-callback-b', s49.s49CallbackB),
    nextSceneId: 's49-after-m3-end' },
  { id: 's49-after-m3-end', beats: [
    { id: 's49-after-m3-end-beat', type: 'ending', endingId: 'm3-eric-s49-only',
      text: t('Технический фрагмент завершён. Следующая сцена маршрута Эрика ещё не перенесена.') },
  ] },
  // Nick-exclusive day-14 arc: the S29-C1 clip choice never grants publication rights.
  { id: 's29-intro', beats: [
    ...beats('s29-intro', s29.s29Intro),
    { id: 's29-c1-choice', type: 'choice', choices: [
      { id: 'a', label: t('Удалить его из фильма и исходников'), targetSceneId: 's29-c1-a' },
      { id: 'b', label: t('Оставить фрагмент только в личном архиве Алисы'), targetSceneId: 's29-c1-b' },
      { id: 'c', label: t('Переснять начало поездки сейчас, с её участием'), targetSceneId: 's29-c1-c' },
    ] },
  ] },
  { id: 's29-c1-a', beats: beats('s29-c1-a', s29.s29C1A), nextSceneId: 's29-common' },
  { id: 's29-c1-b', beats: beats('s29-c1-b', s29.s29C1B), nextSceneId: 's29-common' },
  { id: 's29-c1-c', beats: beats('s29-c1-c', s29.s29C1C), nextSceneId: 's29-common' },
  { id: 's29-common', beats: [
    ...beats('s29-common', s29.s29Common),
    { id: 's29-c2-choice', type: 'choice', choices: [
      { id: 'a', label: t('Выйти без камеры и просто погулять'), targetSceneId: 's29-c2-a',
        effects: [{ op: 'flag_set', id: 's29-hour-walk', value: true }] },
      { id: 'b', label: t('Попросить его научить её снимать короткий немой фильм'),
        targetSceneId: 's29-c2-b', effects: [{ op: 'flag_set', id: 's29-hour-film', value: true }] },
    ] },
  ] },
  { id: 's29-c2-a', beats: beats('s29-c2-a', s29.s29C2A), nextSceneId: 's52-intro' },
  { id: 's29-c2-b', beats: beats('s29-c2-b', s29.s29C2B), nextSceneId: 's52-intro' },
  { id: 's52-intro', beats: [
    ...beats('s52-intro', s52.s52Intro),
    { id: 's52-c1-choice', type: 'choice', choices: [
      { id: 'a', label: t('Назвать прогулку свиданием'), targetSceneId: 's52-c1-a' },
      { id: 'b', label: t('Предложить обычную прогулку завтра'), targetSceneId: 's52-c1-b' },
    ] },
  ] },
  { id: 's52-c1-a', beats: beats('s52-c1-a', s52.s52C1A), nextSceneId: 's52-common' },
  { id: 's52-c1-b', beats: beats('s52-c1-b', s52.s52C1B), nextSceneId: 's52-common' },
  { id: 's52-common', beats: beats('s52-common', s52.s52Common),
    nextSceneId: 's52-callback-dispatch' },
  { id: 's52-callback-dispatch', beats: [
    { id: 's52-callback-choice', type: 'choice', choices: [
      { id: 'a', label: t('Продолжить'), targetSceneId: 's52-callback-a',
        when: { flag: 's29-hour-walk' } },
      { id: 'b', label: t('Продолжить'), targetSceneId: 's52-callback-b',
        when: { flag: 's29-hour-film' } },
    ] },
  ] },
  { id: 's52-callback-a', beats: beats('s52-callback-a', s52.s52CallbackA),
    nextSceneId: 's52-after-m3-end' },
  { id: 's52-callback-b', beats: beats('s52-callback-b', s52.s52CallbackB),
    nextSceneId: 's52-after-m3-end' },
  { id: 's52-after-m3-end', beats: [
    { id: 's52-after-m3-end-beat', type: 'ending', endingId: 'm3-nick-s52-only',
      text: t('Технический фрагмент завершён. Следующая сцена маршрута Ника ещё не перенесена.') },
  ] },
  { id: 's59-after-m3-end', beats: [
    { id: 's59-after-m3-end-beat', type: 'ending', endingId: 'm3-s59-only',
      text: t('Технический фрагмент завершён. Выбранный маршрут дня 14 ещё не перенесён.') },
  ] },
] };
export const labels = { intent: {}, tone: {}, recipient: {}, journal: {} };
export const relationFacts = [];
