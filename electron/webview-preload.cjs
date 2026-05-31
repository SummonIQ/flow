const { ipcRenderer } = require('electron');

const FLOW_BUTTON_ID = 'flow-extract-to-flow';
const FLOW_CARD_BUTTON_CLASS = 'flow-extract-to-flow-card';
const FLOW_FLOATING_ID = 'flow-extract-floating';
const FLOW_LAST_SENT_KEY = '__flowUpworkLastSent';
const FLOW_LAST_LIST_SENT_KEY = '__flowUpworkLastListSent';

function safeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function buildSelectorForElement(el) {
  if (!(el instanceof Element)) return '';
  if (el.id) return `#${CSS.escape(el.id)}`;
  const tag = el.tagName.toLowerCase();
  const classList = Array.from(el.classList || [])
    .filter(Boolean)
    .slice(0, 4);
  if (classList.length) {
    return `${tag}.${classList.map(c => CSS.escape(c)).join('.')}`;
  }
  return tag;
}

function buildElementInfo(el) {
  if (!(el instanceof HTMLElement)) return null;
  return {
    selector: buildSelectorForElement(el),
    tagName: el.tagName.toLowerCase(),
    id: el.id || undefined,
    classes: Array.from(el.classList || []).filter(Boolean),
    text: safeText(el.textContent).slice(0, 200) || undefined,
    href:
      el instanceof HTMLAnchorElement
        ? safeText(el.href || '') || undefined
        : undefined,
  };
}

let scraperPickActive = false;
let scraperPickCleanup = null;
let scraperPickStepId = null;
let scraperPickLast = null;
let scraperCursor = null;

function ensureScraperCursor() {
  if (scraperCursor) return scraperCursor;
  const el = document.createElement('div');
  el.style.position = 'fixed';
  el.style.top = '0';
  el.style.left = '0';
  el.style.width = '12px';
  el.style.height = '12px';
  el.style.borderRadius = '999px';
  el.style.background = 'rgba(255, 255, 255, 0.9)';
  el.style.boxShadow = '0 6px 12px rgba(0,0,0,0.35)';
  el.style.pointerEvents = 'none';
  el.style.zIndex = '999999';
  el.style.transition = 'transform 220ms ease-out, opacity 200ms ease-out';
  el.style.opacity = '0';
  document.body.appendChild(el);
  scraperCursor = el;
  return scraperCursor;
}

function moveScraperCursor() {
  const cursor = ensureScraperCursor();
  const x = Math.max(8, Math.random() * (window.innerWidth - 16));
  const y = Math.max(8, Math.random() * (window.innerHeight - 16));
  cursor.style.opacity = '1';
  cursor.style.transform = `translate(${x}px, ${y}px)`;
  window.setTimeout(() => {
    if (cursor) cursor.style.opacity = '0';
  }, 460);
}

function stopScraperPick() {
  if (scraperPickCleanup) {
    try {
      scraperPickCleanup();
    } catch {}
  }
  scraperPickCleanup = null;
  scraperPickActive = false;
  scraperPickStepId = null;
  if (scraperPickLast) {
    try {
      scraperPickLast.style.outline = '';
      scraperPickLast.style.outlineOffset = '';
    } catch {}
  }
  scraperPickLast = null;
}

function startScraperPick(stepId) {
  if (scraperPickActive) stopScraperPick();
  scraperPickActive = true;
  scraperPickStepId = stepId || null;

  const onMove = event => {
    if (!scraperPickActive) return;
    const target = event.target instanceof HTMLElement ? event.target : null;
    if (!target || !isVisible(target)) return;
    if (scraperPickLast && scraperPickLast !== target) {
      scraperPickLast.style.outline = '';
      scraperPickLast.style.outlineOffset = '';
    }
    scraperPickLast = target;
    scraperPickLast.style.outline = '2px solid #22c55e';
    scraperPickLast.style.outlineOffset = '2px';
  };

  const onClick = event => {
    if (!scraperPickActive) return;
    event.preventDefault();
    event.stopPropagation();
    const target = event.target instanceof HTMLElement ? event.target : null;
    const info = target ? buildElementInfo(target) : null;
    sendToHostScraperPickResult({
      stepId: scraperPickStepId || undefined,
      href: window.location.href,
      element: info,
    });
    stopScraperPick();
  };

  document.addEventListener('mouseover', onMove, true);
  document.addEventListener('click', onClick, true);

  scraperPickCleanup = () => {
    document.removeEventListener('mouseover', onMove, true);
    document.removeEventListener('click', onClick, true);
  };
}

function findLoginField() {
  const selectors = [
    'input[type="email"]',
    'input[autocomplete="username"]',
    'input[id*="username" i]',
    'input[name*="username" i]',
    'input[id*="email" i]',
    'input[name*="email" i]',
  ];
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el instanceof HTMLInputElement && isVisible(el)) return el;
  }
  return null;
}

function findPasswordField() {
  const selectors = [
    'input[type="password"]',
    'input[autocomplete="current-password"]',
    'input[id*="password" i]',
    'input[name*="password" i]',
  ];
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el instanceof HTMLInputElement && isVisible(el)) return el;
  }
  return null;
}

function isLoginUrl() {
  try {
    const url = new URL(window.location.href);
    return url.pathname.includes('/ab/account-security/login');
  } catch {
    return false;
  }
}

async function attemptLogin(username, password) {
  if (!username || !password) return false;

  const loginField = findLoginField();
  if (loginField) {
    setNativeValue(loginField, username);
    await sleep(200);
    const didAdvance =
      (await clickFirstButtonByText(['continue', 'next', 'log in', 'login'])) ||
      (await clickFirstButtonByText(['sign in']));
    if (didAdvance) {
      await sleep(1200);
    }
  }

  const passwordField = findPasswordField();
  if (passwordField) {
    setNativeValue(passwordField, password);
    await sleep(200);
    await clickFirstButtonByText(['log in', 'login', 'sign in']);
    await sleep(1600);
    return true;
  }

  return false;
}

function firstText(selectors, root = document) {
  for (const selector of selectors) {
    const el = root.querySelector(selector);
    const text = safeText(el && el.textContent);
    if (text) return text;
  }
  return '';
}

function joinParagraphText(root) {
  if (!root) return '';
  const paragraphs = Array.from(root.querySelectorAll('p'))
    .map(p => safeText(p.textContent))
    .filter(Boolean);
  if (paragraphs.length) return paragraphs.join('\n\n');
  return safeText(root.textContent);
}

function findSectionByHeading(root, headingMatchers) {
  if (!root) return null;
  const headings = Array.from(
    root.querySelectorAll('h1, h2, h3, h4, h5, strong'),
  );
  for (const heading of headings) {
    const label = safeText(heading.textContent).toLowerCase();
    if (!label) continue;
    if (!headingMatchers.some(match => label.includes(match))) continue;

    let node = heading.parentElement;
    for (let i = 0; i < 4 && node; i += 1) {
      const text = joinParagraphText(node);
      if (text && text.length >= 40) return node;
      node = node.parentElement;
    }
  }
  return null;
}

function closeJobDetailsPanel() {
  const closeSelectors = [
    'button[aria-label*="close" i]',
    'button[title*="close" i]',
    '[data-test*="close" i] button',
    '[data-test*="close" i]',
    '[data-test*="drawer" i] button[aria-label*="close" i]',
    '[data-test*="modal" i] button[aria-label*="close" i]',
    '[role="dialog"] button[aria-label*="close" i]',
  ];

  for (const selector of closeSelectors) {
    const btn = document.querySelector(selector);
    if (btn instanceof HTMLElement && isVisible(btn)) {
      btn.click();
      return true;
    }
  }

  const event = new KeyboardEvent('keydown', {
    key: 'Escape',
    keyCode: 27,
    which: 27,
    bubbles: true,
  });
  document.dispatchEvent(event);
  const textMatches = [
    'close',
    'back',
    'return to search',
    'back to results',
    'back to search',
    'go back',
    'cancel',
  ];
  const fallback = Array.from(document.querySelectorAll('button'))
    .filter(btn => btn instanceof HTMLButtonElement)
    .find(btn =>
      textMatches.some(match =>
        safeText(btn.textContent).toLowerCase().includes(match),
      ),
    );
  if (fallback && fallback instanceof HTMLElement && isVisible(fallback)) {
    fallback.click();
  }
  return false;
}

function rootText(root) {
  if (!root) return '';
  return safeText(root.textContent);
}

function matchFromText(text, regex) {
  if (!text) return '';
  const match = text.match(regex);
  if (!match) return '';
  return safeText(match[1] || match[0]);
}

function normalizeRangeText(value) {
  const raw = safeText(value);
  if (!raw) return '';
  return raw.replace(/\s+/g, ' ').trim();
}

function normalizeJobUrl(url) {
  const raw = safeText(url);
  if (!raw) return '';
  try {
    const parsed = new URL(raw);
    parsed.hash = '';
    parsed.search = '';
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return raw.replace(/#.*$/, '').replace(/\?.*$/, '').replace(/\/$/, '');
  }
}

function dispatchMouseEvent(target, type, clientX, clientY) {
  if (!target) return;
  target.dispatchEvent(
    new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      view: window,
      clientX,
      clientY,
    }),
  );
}

function randomBetween(min, max) {
  return Math.floor(min + Math.random() * (max - min));
}

async function jitterMouseOver(target) {
  if (!(target instanceof HTMLElement)) return;
  const rect = target.getBoundingClientRect();
  if (!rect.width || !rect.height) return;

  const steps = 3;
  for (let i = 0; i < steps; i += 1) {
    const x = randomBetween(rect.left + 6, rect.right - 6);
    const y = randomBetween(rect.top + 4, rect.bottom - 4);
    dispatchMouseEvent(document, 'mousemove', x, y);
    dispatchMouseEvent(target, 'mousemove', x, y);
    await sleep(randomBetween(80, 180));
  }
  dispatchMouseEvent(target, 'mouseover', rect.left + 6, rect.top + 6);
  dispatchMouseEvent(target, 'mouseenter', rect.left + 6, rect.top + 6);
}

function findJobLinkByUrl(targetUrl) {
  const normalizedTarget = normalizeJobUrl(targetUrl);
  if (!normalizedTarget) return null;
  const cardSelectors = '[data-test*="job-tile" i], [data-test*="job-card" i]';
  const cards = Array.from(document.querySelectorAll(cardSelectors));
  for (const card of cards) {
    if (!(card instanceof HTMLElement)) continue;
    const link = card.querySelector('a[href*="/jobs/"]');
    if (!(link instanceof HTMLAnchorElement)) continue;
    const normalized = normalizeJobUrl(link.href || '');
    if (normalized && normalized === normalizedTarget) {
      return link;
    }
  }

  const links = Array.from(document.querySelectorAll('a[href*="/jobs/"]'));
  for (const link of links) {
    if (!(link instanceof HTMLAnchorElement)) continue;
    if (link.closest('[role="dialog"]')) continue;
    if (link.closest('[data-test*="modal" i]')) continue;
    if (link.closest('[data-test*="drawer" i]')) continue;
    const normalized = normalizeJobUrl(link.href || '');
    if (normalized && normalized === normalizedTarget) {
      return link;
    }
  }
  return null;
}

function extractFromDetailsPage() {
  const title = firstText([
    '[data-test="job-title"]',
    '[data-test="job-title"], h1',
    'h1',
  ]);

  const descRoot =
    document.querySelector('[data-test="job-description-text"]') ||
    document.querySelector('[data-test="job-description"]') ||
    document.querySelector('[data-test*="job-description" i]') ||
    document.querySelector('[data-qa="job-description"]') ||
    document.querySelector('[aria-label*="description" i]') ||
    document.querySelector('section[data-test*="description" i]') ||
    findSectionByHeading(document, ['description', 'job details']) ||
    document.querySelector('article') ||
    document.querySelector('main');

  const description = joinParagraphText(descRoot);

  const pageRoot =
    document.querySelector('main') ||
    document.querySelector('[role="main"]') ||
    document.body;
  const pageText = rootText(pageRoot);

  const paymentVerified = /payment\s+verified/i.test(pageText);
  const clientSpent = matchFromText(pageText, /(\$\s?[0-9][0-9,\.]*\s*spent)/i);
  const proposals = normalizeRangeText(
    matchFromText(pageText, /proposals\s*:\s*([^\n\r]{1,40})/i),
  );
  const bids = normalizeRangeText(
    matchFromText(pageText, /bids\s*:\s*([^\n\r]{1,40})/i),
  );
  const avgBid = normalizeRangeText(
    matchFromText(pageText, /avg(?:\.|erage)?\s*bid\s*:?\s*([^\n\r]{1,40})/i),
  );
  const posted = normalizeRangeText(
    matchFromText(pageText, /posted\s+([^\n\r]{1,40})/i),
  );

  const budgetLine = normalizeRangeText(
    matchFromText(
      pageText,
      /((?:fixed\s+price|hourly)[^\n\r]{0,80}(?:est\.?\s*budget\s*:\s*[^\n\r]{1,40})?)/i,
    ),
  );
  const budgetEstimate = normalizeRangeText(
    matchFromText(pageText, /est\.?\s*budget\s*:\s*([^\n\r]{1,40})/i),
  );
  const budgetType = normalizeRangeText(
    matchFromText(pageText, /(fixed\s+price|hourly)/i),
  );
  const experienceLevel = normalizeRangeText(
    matchFromText(pageText, /-\s*(entry\s+level|intermediate|expert)\b/i),
  );

  const connectsRequiredText = matchFromText(
    pageText,
    /(\d+)\s+required\s+connects/i,
  );
  const connectsRequired = connectsRequiredText
    ? parseInt(connectsRequiredText, 10)
    : undefined;

  const duration = normalizeRangeText(
    matchFromText(pageText, /duration\s*:?\s*([^\n\r]{1,40})/i),
  );
  const projectType = normalizeRangeText(
    matchFromText(pageText, /project\s+type\s*:?\s*([^\n\r]{1,40})/i),
  );
  const weeklyHours = normalizeRangeText(
    matchFromText(pageText, /hours\s+per\s+week\s*:?\s*([^\n\r]{1,40})/i),
  );
  const hourlyRange = normalizeRangeText(
    matchFromText(
      pageText,
      /(\$[0-9][0-9,.\s]*\s*-\s*\$[0-9][0-9,.\s]*\s*\/?\s*hr)/i,
    ),
  );
  const fixedPrice = normalizeRangeText(
    matchFromText(pageText, /fixed\s+price\s*:?\s*([^\n\r]{1,40})/i),
  );
  const location = normalizeRangeText(
    matchFromText(pageText, /([a-z\.\s]+freelancers\s+only)/i),
  );
  const activity = normalizeRangeText(
    matchFromText(pageText, /activity\s+on\s+this\s+job\s*([^\n\r]{1,80})/i),
  );
  const clientLocation = normalizeRangeText(
    matchFromText(pageText, /location\s*:?\s*([^\n\r]{1,40})/i),
  );
  const clientJobsPostedText = matchFromText(
    pageText,
    /(\d+)\s+jobs\s+posted/i,
  );
  const clientJobsPosted = clientJobsPostedText
    ? parseInt(clientJobsPostedText, 10)
    : undefined;
  const clientHireRate = normalizeRangeText(
    matchFromText(pageText, /hire\s+rate\s*:?\s*([^\n\r]{1,20})/i),
  );
  const clientAvgHourly = normalizeRangeText(
    matchFromText(pageText, /avg\.?\s+hourly\s+rate\s*:?\s*([^\n\r]{1,20})/i),
  );
  const clientHourlyRange = normalizeRangeText(
    matchFromText(pageText, /hourly\s+rate\s*:?\s*([^\n\r]{1,40})/i),
  );
  const clientTotalHiresText = matchFromText(pageText, /(\d+)\s+hires/i);
  const clientTotalHires = clientTotalHiresText
    ? parseInt(clientTotalHiresText, 10)
    : undefined;
  const clientOpenJobsText = matchFromText(pageText, /(\d+)\s+open\s+jobs/i);
  const clientOpenJobs = clientOpenJobsText
    ? parseInt(clientOpenJobsText, 10)
    : undefined;

  const skills = Array.from(
    document.querySelectorAll(
      '[data-test*="skill" i], [data-test*="token" i], a[href*="/skills/"]',
    ),
  )
    .map(el => safeText(el.textContent))
    .filter(Boolean);

  return {
    url: window.location.href,
    title,
    description,
    tags: Array.from(new Set(skills)).slice(0, 30),
    paymentVerified,
    clientSpent,
    proposals,
    bids,
    avgBid,
    posted,
    budgetLine,
    budgetType,
    experienceLevel,
    budgetEstimate,
    connectsRequired,
    duration,
    projectType,
    location,
    activity,
    clientLocation,
    clientJobsPosted,
    clientHireRate,
    clientHourlyRange,
    clientAvgHourly,
    clientTotalHires,
    clientOpenJobs,
    weeklyHours,
    hourlyRange,
    fixedPrice,
    source: 'details',
  };
}

function extractAllFromListingPage() {
  const links = Array.from(document.querySelectorAll('a[href]'));
  const seen = new Set();
  const results = [];

  for (const link of links) {
    if (!(link instanceof HTMLAnchorElement)) continue;
    if (!link.href) continue;

    if (!isLikelyJobDetailUrl(link.href)) continue;

    const card =
      link.closest('[data-test*="job-tile" i]') ||
      link.closest('[data-test*="job-card" i]') ||
      link.closest('article') ||
      link.closest('li') ||
      link.closest('section') ||
      link.closest('div');

    if (!(card instanceof HTMLElement)) continue;
    if (seen.has(card)) continue;
    seen.add(card);

    const item = extractFromCard(card);
    const title = safeText(item.title);
    if (!title) continue;
    results.push(item);
    if (results.length >= 50) break;
  }

  return results;
}

function isLikelyJobDetailUrl(href) {
  try {
    const u = new URL(href);
    const path = u.pathname || '';
    if (!/\.upwork\.com$/i.test(u.hostname)) return false;
    if (path.startsWith('/nx/jobs/search')) return false;
    if (path.startsWith('/jobs/search')) return false;
    if (!path.includes('/jobs/')) return false;

    // Job detail URLs usually include a stable token like "~01...".
    if (path.includes('~')) return true;
    // Fallback: allow long numeric ids if present.
    if (/\d{6,}/.test(path)) return true;
    return false;
  } catch {
    return false;
  }
}

function isLikelyListingUrl(href) {
  try {
    const u = new URL(href);
    const path = u.pathname || '';
    if (!/\.upwork\.com$/i.test(u.hostname)) return false;
    if (path.startsWith('/nx/jobs/search')) return true;
    if (path.startsWith('/jobs/search')) return true;
    if (path.startsWith('/nx/search/jobs')) return true;
    if (path.startsWith('/nx/find-work')) return true;
    return false;
  } catch {
    return false;
  }
}

function stableListSignature(items) {
  if (!Array.isArray(items)) return '';
  const first = items
    .slice(0, 15)
    .map(it => `${safeText(it && it.url)}|${safeText(it && it.title)}`)
    .join('||');
  const last = items
    .slice(-15)
    .map(it => `${safeText(it && it.url)}|${safeText(it && it.title)}`)
    .join('||');
  return `${items.length}::${first}::${last}`;
}

function maybeAutoExtractListings() {
  const items = extractAllFromListingPage();
  if (!items.length) return false;
  const sig = stableListSignature(items);
  if (!sig) return false;
  if (window[FLOW_LAST_LIST_SENT_KEY] === sig) return true;
  window[FLOW_LAST_LIST_SENT_KEY] = sig;
  sendToHostJobs({ items, auto: true, href: window.location.href });
  return true;
}

function extractFromCard(cardRoot) {
  const link = cardRoot.querySelector('a[href*="/jobs/"]');
  const linkText = safeText(link && link.textContent);
  const title =
    firstText(['h4', 'h3', '[data-test*="job-title" i]'], cardRoot) || linkText;

  const paragraphs = Array.from(cardRoot.querySelectorAll('p'))
    .map(p => safeText(p.textContent))
    .filter(Boolean)
    .filter(t => t.length >= 40);
  const description =
    firstText(['[data-test*="description" i]'], cardRoot) ||
    (paragraphs.length ? paragraphs[0] : '');

  const href = link && link.href ? link.href : window.location.href;

  const cardText = rootText(cardRoot);
  const paymentVerified = /payment\s+verified/i.test(cardText);
  const clientSpent = matchFromText(cardText, /(\$\s?[0-9][0-9,\.]*\s*spent)/i);
  const proposals = normalizeRangeText(
    matchFromText(cardText, /proposals\s*:\s*([^\n\r]{1,40})/i),
  );
  const posted = normalizeRangeText(
    matchFromText(cardText, /posted\s+([^\n\r]{1,40})/i),
  );

  const budgetLine = normalizeRangeText(
    matchFromText(
      cardText,
      /((?:fixed\s+price|hourly)[^\n\r]{0,80}(?:est\.?\s*budget\s*:\s*[^\n\r]{1,40})?)/i,
    ),
  );
  const budgetEstimate = normalizeRangeText(
    matchFromText(cardText, /est\.?\s*budget\s*:\s*([^\n\r]{1,40})/i),
  );
  const budgetType = normalizeRangeText(
    matchFromText(cardText, /(fixed\s+price|hourly)/i),
  );
  const experienceLevel = normalizeRangeText(
    matchFromText(cardText, /-\s*(entry\s+level|intermediate|expert)\b/i),
  );

  const tags = Array.from(
    cardRoot.querySelectorAll(
      '[data-test*="skill" i], [data-test*="token" i], a[href*="/skills/"]',
    ),
  )
    .map(el => safeText(el.textContent))
    .filter(Boolean);

  return {
    url: href,
    title,
    description,
    tags: Array.from(new Set(tags)).slice(0, 20),
    paymentVerified,
    clientSpent,
    proposals,
    posted,
    budgetLine,
    budgetType,
    experienceLevel,
    budgetEstimate,
    source: 'listing',
  };
}

function sendToHost(payload) {
  ipcRenderer.sendToHost('flow:upworkJob', payload);
}

function sendToHostJobs(payload) {
  ipcRenderer.sendToHost('flow:upworkJobs', payload);
}

function sendToHostHtml(payload) {
  ipcRenderer.sendToHost('flow:upworkHtml', payload);
}

function sendToHostDetailHtml(payload) {
  ipcRenderer.sendToHost('flow:upworkDetailHtml', payload);
}

function sendToHostScraperHtml(payload) {
  ipcRenderer.sendToHost('flow:scraperHtml', payload);
}

function sendToHostScraperQueryResult(payload) {
  ipcRenderer.sendToHost('flow:scraperQueryResult', payload);
}

function sendToHostScraperPickResult(payload) {
  ipcRenderer.sendToHost('flow:scraperPickResult', payload);
}

function sendToHostScraperClickResult(payload) {
  ipcRenderer.sendToHost('flow:scraperClickResult', payload);
}

function sendToHostScraperTypeResult(payload) {
  ipcRenderer.sendToHost('flow:scraperTypeResult', payload);
}

function sendToHostSubmit(payload) {
  ipcRenderer.sendToHost('flow:upworkSubmit', payload);
}

function isVisible(el) {
  if (!(el instanceof HTMLElement)) return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function clickFirstButtonByText(textMatchers) {
  const buttons = Array.from(document.querySelectorAll('button'))
    .filter(btn => btn instanceof HTMLButtonElement)
    .filter(btn => isVisible(btn));

  for (const btn of buttons) {
    const label = safeText(btn.textContent).toLowerCase();
    if (!label) continue;
    if (textMatchers.some(m => label.includes(m))) {
      btn.click();
      return true;
    }
  }
  return false;
}

function setNativeValue(el, value) {
  if (!el) return;
  const prototype = Object.getPrototypeOf(el);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
  if (descriptor && typeof descriptor.set === 'function') {
    descriptor.set.call(el, value);
  } else {
    el.value = value;
  }
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
}

function findCoverLetterField() {
  const candidates = [
    'textarea[aria-label*="cover" i]',
    'textarea[name*="cover" i]',
    'textarea[id*="cover" i]',
    'textarea[placeholder*="cover" i]',
    'textarea',
  ];
  for (const selector of candidates) {
    const el = document.querySelector(selector);
    if (el instanceof HTMLTextAreaElement && isVisible(el)) return el;
  }
  return null;
}

function findBidField() {
  const selectors = [
    'input[aria-label*="bid" i]',
    'input[aria-label*="rate" i]',
    'input[name*="bid" i]',
    'input[name*="rate" i]',
    'input[id*="bid" i]',
    'input[id*="rate" i]',
  ];
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    if (el instanceof HTMLInputElement && isVisible(el) && !el.disabled)
      return el;
  }
  return null;
}

function getCardHtmlSnapshot() {
  const links = Array.from(document.querySelectorAll('a[href]'));
  const seen = new Set();
  const parts = [];

  for (const link of links) {
    if (!(link instanceof HTMLAnchorElement)) continue;
    if (!link.href) continue;

    if (!isLikelyJobDetailUrl(link.href)) continue;

    const card =
      link.closest('[data-test*="job-tile" i]') ||
      link.closest('[data-test*="job-card" i]') ||
      link.closest('article') ||
      link.closest('li') ||
      link.closest('section') ||
      link.closest('div');

    if (!(card instanceof HTMLElement)) continue;
    if (seen.has(card)) continue;
    seen.add(card);

    const outer = card.outerHTML;
    if (typeof outer !== 'string' || outer.length < 40) continue;
    parts.push(outer);
    if (parts.length >= 30) break;
  }

  const joined = parts.join('\n\n');
  if (!joined) return '';
  const max = 250_000;
  return joined.length > max ? joined.slice(0, max) : joined;
}

function getDetailModalSnapshot() {
  const modal =
    document.querySelector('[role="dialog"]') ||
    document.querySelector('[data-test*="drawer" i]') ||
    document.querySelector('[data-test*="modal" i]') ||
    document.querySelector('[data-test*="details" i]');
  if (!(modal instanceof HTMLElement) || !isVisible(modal)) return null;

  const clone = modal.cloneNode(true);
  if (clone instanceof HTMLElement) {
    const remove = clone.querySelectorAll('script, style, noscript');
    for (const el of remove) el.remove();
  }

  const html =
    clone && typeof clone.outerHTML === 'string' ? clone.outerHTML : '';
  if (!html) return null;

  const jobLink = modal.querySelector('a[href*="/jobs/"]');
  const jobUrl =
    jobLink instanceof HTMLAnchorElement
      ? normalizeJobUrl(jobLink.href || '')
      : '';

  const max = 250_000;
  return {
    html: html.length > max ? html.slice(0, max) : html,
    jobUrl,
  };
}

function getHtmlSnapshot() {
  const cardSnapshot = getCardHtmlSnapshot();
  if (cardSnapshot) return cardSnapshot;

  const main =
    document.querySelector('main') ||
    document.querySelector('[role="main"]') ||
    document.body;
  if (!main) return '';

  const clone = main.cloneNode(true);
  if (clone instanceof HTMLElement) {
    const remove = clone.querySelectorAll('script, style, noscript');
    for (const el of remove) el.remove();
  }

  const html =
    clone && typeof clone.outerHTML === 'string' ? clone.outerHTML : '';
  if (!html) return '';
  const max = 250_000;
  return html.length > max ? html.slice(0, max) : html;
}

function sendStatus(payload) {
  ipcRenderer.sendToHost('flow:upwork', payload);
}

function stableSignature(payload) {
  const title = safeText(payload && payload.title);
  const description = safeText(payload && payload.description);
  const url = safeText(payload && payload.url);
  const head = description.slice(0, 800);
  return `${url}::${title}::${head}`;
}

function maybeAutoExtract() {
  const extracted = extractFromDetailsPage();
  const title = safeText(extracted.title);
  const description = safeText(extracted.description);

  // Avoid spamming: only send when we have meaningful content and it changed.
  if (!title) return false;
  if (description.length < 40) return false;

  const sig = stableSignature(extracted);
  if (!sig) return false;
  if (window[FLOW_LAST_SENT_KEY] === sig) return true;

  window[FLOW_LAST_SENT_KEY] = sig;
  sendToHost({ ...extracted, auto: true });
  return true;
}

ipcRenderer.on('flow:extractNow', () => {
  try {
    sendToHost({ ...extractFromDetailsPage(), manual: true });
  } catch {}
});

ipcRenderer.on('flow:ensureUpworkSession', async (_event, payload) => {
  try {
    const username = safeText(payload && payload.username);
    const password = safeText(payload && payload.password);
    const targetUrl = safeText(payload && payload.targetUrl);

    if (targetUrl && window.location.href !== targetUrl) {
      window.location.href = targetUrl;
      await sleep(1500);
    }

    if (isLoginUrl() || findLoginField() || findPasswordField()) {
      await attemptLogin(username, password);
      if (targetUrl && window.location.href !== targetUrl) {
        await sleep(1500);
        window.location.href = targetUrl;
      }
    }
  } catch {}
});

ipcRenderer.on('flow:extractAll', () => {
  try {
    if (!isLikelyListingUrl(window.location.href)) return;
    const html = getHtmlSnapshot();
    sendToHostHtml({ html, href: window.location.href, manual: true });
  } catch {}
});

ipcRenderer.on('flow:extractDetailHtml', () => {
  try {
    const detail = getDetailModalSnapshot();
    const html = detail?.html || getHtmlSnapshot();
    sendToHostDetailHtml({
      html,
      href: window.location.href,
      jobUrl: detail?.jobUrl,
      manual: true,
    });
  } catch {}
});

ipcRenderer.on('flow:openJob', async (_event, payload) => {
  try {
    const targetUrl = safeText(payload && payload.url);
    if (!targetUrl) return;
    const link = findJobLinkByUrl(targetUrl);
    if (link) {
      await jitterMouseOver(link);
      await sleep(randomBetween(120, 240));
      link.click();
      return;
    }
    window.location.href = targetUrl;
  } catch {}
});

ipcRenderer.on('flow:goBack', () => {
  try {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.href = 'https://www.upwork.com/nx/search/jobs/';
  } catch {}
});

ipcRenderer.on('flow:closeJob', () => {
  try {
    const didClose = closeJobDetailsPanel();
    if (!didClose && window.history.length > 1) {
      window.history.back();
    }
  } catch {}
});

ipcRenderer.on('flow:scraperExtractHtml', () => {
  try {
    const html = getHtmlSnapshot();
    sendToHostScraperHtml({ html, href: window.location.href, manual: true });
  } catch {}
});

ipcRenderer.on('flow:scraperNavigate', (_event, payload) => {
  try {
    const rawUrl = safeText(payload && payload.url);
    const url = rawUrl && /^https?:\/\//i.test(rawUrl) ? rawUrl : '';
    if (!url) return;
    window.location.href = url;
  } catch {}
});

ipcRenderer.on('flow:scraperQuery', (_event, payload) => {
  try {
    const selector = safeText(payload && payload.selector);
    const attribute = safeText(payload && payload.attribute);
    const stepId = safeText(payload && payload.stepId);
    const el = selector ? document.querySelector(selector) : null;
    let value = '';
    if (el instanceof HTMLElement) {
      if (attribute) {
        value = safeText(el.getAttribute(attribute));
      } else {
        value = safeText(el.textContent);
      }
    }
    sendToHostScraperQueryResult({
      stepId: stepId || undefined,
      selector,
      attribute: attribute || undefined,
      value,
      href: window.location.href,
    });
  } catch {}
});

ipcRenderer.on('flow:scraperClick', (_event, payload) => {
  try {
    const selector = safeText(payload && payload.selector);
    const stepId = safeText(payload && payload.stepId);
    let clicked = false;
    if (selector) {
      const el = document.querySelector(selector);
      if (el && el instanceof HTMLElement) {
        el.scrollIntoView({ behavior: 'instant', block: 'center' });
        el.click();
        clicked = true;
      }
    }
    sendToHostScraperClickResult({
      stepId: stepId || undefined,
      selector,
      clicked,
      href: window.location.href,
    });
  } catch {}
});

ipcRenderer.on('flow:scraperType', (_event, payload) => {
  try {
    const selector = safeText(payload && payload.selector);
    const stepId = safeText(payload && payload.stepId);
    const value = safeText(payload && payload.value);
    const pressEnter = Boolean(payload && payload.pressEnter);
    let typed = false;

    if (selector) {
      const el = document.querySelector(selector);
      if (el && el instanceof HTMLElement) {
        el.scrollIntoView({ behavior: 'instant', block: 'center' });

        if (
          el instanceof HTMLInputElement ||
          el instanceof HTMLTextAreaElement
        ) {
          el.focus();
          el.value = value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
          if (pressEnter) {
            el.dispatchEvent(
              new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                bubbles: true,
              }),
            );
            el.dispatchEvent(
              new KeyboardEvent('keyup', {
                key: 'Enter',
                code: 'Enter',
                bubbles: true,
              }),
            );
          }
          typed = true;
        } else if (el.isContentEditable) {
          el.focus();
          el.textContent = value;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          if (pressEnter) {
            el.dispatchEvent(
              new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                bubbles: true,
              }),
            );
            el.dispatchEvent(
              new KeyboardEvent('keyup', {
                key: 'Enter',
                code: 'Enter',
                bubbles: true,
              }),
            );
          }
          typed = true;
        }
      }
    }

    sendToHostScraperTypeResult({
      stepId: stepId || undefined,
      selector,
      typed,
      value,
      href: window.location.href,
    });
  } catch {}
});

ipcRenderer.on('flow:scraperPickStart', (_event, payload) => {
  try {
    const stepId = safeText(payload && payload.stepId);
    startScraperPick(stepId || undefined);
  } catch {}
});

ipcRenderer.on('flow:scraperPickStop', () => {
  try {
    stopScraperPick();
  } catch {}
});

ipcRenderer.on('flow:scraperCursorMove', () => {
  try {
    moveScraperCursor();
  } catch {}
});

ipcRenderer.on('flow:scraperScrollNudge', () => {
  try {
    const delta = Math.random() > 0.5 ? 40 : -40;
    window.scrollBy({ top: delta, left: 0, behavior: 'smooth' });
  } catch {}
});

let pendingSubmit = null;

ipcRenderer.on('flow:submitProposal', async (_event, payload) => {
  const jobUrl = safeText(payload && payload.jobUrl);
  const jobId = safeText(payload && payload.jobId);
  const proposal = safeText(payload && payload.proposal);
  const bid = safeText(payload && payload.bid);
  const requireConfirm = Boolean(payload && payload.requireConfirm);

  sendToHostSubmit({
    type: 'start',
    href: window.location.href,
    jobUrl,
    jobId,
  });

  try {
    // If we're not already on the proposal form, try to open it.
    const hasTextArea = Boolean(findCoverLetterField());
    if (!hasTextArea) {
      sendToHostSubmit({
        type: 'openForm',
        href: window.location.href,
        jobUrl,
        jobId,
      });
      await clickFirstButtonByText(['submit a proposal', 'apply', 'apply now']);
      await sleep(1200);
    }

    const cover = findCoverLetterField();
    if (!cover) {
      throw new Error('Could not find cover letter field');
    }

    if (proposal) {
      sendToHostSubmit({
        type: 'fillProposal',
        href: window.location.href,
        jobUrl,
        jobId,
      });
      setNativeValue(cover, proposal);
      await sleep(250);
    }

    const bidField = findBidField();
    if (bidField && bid) {
      sendToHostSubmit({
        type: 'fillBid',
        href: window.location.href,
        jobUrl,
        jobId,
      });
      setNativeValue(bidField, bid);
      await sleep(250);
    }

    if (requireConfirm) {
      pendingSubmit = { jobUrl, jobId };
      sendToHostSubmit({
        type: 'ready',
        href: window.location.href,
        jobUrl,
        jobId,
      });
      return;
    }

    sendToHostSubmit({
      type: 'submit',
      href: window.location.href,
      jobUrl,
      jobId,
    });
    const didClick = await clickFirstButtonByText([
      'submit proposal',
      'submit',
      'send',
    ]);
    if (!didClick) {
      throw new Error('Could not find submit button');
    }

    await sleep(1200);
    sendToHostSubmit({
      type: 'done',
      href: window.location.href,
      jobUrl,
      jobId,
    });
  } catch (error) {
    sendToHostSubmit({
      type: 'error',
      href: window.location.href,
      jobUrl,
      jobId,
      message: safeText(error && error.message) || 'Submit failed',
    });
  }
});

ipcRenderer.on('flow:confirmSubmit', async (_event, payload) => {
  const jobUrl = safeText(payload && payload.jobUrl) || pendingSubmit?.jobUrl;
  const jobId = safeText(payload && payload.jobId) || pendingSubmit?.jobId;
  if (!jobUrl && !jobId) return;

  try {
    sendToHostSubmit({
      type: 'submit',
      href: window.location.href,
      jobUrl,
      jobId,
    });
    const didClick = await clickFirstButtonByText([
      'submit proposal',
      'submit',
      'send',
    ]);
    if (!didClick) {
      throw new Error('Could not find submit button');
    }
    await sleep(1200);
    sendToHostSubmit({
      type: 'done',
      href: window.location.href,
      jobUrl,
      jobId,
    });
    pendingSubmit = null;
  } catch (error) {
    sendToHostSubmit({
      type: 'error',
      href: window.location.href,
      jobUrl,
      jobId,
      message: safeText(error && error.message) || 'Submit failed',
    });
  }
});

function makeButton({ compact } = { compact: false }) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = compact ? 'Extract' : 'Extract to Flow';
  btn.style.cssText =
    'margin-left:8px; padding:4px 8px; border-radius:8px; border:1px solid rgba(120,120,120,0.35); background:rgba(255,255,255,0.08); color:inherit; font-size:12px; line-height:16px; cursor:pointer;';
  btn.addEventListener('mouseenter', () => {
    btn.style.background = 'rgba(255,255,255,0.14)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.background = 'rgba(255,255,255,0.08)';
  });
  return btn;
}

function injectDetailsButton() {
  const h1 = document.querySelector('h1');
  if (!h1) return false;

  if (document.getElementById(FLOW_BUTTON_ID)) return true;

  const btn = makeButton();
  btn.id = FLOW_BUTTON_ID;
  btn.addEventListener('click', () => {
    sendToHost(extractFromDetailsPage());
  });

  const wrap = document.createElement('span');
  wrap.style.display = 'inline-flex';
  wrap.style.alignItems = 'center';
  wrap.appendChild(btn);

  h1.appendChild(wrap);
  return true;
}

function injectListingButtons() {
  const cards = Array.from(
    document.querySelectorAll(
      '[data-test*="job-tile" i], [data-test*="job-card" i]',
    ),
  );

  let injected = 0;

  for (const card of cards) {
    if (!(card instanceof HTMLElement)) continue;

    const titleEl =
      card.querySelector('h4') ||
      card.querySelector('h3') ||
      card.querySelector('[data-test*="job-title" i]');

    if (!titleEl) continue;

    if (card.querySelector(`.${FLOW_CARD_BUTTON_CLASS}`)) continue;

    const btn = makeButton({ compact: true });
    btn.className = FLOW_CARD_BUTTON_CLASS;
    btn.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      sendToHost(extractFromCard(card));
    });

    titleEl.appendChild(btn);
    injected += 1;

    if (injected >= 25) break;
  }

  return injected > 0;
}

function bindAutoExtractOnListingClicks() {
  if (window.__flowUpworkClickBound) return;
  window.__flowUpworkClickBound = true;

  document.addEventListener(
    'click',
    event => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      // Any click that appears to open a job details view should trigger an extraction attempt.
      const jobLink = target.closest('a[href*="/jobs/"]');
      const jobCard = target.closest(
        '[data-test*="job-tile" i], [data-test*="job-card" i]',
      );

      if (!jobLink && !jobCard) return;

      // Give the app shell time to render the details panel / navigate.
      setTimeout(() => {
        try {
          maybeAutoExtract();
        } catch {}
      }, 900);
    },
    true,
  );
}

function injectFloatingButton() {
  if (document.getElementById(FLOW_FLOATING_ID)) return;

  const btn = makeButton();
  btn.id = FLOW_FLOATING_ID;
  btn.style.position = 'fixed';
  btn.style.right = '16px';
  btn.style.bottom = '16px';
  btn.style.zIndex = '2147483647';
  btn.style.boxShadow = '0 6px 18px rgba(0,0,0,0.28)';

  btn.addEventListener('click', () => {
    sendToHost(extractFromDetailsPage());
  });

  document.documentElement.appendChild(btn);
}

let pending = false;
function scheduleInject() {
  if (pending) return;
  pending = true;
  setTimeout(() => {
    pending = false;
    if (!/\.upwork\.com$/i.test(window.location.hostname)) return;
    const didDetails = injectDetailsButton();
    injectListingButtons();
    if (!didDetails) injectFloatingButton();

    bindAutoExtractOnListingClicks();
    maybeAutoExtract();
  }, 250);
}

window.addEventListener('DOMContentLoaded', () => {
  try {
    sendStatus({ type: 'preloadLoaded', href: window.location.href });
  } catch {}
  scheduleInject();

  const observer = new MutationObserver(() => scheduleInject());
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
});
