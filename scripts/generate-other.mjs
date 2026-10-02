import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = (f) => join(__dirname, '..', 'src', 'data', f);

function makeItems(level, rows) {
  const counts = {};
  const items = rows.map(([subCategory, title, japanese, reading, meaning, notes], i) => {
    counts[subCategory] = (counts[subCategory] || 0) + 1;
    const item = {
      id: `${level}-o-${String(i + 1).padStart(4, '0')}`,
      title,
      subCategory,
      japanese,
      reading,
      meaning,
      jlptLevel: level,
    };
    if (notes) item.notes = notes;
    return item;
  });
  console.log(level.toUpperCase(), JSON.stringify(counts), 'total:', items.length);
  return items;
}

// ------------------------------------------------------------
// N5 — kana, numbers, counters, dates, time, greetings, questions,
//      basic expressions, conjugations
// ------------------------------------------------------------
const HIRAGANA = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';
const KATAKANA = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
const ROMAJI = ['a','i','u','e','o','ka','ki','ku','ke','ko','sa','shi','su','se','so','ta','chi','tsu','te','to','na','ni','nu','ne','no','ha','hi','fu','he','ho','ma','mi','mu','me','mo','ya','yu','yo','ra','ri','ru','re','ro','wa','wo','n'];

const n5Rows = [];
[...HIRAGANA].forEach((c, i) => n5Rows.push(['hiragana', 'Hiragana (平仮名)', c, ROMAJI[i], ROMAJI[i]]));
[...KATAKANA].forEach((c, i) => n5Rows.push(['katakana', 'Katakana (片仮名)', c, ROMAJI[i], ROMAJI[i]]));

const NUMBERS = [
  ['0', 'れい', 'zero'], ['1', 'いち', 'one'], ['2', 'に', 'two'], ['3', 'さん', 'three'],
  ['4', 'よん', 'four'], ['5', 'ご', 'five'], ['6', 'ろく', 'six'], ['7', 'なな', 'seven'],
  ['8', 'はち', 'eight'], ['9', 'きゅう', 'nine'], ['10', 'じゅう', 'ten'],
  ['100', 'ひゃく', 'hundred'], ['1,000', 'せん', 'thousand'], ['10,000', 'まん', 'ten thousand'],
  ['100,000,000', 'おく', 'hundred million'],
];
for (const [n, r, m] of NUMBERS) n5Rows.push(['numbers', `Number ${n}`, n, r, m]);

const TSU_COUNTER = [['一つ','ひとつ','one (thing)'],['二つ','ふたつ','two (things)'],['三つ','みっつ','three (things)'],['四つ','よっつ','four (things)'],['五つ','いつつ','five (things)'],['六つ','むっつ','six (things)'],['七つ','ななつ','seven (things)'],['八つ','やっつ','eight (things)'],['九つ','ここのつ','nine (things)'],['十','とお','ten (things)'],['いくつ','いくつ','how many']];
const NIN_COUNTER = [['一人','ひとり','one person'],['二人','ふたり','two people'],['三人','さんにん','three people'],['四人','よにん','four people'],['五人','ごにん','five people'],['六人','ろくにん','six people'],['七人','しちにん','seven people'],['八人','はちにん','eight people'],['九人','きゅうにん','nine people'],['十人','じゅうにん','ten people'],['何人','なんにん','how many people']];
const HON_COUNTER = [['一本','いっぽん','one long object'],['二本','にほん','two long objects'],['三本','さんぼん','three long objects'],['四本','よんほん','four long objects'],['五本','ごほん','five long objects'],['六本','ろっぽん','six long objects'],['七本','ななほん','seven long objects'],['八本','はっぽん','eight long objects'],['九本','きゅうほん','nine long objects'],['十本','じゅっぽん','ten long objects'],['何本','なんぼん','how many long objects']];
const MAI_COUNTER = [['一枚','いちまい','one flat object'],['二枚','にまい','two flat objects'],['三枚','さんまい','three flat objects'],['四枚','よんまい','four flat objects'],['五枚','ごまい','five flat objects'],['六枚','ろくまい','six flat objects'],['七枚','ななまい','seven flat objects'],['八枚','はちまい','eight flat objects'],['九枚','きゅうまい','nine flat objects'],['十枚','じゅうまい','ten flat objects'],['何枚','なんまい','how many flat objects']];
const DAI_COUNTER = [['一台','いちだい','one machine'],['二台','にだい','two machines'],['三台','さんだい','three machines'],['四台','よんだい','four machines'],['五台','ごだい','five machines'],['六台','ろくだい','six machines'],['七台','ななだい','seven machines'],['八台','はちだい','eight machines'],['九台','きゅうだい','nine machines'],['十台','じゅうだい','ten machines'],['何台','なんだい','how many machines']];
for (const c of [...TSU_COUNTER, ...NIN_COUNTER, ...HON_COUNTER, ...MAI_COUNTER, ...DAI_COUNTER]) n5Rows.push(['counters', 'Counter (助数詞)', c[0], c[1], c[2]]);

const DAYS = [['月曜日','げつようび','Monday'],['火曜日','かようび','Tuesday'],['水曜日','すいようび','Wednesday'],['木曜日','もくようび','Thursday'],['金曜日','きんようび','Friday'],['土曜日','どようび','Saturday'],['日曜日','にちようび','Sunday']];
for (const [j, r, m] of DAYS) n5Rows.push(['days', 'Day of the week', j, r, m]);

const MONTH_EN = ['', 'January','February','March','April','May','June','July','August','September','October','November','December'];
for (let i = 1; i <= 12; i++) {
  const readings = ['', 'いちがつ','にがつ','さんがつ','しがつ','ごがつ','ろくがつ','しちがつ','はちがつ','くがつ','じゅうがつ','じゅういちがつ','じゅうにがつ'];
  n5Rows.push(['months', 'Month', `${i}月`, readings[i], MONTH_EN[i]]);
}
const DATE_READINGS = ['', 'ついたち','ふつか','みっか','よっか','いつか','むいか','なのか','ようか','ここのか','とおか','じゅういちにち','じゅうににち','じゅうさんにち','じゅうよっか','じゅうごにち','じゅうろくにち','じゅうしちにち','じゅうはちにち','じゅうくにち','はつか','にじゅういちにち','にじゅうににち','にじゅうさんにち','にじゅうよっか','にじゅうごにち','にじゅうろくにち','にじゅうしちにち','にじゅうはちにち','にじゅうくにち','さんじゅうにち','さんじゅういちにち'];
for (let i = 1; i <= 31; i++) {
  n5Rows.push(['dates', `Day ${i}`, `${i}日`, DATE_READINGS[i], `the ${i}th (day of month)`]);
}

const TIME = [
  ['今','いま','now'], ['朝','あさ','morning'], ['昼','ひる','noon; daytime'], ['夜','よる','night'],
  ['今日','きょう','today'], ['昨日','きのう','yesterday'], ['明日','あした','tomorrow'],
  ['一昨日','おととい','the day before yesterday'], ['明後日','あさって','the day after tomorrow'],
  ['今朝','けさ','this morning'], ['今晩','こんばん','tonight'], ['毎日','まいにち','every day'],
  ['先週','せんしゅう','last week'], ['今週','こんしゅう','this week'], ['来週','らいしゅう','next week'],
  ['午前','ごぜん','a.m.; morning'], ['午後','ごご','p.m.; afternoon'],
  ['1時','いちじ',"1 o'clock"], ['2時','にじ',"2 o'clock"], ['3時','さんじ',"3 o'clock"], ['4時','よじ',"4 o'clock"], ['5時','ごじ',"5 o'clock"], ['6時','ろくじ',"6 o'clock"], ['7時','しちじ',"7 o'clock"], ['8時','はちじ',"8 o'clock"], ['9時','くじ',"9 o'clock"], ['10時','じゅうじ',"10 o'clock"], ['11時','じゅういちじ',"11 o'clock"], ['12時','じゅうにじ',"12 o'clock"], ['何時','なんじ','what time'],
  ['1分','いっぷん','one minute'], ['5分','ごふん','five minutes'], ['10分','じゅっぷん','ten minutes'], ['30分','さんじゅっぷん','thirty minutes'], ['半','はん','half'],
];
for (const [j, r, m] of TIME) n5Rows.push(['time', 'Time expression', j, r, m]);

const GREETINGS = [
  ['おはようございます','おはようございます','Good morning (polite)'],
  ['こんにちは','こんにちは','Hello; Good afternoon'],
  ['こんばんは','こんばんは','Good evening'],
  ['さようなら','さようなら','Goodbye'],
  ['おやすみなさい','おやすみなさい','Good night'],
  ['ありがとうございます','ありがとうございます','Thank you (polite)'],
  ['すみません','すみません',"Excuse me; I'm sorry"],
  ['ごめんなさい','ごめんなさい',"I'm sorry (casual)"],
  ['いただきます','いただきます','Said before eating'],
  ['ごちそうさまでした','ごちそうさまでした','Said after eating (thank you for the meal)'],
  ['いってきます','いってきます',"I'm leaving (and will come back)"],
  ['いってらっしゃい','いってらっしゃい','See you later (to someone leaving)'],
  ['ただいま','ただいま',"I'm home"],
  ['おかえりなさい','おかえりなさい','Welcome back'],
  ['はじめまして','はじめまして','Nice to meet you (first meeting)'],
  ['よろしくおねがいします','よろしくおねがいします','Please treat me well'],
  ['おげんきですか','おげんきですか','How are you? (polite)'],
  ['はい','はい','yes'], ['いいえ','いいえ','no'],
];
for (const [j, r, m] of GREETINGS) n5Rows.push(['greetings', 'Greeting (挨拶)', j, r, m]);

const QUESTION_WORDS = [
  ['何','なに','what'], ['誰','だれ','who'], ['どこ','どこ','where'], ['いつ','いつ','when'],
  ['なぜ','なぜ','why'], ['どうして','どうして','why; how'], ['どう','どう','how'],
  ['いくら','いくら','how much (money)'], ['いくつ','いくつ','how many'], ['どれ','どれ','which one'],
  ['どの','どの','which'], ['どちら','どちら','which (of two); where (polite)'],
  ['どんな','どんな','what kind of'], ['何歳','なんさい','how old'], ['何曜日','なんようび','what day of the week'],
];
for (const [j, r, m] of QUESTION_WORDS) n5Rows.push(['questions', 'Question word', j, r, m]);

const EXPRESSIONS = [
  ['〜です','〜です','to be (polite copula)'], ['〜ます','〜ます','polite verb ending (non-past)'],
  ['〜ません','〜ません','polite negative verb ending'], ['〜ました','〜ました','polite past verb ending'],
  ['〜ましょう','〜ましょう',"let's ~ (volitional)"], ['〜てください','〜てください','please ~'],
  ['〜てもいいですか','〜てもいいですか','May I ~? (permission)'], ['〜てはいけません','〜てはいけません','must not ~ (prohibition)'],
  ['〜たいです','〜たいです','I want to ~ (desire)'], ['〜がほしいです','〜がほしいです','I want ~ (object)'],
  ['〜ましょうか','〜ましょうか','Shall I ~? (offer)'], ['〜ませんか','〜ませんか',"Won't you ~? (invitation)"],
  ['〜があります','〜があります','there is ~ (inanimate)'], ['〜がいます','〜がいます','there is ~ (animate)'],
  ['〜がすきです','〜がすきです','I like ~'], ['〜がじょうずです','〜がじょうずです','to be good at ~'],
  ['〜がへたです','〜がへたです','to be poor at ~'], ['〜より〜のほうが','〜より〜のほうが','~ is more ~ than ~'],
  ['〜がいちばん','〜がいちばん','~ is the most ~'], ['〜とおもいます','〜とおもいます','I think that ~'],
];
for (const [j, r, m] of EXPRESSIONS) n5Rows.push(['expressions', 'Basic pattern (文型)', j, r, m]);

const VERBS = [
  ['食べる','たべる','to eat (dictionary form)'], ['食べます','たべます','to eat (polite non-past)'],
  ['食べません','たべません','not eat (polite negative)'], ['食べました','たべました','ate (polite past)'],
  ['食べて','たべて','eat (te-form)'], ['食べない','たべない','not eat (plain negative)'],
  ['飲む','のむ','to drink (dictionary form)'], ['飲みます','のみます','to drink (polite non-past)'],
  ['飲んで','のんで','drink (te-form)'], ['行く','いく','to go (dictionary form)'],
  ['行きます','いきます','to go (polite non-past)'], ['行って','いって','go (te-form)'],
  ['話す','はなす','to speak (dictionary form)'], ['話します','はなします','to speak (polite non-past)'],
  ['話して','はなして','speak (te-form)'], ['見る','みる','to see (dictionary form)'],
  ['見ます','みます','to see (polite non-past)'], ['見て','みて','see (te-form)'],
];
for (const [j, r, m] of VERBS) n5Rows.push(['conjugation', 'Verb conjugation (動詞の活用)', j, r, m]);

const IRREGULAR = [
  ['する','する','to do (dictionary form)'], ['します','します','to do (polite non-past)'],
  ['しました','しました','did (polite past)'], ['して','して','do (te-form)'],
  ['来る','くる','to come (dictionary form)'], ['来ます','きます','to come (polite non-past)'],
  ['来て','きて','come (te-form)'], ['来ない','こない','not come (plain negative)'],
];
for (const [j, r, m] of IRREGULAR) n5Rows.push(['conjugation', 'Irregular verb (不規則動詞)', j, r, m]);

const ADJ = [
  ['高い','たかい','high; expensive (い-adjective)'], ['高くない','たかくない','not high/expensive'],
  ['高かった','たかかった','was high/expensive'], ['高くて','たかくて','high/expensive and (te-form)'],
  ['安い','やすい','cheap (い-adjective)'], ['新しい','あたらしい','new (い-adjective)'],
  ['静か','しずか','quiet (な-adjective)'], ['静かじゃない','しずかじゃない','not quiet'],
  ['静かだった','しずかだった','was quiet'], ['元気','げんき','healthy; energetic (な-adjective)'],
  ['きれい','きれい','pretty; clean (な-adjective)'],
];
for (const [j, r, m] of ADJ) n5Rows.push(['conjugation', 'Adjective conjugation (形容詞の活用)', j, r, m]);

// ------------------------------------------------------------
// N4 — counters, periods, frequency, compound patterns, keigo basics
// ------------------------------------------------------------
const n4Rows = [];
const N4_COUNTERS = [
  ['一冊','いっさつ','one book (bound)'], ['二冊','にさつ','two books'], ['三冊','さんさつ','three books'],
  ['一匹','いっぴき','one small animal'], ['二匹','にひき','two small animals'], ['三匹','さんびき','three small animals'],
  ['一回','いっかい','one time/occurrence'], ['二回','にかい','two times'], ['三回','さんかい','three times'],
  ['一週間','いっしゅうかん','one week (duration)'], ['二週間','にしゅうかん','two weeks'], ['三週間','さんしゅうかん','three weeks'],
  ['一ヶ月','いっかげつ','one month (duration)'], ['二ヶ月','にかげつ','two months'], ['三ヶ月','さんかげつ','three months'],
  ['一年','いちねん','one year (duration)'], ['二年','にねん','two years'], ['三年','さんねん','three years'],
  ['一番','いちばん','first; number one; best'], ['二番','にばん','second'], ['三番','さんばん','third'],
  ['一階','いっかい','first floor'], ['二階','にかい','second floor'], ['三階','さんがい','third floor'],
];
for (const [j, r, m] of N4_COUNTERS) n4Rows.push(['counters', 'Counter (助数詞)', j, r, m]);

const N4_PERIODS = [
  ['おととし','おととし','the year before last'], ['去年','きょねん','last year'], ['今年','ことし','this year'],
  ['来年','らいねん','next year'], ['再来年','さらいねん','the year after next'],
  ['先月','せんげつ','last month'], ['今月','こんげつ','this month'], ['来月','らいげつ','next month'],
  ['毎週','まいしゅう','every week'], ['毎月','まいつき','every month'], ['毎年','まいとし','every year'],
  ['〜ごろ','〜ごろ','around ~ (approximate time)'], ['〜すぎ','〜すぎ','past ~ (time)'], ['〜まえ','〜まえ','before ~'],
  ['〜から〜まで','〜から〜まで','from ~ to ~'],
];
for (const [j, r, m] of N4_PERIODS) n4Rows.push(['time', 'Time expression', j, r, m]);

const N4_PATTERNS = [
  ['〜たことがあります','〜たことがあります','have done ~ before (experience)'],
  ['〜たり〜たりします','〜たり〜たりします','do things like ~ and ~'],
  ['〜ながら','〜ながら','while doing ~'],
  ['〜やすい','〜やすい','easy to ~'], ['〜にくい','〜にくい','difficult to ~'],
  ['〜すぎる','〜すぎる','too much; over-'],
  ['〜そうです','〜そうです','looks like ~ (hearsay/appearance)'],
  ['〜かもしれません','〜かもしれません','might ~; perhaps'],
  ['〜つもりです','〜つもりです','intend to ~ (plan)'],
  ['〜よていです','〜よていです','plan to ~'],
  ['〜ば','〜ば','if ~ (conditional)'], ['〜なら','〜なら','if ~ (conditional)'],
  ['〜ても','〜ても','even if ~'], ['〜なくてもいいです','〜なくてもいいです',"don't have to ~"],
  ['〜なければなりません','〜なければなりません','must ~ (obligation)'],
  ['〜てしまう','〜てしまう','finish ~; end up doing ~'], ['〜ておく','〜ておく','do ~ in advance'],
  ['〜てある','〜てある','has been done ~ (resulting state)'], ['〜てみる','〜てみる','try doing ~'],
  ['〜ていく','〜ていく','do ~ and go; continue to ~'], ['〜てくる','〜てくる','do ~ and come; come to ~'],
  ['〜ところです','〜ところです','just about to do ~ / in the middle of ~'],
  ['〜ばかりです','〜ばかりです','just did ~'], ['〜はずです','〜はずです','should be ~ (expectation)'],
  ['〜ようです','〜ようです','seems ~ (observation)'], ['〜らしいです','〜らしいです','seems ~ (hearsay)'],
  ['〜みたいです','〜みたいです','looks like ~ (colloquial)'],
  ['〜ようにします','〜ようにします','make an effort to ~'], ['〜ようになります','〜ようになります','come to ~ (become able)'],
  ['〜ことにします','〜ことにします','decide to ~'], ['〜ことになります','〜ことになります','it has been decided that ~'],
];
for (const [j, r, m] of N4_PATTERNS) n4Rows.push(['expressions', 'Grammar pattern (文型)', j, r, m]);

const N4_KEIGO = [
  ['いらっしゃいます','いらっしゃいます','come/go/be (honorific of 来る/行く/いる)'],
  ['おっしゃいます','おっしゃいます','say (honorific of 言う)'],
  ['めしあがります','めしあがります','eat/drink (honorific of 食べる/飲む)'],
  ['ごらんになります','ごらんになります','look/see (honorific of 見る)'],
  ['なさいます','なさいます','do (honorific of する)'],
  ['お〜になります','お〜になります','honorific pattern (お+stem+になる)'],
  ['お〜ください','お〜ください','please do ~ (honorific request)'],
];
for (const [j, r, m] of N4_KEIGO) n4Rows.push(['keigo', 'Honorific (尊敬語)', j, r, m]);

// ------------------------------------------------------------
// N3 — conjunctions, formal expressions, humble keigo
// ------------------------------------------------------------
const n3Rows = [];
const N3_CONJ = [
  ['そして','そして','and; and then'], ['それから','それから','after that; and then'],
  ['しかし','しかし','however'], ['でも','でも','but'],
  ['だから','だから','so; therefore'], ['それに','それに','besides; moreover'],
  ['すると','すると','then; thereupon'], ['ところで','ところで','by the way'],
  ['たとえば','たとえば','for example'], ['つまり','つまり','in other words; that is'],
  ['それでも','それでも','even so; nevertheless'], ['そのうえ','そのうえ','in addition; furthermore'],
  ['または','または','or; alternatively'], ['それとも','それとも','or (between choices)'],
];
for (const [j, r, m] of N3_CONJ) n3Rows.push(['conjunctions', 'Conjunction (接続詞)', j, r, m]);

const N3_EXPR = [
  ['〜おかげで','〜おかげで','thanks to ~ (positive)'], ['〜せいで','〜せいで','because of ~ (negative)'],
  ['〜くせに','〜くせに','even though ~ (criticism)'], ['〜かわりに','〜かわりに','instead of ~; in return'],
  ['〜がち','〜がち','tend to ~'], ['〜っぽい','〜っぽい','-ish; tends to ~'],
  ['〜たびに','〜たびに','every time ~'], ['〜につれて','〜につれて','as ~ (gradual change)'],
  ['〜によって','〜によって','depending on ~; by ~'], ['〜に対して','〜に対して','toward ~; in contrast to ~'],
  ['〜わけではない','〜わけではない',"it doesn't mean that ~"],
  ['〜わけにはいかない','〜わけにはいかない','cannot afford to ~'],
  ['〜ようにする','〜ようにする','try to make sure that ~'], ['〜ようとする','〜ようとする','try to ~; be about to ~'],
  ['〜ないで','〜ないで','without doing ~'], ['〜ずに','〜ずに','without doing ~ (written)'],
  ['〜ところが','〜ところが','however (unexpected result)'],
  ['〜はじめる','〜はじめる','begin to ~'], ['〜つづける','〜つづける','continue to ~'],
  ['〜おわる','〜おわる','finish ~'],
];
for (const [j, r, m] of N3_EXPR) n3Rows.push(['expressions', 'Grammar pattern (文型)', j, r, m]);

const N3_KENJOGO = [
  ['まいります','まいります','come/go (humble of 来る/行く)'],
  ['もうします','もうします','say; be called (humble of 言う)'],
  ['いたします','いたします','do (humble of する)'],
  ['おります','おります','be (humble of いる)'],
  ['ぞんじます','ぞんじます','know (humble of 知る)'],
  ['うかがいます','うかがいます','ask; visit (humble of 聞く/訪ねる)'],
  ['いただきます','いただきます','receive (humble of もらう)'],
  ['さしあげます','さしあげます','give (humble of あげる)'],
];
for (const [j, r, m] of N3_KENJOGO) n3Rows.push(['keigo', 'Humble (謙譲語)', j, r, m]);

// ------------------------------------------------------------
// N2 — formal conjunctions, idioms, synonyms/antonyms, register
// ------------------------------------------------------------
const n2Rows = [];
const N2_CONJ = [
  ['したがって','したがって','accordingly; therefore (written)'],
  ['それにもかかわらず','それにもかかわらず','nevertheless; in spite of that'],
  ['そのため','そのため','for that reason'], ['それゆえ','それゆえ','hence (literary)'],
  ['一方で','いっぽうで','on the other hand'], ['逆に','ぎゃくに','conversely'],
  ['要するに','ようするに','in short; to sum up'], ['すなわち','すなわち','namely; that is'],
  ['なお','なお','furthermore; in addition (written)'],
  ['ただし','ただし','however; provided that'], ['もっとも','もっとも','although; though'],
];
for (const [j, r, m] of N2_CONJ) n2Rows.push(['conjunctions', 'Formal conjunction (接続詞)', j, r, m]);

const N2_IDIOMS = [
  ['石の上にも三年','いしのうえにもさんねん','perseverance pays off (lit. three years on a stone)'],
  ['猿も木から落ちる','さるもきからおちる','even experts make mistakes (lit. even monkeys fall from trees)'],
  ['花より団子','はなよりだんご','substance over style (lit. dumplings over flowers)'],
  ['急がば回れ','いそがばまわれ','haste makes waste (lit. if in a hurry, go around)'],
  ['七転び八起き','ななころびやおき','perseverance through failure (lit. fall seven times, rise eight)'],
  ['口は災いの元','くちはわざわいのもと','words can bring disaster'],
  ['百聞は一見に如かず','ひゃくぶんはいっけんにしかず','seeing is believing (lit. hearing a hundred times is not as good as seeing once)'],
  ['雨降って地固まる','あめふってじかたまる','adversity strengthens bonds (lit. after rain, the ground hardens)'],
];
for (const [j, r, m] of N2_IDIOMS) n2Rows.push(['idioms', 'Proverb (ことわざ)', j, r, m]);

const N2_PAIRS = [
  ['安全','あんぜん','safe (antonym: 危険)'], ['危険','きけん','dangerous (antonym: 安全)'],
  ['増加','ぞうか','increase (antonym: 減少)'], ['減少','げんしょう','decrease (antonym: 増加)'],
  ['開始','かいし','start (antonym: 終了)'], ['終了','しゅうりょう','end (antonym: 開始)'],
  ['需要','じゅよう','demand (antonym: 供給)'], ['供給','きょうきゅう','supply (antonym: 需要)'],
  ['複雑','ふくざつ','complex (antonym: 単純)'], ['単純','たんじゅん','simple (antonym: 複雑)'],
  ['利益','りえき','profit (antonym: 損失)'], ['損失','そんしつ','loss (antonym: 利益)'],
  ['賛成','さんせい','agreement (antonym: 反対)'], ['反対','はんたい','opposition (antonym: 賛成)'],
];
for (const [j, r, m] of N2_PAIRS) n2Rows.push(['antonyms', 'Synonym/Antonym pair (類義語・対義語)', j, r, m]);

const N2_REGISTER = [
  ['〜べきだ','〜べきだ','should ~ (moral obligation)'],
  ['〜ものだ','〜ものだ','used to ~; should ~ (general truth)'],
  ['〜ことだ','〜ことだ','should ~ (advice)'],
  ['〜ざるを得ない','〜ざるをえない','cannot help but ~'],
  ['〜に違いない','〜にちがいない','must be ~ (strong conviction)'],
  ['〜に基づいて','〜にもとづいて','based on ~'],
  ['〜に応じて','〜におうじて','according to ~; in response to ~'],
  ['〜をめぐって','〜をめぐって','concerning ~; over ~ (dispute)'],
  ['〜において','〜において','at ~; in ~ (formal)'],
  ['〜にわたって','〜にわたって','over ~ (period/range)'],
  ['〜を通じて','〜をつうじて','through ~; throughout ~'],
  ['〜次第','〜しだい','as soon as ~; depending on ~'],
  ['〜上で','〜うえで','after doing ~; for the purpose of ~'],
  ['〜限り','〜かぎり','as long as ~'],
  ['〜一方で','〜いっぽうで','while ~; on the other hand ~'],
  ['〜反面','〜はんめん','on the other hand ~ (negative side)'],
  ['〜に伴って','〜にともなって','along with ~'],
];
for (const [j, r, m] of N2_REGISTER) n2Rows.push(['expressions', 'Formal pattern (文型)', j, r, m]);

// ------------------------------------------------------------
// N1 — literary conjunctions, advanced idioms, formal patterns
// ------------------------------------------------------------
const n1Rows = [];
const N1_CONJ = [
  ['かくして','かくして','thus; and so (literary)'], ['いわんや','いわんや','much less; let alone (literary)'],
  ['しかるに','しかるに','however; and yet (literary)'], ['されど','されど','nevertheless (archaic/literary)'],
  ['すなわち','すなわち','namely; in other words'],
];
for (const [j, r, m] of N1_CONJ) n1Rows.push(['conjunctions', 'Literary conjunction (文語的接続詞)', j, r, m]);

const N1_IDIOMS = [
  ['青天の霹靂','せいてんのへきれき','a bolt from the blue'],
  ['画竜点睛','がりょうてんせい','the finishing touch (lit. adding the eye to a painted dragon)'],
  ['温故知新','おんこちしん','learning from the past (lit. reviewing the old to know the new)'],
  ['五十歩百歩','ごじゅっぽひゃっぽ','six of one, half a dozen of the other'],
  ['漁夫の利','ぎょふのり','profit from others\' conflict (lit. the fisherman\'s gain)'],
  ['杞憂','きゆう','needless fear (lit. worries of the Qi)'],
  ['四面楚歌','しめんそか','besieged on all sides'],
  ['馬耳東風','ばじとうふう','utter indifference (lit. east wind on a horse\'s ear)'],
];
for (const [j, r, m] of N1_IDIOMS) n1Rows.push(['idioms', 'Four-character idiom (四字熟語)', j, r, m]);

const N1_EXPR = [
  ['〜にあたって','〜にあたって','on the occasion of ~ (formal)'],
  ['〜をよそに','〜をよそに','in defiance of ~; ignoring ~'],
  ['〜をものともせず','〜をものともせず','undaunted by ~'],
  ['〜がてら','〜がてら','while ~ (doing two things)'],
  ['〜かたがた','〜かたがた','both ~ and ~ (formal)'],
  ['〜かたわら','〜かたわら','while ~; in addition to ~'],
  ['〜なり','〜なり','as soon as ~'],
  ['〜や否や','〜やいなや','no sooner than ~'],
  ['〜そばから','〜そばから','as soon as ~ (repeatedly)'],
  ['〜に至って','〜にいたって','only when it comes to ~'],
  ['〜に至るまで','〜にいたるまで','up to ~; even ~'],
  ['〜までもない','〜までもない','there is no need to ~'],
  ['〜べからず','〜べからず','must not ~ (written prohibition)'],
  ['〜ずくめ','〜ずくめ','entirely ~; nothing but ~'],
  ['〜ながらも','〜ながらも','although ~ (despite)'],
  ['〜とはいえ','〜とはいえ','although ~; it is said that ~'],
];
for (const [j, r, m] of N1_EXPR) n1Rows.push(['expressions', 'Advanced pattern (文型)', j, r, m]);

// ------------------------------------------------------------
writeFileSync(out('n5/other.json'), JSON.stringify(makeItems('n5', n5Rows), null, 2) + '\n');
writeFileSync(out('n4/other.json'), JSON.stringify(makeItems('n4', n4Rows), null, 2) + '\n');
writeFileSync(out('n3/other.json'), JSON.stringify(makeItems('n3', n3Rows), null, 2) + '\n');
writeFileSync(out('n2/other.json'), JSON.stringify(makeItems('n2', n2Rows), null, 2) + '\n');
writeFileSync(out('n1/other.json'), JSON.stringify(makeItems('n1', n1Rows), null, 2) + '\n');
