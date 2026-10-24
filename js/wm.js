/* ============================================================
   瓜田98 · 窗口管理器
   统一负责：打开/关闭/最小化/最大化、拖拽、层级、任务栏标签。
   ============================================================ */
(function () {
  'use strict';

  class WindowManager {
    constructor(options) {
      this.layer = options.layer;
      this.taskbar = options.taskbar;
      this.taskButtons = options.taskButtons;
      this.desktop = options.desktop;
      this.icons = window.GuaIcons;
      this.windows = new Map();
      this.zIndex = 20;
      this.cascade = 0;
      this.activeId = null;
      this._boundResize = this._handleResize.bind(this);
      window.addEventListener('resize', this._boundResize);
    }

    get availableHeight() {
      return Math.max(200, window.innerHeight - this.taskbar.offsetHeight);
    }

    notify(title, text, icon) {
      if (window.Gua && typeof window.Gua.toast === 'function') {
        window.Gua.toast(title, text, icon);
      }
    }

    openApp(appId, params) {
      const app = window.GuaApps && window.GuaApps[appId];
      if (!app) {
        this.notify('瓜田98', '没有找到这个程序。', 'warning');
        return null;
      }
      const data = params || {};
      const meta = typeof app.meta === 'function' ? app.meta(data) : {
        title: app.title || '未命名程序',
        icon: app.icon || 'exe',
        width: app.width || 640,
        height: app.height || 460,
        resizable: app.resizable
      };
      const key = typeof app.key === 'function' ? app.key(data) : (app.key || appId);
      const existing = this.windows.get(key);
      if (existing) {
        if (existing.minimized) this.restore(key);
        this.focus(key);
        if (app.onReopen) app.onReopen(existing, data);
        return existing;
      }

      let width = Math.min(meta.width || 640, window.innerWidth - 12);
      let height = Math.min(meta.height || 460, this.availableHeight - 12);
      width = Math.max(280, width);
      height = Math.max(190, height);

      const offset = (this.cascade % 7) * 22;
      this.cascade += 1;
      let left = Math.round((window.innerWidth - width) / 2 + offset);
      let top = Math.round((this.availableHeight - height) / 2 + offset);
      left = Math.max(4, Math.min(left, window.innerWidth - width - 4));
      top = Math.max(4, Math.min(top, this.availableHeight - height - 4));

      const id = 'win-' + (++this.zIndex);
      const winEl = document.createElement('div');
      winEl.className = 'window';
      winEl.dataset.windowId = key;
      winEl.dataset.windowDom = id;
      winEl.setAttribute('role', 'dialog');
      winEl.setAttribute('aria-label', meta.title || '窗口');
      winEl.style.left = left + 'px';
      winEl.style.top = top + 'px';
      winEl.style.width = width + 'px';
      winEl.style.height = height + 'px';
      winEl.style.zIndex = this.zIndex;

      const iconHtml = this.icons[meta.icon] || this.icons.exe;

      winEl.innerHTML = `
        <div class="window-frame">
          <div class="titlebar">
            <div class="window-title">
              <span class="window-title-icon">${iconHtml}</span>
              <span class="window-title-text">${this._escape(meta.title || '')}</span>
            </div>
            <div class="window-controls">
              <button type="button" class="window-control" data-win-action="minimize" aria-label="最小化" title="最小化">
                <span class="ctrl-glyph glyph-min"></span>
              </button>
              <button type="button" class="window-control" data-win-action="maximize" aria-label="最大化" title="最大化">
                <span class="ctrl-glyph glyph-max"></span>
              </button>
              <button type="button" class="window-control" data-win-action="close" aria-label="关闭" title="关闭">
                <span class="ctrl-glyph glyph-close"></span>
              </button>
            </div>
          </div>
          <div class="window-body"></div>
        </div>
      `;

      const body = winEl.querySelector('.window-body');
      const appApi = {
        key,
        id,
        element: winEl,
        body,
        title: meta.title,
        params: data,
        close: () => this.close(key),
        minimize: () => this.minimize(key),
        maximize: () => this.toggleMaximize(key),
        setTitle: (title) => this.setTitle(key, title)
      };

      try {
        body.innerHTML = app.render ? app.render(data, appApi) : '<div class="empty-state">这个程序还在加载中。</div>';
      } catch (err) {
        body.innerHTML = '<div class="empty-state error-state">程序遇到了一个异常，请关闭后重试。</div>';
      }

      this.layer.appendChild(winEl);
      const record = {
        key,
        id,
        appId,
        title: meta.title,
        icon: meta.icon || 'exe',
        element: winEl,
        body,
        minimized: false,
        maximized: false,
        prevRect: null,
        meta,
        app,
        api: appApi,
        taskButton: null
      };
      this.windows.set(key, record);

      this._bindWindow(record);
      this._createTaskButton(record);

      // onMount 在节点进入 DOM 后再执行，便于测量与绑定事件
      if (app.mount) {
        try {
          app.mount(body, record, data);
        } catch (err) {
          // 保持窗口可用，控制台不输出无意义噪声
        }
      }

      this.focus(key);
      if (window.GuaSound) window.GuaSound.play('open');
      return record;
    }

    _bindWindow(record) {
      const el = record.element;
      el.addEventListener('pointerdown', () => {
        if (this.activeId !== record.key) this.focus(record.key);
      }, true);

      const titlebar = el.querySelector('.titlebar');
      titlebar.addEventListener('pointerdown', (event) => {
        if (event.target.closest('.window-control')) return;
        if (record.maximized) return;
        this._startDrag(record, event);
      });
      titlebar.addEventListener('dblclick', (event) => {
        if (event.target.closest('.window-control')) return;
        this.toggleMaximize(record.key);
      });

      el.querySelectorAll('[data-win-action]').forEach((btn) => {
        btn.addEventListener('click', (event) => {
          event.stopPropagation();
          const action = btn.dataset.winAction;
          if (action === 'minimize') this.minimize(record.key);
          if (action === 'maximize') this.toggleMaximize(record.key);
          if (action === 'close') this.close(record.key);
        });
      });

      // 应用内部可以用 data-win-action="close" 关闭自己
      el.querySelector('.window-body').addEventListener('click', (event) => {
        const actionEl = event.target.closest('[data-window-action]');
        if (!actionEl) return;
        if (actionEl.dataset.windowAction === 'close') this.close(record.key);
        if (actionEl.dataset.windowAction === 'minimize') this.minimize(record.key);
      });
    }

    _startDrag(record, event) {
      if (event.button !== 0) return;
      const el = record.element;
      const startX = event.clientX;
      const startY = event.clientY;
      const rect = el.getBoundingClientRect();
      const offsetX = startX - rect.left;
      const offsetY = startY - rect.top;
      const pointerId = event.pointerId;
      el.classList.add('dragging');
      document.body.classList.add('window-dragging');

      const move = (moveEvent) => {
        if (moveEvent.pointerId !== pointerId) return;
        const width = el.offsetWidth;
        const height = el.offsetHeight;
        const maxLeft = Math.max(0, window.innerWidth - width);
        const maxTop = Math.max(0, this.availableHeight - height);
        const nextLeft = Math.max(0, Math.min(moveEvent.clientX - offsetX, maxLeft));
        const nextTop = Math.max(0, Math.min(moveEvent.clientY - offsetY, maxTop));
        el.style.left = Math.round(nextLeft) + 'px';
        el.style.top = Math.round(nextTop) + 'px';
      };

      const finish = () => {
        el.classList.remove('dragging');
        document.body.classList.remove('window-dragging');
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', finish);
        window.removeEventListener('pointercancel', finish);
      };

      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', finish);
      window.addEventListener('pointercancel', finish);
    }

    _createTaskButton(record) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'task-button';
      btn.dataset.windowId = record.key;
      const icon = this.icons[record.icon] || this.icons.exe;
      btn.innerHTML = `<span class="task-button-icon">${icon}</span><span class="task-button-label">${this._escape(record.title)}</span>`;
      btn.title = record.title;
      btn.addEventListener('click', () => {
        if (record.minimized) {
          this.restore(record.key);
          this.focus(record.key);
          return;
        }
        if (this.activeId === record.key) {
          this.minimize(record.key);
        } else {
          this.focus(record.key);
        }
      });
      record.taskButton = btn;
      this.taskButtons.appendChild(btn);
    }

    focus(key) {
      const record = this.windows.get(key);
      if (!record) return;
      if (record.minimized) this.restore(key);
      this.activeId = key;
      this.zIndex += 1;
      record.element.style.zIndex = this.zIndex;
      this.windows.forEach((w, wKey) => {
        const active = wKey === key;
        w.element.classList.toggle('active', active);
        if (w.taskButton) w.taskButton.classList.toggle('active', active);
      });
      record.element.classList.remove('window-attention');
      void record.element.offsetWidth;
      if (record.app && record.app.onFocus) {
        try { record.app.onFocus(record); } catch (err) {}
      }
    }

    minimize(key) {
      const record = this.windows.get(key);
      if (!record || record.minimized) return;
      record.minimized = true;
      record.element.classList.add('minimized');
      record.element.setAttribute('aria-hidden', 'true');
      if (record.taskButton) record.taskButton.classList.remove('active');
      if (this.activeId === key) {
        this.activeId = null;
        this._focusTopmost();
      }
      if (window.GuaSound) window.GuaSound.play('minimize');
    }

    restore(key) {
      const record = this.windows.get(key);
      if (!record) return;
      record.minimized = false;
      record.element.classList.remove('minimized');
      record.element.removeAttribute('aria-hidden');
      if (record.taskButton) record.taskButton.classList.add('active');
    }

    toggleMaximize(key) {
      const record = this.windows.get(key);
      if (!record) return;
      const el = record.element;
      if (!record.maximized) {
        const rect = el.getBoundingClientRect();
        record.prevRect = {
          left: el.style.left || rect.left + 'px',
          top: el.style.top || rect.top + 'px',
          width: el.style.width || rect.width + 'px',
          height: el.style.height || rect.height + 'px'
        };
        record.maximized = true;
        el.classList.add('maximized');
        el.style.left = '0px';
        el.style.top = '0px';
        el.style.width = window.innerWidth + 'px';
        el.style.height = this.availableHeight + 'px';
      } else {
        record.maximized = false;
        el.classList.remove('maximized');
        if (record.prevRect) {
          el.style.left = record.prevRect.left;
          el.style.top = record.prevRect.top;
          el.style.width = record.prevRect.width;
          el.style.height = record.prevRect.height;
        }
      }
      const maxBtn = el.querySelector('[data-win-action="maximize"]');
      if (maxBtn) {
        maxBtn.title = record.maximized ? '还原' : '最大化';
        maxBtn.setAttribute('aria-label', record.maximized ? '还原' : '最大化');
      }
      this.focus(key);
      if (window.GuaSound) window.GuaSound.play('menu');
      if (record.app && record.app.onResize) {
        try { record.app.onResize(record); } catch (err) {}
      }
      window.dispatchEvent(new Event('resize'));
    }

    close(key) {
      const record = this.windows.get(key);
      if (!record) return;
      const wasActive = this.activeId === key;
      record.element.classList.add('closing');
      if (record.taskButton) record.taskButton.classList.remove('active');
      const finish = () => {
        record.element.remove();
        if (record.taskButton) record.taskButton.remove();
        this.windows.delete(key);
        if (wasActive) {
          this.activeId = null;
          this._focusTopmost();
        }
      };
      // 给 CSS 留出极短的关闭时间；即便动画被禁用也会执行
      setTimeout(finish, 70);
      if (window.GuaSound) window.GuaSound.play('close');
    }

    closeAll() {
      Array.from(this.windows.keys()).forEach((key) => this.close(key));
    }

    setTitle(key, title) {
      const record = this.windows.get(key);
      if (!record) return;
      record.title = title;
      const text = record.element.querySelector('.window-title-text');
      if (text) text.textContent = title;
      if (record.taskButton) {
        record.taskButton.querySelector('.task-button-label').textContent = title;
        record.taskButton.title = title;
      }
    }

    _focusTopmost() {
      let top = null;
      let topZ = -1;
      this.windows.forEach((record) => {
        if (record.minimized) return;
        const z = parseInt(record.element.style.zIndex || '0', 10);
        if (z > topZ) {
          topZ = z;
          top = record;
        }
      });
      if (top) this.focus(top.key);
    }

    _handleResize() {
      const avail = this.availableHeight;
      this.windows.forEach((record) => {
        if (record.maximized) {
          record.element.style.width = window.innerWidth + 'px';
          record.element.style.height = avail + 'px';
        } else {
          const rect = record.element.getBoundingClientRect();
          const width = Math.min(rect.width, window.innerWidth);
          const height = Math.min(rect.height, avail);
          record.element.style.width = Math.max(280, width) + 'px';
          record.element.style.height = Math.max(190, height) + 'px';
          const maxLeft = Math.max(0, window.innerWidth - width);
          const maxTop = Math.max(0, avail - height);
          record.element.style.left = Math.max(0, Math.min(rect.left, maxLeft)) + 'px';
          record.element.style.top = Math.max(0, Math.min(rect.top, maxTop)) + 'px';
        }
      });
    }

    _escape(text) {
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }
  }

  window.GuaWindowManager = WindowManager;
})();
