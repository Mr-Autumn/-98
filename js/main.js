/* ============================================================
   瓜田98 · 主运行时
   开机、桌面、开始菜单、右键菜单、任务栏、对话框、
   音效、CRT、1024 彩蛋、关机、Win98 ↔ Win11 穿越、蓝屏
   ============================================================ */
(function () {
  'use strict';

  const I = window.GuaIcons;
  const $ = function (id) { return document.getElementById(id); };

  const STORAGE = {
    sound: 'guatian98_sound_v1',
    crt: 'guatian98_crt_v1',
    theme: 'guatian98_theme_v1',
    visited: 'guatian98_visited_v1'
  };

  const dom = {
    bootScreen: $('boot-screen'),
    bootProgress: $('boot-progress'),
    bootStatus: $('boot-status'),
    desktop: $('desktop'),
    icons: $('desktop-icons'),
    windowsLayer: $('windows-layer'),
    taskbar: $('taskbar'),
    startButton: $('start-button'),
    taskButtons: $('task-buttons'),
    tray1024: $('tray-1024'),
    trayOnline: $('tray-online'),
    traySound: $('tray-sound'),
    trayClock: $('tray-clock'),
    clockTime: $('clock-time'),
    startMenu: $('start-menu'),
    win11Start: $('win11-start-menu'),
    contextMenu: $('context-menu'),
    balloon: $('balloon'),
    toastLayer: $('toast-layer'),
    dialogLayer: $('dialog-layer'),
    crtOverlay: $('crt-overlay'),
    themeTransition: $('theme-transition'),
    shutdownScreen: $('shutdown-screen'),
    shutdownMessage: $('shutdown-message'),
    shutdownFinal: $('shutdown-final'),
    rebootButton: $('reboot-button'),
    bsod: $('bsod-screen')
  };

  const now = new Date();
  const is1024 = now.getMonth() === 9 && now.getDate() === 24;

  let theme = readStore(STORAGE.theme) === 'win11' ? 'win11' : 'win98';
  let contextItems = [];
  let balloonTimer = null;
  let bootFinished = false;
  let dialogBackdrop = null;
  const dialogStack = [];

  /* ---------- 本地存储 ---------- */
  function readStore(key) {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      return null;
    }
  }

  function writeStore(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      // 存储不可用时保持当前会话生效
    }
  }

  /* ---------- 小工具 ---------- */
  function esc(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function pad2(number) {
    return number < 10 ? '0' + number : '' + number;
  }

  function sound(name) {
    if (window.GuaSound) window.GuaSound.play(name);
  }

  /* ---------- 窗口管理器 ---------- */
  const wm = new window.GuaWindowManager({
    layer: dom.windowsLayer,
    taskbar: dom.taskbar,
    taskButtons: dom.taskButtons,
    desktop: dom.desktop
  });

  /* ============================================================
     toast / 气泡 / 对话框
     ============================================================ */
  function toast(title, text, icon) {
    const item = document.createElement('div');
    item.className = 'toast';
    item.innerHTML = (icon ? `<span class="toast-icon">${I[icon] || I.info}</span>` : '') +
      `<strong>${esc(title || '瓜田98')}</strong>${esc(text || '')}`;
    dom.toastLayer.appendChild(item);
    while (dom.toastLayer.children.length > 4) {
      dom.toastLayer.firstElementChild.remove();
    }
    setTimeout(function () {
      if (!item.parentNode) return;
      item.classList.add('out');
      setTimeout(function () { if (item.parentNode) item.remove(); }, 300);
    }, 2800);
  }

  function hideBalloon() {
    if (!dom.balloon) return;
    dom.balloon.hidden = true;
    if (balloonTimer) {
      clearTimeout(balloonTimer);
      balloonTimer = null;
    }
  }

  function showBalloon(title, text, icon, duration) {
    if (!dom.balloon) return;
    dom.balloon.innerHTML = `
      <button type="button" class="balloon-close" aria-label="关闭提示">×</button>
      <div class="balloon-title"><span class="pixel-icon">${I[icon] || I.info}</span>${esc(title || '瓜田98')}</div>
      <p>${esc(text || '').replace(/\n/g, '<br>')}</p>
    `;
    dom.balloon.hidden = false;
    dom.balloon.querySelector('.balloon-close').addEventListener('click', hideBalloon);
    if (balloonTimer) clearTimeout(balloonTimer);
    const wait = typeof duration === 'number' ? duration : 3000;
    if (wait > 0) balloonTimer = setTimeout(hideBalloon, wait);
  }

  function ensureDialogLayer() {
    dom.dialogLayer.classList.add('show');
    if (!dialogBackdrop) {
      dialogBackdrop = document.createElement('div');
      dialogBackdrop.className = 'dialog-backdrop';
      dom.dialogLayer.appendChild(dialogBackdrop);
    }
  }

  function closeDialogEntry(entry, value) {
    if (!entry || !entry.el.parentNode) return;
    entry.el.remove();
    const index = dialogStack.indexOf(entry);
    if (index >= 0) dialogStack.splice(index, 1);
    if (!dialogStack.length) {
      dom.dialogLayer.classList.remove('show');
      if (dialogBackdrop) {
        dialogBackdrop.remove();
        dialogBackdrop = null;
      }
    }
    if (typeof entry.onSelect === 'function') entry.onSelect(value);
  }

  function dialog(options) {
    const opts = options || {};
    const iconName = opts.icon || 'info';
    const buttons = opts.buttons && opts.buttons.length
      ? opts.buttons
      : [{ label: '确定', value: 'ok', primary: true }];

    const el = document.createElement('div');
    el.className = 'modal-window';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', opts.title || '瓜田98');

    const buttonsHtml = buttons.map(function (btn) {
      return `<button type="button" class="btn98 ${btn.primary ? 'default' : ''}" data-dialog-value="${esc(btn.value)}">${esc(btn.label)}</button>`;
    }).join('');

    el.innerHTML = `
      <div class="modal-titlebar">
        <span class="modal-title">
          <span class="modal-title-icon">${I[iconName] || I.info}</span>
          <span class="modal-title-text">${esc(opts.title || '瓜田98')}</span>
        </span>
        <button type="button" class="modal-close" aria-label="关闭"></button>
      </div>
      <div class="modal-body">
        <span class="modal-icon">${I[iconName] || I.info}</span>
        <div class="modal-text">${esc(opts.text || '')}${opts.subtext ? `<div class="modal-subtext">${esc(opts.subtext)}</div>` : ''}</div>
      </div>
      <div class="modal-buttons">${buttonsHtml}</div>
    `;

    ensureDialogLayer();
    dom.dialogLayer.appendChild(el);

    const entry = { el: el, onSelect: opts.onSelect };
    entry.close = function (value) { closeDialogEntry(entry, value); };
    dialogStack.push(entry);

    el.querySelector('.modal-close').addEventListener('click', function () {
      entry.close('cancel');
    });
    el.querySelectorAll('[data-dialog-value]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        sound('click');
        entry.close(btn.dataset.dialogValue);
      });
    });

    const first = el.querySelector('.btn98.default') || el.querySelector('.btn98');
    if (first) setTimeout(function () { if (el.parentNode) first.focus(); }, 30);

    return entry;
  }

  /* ============================================================
     主题：Win98 ↔ Win11
     ============================================================ */
  function applyTheme(next, options) {
    const opts = options || {};
    theme = next === 'win11' ? 'win11' : 'win98';
    document.body.classList.toggle('theme-win11', theme === 'win11');
    document.body.classList.toggle('theme-win98', theme === 'win98');
    document.documentElement.setAttribute('data-theme', theme);
    writeStore(STORAGE.theme, theme);
    document.dispatchEvent(new CustomEvent('gua-theme-change', { detail: { theme: theme } }));
    if (!opts.silent) closeMenus();
  }

  function timeTravel(target) {
    const next = target || (theme === 'win11' ? 'win98' : 'win11');
    if (dom.themeTransition.classList.contains('run')) return;

    closeMenus();
    sound('menu');
    dom.themeTransition.classList.remove('run');
    void dom.themeTransition.offsetWidth;
    dom.themeTransition.classList.add('run');

    setTimeout(function () { applyTheme(next, { silent: true }); }, 380);

    setTimeout(function () {
      dom.themeTransition.classList.remove('run');
      if (next === 'win11') {
        sound('chime');
        dialog({
          title: '时空穿越',
          icon: 'timeMachine',
          text: '28年，界面变了，系统变了，但吃瓜的你，没变。',
          subtext: '日历和瓜数据都还在。想回去的时候，随时可以。',
          buttons: [
            { label: '回到 1998', value: 'back' },
            { label: '继续吃瓜', value: 'ok', primary: true }
          ],
          onSelect: function (value) {
            if (value === 'back') timeTravel('win98');
          }
        });
      } else {
        toast('时空穿越', '已回到 1998。网速慢了一点，情怀满格。', 'timeMachine');
      }
    }, 1050);
  }

  /* ============================================================
     CRT 显示模式
     ============================================================ */
  function isCRT() {
    return document.body.classList.contains('crt-on');
  }

  function setCRT(on, options) {
    const opts = options || {};
    document.body.classList.toggle('crt-on', !!on);
    writeStore(STORAGE.crt, on ? '1' : '0');
    if (opts.notify !== false) {
      toast('CRT 显示模式', on ? '扫描线已开启。请坐直，离屏幕远一点。' : '已回到 LCD 时代，屏幕不再呼吸。', 'screenshot');
    }
    sound(on ? 'chime' : 'click');
  }

  /* ============================================================
     声音开关
     ============================================================ */
  function updateSoundUI() {
    const on = !!window.GuaSound.enabled;
    dom.traySound.classList.toggle('muted', !on);
    dom.traySound.title = on ? '音效已开启，点击关闭' : '音效已关闭，点击开启';
  }

  function toggleSound() {
    const next = !window.GuaSound.enabled;
    window.GuaSound.setEnabled(next);
    writeStore(STORAGE.sound, next ? '1' : '0');
    updateSoundUI();
    toast('声音', next ? '音效已开启。开机、关机、蓝屏都有声音了。' : '音效已关闭。世界安静了。', next ? 'volumeOn' : 'volumeOff');
  }

  /* ============================================================
     桌面图标
     ============================================================ */
  const DESKTOP_ICONS = [
    { key: 'myComputer', label: '我的电脑', icon: 'computer' },
    { key: 'calendar', label: '瓜田日历', icon: 'calendar' },
    { key: 'notes', label: '吃瓜笔记', icon: 'notes' },
    { key: 'recycle', label: '回收站', icon: 'recycle' },
    { key: 'tools', label: '工具', icon: 'tools' }
  ];

  function selectIcon(target) {
    dom.icons.querySelectorAll('.desktop-icon').forEach(function (icon) {
      icon.classList.toggle('selected', icon === target);
    });
  }

  function clearIconSelection() {
    dom.icons.querySelectorAll('.desktop-icon').forEach(function (icon) {
      icon.classList.remove('selected');
    });
  }

  function buildDesktopIcons() {
    const fragment = document.createDocumentFragment();
    DESKTOP_ICONS.forEach(function (def) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'desktop-icon';
      btn.dataset.app = def.key;
      btn.setAttribute('aria-label', def.label);
      btn.innerHTML = `<span class="desktop-icon-image">${I[def.icon] || I.exe}</span><span class="desktop-icon-label">${esc(def.label)}</span>`;
      btn.addEventListener('click', function (event) {
        event.stopPropagation();
        selectIcon(btn);
        sound('click');
      });
      btn.addEventListener('dblclick', function (event) {
        event.stopPropagation();
        openApp(def.key);
      });
      btn.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openApp(def.key);
        }
      });
      fragment.appendChild(btn);
    });
    dom.icons.appendChild(fragment);
  }

  /* ============================================================
     开始菜单
     ============================================================ */
  function startItemHTML(item) {
    if (item.sep) return '<div class="start-separator"></div>';
    if (item.items) {
      return `
        <div class="start-item has-submenu" role="menuitem" aria-haspopup="true">
          <span class="start-icon">${I[item.icon] || I.folder}</span>
          <span class="start-label">${esc(item.label)}</span>
          <div class="start-submenu">${item.items.map(startItemHTML).join('')}</div>
        </div>
      `;
    }
    const attr = item.app
      ? `data-start-app="${esc(item.app)}"${item.auto ? ' data-start-auto="1"' : ''}`
      : `data-start-action="${esc(item.action)}"`;
    return `
      <div class="start-item" role="menuitem" ${attr}>
        <span class="start-icon">${I[item.icon] || I.exe}</span>
        <span class="start-label">${esc(item.label)}</span>
        ${item.desc ? `<span class="start-desc">${esc(item.desc)}</span>` : ''}
      </div>
    `;
  }

  function buildStartMenu() {
    const items = [
      { label: '瓜田日历', icon: 'calendar', app: 'calendar', desc: '1998—2026' },
      { label: '随机吃瓜', icon: 'random', app: 'random', auto: true },
      { label: '瓜田搜索', icon: 'search', app: 'search' },
      { label: '吃瓜笔记', icon: 'notes', app: 'notes' },
      {
        label: '工具', icon: 'tools', items: [
          { label: '代码时光机.exe', icon: 'timeMachine', app: 'timeMachine' },
          { label: '显示属性', icon: 'controlPanel', app: 'displayProperties' },
          { label: '使用说明', icon: 'help', app: 'help' },
          { label: '关于瓜田98', icon: 'info', app: 'about' }
        ]
      }
    ];

    if (is1024) {
      items.push({ label: '1024 特辑', icon: 'star', app: 'special1024', desc: '程序员节' });
    }

    items.push({ sep: true });
    items.push({ label: '关机...', icon: 'power', action: 'shutdown' });

    dom.startMenu.innerHTML = `
      <div class="start-sidebar"><span>瓜田 98</span></div>
      <div class="start-body">
        <div class="start-items">${items.map(startItemHTML).join('')}</div>
        <div class="start-footer"><span>Windows 98</span><span>4.10.1998</span></div>
      </div>
    `;
  }

  function buildWin11Start() {
    const items = [
      { label: '日历', icon: 'calendar', app: 'calendar' },
      { label: '笔记', icon: 'notes', app: 'notes' },
      { label: '检索器', icon: 'search', app: 'search' },
      { label: '随机吃瓜', icon: 'random', app: 'random', auto: true },
      { label: '工具', icon: 'tools', app: 'tools' },
      { label: '代码时光机', icon: 'timeMachine', app: 'timeMachine' },
      { label: '显示属性', icon: 'controlPanel', app: 'displayProperties' },
      { label: '关于', icon: 'info', app: 'about' }
    ];
    if (is1024) items.push({ label: '1024 特辑', icon: 'star', app: 'special1024' });
    items.push({ label: '使用说明', icon: 'help', app: 'help' });

    const grid = items.map(function (item) {
      return `
        <button type="button" class="w11-start-item" data-start-app="${esc(item.app)}"${item.auto ? ' data-start-auto="1"' : ''}>
          <span class="w11-start-icon">${I[item.icon] || I.exe}</span>
          <span class="w11-start-label">${esc(item.label)}</span>
        </button>
      `;
    }).join('');

    dom.win11Start.innerHTML = `
      <div class="w11-start-head"><strong>已固定</strong><span>瓜田98 · 2026 Edition</span></div>
      <div class="w11-start-grid">${grid}</div>
      <div class="w11-start-foot">
        <button type="button" class="w11-start-foot-btn" data-start-app="about"><span class="w11-foot-icon">${I.info}</span>关于</button>
        <span class="spacer"></span>
        <button type="button" class="w11-start-foot-btn w11-power" data-start-action="shutdown"><span class="w11-foot-icon">${I.power}</span>关机</button>
      </div>
    `;
  }

  function closeMenus() {
    dom.startMenu.hidden = true;
    dom.win11Start.hidden = true;
    dom.contextMenu.hidden = true;
    dom.startButton.classList.remove('open');
    dom.startButton.setAttribute('aria-expanded', 'false');
  }

  function toggleStart() {
    const menu = theme === 'win11' ? dom.win11Start : dom.startMenu;
    const wasOpen = !menu.hidden;
    closeMenus();
    if (wasOpen) return;
    menu.hidden = false;
    dom.startButton.classList.add('open');
    dom.startButton.setAttribute('aria-expanded', 'true');
    sound('menu');
  }

  function startAction(action) {
    if (action === 'shutdown') {
      requestShutdown();
      return;
    }
    if (action === 'open-calendar') {
      openCalendarToday();
    }
  }

  function handleStartClick(event) {
    const appEl = event.target.closest('[data-start-app]');
    if (appEl) {
      const auto = appEl.dataset.startAuto === '1';
      closeMenus();
      openApp(appEl.dataset.startApp, auto ? { auto: true } : {});
      return;
    }
    const actionEl = event.target.closest('[data-start-action]');
    if (actionEl) {
      closeMenus();
      startAction(actionEl.dataset.startAction);
    }
  }

  /* ============================================================
     右键菜单
     ============================================================ */
  function showContextMenu(x, y, items) {
    contextItems = items;
    dom.contextMenu.innerHTML = items.map(function (item) {
      if (item.sep) return '<div class="context-sep"></div>';
      return `
        <div class="context-item ${item.checked ? 'checked' : ''} ${item.disabled ? 'disabled' : ''}"
          role="menuitem" data-menu-key="${esc(item.key)}">
          <span class="context-check"></span>
          <span class="context-icon">${item.icon ? (I[item.icon] || '') : ''}</span>
          <span>${esc(item.label)}</span>
          ${item.shortcut ? `<span class="context-shortcut">${esc(item.shortcut)}</span>` : ''}
        </div>
      `;
    }).join('');

    dom.contextMenu.hidden = false;
    const rect = dom.contextMenu.getBoundingClientRect();
    const left = Math.max(4, Math.min(x, window.innerWidth - rect.width - 4));
    const top = Math.max(4, Math.min(y, window.innerHeight - rect.height - 4));
    dom.contextMenu.style.left = left + 'px';
    dom.contextMenu.style.top = top + 'px';
    sound('menu');
  }

  function hideContextMenu() {
    dom.contextMenu.hidden = true;
  }

  function iconMenu(def) {
    const items = [
      { key: 'open', label: '打开', icon: def.icon, run: function () { openApp(def.key); } }
    ];
    if (def.key === 'recycle') {
      items.push({
        key: 'empty', label: '清空回收站', icon: 'recycle', run: function () {
          dialog({
            title: '清空回收站',
            icon: 'warning',
            text: '确定要清空回收站吗？',
            subtext: '系统提示：这些文件仍在被 1998 年的某个人使用。',
            buttons: [
              { label: '还是清空', value: 'empty' },
              { label: '算了', value: 'cancel', primary: true }
            ],
            onSelect: function (value) {
              if (value === 'empty') {
                sound('error');
                toast('回收站', '清空失败：回忆不计入磁盘空间。', 'error');
              }
            }
          });
        }
      });
    }
    items.push({ sep: true });
    items.push({ key: 'props', label: '属性', icon: 'info', run: function () { openApp('about'); } });
    return items;
  }

  function desktopMenu() {
    const items = [
      { key: 'refresh', label: '刷新', icon: 'screenshot', run: refreshDesktop },
      {
        key: 'arrange', label: '排列图标', icon: 'computer', run: function () {
          toast('桌面', '图标已经排列整齐，像 1998 年的机房一样。', 'computer');
        }
      },
      { sep: true },
      { key: 'random', label: '随机抽个瓜', icon: 'random', run: function () { openApp('random', { auto: true }); } },
      { key: 'notes', label: '新建吃瓜笔记', icon: 'notes', run: function () { openApp('notes'); } },
      { sep: true },
      {
        key: 'crt', label: 'CRT 显示模式', icon: 'screenshot', checked: isCRT(), run: function () {
          setCRT(!isCRT());
        }
      },
      { key: 'props', label: '属性', icon: 'gear', run: function () { openApp('displayProperties'); } }
    ];

    if (theme === 'win11') {
      items.push({ sep: true });
      items.push({
        key: 'back98', label: '回到 1998', icon: 'timeMachine', run: function () {
          timeTravel('win98');
        }
      });
    }
    return items;
  }

  function refreshDesktop() {
    dom.icons.style.visibility = 'hidden';
    setTimeout(function () { dom.icons.style.visibility = ''; }, 90);
    clearIconSelection();
    sound('click');
    toast('桌面', '桌面已刷新。1998 年的图标一个都没少。', 'screenshot');
  }

  function handleContextMenuClick(event) {
    const itemEl = event.target.closest('[data-menu-key]');
    if (!itemEl || itemEl.classList.contains('disabled')) return;
    const def = contextItems.filter(function (item) { return item.key === itemEl.dataset.menuKey; })[0];
    hideContextMenu();
    if (def && typeof def.run === 'function') def.run();
  }

  document.addEventListener('contextmenu', function (event) {
    if (event.target.closest('.dialog-layer') || event.target.closest('#start-menu') || event.target.closest('#win11-start-menu')) {
      event.preventDefault();
      return;
    }
    if (event.target.closest('.window') || event.target.closest('.taskbar')) {
      // 应用内部保留浏览器原生右键菜单（例如笔记输入框的复制粘贴）
      return;
    }
    event.preventDefault();
    hideStartAndContext();

    const icon = event.target.closest('.desktop-icon');
    if (icon) {
      const def = DESKTOP_ICONS.filter(function (item) { return item.key === icon.dataset.app; })[0];
      if (!def) return;
      selectIcon(icon);
      showContextMenu(event.clientX, event.clientY, iconMenu(def));
      return;
    }
    clearIconSelection();
    showContextMenu(event.clientX, event.clientY, desktopMenu());
  });

  function hideStartAndContext() {
    dom.startMenu.hidden = true;
    dom.win11Start.hidden = true;
    dom.startButton.classList.remove('open');
    dom.startButton.setAttribute('aria-expanded', 'false');
    dom.contextMenu.hidden = true;
  }

  /* ============================================================
     任务栏 / 托盘 / 时钟
     ============================================================ */
  function tickClock() {
    const d = new Date();
    dom.clockTime.textContent = pad2(d.getHours()) + ':' + pad2(d.getMinutes());
    dom.trayClock.title = `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日 · 查看今天的瓜`;
  }

  function openCalendarToday() {
    openApp('calendar');
    const d = new Date();
    if (d.getFullYear() < 1998 || d.getFullYear() > 2026) return;
    const date = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    setTimeout(function () {
      document.dispatchEvent(new CustomEvent('gua-calendar-jump', { detail: { date: date } }));
    }, 80);
  }

  function bindTaskbar() {
    dom.startButton.addEventListener('click', function (event) {
      event.stopPropagation();
      toggleStart();
    });

    dom.traySound.addEventListener('click', function (event) {
      event.stopPropagation();
      toggleSound();
    });

    dom.trayOnline.addEventListener('click', function () {
      sound('click');
      toast('瓜田在线', '连接正常 · 已在线 28 年。网速不快，但瓜管够。', 'network');
    });

    dom.trayClock.addEventListener('click', function () {
      sound('click');
      openCalendarToday();
    });

    dom.tray1024.addEventListener('click', function () {
      sound('chime');
      openApp('special1024');
    });

    dom.startMenu.addEventListener('click', handleStartClick);
    dom.win11Start.addEventListener('click', handleStartClick);
    dom.contextMenu.addEventListener('click', handleContextMenuClick);
  }

  /* ============================================================
     开机
     ============================================================ */
  const BOOT_MESSAGES = [
    '正在加载系统核心文件...',
    '正在挂载瓜田年鉴 1998—2026...',
    '正在检查调制解调器...',
    '正在恢复桌面图标...',
    '正在准备今年的大瓜...'
  ];

  function boot() {
    let progress = 0;
    let step = 0;
    dom.bootProgress.style.width = '0%';

    const timer = setInterval(function () {
      progress = Math.min(100, progress + 7 + Math.random() * 9);
      step = Math.min(BOOT_MESSAGES.length - 1, Math.floor(progress / 21));
      dom.bootProgress.style.width = progress + '%';
      dom.bootProgress.setAttribute('aria-valuenow', String(Math.round(progress)));
      dom.bootStatus.textContent = BOOT_MESSAGES[step];

      if (progress >= 100) {
        clearInterval(timer);
        dom.bootStatus.textContent = '正在进入桌面...';
        setTimeout(finishBoot, 360);
      }
    }, 170);
  }

  function finishBoot() {
    if (bootFinished) return;
    bootFinished = true;
    document.body.classList.remove('booting');
    tickClock();
    setTimeout(function () {
      if (window.GuaSound.enabled) sound('startup');
    }, 120);
    setTimeout(onDesktopReady, 520);
  }

  function onDesktopReady() {
    const visited = readStore(STORAGE.visited) === '1';
    if (!visited) {
      writeStore(STORAGE.visited, '1');
      showBalloon(
        '瓜田98',
        '欢迎回来。\n1998年，你用记事本写着HTML，盼着网速快一点。\n2026年，你用AI生成着代码，盼着bug少一点。\n今天，想吃点什么瓜？',
        'watermelon',
        3000
      );
      if (is1024) setTimeout(openMessenger, 3800);
    } else if (is1024) {
      setTimeout(openMessenger, 900);
    }
  }

  /* ============================================================
     1024 信使服务
     ============================================================ */
  function openMessenger() {
    sound('chime');
    dialog({
      title: '信使服务',
      icon: 'messenger',
      text: '【信使服务】致28年前的你：你不用担心未来的程序员会失业，他们只是换了种方式，继续和代码死磕。1024程序员节快乐。',
      subtext: '已为你解锁「程序员翻车名场面合集」。',
      buttons: [
        { label: '去看看', value: 'open' },
        { label: '收下祝福', value: 'ok', primary: true }
      ],
      onSelect: function (value) {
        if (value === 'open') openApp('special1024');
      }
    });
  }

  /* ============================================================
     关机
     ============================================================ */
  function requestShutdown() {
    closeMenus();
    dialog({
      title: '关闭 Windows',
      icon: 'power',
      text: '您确定要关闭这台瓜田 98 吗？\n\n所有未吃完的瓜都会被保存。',
      buttons: [
        { label: '关机', value: 'shutdown' },
        { label: '取消', value: 'cancel', primary: true }
      ],
      onSelect: function (value) {
        if (value === 'shutdown') runShutdown();
      }
    });
  }

  function runShutdown() {
    closeMenus();
    hideBalloon();
    sound('shutdown');
    dom.shutdownScreen.classList.add('active');
    setTimeout(function () {
      dom.shutdownScreen.classList.add('show-message');
    }, 3000);
    setTimeout(function () {
      dom.shutdownScreen.classList.add('message-out');
    }, 8200);
    setTimeout(function () {
      dom.shutdownScreen.classList.remove('message-out');
      dom.shutdownScreen.classList.add('show-final');
    }, 9400);
  }

  /* ============================================================
     蓝屏
     ============================================================ */
  let bsodOpen = false;

  function showBSOD() {
    if (bsodOpen) return;
    bsodOpen = true;
    dom.bsod.classList.add('show');
    sound('bsod');

    const hide = function () {
      bsodOpen = false;
      dom.bsod.classList.remove('show');
      window.removeEventListener('keydown', hide);
      dom.bsod.removeEventListener('click', hide);
      sound('click');
    };

    setTimeout(function () {
      window.addEventListener('keydown', hide);
      dom.bsod.addEventListener('click', hide);
    }, 400);
  }

  /* ============================================================
     全局 GUI API
     ============================================================ */
  function openApp(appId, params) {
    hideStartAndContext();
    hideBalloon();
    return wm.openApp(appId, params || {});
  }

  window.Gua = {
    wm: wm,
    openApp: openApp,
    toast: toast,
    balloon: showBalloon,
    dialog: dialog,
    showBSOD: showBSOD,
    timeTravel: timeTravel,
    setCRT: setCRT,
    openCalendarToday: openCalendarToday,
    shutdown: requestShutdown,
    get crt() { return isCRT(); },
    get theme() { return theme; }
  };

  /* ============================================================
     全局事件
     ============================================================ */
  function bindGlobalEvents() {
    document.addEventListener('pointerdown', function (event) {
      const target = event.target;
      if (!dom.startMenu.hidden && !target.closest('#start-menu') && !target.closest('#start-button')) {
        dom.startMenu.hidden = true;
        dom.startButton.classList.remove('open');
        dom.startButton.setAttribute('aria-expanded', 'false');
      }
      if (!dom.win11Start.hidden && !target.closest('#win11-start-menu') && !target.closest('#start-button')) {
        dom.win11Start.hidden = true;
        dom.startButton.classList.remove('open');
        dom.startButton.setAttribute('aria-expanded', 'false');
      }
      if (!dom.contextMenu.hidden && !target.closest('#context-menu')) {
        dom.contextMenu.hidden = true;
      }
    }, true);

    dom.desktop.addEventListener('click', function (event) {
      if (event.target.closest('.desktop-icon') || event.target.closest('.window')) return;
      if (event.target.closest('.taskbar')) return;
      clearIconSelection();
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      if (!dom.contextMenu.hidden) {
        dom.contextMenu.hidden = true;
        return;
      }
      if (!dom.startMenu.hidden || !dom.win11Start.hidden) {
        hideStartAndContext();
        return;
      }
      if (dialogStack.length) {
        closeDialogEntry(dialogStack[dialogStack.length - 1], 'cancel');
      }
    });

    window.addEventListener('resize', function () {
      hideStartAndContext();
    });

    dom.rebootButton.addEventListener('click', function () {
      window.location.reload();
    });
  }

  /* ============================================================
     初始化
     ============================================================ */
  function init() {
    applyTheme(theme, { silent: true });

    const savedSound = readStore(STORAGE.sound) === '1';
    window.GuaSound.enabled = savedSound;
    if (savedSound) window.GuaSound.ensureContext();
    updateSoundUI();

    if (readStore(STORAGE.crt) === '1') {
      document.body.classList.add('crt-on');
    }

    if (is1024) {
      dom.tray1024.hidden = false;
      dom.tray1024.classList.add('visible');
    }

    buildDesktopIcons();
    buildStartMenu();
    buildWin11Start();
    bindTaskbar();
    bindGlobalEvents();
    tickClock();
    setInterval(tickClock, 1000);

    const unlock = function () {
      const ctx = window.GuaSound.ensureContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(function () {});
      }
      document.removeEventListener('pointerdown', unlock);
    };
    document.addEventListener('pointerdown', unlock);

    boot();
  }

  init();
})();
