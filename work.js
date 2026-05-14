/**
 * WORK DETAIL — work-detail.js
 * スプリットスクロール制御
 * - 右パネルのスクロールを監視
 * - 左パネルの情報を対応するパネルのデータで更新
 * - プログレスバー・ドットナビ管理
 */

'use strict';

// ===========================================
// 1. DOM取得
// ===========================================
const progressBar = document.getElementById('detailProgress');
const infoLabel   = document.getElementById('infoLabel');
const infoHeading = document.getElementById('infoHeading');
const infoBody    = document.getElementById('infoBody');
const splitMeta   = document.getElementById('splitMeta');
const colorBg     = document.getElementById('colorBg');
const dotsWrap    = document.getElementById('splitDots');
const panels      = document.querySelectorAll('.split-panel');

// ===========================================
// 2. ドットナビ生成
// ===========================================
const buildDots = () => {
  if (!dotsWrap || panels.length === 0) return;

  panels.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.classList.add('split-dot');
    dot.setAttribute('aria-label', `Section ${i + 1}`);
    if (i === 0) dot.classList.add('is-active');

    dot.addEventListener('click', () => {
      const target = panels[i];
      const right  = document.getElementById('splitRight');
      if (!right || !target) return;

      // splitRight内でのオフセットではなくwindow基準でスクロール
      const top = target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: 'smooth' });
    });

    dotsWrap.appendChild(dot);
  });
};

// ===========================================
// 3. 左パネル情報の更新（アニメーション付き）
// ===========================================
let currentIndex = -1;

const infoEls = () => [infoLabel, infoHeading, infoBody, splitMeta].filter(Boolean);

const hideInfo = () => {
  infoEls().forEach((el) => {
    el.classList.remove('is-visible');
  });
};

const showInfo = () => {
  // 少しずらして表示（CSSのtransition-delayと連動）
  requestAnimationFrame(() => {
    infoEls().forEach((el) => {
      el.classList.add('is-visible');
    });
  });
};

const updateInfo = (panel) => {
  const idx = parseInt(panel.dataset.index ?? '0', 10);
  if (idx === currentIndex) return;
  currentIndex = idx;

  // フェードアウト → 内容更新 → フェードイン
  hideInfo();

  setTimeout(() => {
    if (infoLabel)   infoLabel.textContent   = panel.dataset.label   ?? '';
    if (infoHeading) infoHeading.innerHTML   = panel.dataset.heading ?? '';
    if (infoBody)    infoBody.textContent    = panel.dataset.body    ?? '';

    // メタ情報は data-show-meta="true" のパネルのみ表示
    if (splitMeta) {
      const showMeta = panel.dataset.showMeta === 'true';
      splitMeta.style.display = showMeta ? '' : 'none';
    }

    // カラー背景
    if (colorBg) {
      colorBg.classList.add('is-visible');
    }

    showInfo();
  }, 280);

  // ドット更新
  document.querySelectorAll('.split-dot').forEach((dot, i) => {
    dot.classList.toggle('is-active', i === idx);
  });
};

// ===========================================
// 4. IntersectionObserver でパネルを監視
// ===========================================
const initPanelObserver = () => {
  if (!('IntersectionObserver' in window)) {
    // フォールバック: 最初のパネルをアクティブに
    if (panels.length > 0) updateInfo(panels[0]);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-active');
          updateInfo(entry.target);
        } else {
          entry.target.classList.remove('is-active');
        }
      });
    },
    {
      // パネルが画面の40%以上見えたら発火
      threshold: 0.4,
      rootMargin: '0px',
    }
  );

  panels.forEach((panel) => observer.observe(panel));
};

// ===========================================
// 5. プログレスバー
// ===========================================
const initProgress = () => {
  if (!progressBar) return;

  const update = () => {
    const scrollTop  = window.scrollY;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    const percent    = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${Math.min(percent, 100)}%`;
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
};

// ===========================================
// 6. カーソル（デスクトップのみ）
//    main.jsと同じ実装を単体でも動くよう再定義
// ===========================================
const initCursor = () => {
  if (window.matchMedia('(hover: none)').matches) return;
  if (document.querySelector('.cursor-dot')) return; // main.jsで生成済なら skip

  const cursor = document.createElement('div');
  cursor.classList.add('cursor-dot');
  cursor.style.cssText = `
    position:fixed;top:0;left:0;
    width:6px;height:6px;
    background:#1A1A1A;border-radius:50%;
    pointer-events:none;z-index:9999;
    transform:translate(-50%,-50%);
    mix-blend-mode:multiply;
  `;
  document.body.appendChild(cursor);

  const ring = document.createElement('div');
  ring.style.cssText = `
    position:fixed;top:0;left:0;
    width:32px;height:32px;
    border:1px solid rgba(26,26,26,0.3);border-radius:50%;
    pointer-events:none;z-index:9998;
    transform:translate(-50%,-50%);
    transition:width .3s,height .3s;
  `;
  document.body.appendChild(ring);

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = `${mx}px`;
    cursor.style.top  = `${my}px`;
  });

  const loop = () => {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = `${rx}px`;
    ring.style.top  = `${ry}px`;
    requestAnimationFrame(loop);
  };
  loop();
};

// ===========================================
// 7. 初期化
// ===========================================
const init = () => {
  buildDots();
  initPanelObserver();
  initProgress();
  initCursor();

  // 最初のパネルの情報を即時反映
  if (panels.length > 0) {
    updateInfo(panels[0]);
    panels[0].classList.add('is-active');
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}