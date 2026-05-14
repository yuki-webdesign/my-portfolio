/**
 * YUKI HATTORI PORTFOLIO — main.js
 * コンセプト: USER-SIDE
 * 担当: インタラクション / スクロール演出 / サムネイルプレビュー
 */

'use strict';

// ===========================================
// 1. ヘッダー: スクロール時にボーダー表示
// ===========================================
const initHeader = () => {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
};

// ===========================================
// 2. Works フルスクリーン背景エフェクト
//    → ホバーで背景全体が作品画像に切り替わる
// ===========================================
const initWorksBg = () => {
  const worksSection = document.querySelector('.works');
  const bgLayers     = document.querySelectorAll('.works-bg__layer');
  const items        = document.querySelectorAll('.works-item');

  if (!worksSection || bgLayers.length === 0 || items.length === 0) return;

  let activeIndex = -1;

  const activate = (index) => {
    if (activeIndex === index) return;
    activeIndex = index;

    // 全レイヤーを非表示にしてから対象だけ表示
    bgLayers.forEach((layer, i) => {
      layer.classList.toggle('is-active', i === index);
    });

    // 全itemのis-activeをリセット
    items.forEach((item, i) => {
      item.classList.toggle('is-active', i === index);
    });
  };

  const deactivate = () => {
    activeIndex = -1;
    bgLayers.forEach((layer) => layer.classList.remove('is-active'));
    items.forEach((item) => item.classList.remove('is-active'));
    worksSection.classList.remove('is-hovered');
  };

  items.forEach((item, i) => {
    item.addEventListener('mouseenter', () => {
      worksSection.classList.add('is-hovered');
      activate(i);
    });
  });

  // worksセクション全体からマウスが外れたら元に戻す
  worksSection.addEventListener('mouseleave', deactivate);
};

// ===========================================
// 3. スクロールリビール
//    → 画面内に入った要素を.is-visibleで表示
// ===========================================
const initScrollReveal = () => {
  const targets = document.querySelectorAll(
    '.section-header, .works-item, .about-profile, .skill-group, .contact-inner, .profile-badge'
  );

  if (targets.length === 0) return;

  // IntersectionObserver対応チェック
  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('reveal', 'is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // 一度だけ発火
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  targets.forEach((el, i) => {
    el.classList.add('reveal');
    // 連続する要素に delay を付加（自然なウェーブ感）
    el.style.transitionDelay = `${(i % 4) * 0.08}s`;
    observer.observe(el);
  });
};

// ===========================================
// 4. スムーズスクロール（ナビゲーション）
// ===========================================
const initSmoothScroll = () => {
  const navLinks = document.querySelectorAll('.header-nav a[href^="#"]');

  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);

      if (!target) return;

      const headerHeight = document.querySelector('.site-header')?.offsetHeight ?? 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 24;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
};

// ===========================================
// 5. Works: ホバー時のタイポ演出
//    → 数字の色変化を少しずつ遅延させる
// ===========================================
const initWorksHover = () => {
  const items = document.querySelectorAll('.works-item');

  items.forEach((item) => {
    const link = item.querySelector('.works-link');
    if (!link) return;

    // Works番号のカウントアップ風アニメーション（ホバー時）
    const num = item.querySelector('.works-num');
    if (!num) return;

    const originalText = num.textContent;

    item.addEventListener('mouseenter', () => {
      let count = 0;
      const chars = '0123456789';
      const targetNum = parseInt(originalText, 10);

      const interval = setInterval(() => {
        if (count >= 5) {
          num.textContent = originalText;
          clearInterval(interval);
          return;
        }
        const rand = chars[Math.floor(Math.random() * chars.length)];
        num.textContent = `0${rand}`;
        count++;
      }, 50);
    });
  });
};

// ===========================================
// 6. カーソル（デスクトップのみ）
// ===========================================
const initCursor = () => {
  // タッチデバイスはスキップ
  if (window.matchMedia('(hover: none)').matches) return;

  const cursor = document.createElement('div');
  cursor.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 6px; height: 6px;
    background: #1A1A1A;
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: width 0.2s, height 0.2s, background 0.2s;
    mix-blend-mode: multiply;
  `;
  document.body.appendChild(cursor);

  const ring = document.createElement('div');
  ring.style.cssText = `
    position: fixed;
    top: 0; left: 0;
    width: 32px; height: 32px;
    border: 1px solid rgba(26,26,26,0.3);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9998;
    transform: translate(-50%, -50%);
    transition: width 0.3s, height 0.3s, border-color 0.3s;
  `;
  document.body.appendChild(ring);

  let mx = 0, my = 0;
  let rx = 0, ry = 0;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.left = `${mx}px`;
    cursor.style.top = `${my}px`;
  });

  const updateRing = () => {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = `${rx}px`;
    ring.style.top = `${ry}px`;
    requestAnimationFrame(updateRing);
  };
  updateRing();

  // リンク・ボタンホバー時に拡大
  const hoverEls = document.querySelectorAll('a, button');
  hoverEls.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      ring.style.width = '60px';
      ring.style.height = '60px';
      ring.style.borderColor = 'rgba(26,26,26,0.15)';
      cursor.style.width = '4px';
      cursor.style.height = '4px';
    });
    el.addEventListener('mouseleave', () => {
      ring.style.width = '32px';
      ring.style.height = '32px';
      ring.style.borderColor = 'rgba(26,26,26,0.3)';
      cursor.style.width = '6px';
      cursor.style.height = '6px';
    });
  });
};

// ===========================================
// 初期化
// ===========================================
const init = () => {
  initHeader();
  initWorksBg();
  initScrollReveal();
  initSmoothScroll();
  initWorksHover();
  initCursor();

  console.log('%cYUKI HATTORI — Portfolio', 'font-family: serif; font-size: 1.2rem; color: #1A1A1A;');
  console.log('%cUSER-SIDE Design', 'font-family: monospace; font-size: 0.8rem; color: #757575;');
};

// DOMContentLoaded後に実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}