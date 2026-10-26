/* =========================================================
   스피드모터스 인천 남동로점 — 정적 사이트 스크립트
   - 해시 라우팅: #/ · #/list · #/detail/1 · #/sell · #/store
   - 이미지는 /images 폴더에 아래 파일명으로 넣으면 자동 표시됩니다.
     hero.jpg, store.jpg, bike-{id}.jpg, bike-{id}-1.jpg ~ -4.jpg
   ========================================================= */

const CONFIG = {
  heroVariant: 'A',          // 'A' = 그레이 풀이미지 + 시세조회 바, 'B' = 라이트 스플릿
  phone: '032-000-0000',
  today: new Date()          // 예약 날짜 계산 기준
};

const MODELS = [
  { b: '혼다', m: 'PCX 125', cc: 125, base: 430 },
  { b: '혼다', m: '포르자 350', cc: 350, base: 820 },
  { b: '혼다', m: 'ADV 350', cc: 350, base: 880 },
  { b: '혼다', m: '비전 110', cc: 110, base: 260 },
  { b: '야마하', m: 'NMAX 125', cc: 125, base: 410 },
  { b: '야마하', m: 'XMAX 300', cc: 300, base: 760 },
  { b: '스즈키', m: '버그만 125', cc: 125, base: 380 },
  { b: 'SYM', m: '크루심 300', cc: 300, base: 560 },
  { b: 'SYM', m: '조이맥스 Z 125', cc: 125, base: 350 },
  { b: '킴코', m: '다운타운 350', cc: 350, base: 640 },
  { b: '베스파', m: '프리마베라 125', cc: 125, base: 620 },
  { b: '베스파', m: 'GTS 300', cc: 300, base: 980 }
];
const BRANDS = ['혼다', '야마하', '스즈키', 'SYM', '킴코', '베스파'];
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 9 }, (_, i) => THIS_YEAR - i);

// 매물 데이터 (d = 입고 후 경과일)
const STOCK = [
  { id: 1, m: 'PCX 125', y: 2024, km: 6200, p: 368, color: '매트 블랙', isNew: true, d: 1 },
  { id: 2, m: 'NMAX 125', y: 2023, km: 11800, p: 315, color: '다크 그레이', isNew: true, d: 2 },
  { id: 3, m: 'XMAX 300', y: 2022, km: 18400, p: 520, color: '블루', isNew: false, d: 8 },
  { id: 4, m: '포르자 350', y: 2023, km: 9600, p: 690, color: '화이트', isNew: true, d: 3 },
  { id: 5, m: 'GTS 300', y: 2021, km: 14200, p: 690, color: '베르데', isNew: false, d: 14 },
  { id: 6, m: '프리마베라 125', y: 2022, km: 7300, p: 455, color: '크림', isNew: false, d: 10 },
  { id: 7, m: '버그만 125', y: 2021, km: 24500, p: 235, color: '실버', isNew: false, d: 21 },
  { id: 8, m: 'ADV 350', y: 2024, km: 4100, p: 790, color: '매트 그레이', isNew: true, d: 2 },
  { id: 9, m: '크루심 300', y: 2020, km: 31000, p: 290, color: '블랙', isNew: false, d: 30 },
  { id: 10, m: '비전 110', y: 2023, km: 5400, p: 198, color: '레드', isNew: false, d: 12 },
  { id: 11, m: '다운타운 350', y: 2021, km: 22800, p: 385, color: '블랙', isNew: false, d: 18 },
  { id: 12, m: '조이맥스 Z 125', y: 2022, km: 15600, p: 228, color: '그레이', isNew: false, d: 9 }
].map(s => { const md = MODELS.find(x => x.m === s.m); return { ...s, brand: md.b, cc: md.cc }; });

const CC = [{ k: 'all', l: '전체' }, { k: 's', l: '125cc 이하' }, { k: 'm', l: '126 – 300cc' }, { k: 'l', l: '300cc 초과' }];
const SORTS = ['최신 입고순', '낮은 가격순', '높은 가격순', '낮은 주행거리순'];
const ACC = [{ k: 'none', l: '무사고', d: '사고 이력 없음', f: 1 }, { k: 'minor', l: '경미', d: '단순 슬립·스크래치', f: 0.92 }, { k: 'major', l: '있음', d: '프레임·구동계 수리', f: 0.78 }];
const LOOK = [{ k: 'a', l: '상', d: '눈에 띄는 흠 없음', f: 1.03 }, { k: 'b', l: '중', d: '생활 기스 수준', f: 1 }, { k: 'c', l: '하', d: '파손·교체 필요', f: 0.88 }];
const TUNE = [{ k: 'no', l: '순정', d: '튜닝 없음', f: 1 }, { k: 'light', l: '일부', d: '머플러·액세서리', f: 0.97 }, { k: 'heavy', l: '다수', d: '구조 변경 포함', f: 0.9 }];
const TIMES = ['10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
const DOW = ['일', '월', '화', '수', '목', '금', '토'];

/* ---------- helpers ---------- */
const $ = sel => document.querySelector(sel);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const won = v => `${Math.round(v).toLocaleString()}만원`;
const modelsOf = b => MODELS.filter(x => x.b === b).map(x => x.m);
const options = (list, cur, suffix = '') => list.map(o => `<option value="${esc(o)}"${String(o) === String(cur) ? ' selected' : ''}>${esc(o)}${suffix}</option>`).join('');
const ph = (src, label, cls = '') => `<div class="ph ${cls}" data-label="${esc(label)}"><img src="${src}" alt="${esc(label)}" onerror="this.remove()"></div>`;

function buyValue(model, year, km) {
  const md = MODELS.find(x => x.m === model); if (!md) return 0;
  const age = Math.max(0, THIS_YEAR - year);
  const kmF = 1 - Math.min(Number(km) || 0, 80000) / 80000 * 0.45;
  return md.base * Math.pow(0.88, age) * kmF * 0.72;
}
const range = v => `${Math.floor(v * 0.94 / 5) * 5}–${Math.ceil(v * 1.05 / 5) * 5}만원`;
function nextDays() {
  const out = []; const d = new Date(CONFIG.today); d.setDate(d.getDate() + 1);
  while (out.length < 7) {
    if (d.getDay() !== 0) out.push({ key: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`, dow: DOW[d.getDay()], date: `${d.getMonth() + 1}/${d.getDate()}` });
    d.setDate(d.getDate() + 1);
  }
  return out;
}
const meta = b => `${b.y}년 · ${b.km.toLocaleString()}km · ${b.cc}cc`;

/* ---------- state ---------- */
const state = {
  q: { brand: '혼다', model: 'PCX 125', year: 2023, km: 12000 },
  f: { brand: '전체', cc: 'all', maxPrice: 1200, maxKm: 60000 },
  sort: SORTS[0],
  step: 1, sellDone: false,
  s: { brand: '혼다', model: 'PCX 125', year: 2023, km: 12000, acc: 'none', look: 'b', tune: 'no', name: '', phone: '', day: null, agree: false },
  r: { open: false, done: false, purpose: '구매 상담', day: null, time: null, name: '', phone: '' }
};

/* ---------- views ---------- */
function cardHTML(b) {
  return `<a class="card" href="#/detail/${b.id}">
    ${ph(`images/bike-${b.id}.jpg`, `${b.m} 사진`)}
    ${b.isNew ? '<span class="badge" style="position:absolute">신규 입고</span>' : ''}
    <div class="card__body">
      <span class="card__brand">${esc(b.brand)}</span>
      <span class="card__name">${esc(b.m)}</span>
      <span class="card__meta">${meta(b)}</span>
      <div class="card__foot"><span class="card__price">${won(b.p)}</span><span class="card__more">상세보기 →</span></div>
    </div>
  </a>`;
}

function storeHTML() {
  return `<section class="store" id="store">
    <div class="container store__grid">
      <div class="store__info">
        <div><span class="eyebrow">STORE</span><h2 class="section-title">매장 안내</h2></div>
        <div class="info-table">
          <div class="info-row"><span>주소</span><span>인천광역시 남동구 남동대로 000</span></div>
          <div class="info-row"><span>영업시간</span><span>평일 10:00 – 20:00<br>토요일 10:00 – 18:00<br><span class="text-red">일요일 · 공휴일 휴무</span></span></div>
          <div class="info-row"><span>전화</span><span class="mono">${CONFIG.phone}</span></div>
        </div>
        <div class="btn-row">
          <a href="tel:${CONFIG.phone.replace(/-/g, '')}" class="btn btn--ink">전화 문의</a>
          <button class="btn btn--outline" data-action="reserve">방문 예약하기</button>
        </div>
      </div>
      ${ph('images/store.jpg', '매장 지도 또는 외관 사진', 'store__media')}
    </div>
  </section>`;
}

function homeHTML() {
  const { q } = state;
  const heroA = `<section class="hero hero-a">
    <div class="container hero-a__grid">
      <div class="hero-a__copy">
        <div>
          <span class="eyebrow eyebrow--cyan">SCOOTER SPECIALIST · INCHEON NAMDONG-RO</span>
          <h1>스쿠터,<br><em>제값</em>에 사고<br><em>제값</em>에 팝니다.</h1>
          <p>입고되는 모든 차량은 직접 점검 후 판매합니다. 매입은 시세 기준으로, 숨김 없이 안내드립니다.</p>
        </div>
        <div class="hero-a__ctas">
          <a href="#/list" class="cta-card cta-card--light"><span>구매</span><span>매물 보기 <span>→</span></span></a>
          <a href="#/sell" class="cta-card cta-card--teal"><span>판매</span><span>매입 신청 <span>→</span></span></a>
        </div>
      </div>
      <div class="ph hero-a__media" data-label="히어로 이미지 · 대표 스쿠터 사진">
        <img src="images/hero.jpg" alt="" onerror="this.remove()">
        <span class="badge">이번 주 신규 입고 ${STOCK.filter(b => b.isNew).length}대</span>
      </div>
    </div>
    <div class="container quick">
      <div class="quick__bar">
        <span class="quick__title">내 스쿠터 시세 조회</span>
        <label>브랜드<select data-q="brand">${options(BRANDS, q.brand)}</select></label>
        <label>모델<select data-q="model">${options(modelsOf(q.brand), q.model)}</select></label>
        <label>연식<select data-q="year">${options(YEARS, q.year, '년')}</select></label>
        <label>주행거리 (km)<input type="number" data-q="km" value="${q.km}"></label>
        <div class="quick__est"><span>예상 매입가</span><strong id="qEstimate">${range(buyValue(q.model, q.year, q.km))}</strong></div>
        <button class="btn btn--cyan" data-action="quick-sell">매입 신청하기 →</button>
      </div>
    </div>
  </section>`;

  const heroB = `<section class="hero hero-b">
    <div class="hero-b__grid">
      <div class="hero-b__copy">
        <div>
          <span class="eyebrow">인천 남동로 · 스쿠터 전문</span>
          <h1>타던 스쿠터는<br>정직하게 사고,<br>다음 스쿠터는<br>믿고 고르세요.</h1>
          <p>점검을 마친 차량만 판매하고, 매입가는 시세 기준으로 투명하게 안내합니다.</p>
        </div>
        <div class="hero-b__ctas">
          <a href="#/list" class="big-cta big-cta--ink"><div><strong>스쿠터 사기</strong><small>현재 보유 매물 ${STOCK.length}대</small></div><i>→</i></a>
          <a href="#/sell" class="big-cta big-cta--teal"><div><strong>스쿠터 팔기</strong><small>모델·연식·주행거리로 예상 매입가 확인</small></div><i>→</i></a>
        </div>
      </div>
      ${ph('images/hero.jpg', '히어로 이미지 · 매장 또는 대표 스쿠터', 'hero-b__media')}
    </div>
  </section>`;

  return (CONFIG.heroVariant === 'B' ? heroB : heroA) + storeHTML();
}

function filteredStock() {
  const { f } = state;
  const sorters = {
    '최신 입고순': (a, b) => a.d - b.d, '낮은 가격순': (a, b) => a.p - b.p,
    '높은 가격순': (a, b) => b.p - a.p, '낮은 주행거리순': (a, b) => a.km - b.km
  };
  return STOCK.filter(b => (f.brand === '전체' || b.brand === f.brand)
    && (f.cc === 'all' || (f.cc === 's' && b.cc <= 125) || (f.cc === 'm' && b.cc > 125 && b.cc <= 300) || (f.cc === 'l' && b.cc > 300))
    && b.p <= f.maxPrice && b.km <= f.maxKm).sort(sorters[state.sort]);
}

function listHTML() {
  const { f } = state;
  const list = filteredStock();
  return `<section class="page"><div class="container">
    <div class="page__head">
      <div><span class="eyebrow">INVENTORY</span><h1>매물 보기 <span>${list.length}</span></h1></div>
      <select class="select" data-action="sort">${options(SORTS, state.sort)}</select>
    </div>
    <div class="list-layout">
      <aside class="filters">
        <div class="filter"><span class="filter__title">브랜드</span>
          <div class="chips">${['전체', ...BRANDS].map(b => `<button class="chip${f.brand === b ? ' is-on' : ''}" data-f-brand="${esc(b)}">${esc(b)}</button>`).join('')}</div>
        </div>
        <div class="filter"><span class="filter__title">배기량</span>
          <div class="chips chips--col">${CC.map(c => `<button class="chip chip--row${f.cc === c.k ? ' is-on' : ''}" data-f-cc="${c.k}">${c.l}</button>`).join('')}</div>
        </div>
        <div class="filter"><span class="filter__title">최대 가격 <span id="priceLabel">${f.maxPrice >= 1200 ? '제한 없음' : won(f.maxPrice)}</span></span>
          <input type="range" min="100" max="1200" step="50" value="${f.maxPrice}" data-f-range="maxPrice">
        </div>
        <div class="filter"><span class="filter__title">최대 주행거리 <span id="kmLabel">${f.maxKm >= 60000 ? '제한 없음' : f.maxKm.toLocaleString() + 'km'}</span></span>
          <input type="range" min="5000" max="60000" step="5000" value="${f.maxKm}" data-f-range="maxKm">
        </div>
        <button class="link-btn" data-action="reset-filters">필터 초기화</button>
      </aside>
      <div class="results">
        ${list.length ? `<div class="cards">${list.map(cardHTML).join('')}</div>` : `<div class="empty">
          <strong>조건에 맞는 매물이 없습니다</strong>
          <span>원하시는 차량을 남겨주시면 입고 시 연락드립니다.</span>
          <button class="btn btn--ink btn--pill" data-action="reserve">상담 예약</button>
        </div>`}
      </div>
    </div>
  </div></section>`;
}

function detailHTML(id) {
  const b = STOCK.find(x => x.id === id) || STOCK[0];
  const related = STOCK.filter(x => x.id !== b.id)
    .sort((x, y) => Math.abs(x.cc - b.cc) - Math.abs(y.cc - b.cc) || Math.abs(x.p - b.p) - Math.abs(y.p - b.p)).slice(0, 4);
  const specs = [['제조사', b.brand], ['연식', `${b.y}년`], ['주행거리', `${b.km.toLocaleString()}km`], ['배기량', `${b.cc}cc`], ['색상', b.color], ['사고 이력', '무사고']];
  const checks = [['엔진·오일', '양호'], ['구동계·벨트', b.km > 20000 ? '교체 완료' : '양호'], ['브레이크', '양호'], ['타이어', b.km > 15000 ? '교체 완료' : '양호'], ['전기·등화', '양호'], ['서류·명의', '이상 없음']];
  return `<section class="page"><div class="container">
    <a href="#/list" class="back">← 매물 목록</a>
    <div class="detail">
      <div class="gallery">
        ${ph(`images/bike-${b.id}.jpg`, `${b.m} 대표 사진`, 'gallery__main')}
        <div class="gallery__thumbs">${['측면', '후면', '계기판', '엔진룸'].map((l, i) => ph(`images/bike-${b.id}-${i + 1}.jpg`, l)).join('')}</div>
        <div class="box"><span class="box__title">차량 정보</span>
          <div class="specs">${specs.map(([k, v]) => `<div class="spec"><span>${k}</span><strong>${esc(v)}</strong></div>`).join('')}</div>
        </div>
        <div class="box"><span class="box__title">입고 점검 결과 <small>스피드모터스 자체 점검</small></span>
          <div class="checks">${checks.map(([k, v]) => `<div class="check"><span>${k}</span><strong class="${v === '교체 완료' ? 'is-replaced' : ''}">${v}</strong></div>`).join('')}</div>
        </div>
      </div>
      <aside class="buy-panel">
        <div>
          <div class="buy-panel__tags"><span class="eyebrow eyebrow--cyan">${esc(b.brand)}</span>${b.isNew ? '<span class="badge">신규 입고</span>' : ''}</div>
          <h1>${esc(b.m)}</h1>
          <span class="buy-panel__meta">${meta(b)}</span>
        </div>
        <div class="buy-panel__price"><span>판매가</span><strong>${won(b.p)}</strong></div>
        <div class="stack">
          <button class="btn btn--cyan" data-action="reserve">방문 예약하고 실차 보기</button>
          <a href="tel:${CONFIG.phone.replace(/-/g, '')}" class="btn btn--ghost-dark">전화 문의 <small>${CONFIG.phone}</small></a>
        </div>
        <a href="#/sell" class="trade-in"><div><strong>타던 스쿠터가 있으신가요?</strong><small>매입 후 차액만 결제할 수 있어요</small></div><span>→</span></a>
      </aside>
    </div>
    <div class="related"><h2>비슷한 매물</h2><div class="cards">${related.map(cardHTML).join('')}</div></div>
  </div></section>`;
}

function sellHTML() {
  const { s, step } = state;
  const steps = [['차량 정보', 1], ['상태', 2], ['연락처', 3]].map(([l, n]) =>
    `<div class="step-pill${step === n ? ' is-current' : step > n ? ' is-done' : ''}"><span>0${n}</span>${l}</div>`).join('');

  if (state.sellDone) {
    return `<section class="sell"><div class="container">
      <div class="page__head"><div><span class="eyebrow eyebrow--cyan">SELL YOUR SCOOTER</span><h1>내 스쿠터 팔기</h1></div></div>
      <div class="done">
        <span class="done__icon">✓</span>
        <h2>매입 신청이 접수되었습니다</h2>
        <p>${esc(s.name || '고객')}님, ${esc(s.brand)} ${esc(s.model)} 매입 신청을 받았습니다. 영업시간 내 ${esc(s.phone || '입력하신 번호')}로 연락드려 방문 일정을 확정해 드릴게요.</p>
        <div class="btn-row"><a href="#/" class="btn btn--ink">홈으로</a><a href="#/list" class="btn btn--outline">매물 둘러보기</a></div>
      </div>
    </div></section>`;
  }

  const opt = (title, list, key) => `<div class="field"><span class="field__label">${title}</span>
    <div class="opt-grid">${list.map(o => `<button class="opt${s[key] === o.k ? ' is-on' : ''}" data-s-opt="${key}" data-v="${o.k}"><span>${o.l}</span><small>${o.d}</small></button>`).join('')}</div></div>`;

  let body = '';
  if (step === 1) body = `<div class="form-step"><h2>차량 정보를 알려주세요</h2>
    <div class="field"><span class="field__label">브랜드</span>
      <div class="chips">${BRANDS.map(b => `<button class="chip chip--box${s.brand === b ? ' is-on' : ''}" data-s-brand="${esc(b)}">${esc(b)}</button>`).join('')}</div>
    </div>
    <div class="fields">
      <label>모델<select class="input" data-s="model">${options(modelsOf(s.brand), s.model)}</select></label>
      <label>연식<select class="input" data-s="year">${options(YEARS, s.year, '년')}</select></label>
      <label>주행거리 (km)<input class="input input--mono" type="number" data-s="km" value="${s.km}"></label>
    </div></div>`;
  if (step === 2) body = `<div class="form-step"><h2>차량 상태를 선택해주세요</h2>
    ${opt('사고 이력', ACC, 'acc')}${opt('외관 상태', LOOK, 'look')}${opt('튜닝 여부', TUNE, 'tune')}</div>`;
  if (step === 3) body = `<div class="form-step"><h2>연락처와 방문 일정</h2>
    <div class="fields">
      <label>이름<input class="input" data-s="name" value="${esc(s.name)}" placeholder="홍길동"></label>
      <label>연락처<input class="input input--mono" data-s="phone" value="${esc(s.phone)}" placeholder="010-0000-0000"></label>
    </div>
    <div class="field"><span class="field__label">희망 방문일</span>
      <div class="days">${nextDays().map(d => `<button class="day${s.day === d.key ? ' is-on' : ''}" data-s-day="${d.key}"><small>${d.dow}</small><strong>${d.date}</strong></button>`).join('')}</div>
    </div>
    <label class="agree"><input type="checkbox" data-s-agree ${s.agree ? 'checked' : ''}>개인정보 수집·이용에 동의합니다 <span class="text-red">(필수)</span></label>
  </div>`;

  return `<section class="sell"><div class="container">
    <div class="page__head"><div><span class="eyebrow eyebrow--cyan">SELL YOUR SCOOTER</span><h1>내 스쿠터 팔기</h1></div><div class="steps">${steps}</div></div>
    <div class="sell-layout">
      <div class="sell-form">
        ${body}
        <div class="form-nav">
          <button class="btn btn--outline" data-action="prev" style="visibility:${step > 1 ? 'visible' : 'hidden'}">이전</button>
          <button class="btn btn--ink" data-action="next" id="nextBtn">${step < 3 ? '다음' : '매입 신청하기'}</button>
        </div>
      </div>
      <aside class="estimate" id="estimate">${estimateHTML()}</aside>
    </div>
  </div></section>`;
}

function estimateHTML() {
  const { s } = state;
  const f = ACC.find(x => x.k === s.acc).f * LOOK.find(x => x.k === s.look).f * TUNE.find(x => x.k === s.tune).f;
  const rows = [['차량', `${s.brand} ${s.model}`], ['연식', `${s.year}년`], ['주행거리', `${(Number(s.km) || 0).toLocaleString()}km`], ['사고 이력', ACC.find(x => x.k === s.acc).l], ['외관', LOOK.find(x => x.k === s.look).l]];
  return `<span>예상 매입가</span>
    <div class="estimate__value"><strong>${range(buyValue(s.model, s.year, s.km) * f)}</strong><small>입력하신 정보 기준 · 실차 확인 후 확정</small></div>
    <div class="summary">${rows.map(([k, v]) => `<div><span>${k}</span><strong>${esc(v)}</strong></div>`).join('')}</div>
    <p>급하신 경우 <a href="tel:${CONFIG.phone.replace(/-/g, '')}">${CONFIG.phone}</a>으로 바로 전화 주세요.</p>`;
}

function modalHTML() {
  const { r } = state;
  if (!r.open) return '';
  const days = nextDays();
  const ok = r.day && r.time && r.name && r.phone;
  const d = days.find(x => x.key === r.day);
  const inner = r.done
    ? `<div class="modal__done"><strong>예약 요청이 접수되었습니다</strong>
        <p>${d ? `${d.date}(${d.dow})` : ''} ${r.time || ''} ${r.purpose} 예약 요청을 받았습니다. 확인 전화를 드린 뒤 확정됩니다.</p>
        <button class="btn btn--ink" data-action="close-modal">확인</button></div>`
    : `<div class="grid-2">${['구매 상담', '매입 상담'].map(p => `<button class="chip chip--box${r.purpose === p ? ' is-on' : ''}" data-r-purpose="${p}">${p}</button>`).join('')}</div>
      <div class="field"><span class="field__label">날짜</span>
        <div class="grid-7">${days.map(x => `<button class="day${r.day === x.key ? ' is-on' : ''}" data-r-day="${x.key}"><small>${x.dow}</small><strong>${x.date}</strong></button>`).join('')}</div></div>
      <div class="field"><span class="field__label">시간</span>
        <div class="grid-4">${TIMES.map(t => `<button class="time${r.time === t ? ' is-on' : ''}" data-r-time="${t}">${t}</button>`).join('')}</div></div>
      <div class="grid-2">
        <input class="input" data-r="name" value="${esc(r.name)}" placeholder="이름">
        <input class="input input--mono" data-r="phone" value="${esc(r.phone)}" placeholder="연락처">
      </div>
      <button class="btn btn--teal" data-action="submit-reserve" id="reserveBtn" ${ok ? '' : 'disabled'}>예약 요청하기</button>`;
  return `<div class="modal" data-action="close-modal"><div class="modal__box">
    <div class="modal__head">방문 예약<button class="modal__close" data-action="close-modal" aria-label="닫기">✕</button></div>
    ${inner}
  </div></div>`;
}

/* ---------- render & routing ---------- */
function route() {
  const [, page, id] = (location.hash || '#/').split('/');
  return { page: page || 'home', id: Number(id) };
}

function render(keepScroll) {
  const { page, id } = route();
  const app = $('#app');
  const y = window.scrollY;
  if (page === 'list') app.innerHTML = listHTML();
  else if (page === 'detail') app.innerHTML = detailHTML(id);
  else if (page === 'sell') app.innerHTML = sellHTML();
  else app.innerHTML = homeHTML();

  document.querySelectorAll('[data-nav]').forEach(a => {
    const n = a.dataset.nav;
    a.classList.toggle('is-active', n === page || (n === 'list' && page === 'detail'));
  });
  if (page === 'store') { const el = $('#store'); if (el) window.scrollTo({ top: el.offsetTop - 72 }); }
  else window.scrollTo({ top: keepScroll ? y : 0 });
  updateNextBtn();
}

function renderModal() { $('#modal').innerHTML = modalHTML(); }

function canNext() {
  const { s, step } = state;
  return step < 3 || (s.name && s.phone && s.day && s.agree);
}
function updateNextBtn() { const b = $('#nextBtn'); if (b) b.disabled = !canNext(); }

window.addEventListener('hashchange', () => {
  if (route().page === 'sell' && state.sellDone) { state.sellDone = false; state.step = 1; }
  render();
});

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-action],[data-f-brand],[data-f-cc],[data-s-brand],[data-s-opt],[data-s-day],[data-r-purpose],[data-r-day],[data-r-time]');
  if (!t) return;
  const ds = t.dataset;

  if (ds.action === 'close-modal' && t.classList.contains('modal') && e.target !== t) return; // 박스 내부 클릭 무시
  switch (ds.action) {
    case 'reserve': state.r.open = true; state.r.done = false; renderModal(); return;
    case 'close-modal': state.r.open = false; renderModal(); return;
    case 'submit-reserve': state.r.done = true; renderModal(); return;
    case 'quick-sell':
      Object.assign(state.s, { brand: state.q.brand, model: state.q.model, year: state.q.year, km: state.q.km });
      state.step = 1; state.sellDone = false; location.hash = '#/sell'; return;
    case 'reset-filters': state.f = { brand: '전체', cc: 'all', maxPrice: 1200, maxKm: 60000 }; render(true); return;
    case 'prev': state.step = Math.max(1, state.step - 1); render(true); return;
    case 'next':
      if (!canNext()) return;
      if (state.step < 3) state.step++; else state.sellDone = true;
      render(true); return;
  }
  if (ds.fBrand) { state.f.brand = ds.fBrand; render(true); }
  if (ds.fCc) { state.f.cc = ds.fCc; render(true); }
  if (ds.sBrand) { state.s.brand = ds.sBrand; state.s.model = modelsOf(ds.sBrand)[0]; render(true); }
  if (ds.sOpt) { state.s[ds.sOpt] = ds.v; render(true); }
  if (ds.sDay) { state.s.day = ds.sDay; render(true); }
  if (ds.rPurpose) { state.r.purpose = ds.rPurpose; renderModal(); }
  if (ds.rDay) { state.r.day = ds.rDay; renderModal(); }
  if (ds.rTime) { state.r.time = ds.rTime; renderModal(); }
});

document.addEventListener('input', e => {
  const t = e.target, ds = t.dataset;
  if (ds.q) {
    const v = ds.q === 'year' ? Number(t.value) : t.value;
    state.q[ds.q] = v;
    if (ds.q === 'brand') { state.q.model = modelsOf(v)[0]; render(true); return; }
    $('#qEstimate').textContent = range(buyValue(state.q.model, state.q.year, state.q.km));
  }
  if (ds.fRange) {
    state.f[ds.fRange] = Number(t.value);
    const f = state.f;
    $('#priceLabel').textContent = f.maxPrice >= 1200 ? '제한 없음' : won(f.maxPrice);
    $('#kmLabel').textContent = f.maxKm >= 60000 ? '제한 없음' : f.maxKm.toLocaleString() + 'km';
    const list = filteredStock();
    $('.page__head h1 span').textContent = list.length;
    $('.results').innerHTML = list.length ? `<div class="cards">${list.map(cardHTML).join('')}</div>` : `<div class="empty"><strong>조건에 맞는 매물이 없습니다</strong><span>원하시는 차량을 남겨주시면 입고 시 연락드립니다.</span><button class="btn btn--ink btn--pill" data-action="reserve">상담 예약</button></div>`;
  }
  if (ds.s) {
    state.s[ds.s] = ds.s === 'year' ? Number(t.value) : t.value;
    $('#estimate').innerHTML = estimateHTML();
    updateNextBtn();
  }
  if (t.hasAttribute('data-s-agree')) { state.s.agree = t.checked; updateNextBtn(); }
  if (ds.r) {
    state.r[ds.r] = t.value;
    const b = $('#reserveBtn'); const r = state.r;
    if (b) b.disabled = !(r.day && r.time && r.name && r.phone);
  }
});

document.addEventListener('change', e => {
  if (e.target.dataset.action === 'sort') { state.sort = e.target.value; render(true); }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && state.r.open) { state.r.open = false; renderModal(); }
});

render();
