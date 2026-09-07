(() => {
  'use strict';
  if (!window.HTMLDialogElement) return;
  const zh = document.documentElement.lang.startsWith('zh');
  const t = (ja, cn) => zh ? cn : ja;
  const make = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  };
  const dialog = (id, title) => {
    const el = make('dialog', 'reader-dialog'); el.id = id;
    el.setAttribute('aria-labelledby', `${id}-title`);
    const head = make('div', 'reader-dialog-head');
    const heading = make('h2', '', title); heading.id = `${id}-title`;
    const close = make('button', 'reader-control', t('閉じて戻る', '关闭并返回'));
    close.type = 'button'; close.addEventListener('click', () => el.close());
    head.append(heading, close); el.append(head); document.body.append(el);
    let previousOverflow = '';
    const open = () => {
      previousOverflow = document.body.style.overflow;
      el.showModal(); document.body.style.overflow = 'hidden';
    };
    el.addEventListener('close', () => { document.body.style.overflow = previousOverflow; });
    el.addEventListener('click', event => {
      const r = el.getBoundingClientRect();
      if (event.target === el && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) el.close();
    });
    return {el, head, heading, open};
  };

  const images = [...document.querySelectorAll('a[href]')].filter(a => /\.(png|jpe?g|webp)(?:[?#]|$)/i.test(a.getAttribute('href')));
  if (images.length) {
    const view = dialog('image-viewer', t('画像を見る', '查看图片'));
    const controls = make('div', 'image-controls');
    const zoom = make('button', 'reader-control', t('原寸で読む', '原尺寸阅读')); zoom.type = 'button';
    zoom.setAttribute('aria-pressed', 'false');
    const hint = make('span', '', t('原寸表示ではスクロールして読めます。', '原尺寸下可滚动查看细节。'));
    controls.append(zoom, hint);
    const scroller = make('div', 'image-viewer-body');
    const img = make('img'); scroller.append(img);
    view.el.append(controls, scroller);
    zoom.addEventListener('click', () => {
      const full = scroller.classList.toggle('original-size');
      zoom.setAttribute('aria-pressed', String(full));
      zoom.textContent = full ? t('全体を表示', '显示全图') : t('原寸で読む', '原尺寸阅读');
    });
    for (const a of images) {
      a.setAttribute('aria-haspopup', 'dialog');
      a.addEventListener('click', event => {
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        const source = a.querySelector('img') || a.closest('figure')?.querySelector('img');
        img.src = a.href; img.alt = source?.alt || t('資料画像', '资料图片');
        view.heading.textContent = img.alt;
        scroller.classList.remove('original-size');
        zoom.textContent = t('原寸で読む', '原尺寸阅读'); zoom.setAttribute('aria-pressed', 'false');
        view.open(); scroller.scrollTo(0, 0);
      });
    }
  }

  if (document.querySelector('main.reading')) {
    const source = document.querySelector('.chapter-nav, .toc, .page-index');
    if (!source) return;
    const toc = dialog('reader-contents', t('目次', '目录'));
    const links = make('nav', 'reader-contents-links'); links.setAttribute('aria-label', t('読みたい箇所へ移動', '跳转到阅读章节'));
    for (const a of source.querySelectorAll('a[href^="#"]')) {
      const link = make('a', '', a.textContent); link.href = a.getAttribute('href');
      link.addEventListener('click', () => toc.el.close()); links.append(link);
    }
    toc.el.append(links);
    const bar = make('nav', 'reader-toolbar'); bar.setAttribute('aria-label', t('読書ナビゲーション', '阅读导航'));
    const showToc = make('button', 'reader-control', t('目次', '目录')); showToc.type = 'button';
    showToc.setAttribute('aria-haspopup', 'dialog'); showToc.setAttribute('aria-controls', toc.el.id);
    showToc.addEventListener('click', toc.open);
    const appendix = make('a', 'reader-control', t('補足資料', '补充资料')); appendix.href = '../index.html#projects';
    const top = make('a', 'reader-control', t('先頭へ ↑', '回到顶部 ↑')); top.href = '#top';
    bar.append(showToc, appendix, top); document.body.append(bar);
    document.body.classList.add('has-reader-toolbar');
  }
})();
