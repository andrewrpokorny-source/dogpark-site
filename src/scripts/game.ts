// Solo sample round of Dog Park, played on the traced board path.
// Rules follow /how-to-play; PAW cards and trivia are sample content.
import { board, type SpaceType } from '../data/board-path';

type Token = 'bone' | 'diamond' | 'heart';
type Place = 'doghouse' | 'drbens' | 'spa' | 'dogpark';
type Track = 'main' | 'loop';

interface Option { id: string; label: string; tone?: 'primary' | 'dark' | 'ghost' }

const TOKENS: Token[] = ['bone', 'diamond', 'heart'];
const NAMES: Record<Token, string> = { bone: 'bone', diamond: 'diamond', heart: 'heart' };
const GOAL = 5;
const LAST = board.cells.length - 1;
const IDX = board.index;

const PLACE_INFO: Record<Place, { name: string; xy: [number, number] }> = {
  doghouse: { name: 'the Dog House', xy: board.places.doghouse },
  drbens: { name: 'Dr. Ben’s Dog Clinic', xy: board.places.drbens },
  spa: { name: 'the Paw Spa', xy: board.places.spa },
  dogpark: { name: 'the Dog Park', xy: board.places.dogpark },
};

// --- Sample PAW deck (built from card types named in the rules) ---
type PawCard = { kind: 'take'; token: Token } | { kind: 'choice' } | { kind: 'question' } | { kind: 'goto'; place: Exclude<Place, 'dogpark'> } | { kind: 'dogpark' };
const PAW_DECK: PawCard[] = [
  ...Array(3).fill({ kind: 'take', token: 'bone' }),
  ...Array(2).fill({ kind: 'take', token: 'diamond' }),
  ...Array(2).fill({ kind: 'take', token: 'heart' }),
  ...Array(3).fill({ kind: 'choice' }),
  ...Array(4).fill({ kind: 'question' }),
  ...Array(2).fill({ kind: 'goto', place: 'doghouse' }),
  ...Array(2).fill({ kind: 'goto', place: 'drbens' }),
  ...Array(2).fill({ kind: 'goto', place: 'spa' }),
  ...Array(2).fill({ kind: 'dogpark' }),
];

// --- Sample doggy trivia ---
const TRIVIA: { q: string; a: string[]; correct: number }[] = [
  { q: 'How many teeth does an adult dog have?', a: ['28', '42', '52'], correct: 1 },
  { q: 'The Welsh Terrier comes from which country?', a: ['Scotland', 'Ireland', 'Wales'], correct: 2 },
  { q: 'What is a dog’s strongest sense?', a: ['Smell', 'Sight', 'Taste'], correct: 0 },
  { q: 'Which breed is the fastest runner?', a: ['Greyhound', 'Beagle', 'Bulldog'], correct: 0 },
  { q: 'What color are Dalmatian puppies when they’re born?', a: ['Spotted', 'All white', 'All black'], correct: 1 },
  { q: 'Which breed is known for its blue-black tongue?', a: ['Chow Chow', 'Poodle', 'Collie'], correct: 0 },
  { q: 'Which breed is famous for yodeling instead of barking?', a: ['Basenji', 'Husky', 'Pug'], correct: 0 },
  { q: 'Where are a dog’s main sweat glands?', a: ['Ears', 'Paw pads', 'Tail'], correct: 1 },
  { q: 'What do you call a group of puppies born together?', a: ['A herd', 'A litter', 'A pack'], correct: 1 },
  { q: 'Newfoundlands have webbed feet and are known as great…', a: ['Swimmers', 'Climbers', 'Diggers'], correct: 0 },
  { q: 'Which is the smallest dog breed?', a: ['Chihuahua', 'Dachshund', 'Corgi'], correct: 0 },
  { q: 'Compared with people, a dog’s normal body temperature is…', a: ['Lower', 'About the same', 'Higher'], correct: 2 },
];

const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initGame(root: HTMLElement) {
  const $ = <T extends HTMLElement = HTMLElement>(sel: string) => root.querySelector<T>(sel)!;
  const tokenEl = $('[data-token]');
  const tokenImg = $<HTMLImageElement>('[data-token-img]');
  const ring = $('[data-ring]');
  const dieEl = $('[data-die]');
  const primary = $<HTMLButtonElement>('[data-primary]');
  const eventBox = $('[data-event]');
  const logEl = $('[data-log]');
  const pupButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-pup]')];

  let s = fresh();
  let deck: PawCard[] = [];
  let trivia: typeof TRIVIA = [];
  let busy = false;

  function fresh() {
    return {
      track: 'main' as Track,
      i: 0,
      place: null as Place | null,
      skipTo: null as number | null,
      rollAgain: false,
      tokens: { bone: 0, diamond: 0, heart: 0 } as Record<Token, number>,
      dpCards: 1,
      choiceCards: 0,
      doorCards: [] as Token[],
      passedSign: false,
      txThisTurn: false,
      turn: 1,
      done: false,
      zoomies: (root.querySelector<HTMLInputElement>('[data-zoomies]')?.checked) ?? false,
    };
  }

  // ---------- helpers ----------
  const hasGoal = () => TOKENS.every((t) => s.tokens[t] >= GOAL);
  const total = () => TOKENS.reduce((n, t) => n + s.tokens[t], 0);
  const cellXY = (): [number, number] => {
    if (s.place) return PLACE_INFO[s.place].xy;
    const c = s.track === 'loop' ? board.loop[s.i] : board.cells[s.i];
    return [c[0], c[1]];
  };
  const spaceType = (): SpaceType => (s.track === 'loop' ? board.loop[s.i][2] : board.cells[s.i][2]);

  function log(msg: string, tone: 'good' | 'bad' | 'info' = 'info') {
    const li = document.createElement('li');
    li.className = 'flex gap-2 py-1.5';
    const dot = tone === 'good' ? 'bg-lime-deep' : tone === 'bad' ? 'bg-token-red' : 'bg-ink/30';
    li.innerHTML = `<span class="mt-1.5 size-2 shrink-0 rounded-full ${dot}"></span><span><span class="font-type text-[11px] text-ink-soft">T${s.turn}</span> ${msg}</span>`;
    logEl.prepend(li);
    while (logEl.children.length > 8) logEl.lastElementChild!.remove();
  }

  function give(t: Token, n = 1, why = '') {
    s.tokens[t] += n;
    log(`+${n} ${NAMES[t]}${n > 1 ? 's' : ''}${why ? ` ${why}` : ''}`, 'good');
    const el = root.querySelector<HTMLElement>(`[data-count="${t}"]`);
    el?.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 400 });
    render();
  }

  function showEvent(title: string, body = '', icon = '') {
    eventBox.innerHTML = `
      <div class="flex items-start gap-3">
        ${icon ? `<span class="grid size-11 shrink-0 place-items-center rounded-xl bg-lime-soft text-2xl">${icon}</span>` : ''}
        <div><p class="font-display text-lg font-bold leading-tight">${title}</p>${body ? `<p class="mt-1 text-sm text-ink-soft">${body}</p>` : ''}</div>
      </div>`;
  }

  function ask(title: string, body: string, options: Option[], icon = ''): Promise<string> {
    showEvent(title, body, icon);
    const row = document.createElement('div');
    row.className = 'mt-4 flex flex-wrap gap-2';
    eventBox.append(row);
    primary.disabled = true;
    return new Promise((resolve) => {
      for (const o of options) {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = `btn ${o.tone === 'dark' ? 'btn-dark' : o.tone === 'ghost' ? 'btn-ghost' : 'btn-primary'} !px-4 !py-2 text-sm`;
        b.textContent = o.label;
        b.addEventListener('click', () => { row.remove(); primary.disabled = false; resolve(o.id); });
        row.append(b);
      }
      (row.firstElementChild as HTMLElement | null)?.focus({ preventScroll: true });
    });
  }

  const tokenOptions = (filter: Token[] = TOKENS): Option[] => filter.map((t) => ({ id: t, label: `${t === 'bone' ? '🦴' : t === 'diamond' ? '💎' : '❤️'} ${NAMES[t][0].toUpperCase()}${NAMES[t].slice(1)}` }));

  // ---------- die ----------
  const PIPS: Record<number, number[]> = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  function drawDie(n: number) {
    dieEl.innerHTML = Array.from({ length: 9 }, (_, k) => `<span class="${PIPS[n].includes(k) ? 'bg-ink' : ''} size-2.5 place-self-center rounded-full sm:size-3"></span>`).join('');
    dieEl.setAttribute('aria-label', `Die shows ${n}`);
  }
  async function roll(): Promise<number> {
    const n = 1 + Math.floor(Math.random() * 6);
    if (!reduced()) {
      dieEl.animate([{ transform: 'rotate(0) scale(1)' }, { transform: 'rotate(200deg) scale(1.15)' }, { transform: 'rotate(360deg) scale(1)' }], { duration: 520, easing: 'cubic-bezier(.2,.7,.2,1)' });
      for (let k = 0; k < 6; k++) { drawDie(1 + Math.floor(Math.random() * 6)); await sleep(70); }
    }
    drawDie(n);
    return n;
  }

  // ---------- token movement ----------
  function placeToken(instant = false) {
    const [x, y] = cellXY();
    tokenEl.style.transitionDuration = instant ? '0ms' : s.place ? '600ms' : '170ms';
    tokenEl.style.left = `${x}%`;
    tokenEl.style.top = `${y}%`;
    ring.style.left = `${x}%`;
    ring.style.top = `${y}%`;
  }

  async function hop() {
    if (!reduced()) {
      tokenImg.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-35%)' }, { transform: 'translateY(0)' }], { duration: 170, easing: 'ease-out' });
    }
    placeToken();
    await sleep(reduced() ? 40 : 175);
  }

  async function goToPlace(p: Place) {
    s.place = p;
    placeToken();
    await sleep(650);
  }

  async function exitTo(index: number) {
    s.place = null;
    s.track = 'main';
    s.i = index;
    placeToken();
    await sleep(650);
  }

  async function move(steps: number) {
    for (let k = 0; k < steps; k++) {
      // Leaving the ARROW space: optionally re-walk the loop
      if (s.track === 'main' && s.i === IDX.arrow && !hasGoal()) {
        const pick = await ask('You’re at the ARROW', `Short on tokens? Follow the arrow to re-walk a loop of the path, or keep heading for TOP DOG. ${steps - k} step${steps - k === 1 ? '' : 's'} left.`, [
          { id: 'loop', label: 'Follow the arrow ↻', tone: 'dark' },
          { id: 'go', label: 'Head for TOP DOG', tone: 'ghost' },
        ], '➡️');
        if (pick === 'loop') { s.track = 'loop'; s.i = 0; log('Took the ARROW loop'); await hop(); continue; }
      }
      if (s.track === 'loop') {
        if (s.i < board.loop.length - 1) s.i++;
        else { s.track = 'main'; s.i = IDX.arrow + 1; }
      } else {
        s.i = Math.min(s.i + 1, LAST);
      }
      if (s.track === 'main' && s.i > IDX.parksign && !s.passedSign) { s.passedSign = true; log('Passed the DOG PARK sign. Your DOG PARK card is now playable.', 'good'); }
      await hop();
      if (s.track === 'main' && s.i === LAST) break; // no exact roll needed for TOP DOG
    }
    render();
  }

  // ---------- landing ----------
  async function land() {
    const t = spaceType();
    switch (t) {
      case 'bone':
        showEvent('Bone space!', 'Take 1 bone from the Dog Warden’s bone pile.', '🦴');
        give('bone', 1, '(bone space)');
        break;
      case 'pupcup': {
        const pick = await ask('PUP CUP!', 'Choose 1 bone or 1 heart from the Dog Warden.', tokenOptions(['bone', 'heart']), '🍦');
        give(pick as Token, 1, '(PUP CUP)');
        showEvent('Yum.', `You picked a ${pick}.`, '🍦');
        break;
      }
      case 'steal':
        showEvent('STEAL ONE BONE', 'No other dogs to rob in a sample round, so you take a bone from the Dog Warden instead.', '🦴');
        give('bone', 1, '(STEAL ONE BONE)');
        break;
      case 'baddog':
        showEvent('BAD DOG!', 'Off to the Dog House. Roll a 2, 4, or 6 to get out.', '🏠');
        log('Landed on BAD DOG. Sent to the Dog House', 'bad');
        await goToPlace('doghouse');
        break;
      case 'paw':
        await drawPaw();
        break;
      case 'topdog':
        await finish();
        break;
      case 'parksign':
        showEvent('The DOG PARK sign', 'From here on, you can play a DOG PARK card before rolling to visit the Dog Park and trade.', '🪧');
        break;
      case 'arrow':
        showEvent('The ARROW', hasGoal() ? 'You’ve got everything you need. Straight on to TOP DOG!' : 'Short on tokens? On your next move you can follow the arrow and re-walk a loop.', '➡️');
        break;
      default:
        showEvent(t === 'blank' || t === 'start' ? 'Nice stroll.' : 'Trotting along.', 'Nothing happens on this space.', '🐾');
    }
  }

  async function drawPaw() {
    if (!deck.length) deck = shuffle(PAW_DECK);
    const card = deck.pop()!;
    if (card.kind === 'take') {
      showEvent('PAW card', `Take 1 ${card.token} from the Dog Warden.`, '🐾');
      give(card.token, 1, '(PAW card)');
    } else if (card.kind === 'choice') {
      const pick = await ask('PAW card: CHOICE!', 'Use it now to take any token, or save it to play before a future roll.', [...tokenOptions(), { id: 'save', label: 'Save for later', tone: 'ghost' }], '🎁');
      if (pick === 'save') { s.choiceCards++; log('Saved a CHOICE card'); showEvent('CHOICE card saved', 'Play it before any future roll.', '🎁'); }
      else give(pick as Token, 1, '(CHOICE)');
    } else if (card.kind === 'question') {
      await askTrivia();
    } else if (card.kind === 'goto') {
      const info = card.place === 'doghouse' ? ['Go to the Dog House!', 'Roll a 2, 4, or 6 on a future turn to get out.', '🏠']
        : card.place === 'drbens' ? ['Visit Dr. Ben’s', 'Lose 1 turn, but add 1 bone.', '🩺']
        : ['Treat yourself at the Paw Spa', 'Lose 1 turn, but add 1 diamond.', '💅'];
      showEvent(`PAW card: ${info[0]}`, info[1], info[2]);
      log(`PAW card sent you to ${PLACE_INFO[card.place].name}`, card.place === 'doghouse' ? 'bad' : 'info');
      await goToPlace(card.place);
      if (card.place === 'drbens') { give('bone', 1, 'at Dr. Ben’s'); s.skipTo = IDX.cross; }
      if (card.place === 'spa') { give('diamond', 1, 'at the Paw Spa'); s.skipTo = IDX.spaexit; }
    } else {
      s.dpCards++;
      showEvent('PAW card: DOG PARK', 'You got another DOG PARK card. Save it for doggy deals.', '🌳');
      log('+1 DOG PARK card', 'good');
    }
  }

  async function askTrivia() {
    if (!trivia.length) trivia = shuffle(TRIVIA);
    const q = trivia.pop()!;
    const pick = await ask('QUESTION card', q.q, q.a.map((a, k) => ({ id: String(k), label: a, tone: 'ghost' as const })), '❓');
    if (+pick === q.correct) {
      const t = await ask('Correct! Good dog.', 'Choose 1 bone, diamond, or heart.', tokenOptions(), '🎉');
      give(t as Token, 1, '(trivia)');
      showEvent('Correct!', `You chose a ${t}.`, '🎉');
    } else {
      showEvent('Not quite!', `The answer was “${q.a[q.correct]}.” You neither win nor lose anything.`, '🤔');
      log('Missed a trivia question');
    }
  }

  async function finish() {
    s.done = true;
    if (hasGoal()) {
      showEvent('TOP DOG!', `You reached the center with all 15 tokens in ${s.turn} turns. Tail-wagging victory!`, '🏆');
      log('Reached TOP DOG with 5 of each. Winner!', 'good');
      confetti();
    } else {
      const missing = TOKENS.filter((t) => s.tokens[t] < GOAL).map((t) => `${GOAL - s.tokens[t]} ${NAMES[t]}${GOAL - s.tokens[t] > 1 ? 's' : ''}`).join(', ');
      showEvent('You made it to the center!', `You collected ${total()} tokens in ${s.turn} turns, but you’re still short ${missing}. In a full game you’d wait here and hope nobody else gets there first.`, '🐶');
      log('Reached the center without 5 of each');
    }
    render();
  }

  // ---------- turn flow ----------
  function endTurn() {
    s.turn++;
    s.txThisTurn = false;
    render();
  }

  async function rollAndMove() {
    const n = await roll();
    const steps = s.zoomies ? n * 2 : n;
    log(`Rolled a ${n}${s.zoomies ? ` (zoomies: ${steps} spaces)` : ''}`);
    await move(steps);
    await land();
  }

  async function onPrimary() {
    if (busy) return;
    if (s.done) { reset(); return; }
    busy = true;
    render();
    try {
      if (s.place === 'doghouse') {
        const n = await roll();
        if (n % 2 === 0) {
          log(`Rolled a ${n}. Out of the Dog House!`, 'good');
          showEvent(`Rolled a ${n}. You’re free!`, 'Move to DOG HOUSE EXIT and roll again.', '🎉');
          await exitTo(IDX.dhexit);
          s.rollAgain = true;
        } else {
          log(`Rolled a ${n}. Still in the Dog House`, 'bad');
          showEvent(`Rolled a ${n}…`, 'You need a 2, 4, or 6. Try again next turn.', '🏠');
          endTurn();
        }
      } else if ((s.place === 'drbens' || s.place === 'spa') && s.skipTo !== null) {
        const to = s.skipTo;
        s.skipTo = null;
        log(s.place === 'drbens' ? 'Turn’s up: moved to the CROSS' : 'Turn’s up: moved to SPA EXIT');
        showEvent('Back on the path', 'Roll on your next turn.', '🐾');
        await exitTo(to);
        endTurn();
      } else if (s.place === 'dogpark') {
        log('Left the Dog Park');
        await exitTo(IDX.dpexit);
        await rollAndMove();
        if (!s.done) endTurn();
      } else {
        s.rollAgain = false;
        await rollAndMove();
        if (!s.done) endTurn();
      }
    } finally {
      busy = false;
      render();
    }
  }

  // Pre-roll actions
  async function playChoice() {
    if (busy || !s.choiceCards || s.txThisTurn) return;
    busy = true;
    const t = await ask('Play your CHOICE card', 'Take any 1 token from the Dog Warden.', tokenOptions(), '🎁');
    s.choiceCards--; s.txThisTurn = true;
    give(t as Token, 1, '(CHOICE card)');
    busy = false; render();
  }

  async function playDogPark() {
    if (busy || !s.dpCards || !s.passedSign || s.place) return;
    busy = true;
    s.dpCards--;
    log('Played a DOG PARK card');
    showEvent('Welcome to the Dog Park!', 'Settle in. You can make 1 trade per turn, starting next turn.', '🌳');
    await goToPlace('dogpark');
    busy = false;
    // Using the card is this turn's move; trading starts next turn.
    endTurn();
  }

  async function trade(kind: 'warden' | 'door' | 'redeem') {
    if (busy) return;
    busy = true;
    try {
      if (kind === 'warden') {
        const can = TOKENS.filter((t) => s.tokens[t] >= 2);
        const give2 = await ask('Trade with the Dog Warden (2 for 1)', 'Which 2 matching tokens will you trade away?', [...tokenOptions(can), { id: 'x', label: 'Cancel', tone: 'ghost' }], '🤝');
        if (give2 === 'x') return;
        const get = await ask('…for which token?', '', tokenOptions(TOKENS.filter((t) => t !== give2)), '🤝');
        s.tokens[give2 as Token] -= 2; s.txThisTurn = true;
        log(`Traded 2 ${give2}s to the Dog Warden`);
        give(get as Token, 1, '(trade)');
      } else if (kind === 'door') {
        const can = TOKENS.filter((t) => s.tokens[t] >= 1);
        const g = await ask('Trade for a DOGGY DOOR card', 'Give 1 token for a face-down DOGGY DOOR card (it shows a bone, diamond, or heart).', [...tokenOptions(can), { id: 'x', label: 'Cancel', tone: 'ghost' }], '🚪');
        if (g === 'x') return;
        s.tokens[g as Token]--; s.txThisTurn = true;
        const card = TOKENS[Math.floor(Math.random() * 3)];
        log(`Traded 1 ${g} for a DOGGY DOOR card`);
        const r = await ask(`It’s a ${card}!`, 'Redeem it now, or save it to redeem before a later roll.', [{ id: 'now', label: 'Redeem now' }, { id: 'save', label: 'Save it', tone: 'ghost' }], '🚪');
        if (r === 'now') give(card, 1, '(DOGGY DOOR)'); else { s.doorCards.push(card); render(); }
      } else {
        const card = s.doorCards.shift()!;
        s.txThisTurn = true;
        give(card, 1, '(DOGGY DOOR)');
      }
    } finally { busy = false; render(); }
  }

  // ---------- rendering ----------
  function render() {
    for (const t of TOKENS) {
      const n = s.tokens[t];
      root.querySelector(`[data-count="${t}"]`)!.textContent = String(n);
      const bar = root.querySelector<HTMLElement>(`[data-bar="${t}"]`)!;
      bar.style.width = `${Math.min(100, (n / GOAL) * 100)}%`;
      bar.parentElement!.parentElement!.classList.toggle('is-full', n >= GOAL);
    }
    $('[data-turn]').textContent = String(s.turn);
    $('[data-total]').textContent = String(total());
    $('[data-progress]').style.width = `${(s.track === 'main' ? s.i / LAST : IDX.arrow / LAST) * 100}%`;

    // Primary label
    primary.disabled = busy;
    primary.textContent = s.done ? 'Play again'
      : s.place === 'doghouse' ? 'Roll for a 2, 4 or 6'
      : s.place === 'drbens' ? 'Head to the CROSS'
      : s.place === 'spa' ? 'Head to SPA EXIT'
      : s.place === 'dogpark' ? 'Leave the park & roll'
      : s.rollAgain ? 'Roll again!' : 'Roll the die';

    // Card actions
    const preRoll = !busy && !s.done;
    const choiceBtn = $<HTMLButtonElement>('[data-play-choice]');
    choiceBtn.hidden = !s.choiceCards;
    choiceBtn.disabled = !preRoll || s.txThisTurn || !!s.place && s.place !== 'dogpark';
    choiceBtn.querySelector('span')!.textContent = String(s.choiceCards);

    const dpBtn = $<HTMLButtonElement>('[data-play-dp]');
    dpBtn.disabled = !preRoll || !s.dpCards || !s.passedSign || !!s.place;
    dpBtn.title = !s.passedSign ? 'Playable once you pass the DOG PARK sign' : '';
    dpBtn.querySelector('span')!.textContent = String(s.dpCards);

    const doorBtn = $<HTMLButtonElement>('[data-redeem-door]');
    doorBtn.hidden = !s.doorCards.length;
    doorBtn.disabled = !preRoll || s.txThisTurn;
    doorBtn.querySelector('span')!.textContent = s.doorCards.length ? `(${s.doorCards[0]})` : '';

    const park = $('[data-park]');
    park.hidden = s.place !== 'dogpark';
    const canTrade = preRoll && s.place === 'dogpark' && !s.txThisTurn;
    $<HTMLButtonElement>('[data-trade="warden"]').disabled = !canTrade || !TOKENS.some((t) => s.tokens[t] >= 2);
    $<HTMLButtonElement>('[data-trade="door"]').disabled = !canTrade || total() === 0;
    $('[data-park-note]').textContent = s.txThisTurn ? 'You’ve made your 1 trade this turn.' : '1 trade per turn, made before you roll.';
    $<HTMLButtonElement>('[data-stay]').disabled = !preRoll;

    // Ring highlight on current space
    ring.classList.toggle('opacity-0', !!s.place);
  }

  function setPup(id: string) {
    const btn = pupButtons.find((b) => b.dataset.pup === id) ?? pupButtons[0];
    pupButtons.forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    tokenImg.src = btn.dataset.img!;
    tokenEl.style.setProperty('--pup', btn.dataset.hex!);
    $('[data-pup-name]').textContent = btn.dataset.name!;
  }

  function reset() {
    s = fresh();
    deck = shuffle(PAW_DECK);
    trivia = shuffle(TRIVIA);
    logEl.innerHTML = '';
    drawDie(1);
    placeToken(true);
    showEvent('Ready when you are!', 'Collect 5 bones, 5 diamonds, and 5 hearts, then race to TOP DOG. Roll to start.', '🐾');
    log('New game. You start with 1 DOG PARK card.');
    render();
  }

  // ---------- confetti ----------
  function confetti() {
    if (reduced()) return;
    const layer = $('[data-confetti]');
    const colors = ['#b4cb76', '#e8432f', '#899dbd', '#e5d29f', '#e7a391', '#2fb5e3'];
    for (let k = 0; k < 90; k++) {
      const p = document.createElement('i');
      p.style.cssText = `position:absolute;left:${Math.random() * 100}%;top:-5%;width:${6 + Math.random() * 6}px;height:${10 + Math.random() * 8}px;background:${colors[k % colors.length]};border-radius:2px;`;
      layer.append(p);
      p.animate([{ transform: `translate(0,0) rotate(0)` }, { transform: `translate(${(Math.random() - 0.5) * 200}px, ${500 + Math.random() * 300}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }], { duration: 1800 + Math.random() * 1400, easing: 'cubic-bezier(.2,.6,.4,1)' }).onfinish = () => p.remove();
    }
  }

  // ---------- wire up ----------
  primary.addEventListener('click', onPrimary);
  $('[data-play-choice]').addEventListener('click', playChoice);
  $('[data-play-dp]').addEventListener('click', playDogPark);
  $('[data-redeem-door]').addEventListener('click', () => trade('redeem'));
  $('[data-trade="warden"]').addEventListener('click', () => trade('warden'));
  $('[data-trade="door"]').addEventListener('click', () => trade('door'));
  $('[data-stay]').addEventListener('click', () => { if (!busy) { log('Stayed in the Dog Park'); showEvent('Lounging in the park', 'You can trade again next turn.', '🌳'); endTurn(); } });
  $('[data-new]').addEventListener('click', () => { if (!busy) reset(); });
  root.querySelector<HTMLInputElement>('[data-zoomies]')?.addEventListener('change', (e) => { s.zoomies = (e.target as HTMLInputElement).checked; });
  pupButtons.forEach((b) => b.addEventListener('click', () => { setPup(b.dataset.pup!); history.replaceState(null, '', `?pup=${b.dataset.pup}`); }));
  document.addEventListener('keydown', (e) => {
    if ((e.key === ' ' || e.key === 'Enter') && document.activeElement === document.body) { e.preventDefault(); onPrimary(); }
  });

  setPup(new URLSearchParams(location.search).get('pup') ?? 'green');
  reset();
}
