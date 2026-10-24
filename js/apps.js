/* ============================================================
   瓜田98 · 应用层（核心）
   日历、瓜详情、检索器、吃瓜笔记、随机吃瓜
   ============================================================ */
(function () {
  'use strict';

  const D = window.GuaData;
  const I = window.GuaIcons;

  const CATEGORY_META = {
    tech: { label: '科技圈', icon: 'keyboard' },
    ent: { label: '娱乐圈', icon: 'popcorn' },
    web: { label: '互联网圈', icon: 'globe' },
    reversal: { label: '反转连续剧', icon: 'loop' }
  };

  const STATUS_META = {
    none: { label: '未标记', className: '' },
    waiting: { label: '待吃', className: 'waiting' },
    eaten: { label: '已吃', className: 'eaten' },
    following: { label: '追更中', className: 'following' }
  };

  function esc(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function icon(name, className) {
    return `<span class="${className || ''}">${I[name] || I.exe}</span>`;
  }

  function catMeta(gua) {
    return CATEGORY_META[gua.type] || CATEGORY_META.web;
  }

  function parseDate(dateStr) {
    const parts = String(dateStr).split('-').map(Number);
    return { year: parts[0], month: parts[1], day: parts[2] };
  }

  function pad2(number) {
    return number < 10 ? '0' + number : '' + number;
  }

  function formatDate(dateStr) {
    const d = parseDate(dateStr);
    return `${d.year} 年 ${d.month} 月 ${d.day} 日`;
  }

  function heatMeter(heat, label) {
    let cells = '';
    for (let i = 1; i <= 5; i += 1) {
      cells += `<i class="${i <= heat ? 'on' : ''}"></i>`;
    }
    return `<span class="heat-meter" role="img" aria-label="${esc(label || ('劲爆指数 ' + heat + ' / 5'))}">${cells}</span>`;
  }

  function getGuaById(id) {
    return D.gua.find(function (g) { return g.id === id; }) || null;
  }

  function getGuaByDate(dateStr) {
    return D.gua.filter(function (g) { return g.date === dateStr; });
  }

  function openGua(id) {
    if (window.Gua && typeof window.Gua.openApp === 'function') {
      window.Gua.openApp('guaDetail', { id: id });
    }
  }

  function statusFor(id) {
    const entry = window.GuaNotes.get(id);
    return entry && entry.status && STATUS_META[entry.status] ? entry.status : 'none';
  }

  /* ---------- localStorage 笔记 ---------- */
  const NOTE_KEY = 'guatian98_notes_v1';

  class NoteStore {
    constructor() {
      this.key = NOTE_KEY;
    }

    read() {
      try {
        const raw = localStorage.getItem(this.key);
        if (!raw) return {};
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
      } catch (err) {
        return {};
      }
    }

    write(data) {
      try {
        localStorage.setItem(this.key, JSON.stringify(data));
      } catch (err) {
        // 本地存储不可用时保持页面可用，数据只在当前会话内生效
      }
    }

    get(id) {
      return this.read()[id] || null;
    }

    set(id, patch) {
      const all = this.read();
      const previous = all[id] || { status: 'none', note: '', updatedAt: 0 };
      const next = Object.assign({}, previous, patch, { updatedAt: Date.now() });
      if (!next.note && (!next.status || next.status === 'none')) {
        delete all[id];
      } else {
        all[id] = next;
      }
      this.write(all);
      document.dispatchEvent(new CustomEvent('gua-notes-change', { detail: { id: id } }));
      return all[id] || null;
    }

    setStatus(id, status) {
      return this.set(id, { status: status });
    }

    setNote(id, note) {
      return this.set(id, { note: note });
    }

    remove(id) {
      const all = this.read();
      delete all[id];
      this.write(all);
      document.dispatchEvent(new CustomEvent('gua-notes-change', { detail: { id: id } }));
    }

    clear() {
      this.write({});
      document.dispatchEvent(new CustomEvent('gua-notes-change', { detail: { id: null } }));
    }

    list() {
      const all = this.read();
      return Object.keys(all)
        .map(function (id) {
          return Object.assign({ id: id }, all[id]);
        })
        .filter(function (entry) { return !!getGuaById(entry.id); })
        .sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
    }
  }

  const notes = new NoteStore();
  window.GuaNotes = notes;

  /* ---------- 日历公共状态 ---------- */
  const realToday = new Date();
  const todayInRange = realToday.getFullYear() >= 1998 && realToday.getFullYear() <= 2026;
  const calendarState = {
    year: todayInRange ? realToday.getFullYear() : 2026,
    month: todayInRange ? realToday.getMonth() + 1 : 10,
    selected: null
  };

  function todayString() {
    return `${realToday.getFullYear()}-${pad2(realToday.getMonth() + 1)}-${pad2(realToday.getDate())}`;
  }

  function categoryOptions(selected, includeAll) {
    let html = includeAll ? '<option value="all">全部圈子</option>' : '';
    Object.keys(CATEGORY_META).forEach(function (key) {
      html += `<option value="${key}" ${selected === key ? 'selected' : ''}>${CATEGORY_META[key].label}</option>`;
    });
    return html;
  }

  function yearOptions(selected, includeAll) {
    let html = includeAll ? '<option value="all">全部年份</option>' : '';
    for (let y = 2026; y >= 1998; y -= 1) {
      html += `<option value="${y}" ${Number(selected) === y ? 'selected' : ''}>${y}</option>`;
    }
    return html;
  }

  /* ============================================================
     瓜田日历
     ============================================================ */
  function calendarInner() {
    const state = calendarState;
    const monthGua = D.gua
      .filter(function (g) {
        const d = parseDate(g.date);
        return d.year === state.year && d.month === state.month;
      })
      .sort(function (a, b) { return a.date.localeCompare(b.date); });

    const firstDay = new Date(state.year, state.month - 1, 1).getDay();
    const gridStart = new Date(state.year, state.month - 1, 1 - firstDay);
    const currentDate = todayString();
    let cells = '';

    for (let i = 0; i < 42; i += 1) {
      const d = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
      const dateStr = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
      const others = d.getMonth() + 1 !== state.month;
      const guas = getGuaByDate(dateStr);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const isToday = dateStr === currentDate;
      const isSelected = dateStr === state.selected;
      const markerIcon = guas.length ? catMeta(guas[0]).icon : null;
      const is1024 = d.getMonth() + 1 === 10 && d.getDate() === 24;
      const label = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日${guas.length ? '，' + guas.length + ' 个瓜' : ''}`;

      cells += `
        <button type="button" class="cal-day ${others ? 'other-month' : ''} ${isWeekend ? 'weekend' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}"
          data-cal-date="${dateStr}" aria-label="${label}">
          <span class="day-number">${d.getDate()}</span>
          ${guas.length ? `<span class="day-marker">${I[markerIcon] || I.globe}</span>` : ''}
          ${guas.length > 1 ? `<span class="day-gua-count">${guas.length}</span>` : ''}
          ${is1024 ? '<span class="day-special" title="1024 程序员节">1024</span>' : ''}
        </button>
      `;
    }

    let monthList = '';
    monthGua.forEach(function (g) {
      monthList += `
        <button type="button" class="month-gua-item" data-gua-id="${esc(g.id)}">
          <span class="month-gua-icon">${I[catMeta(g).icon]}</span>
          <span class="month-gua-text">
            <span class="month-gua-title">${esc(g.title)}</span>
            <span class="month-gua-date">${esc(g.date.slice(5).replace('-', ' / '))} · ${heatMeter(g.heat)}</span>
          </span>
        </button>
      `;
    });
    if (!monthGua.length) {
      monthList = '<div class="month-gua-empty">这个月暂时没有收录大瓜。<br>但互联网从不缺故事，换个年份看看？</div>';
    }

    let footnote = '';
    const selectedParts = state.selected ? parseDate(state.selected) : null;
    if (selectedParts && selectedParts.month === 1 && selectedParts.day === 1) {
      const note = D.footnotes[selectedParts.year] || '这一年的技术故事，还在整理中。';
      footnote = `
        <div class="cal-side-panel cal-note-panel show">
          <div class="cal-side-head">年度技术注脚 · ${selectedParts.year}</div>
          <div class="cal-note-body">
            <h4>${selectedParts.year} 年的技术圈</h4>
            <p>${esc(note)}</p>
            <button type="button" class="btn98 small" data-cal-action="open-annual" data-year="${selectedParts.year}" style="margin-top:6px;">展开完整注脚</button>
          </div>
        </div>
      `;
    } else if (selectedParts && selectedParts.month === 10 && selectedParts.day === 24) {
      footnote = `
        <div class="cal-side-panel cal-note-panel show">
          <div class="cal-side-head">1024 · 程序员节</div>
          <div class="cal-note-body">
            <h4>今天不写需求，只吃瓜</h4>
            <p>1998 到 2026，代码换了很多种写法，深夜改 bug 的心情没怎么变。1024 快乐。</p>
            <button type="button" class="btn98 small" data-cal-action="open-1024" style="margin-top:6px;">打开 1024 特辑</button>
          </div>
        </div>
      `;
    }

    const selectedInfo = state.selected
      ? `${formatDate(state.selected)}${getGuaByDate(state.selected).length ? ' · 收录了 ' + getGuaByDate(state.selected).length + ' 个瓜' : ' · 这天暂时没有收录大瓜'}`
      : '单击有标记的日期查看瓜档；每一年的 1 月 1 日还会多一条技术注脚。';

    return `
      <div class="calendar-toolbar">
        <div class="cal-nav">
          <button type="button" class="btn98" data-cal-action="prev-year" title="上一年" aria-label="上一年" ${state.year <= 1998 ? 'disabled' : ''}>«</button>
          <button type="button" class="btn98" data-cal-action="prev-month" title="上个月" aria-label="上个月">‹</button>
        </div>
        <div class="cal-title"><span>${state.year}</span> 年 <strong>${state.month}</strong> 月 <em>· 瓜田年鉴</em></div>
        <div class="cal-nav">
          <button type="button" class="btn98" data-cal-action="next-month" title="下个月" aria-label="下个月">›</button>
          <button type="button" class="btn98" data-cal-action="next-year" title="下一年" aria-label="下一年" ${state.year >= 2026 ? 'disabled' : ''}>»</button>
        </div>
        <div class="spacer"></div>
        <label class="field-label">年份
          <select class="field98 year-select" data-cal-year aria-label="选择年份">${yearOptions(state.year, false)}</select>
        </label>
        <button type="button" class="btn98 today-btn" data-cal-action="today">今天</button>
      </div>
      <div class="cal-main">
        <div class="cal-grid-wrap">
          <div class="cal-weekdays">
            <span class="sun">日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span class="sat">六</span>
          </div>
          <div class="calendar-grid">${cells}</div>
        </div>
        <aside class="cal-sidebar">
          <div class="cal-side-panel month-list-panel">
            <div class="cal-side-head">
              <span>本月大瓜</span>
              <span class="side-count">${monthGua.length} 条</span>
            </div>
            <div class="month-gua-list">${monthList}</div>
          </div>
          ${footnote}
          <div class="cal-side-panel">
            <div class="cal-side-head">日历说明</div>
            <div class="cal-selected-note">${esc(selectedInfo)}</div>
          </div>
        </aside>
      </div>
      <div class="app-statusbar">
        <span class="status-cell">${esc(selectedInfo)}</span>
        <span class="status-spacer"></span>
        <span class="status-cell">1998 — 2026 · 共 ${D.gua.length} 个瓜</span>
      </div>
    `;
  }

  function paintCalendar(root) {
    root.innerHTML = calendarInner();
  }

  function navigateCalendar(delta, unit) {
    if (unit === 'year') {
      const next = calendarState.year + delta;
      if (next < 1998 || next > 2026) {
        window.GuaSound.play('error');
        return;
      }
      calendarState.year = next;
    } else {
      let year = calendarState.year;
      let month = calendarState.month + delta;
      if (month > 12) {
        month = 1;
        year += 1;
      } else if (month < 1) {
        month = 12;
        year -= 1;
      }
      if (year < 1998 || year > 2026) {
        window.GuaSound.play('error');
        return;
      }
      calendarState.year = year;
      calendarState.month = month;
    }
    calendarState.selected = null;
  }

  const CalendarApp = {
    title: '瓜田日历',
    icon: 'calendar',
    width: 850,
    height: 590,
    render: function () {
      return '<div class="app calendar-app"></div>';
    },
    mount: function (body) {
      const root = body.querySelector('.calendar-app');

      function openSelectedGua(dateStr) {
        const guas = getGuaByDate(dateStr);
        if (guas.length) {
          guas.forEach(function (g) { openGua(g.id); });
        }
      }

      root.addEventListener('click', function (event) {
        const actionBtn = event.target.closest('[data-cal-action]');
        if (actionBtn) {
          const action = actionBtn.dataset.calAction;
          if (action === 'prev-year') navigateCalendar(-1, 'year');
          if (action === 'next-year') navigateCalendar(1, 'year');
          if (action === 'prev-month') navigateCalendar(-1, 'month');
          if (action === 'next-month') navigateCalendar(1, 'month');
          if (action === 'today') {
            const now = new Date();
            if (now.getFullYear() < 1998 || now.getFullYear() > 2026) {
              window.Gua.toast('瓜田日历', '今天不在 1998—2026 的年鉴范围内，已停在 2026 年 10 月。', 'info');
              calendarState.year = 2026;
              calendarState.month = 10;
              calendarState.selected = null;
            } else {
              calendarState.year = now.getFullYear();
              calendarState.month = now.getMonth() + 1;
              calendarState.selected = todayString();
            }
          }
          if (action === 'open-annual') {
            window.Gua.openApp('annualNote', { year: Number(actionBtn.dataset.year) });
            return;
          }
          if (action === 'open-1024') {
            window.Gua.openApp('special1024');
            return;
          }
          window.GuaSound.play('click');
          paintCalendar(root);
          return;
        }

        const guaBtn = event.target.closest('[data-gua-id]');
        if (guaBtn) {
          window.GuaSound.play('click');
          openGua(guaBtn.dataset.guaId);
          return;
        }

        const dayBtn = event.target.closest('[data-cal-date]');
        if (dayBtn) {
          const dateStr = dayBtn.dataset.calDate;
          const d = parseDate(dateStr);
          if (d.year !== calendarState.year || d.month !== calendarState.month) {
            calendarState.year = d.year;
            calendarState.month = d.month;
          }
          calendarState.selected = dateStr;
          window.GuaSound.play('click');
          paintCalendar(root);
          if (d.month === 10 && d.day === 24) {
            window.Gua.toast('1024 程序员节', '今天不写需求，只吃瓜。', 'watermelon');
          }
          openSelectedGua(dateStr);
        }
      });

      root.addEventListener('change', function (event) {
        const yearSelect = event.target.closest('[data-cal-year]');
        if (yearSelect) {
          const y = Number(yearSelect.value);
          if (y >= 1998 && y <= 2026) {
            calendarState.year = y;
            calendarState.selected = null;
            window.GuaSound.play('menu');
            paintCalendar(root);
          }
        }
      });

      document.addEventListener('gua-calendar-jump', function (event) {
        if (!document.body.contains(root) || !event.detail || !event.detail.date) return;
        const d = parseDate(event.detail.date);
        calendarState.year = d.year;
        calendarState.month = d.month;
        calendarState.selected = event.detail.date;
        paintCalendar(root);
      });

      paintCalendar(root);
    }
  };

  window.addEventListener('gua-notes-change', function () {
    const root = document.querySelector('.calendar-app');
    if (root) paintCalendar(root);
  });

  /* ============================================================
     瓜档详情
     ============================================================ */
  const GuaDetailApp = {
    icon: 'globe',
    width: 700,
    height: 605,
    key: function (params) { return 'gua:' + (params && params.id ? params.id : 'unknown'); },
    meta: function (params) {
      const g = params && getGuaById(params.id);
      return {
        title: g ? '瓜档 · ' + g.title : '瓜档 · 未找到',
        icon: g ? catMeta(g).icon : 'warning',
        width: 700,
        height: 605
      };
    },
    render: function (params) {
      const g = params && getGuaById(params.id);
      if (!g) {
        return '<div class="app"><div class="empty-state error-state">这条瓜档似乎被时间吞掉了。</div></div>';
      }
      const meta = catMeta(g);
      const currentStatus = statusFor(g.id);
      const statusOptions = Object.keys(STATUS_META).map(function (key) {
        return `<option value="${key}" ${key === currentStatus ? 'selected' : ''}>${STATUS_META[key].label}</option>`;
      }).join('');

      let timeline = '';
      g.timeline.forEach(function (item) {
        timeline += `
          <li>
            <span class="timeline-date">${esc(item.date)}</span>
            <span class="timeline-text">${esc(item.text)}</span>
          </li>
        `;
      });

      let moments = '';
      (g.moments || []).forEach(function (text) {
        moments += `<li>${esc(text)}</li>`;
      });

      let memes = '';
      (g.memes || []).forEach(function (meme) {
        memes += `<dt>${esc(meme.name)}</dt><dd>${esc(meme.explain)}</dd>`;
      });

      let tags = '';
      (g.tags || []).forEach(function (tag) {
        tags += `<span class="pill-tag">${esc(tag)}</span>`;
      });

      const replay = g.id === 'comdex-bsod-1998'
        ? '<button type="button" class="btn98 small replay-bsod-btn" data-detail-action="replay-bsod" title="蓝屏是那个年代共同的记忆">重演蓝屏名场面</button>'
        : '';

      return `
        <div class="app gua-detail">
          <div class="gua-detail-head">
            <span class="gua-cat-icon">${I[meta.icon]}</span>
            <div class="gua-detail-title-wrap">
              <h2 class="gua-detail-title">${esc(g.title)}</h2>
              <div class="gua-detail-meta">
                <span class="meta-cat">${esc(g.category)}</span>
                <span>${esc(formatDate(g.date))}</span>
                <span>劲爆 ${heatMeter(g.heat)}</span>
                <span>档案号 #${esc(g.id)}</span>
              </div>
            </div>
          </div>
          <div class="gua-detail-scroll">
            <section class="detail-section">
              <h3>事件简介</h3>
              <p class="detail-summary">${esc(g.summary)}</p>
            </section>
            <section class="detail-section">
              <h3>关键时间线</h3>
              <ol class="detail-timeline">${timeline}</ol>
            </section>
            <section class="detail-section">
              <h3>名场面</h3>
              <ul class="moment-list">${moments}</ul>
            </section>
            <section class="detail-section">
              <h3>梗解释</h3>
              <dl class="meme-list">${memes}</dl>
            </section>
            <section class="detail-section">
              <h3>后续结果</h3>
              <p>${esc(g.aftermath)}</p>
              <div class="gua-tags">
                ${tags}
                ${g.special1024 ? '<span class="pill-tag" style="background:#e8f2d8;">1024 特辑收录</span>' : ''}
              </div>
            </section>
          </div>
          <div class="gua-actions">
            <label class="gua-status-label">我的状态
              <select class="field98 status-select" data-detail-status aria-label="吃瓜状态">${statusOptions}</select>
            </label>
            <button type="button" class="btn98 small" data-detail-action="calendar">在日历中查看</button>
            <button type="button" class="btn98 small" data-detail-action="note">去写笔记</button>
            ${replay}
            <span class="spacer"></span>
            <button type="button" class="btn98 small" data-window-action="close">关闭</button>
          </div>
        </div>
      `;
    },
    mount: function (body, record, params) {
      const g = getGuaById(params.id);
      if (!g) return;
      const root = body.querySelector('.gua-detail');

      root.addEventListener('click', function (event) {
        const btn = event.target.closest('[data-detail-action]');
        if (!btn) return;
        const action = btn.dataset.detailAction;
        if (action === 'note') {
          window.Gua.openApp('notes', { selectedId: g.id });
          return;
        }
        if (action === 'calendar') {
          const d = parseDate(g.date);
          calendarState.year = d.year;
          calendarState.month = d.month;
          calendarState.selected = g.date;
          window.Gua.openApp('calendar');
          document.dispatchEvent(new CustomEvent('gua-calendar-jump', { detail: { date: g.date } }));
          return;
        }
        if (action === 'replay-bsod') {
          window.Gua.showBSOD();
          return;
        }
      });

      root.addEventListener('change', function (event) {
        const select = event.target.closest('[data-detail-status]');
        if (!select) return;
        window.GuaNotes.setStatus(g.id, select.value);
        window.Gua.toast('吃瓜笔记', `《${g.title}》已标记为「${STATUS_META[select.value].label}」。`, 'notes');
        if (select.value !== 'none') window.GuaSound.play('chime');
        else window.GuaSound.play('click');
      });

      document.addEventListener('gua-notes-change', function (event) {
        if (!document.body.contains(root)) return;
        if (event.detail && event.detail.id !== g.id) return;
        const select = root.querySelector('[data-detail-status]');
        if (select) select.value = statusFor(g.id);
      });
    }
  };

  /* ============================================================
     瓜田检索器
     ============================================================ */
  function highlight(text, query) {
    const safe = esc(text);
    if (!query) return safe;
    const q = esc(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      return safe.replace(new RegExp('(' + q + ')', 'ig'), '<mark class="search-hit">$1</mark>');
    } catch (err) {
      return safe;
    }
  }

  function searchData(keyword, category, year, minHeat) {
    const q = keyword.trim().toLowerCase();
    return D.gua.filter(function (g) {
      if (category !== 'all' && g.type !== category) return false;
      if (year !== 'all' && parseDate(g.date).year !== Number(year)) return false;
      if (minHeat && g.heat < minHeat) return false;
      if (!q) return true;
      const haystack = [
        g.title, g.summary, g.aftermath, g.category,
        (g.tags || []).join(' '),
        (g.moments || []).join(' '),
        (g.memes || []).map(function (m) { return m.name + ' ' + m.explain; }).join(' ')
      ].join(' ').toLowerCase();
      return haystack.indexOf(q) !== -1;
    }).sort(function (a, b) { return b.date.localeCompare(a.date); });
  }

  const SearchApp = {
    title: '瓜田检索器',
    icon: 'search',
    width: 770,
    height: 570,
    render: function (params) {
      const initial = params && params.query ? esc(params.query) : '';
      return `
        <div class="app search-app">
          <div class="search-form">
            <label class="field-label">关键词
              <input class="field98" type="search" data-search-keyword value="${initial}" placeholder="标题、梗、人物、年份..." autocomplete="off">
            </label>
            <label class="field-label">圈子
              <select class="field98" data-search-category>${categoryOptions('all', true)}</select>
            </label>
            <label class="field-label">年份
              <select class="field98" data-search-year>${yearOptions('all', true)}</select>
            </label>
            <label class="field-label">劲爆程度
              <select class="field98" data-search-heat>
                <option value="0">全部</option>
                <option value="3">3 级以上</option>
                <option value="4">4 级以上</option>
                <option value="5">5 级大瓜</option>
              </select>
            </label>
            <button type="button" class="btn98 search-submit" data-search-action="focus">检索</button>
          </div>
          <div class="search-summary" data-search-summary>输入关键词，或按圈子、年份和劲爆程度筛选。</div>
          <div class="search-results" data-search-results></div>
          <div class="app-statusbar">
            <span class="status-cell" data-search-status>等待检索</span>
            <span class="status-spacer"></span>
            <span class="status-cell">双击结果查看详情</span>
            <button type="button" class="btn98" data-search-action="open">查看详情</button>
          </div>
        </div>
      `;
    },
    mount: function (body) {
      const root = body.querySelector('.search-app');
      const keywordEl = root.querySelector('[data-search-keyword]');
      const categoryEl = root.querySelector('[data-search-category]');
      const yearEl = root.querySelector('[data-search-year]');
      const heatEl = root.querySelector('[data-search-heat]');
      const resultsEl = root.querySelector('[data-search-results]');
      const summaryEl = root.querySelector('[data-search-summary]');
      const statusEl = root.querySelector('[data-search-status]');
      let selectedId = null;

      function runSearch() {
        const keyword = keywordEl.value.trim();
        const category = categoryEl.value;
        const year = yearEl.value;
        const minHeat = Number(heatEl.value) || 0;
        const list = searchData(keyword, category, year, minHeat);

        if (selectedId && !list.some(function (g) { return g.id === selectedId; })) {
          selectedId = null;
        }

        if (!list.length) {
          resultsEl.innerHTML = `
            <div class="empty-state search-empty">
              <div class="empty-icon">${I.search}</div>
              没有找到对应的瓜。<br>换个关键词，或者把筛选条件放宽一点。
            </div>
          `;
        } else {
          let rows = '';
          list.forEach(function (g) {
            const meta = catMeta(g);
            const shortSummary = g.summary.length > 78 ? g.summary.slice(0, 78) + '…' : g.summary;
            rows += `
              <div class="data-row ${selectedId === g.id ? 'selected' : ''}" data-search-id="${esc(g.id)}" tabindex="0" role="button" aria-label="${esc(g.title)}">
                <span class="cell-date">${esc(g.date)}</span>
                <span class="cell-title">${highlight(g.title, keyword)}
                  <span class="row-sub">${highlight(shortSummary, keyword)}</span>
                </span>
                <span class="cell-cat">${esc(g.category)}</span>
                <span class="cell-heat">${heatMeter(g.heat, '劲爆指数 ' + g.heat)}</span>
              </div>
            `;
          });
          resultsEl.innerHTML = `
            <div class="data-table">
              <div class="data-row data-head">
                <span>日期</span><span>瓜档</span><span>圈子</span><span>劲爆</span>
              </div>
              ${rows}
            </div>
          `;
        }

        summaryEl.textContent = `共找到 ${list.length} 条${keyword ? '与「' + keyword + '」相关的' : ''}瓜档。`;
        statusEl.textContent = selectedId
          ? '已选中：' + (getGuaById(selectedId) || {}).title
          : '等待选择一条瓜档';
      }

      function openSelected() {
        if (!selectedId) {
          window.Gua.toast('瓜田检索器', '先选一条瓜，再查看详情。', 'info');
          window.GuaSound.play('error');
          return;
        }
        openGua(selectedId);
      }

      root.addEventListener('input', runSearch);
      root.addEventListener('change', runSearch);
      root.addEventListener('click', function (event) {
        const action = event.target.closest('[data-search-action]');
        if (action) {
          if (action.dataset.searchAction === 'open') openSelected();
          else keywordEl.focus();
          return;
        }
        const row = event.target.closest('[data-search-id]');
        if (row) {
          selectedId = row.dataset.searchId;
          root.querySelectorAll('[data-search-id]').forEach(function (item) {
            item.classList.toggle('selected', item === row);
          });
          statusEl.textContent = '已选中：' + (getGuaById(selectedId) || {}).title;
          window.GuaSound.play('click');
        }
      });
      root.addEventListener('dblclick', function (event) {
        const row = event.target.closest('[data-search-id]');
        if (row) {
          selectedId = row.dataset.searchId;
          openSelected();
        }
      });
      root.addEventListener('keydown', function (event) {
        const row = event.target.closest('[data-search-id]');
        if (row && event.key === 'Enter') openSelected();
      });

      runSearch();
      setTimeout(function () { if (document.body.contains(root)) keywordEl.focus(); }, 60);
    }
  };

  /* ============================================================
     吃瓜笔记
     ============================================================ */
  const notesViewState = {
    filter: 'all',
    selectedId: null
  };

  const NotesApp = {
    title: '吃瓜笔记',
    icon: 'notes',
    width: 780,
    height: 550,
    render: function () {
      return `
        <div class="app notes-app">
          <div class="notes-filter">
            <button type="button" class="btn98 filter-btn active" data-note-filter="all">全部</button>
            <button type="button" class="btn98 filter-btn" data-note-filter="waiting">待吃</button>
            <button type="button" class="btn98 filter-btn" data-note-filter="eaten">已吃</button>
            <button type="button" class="btn98 filter-btn" data-note-filter="following">追更中</button>
            <span class="notes-count" data-notes-count></span>
          </div>
          <div class="notes-main">
            <div class="notes-list" data-notes-list></div>
            <div class="notes-editor" data-notes-editor></div>
          </div>
          <div class="app-statusbar">
            <span class="status-cell">笔记保存在本机浏览器，刷新页面也不会丢。</span>
            <span class="status-spacer"></span>
            <button type="button" class="btn98" data-note-action="clear">清空全部</button>
          </div>
        </div>
      `;
    },
    mount: function (body, record, params) {
      const root = body.querySelector('.notes-app');
      const listEl = root.querySelector('[data-notes-list]');
      const editorEl = root.querySelector('[data-notes-editor]');
      const countEl = root.querySelector('[data-notes-count]');

      if (params && params.selectedId) {
        notesViewState.selectedId = params.selectedId;
        notesViewState.filter = 'all';
      }

      function filteredNotes() {
        const all = window.GuaNotes.list();
        if (notesViewState.filter === 'all') return all;
        return all.filter(function (entry) { return entry.status === notesViewState.filter; });
      }

      function selectFirstIfNeeded() {
        const all = filteredNotes();
        if (!notesViewState.selectedId || !all.some(function (entry) { return entry.id === notesViewState.selectedId; })) {
          notesViewState.selectedId = all.length ? all[0].id : null;
        }
      }

      function renderList() {
        const all = filteredNotes();
        countEl.textContent = `共 ${window.GuaNotes.list().length} 条笔记`;
        root.querySelectorAll('[data-note-filter]').forEach(function (btn) {
          btn.classList.toggle('active', btn.dataset.noteFilter === notesViewState.filter);
        });

        if (!all.length) {
          listEl.innerHTML = '<div class="notes-empty" style="padding:14px 8px;">这一栏还是空的<br><span class="muted">去日历里挑个瓜吧</span></div>';
          return;
        }

        let html = '';
        all.forEach(function (entry) {
          const g = getGuaById(entry.id);
          if (!g) return;
          const status = STATUS_META[entry.status] || STATUS_META.none;
          const preview = entry.note ? entry.note : '（还没有写备注）';
          html += `
            <button type="button" class="notes-item ${entry.id === notesViewState.selectedId ? 'active' : ''}" data-note-id="${esc(entry.id)}">
              <span class="note-icon">${I[catMeta(g).icon]}</span>
              <span class="note-text">
                <span class="note-title">${esc(g.title)}</span>
                <span class="note-preview">${esc(preview)}</span>
              </span>
              <span class="status-dot ${status.className}" title="${status.label}"></span>
            </button>
          `;
        });
        listEl.innerHTML = html;
      }

      function renderEditor() {
        const id = notesViewState.selectedId;
        const g = id ? getGuaById(id) : null;
        if (!g) {
          editorEl.innerHTML = `
            <div class="notes-empty">
              <span>${I.notes}</span>
              还没有选中笔记。<br>
              先打开日历，点击一个有标记的日期，然后把瓜记下来。
              <button type="button" class="btn98" data-note-action="calendar">去日历逛逛</button>
            </div>
          `;
          return;
        }

        const entry = window.GuaNotes.get(g.id) || { status: 'none', note: '' };
        const status = STATUS_META[entry.status] || STATUS_META.none;
        editorEl.innerHTML = `
          <div class="notes-editor-head">
            <div class="notes-editor-title">${esc(g.title)}</div>
            <div class="notes-editor-meta">
              <span>${esc(formatDate(g.date))}</span>
              <span>${esc(g.category)}</span>
              <span class="status-badge ${status.className}">${status.label}</span>
            </div>
          </div>
          <div class="notes-editor-body">
            <label class="field-label" style="align-items:center;">状态
              <select class="field98 status-select" data-note-status>
                ${Object.keys(STATUS_META).map(function (key) {
                  return `<option value="${key}" ${key === (entry.status || 'none') ? 'selected' : ''}>${STATUS_META[key].label}</option>`;
                }).join('')}
              </select>
            </label>
            <textarea class="field98" data-note-text placeholder="写点什么吧。比如：当年你在哪儿、和谁一起看的、后来怎么样了……">${esc(entry.note || '')}</textarea>
            <div class="notes-tip">备注只保存在这台设备的浏览器里，不会上传。</div>
          </div>
          <div class="notes-editor-actions">
            <button type="button" class="btn98" data-note-action="save">保存笔记</button>
            <button type="button" class="btn98" data-note-action="open-gua">查看瓜档</button>
            <span class="spacer"></span>
            <button type="button" class="btn98" data-note-action="delete">删除这条</button>
          </div>
        `;
      }

      function refresh(selectFirst) {
        if (selectFirst) selectFirstIfNeeded();
        renderList();
        renderEditor();
      }

      root.addEventListener('click', function (event) {
        const filterBtn = event.target.closest('[data-note-filter]');
        if (filterBtn) {
          notesViewState.filter = filterBtn.dataset.noteFilter;
          selectFirstIfNeeded();
          refresh(false);
          window.GuaSound.play('click');
          return;
        }

        const noteBtn = event.target.closest('[data-note-id]');
        if (noteBtn) {
          notesViewState.selectedId = noteBtn.dataset.noteId;
          renderList();
          renderEditor();
          window.GuaSound.play('click');
          return;
        }

        const actionBtn = event.target.closest('[data-note-action]');
        if (!actionBtn) return;
        const action = actionBtn.dataset.noteAction;
        const id = notesViewState.selectedId;

        if (action === 'calendar') {
          window.Gua.openApp('calendar');
          return;
        }
        if (action === 'save') {
          if (!id) return;
          const textarea = root.querySelector('[data-note-text]');
          const select = root.querySelector('[data-note-status]');
          window.GuaNotes.setNote(id, textarea.value);
          if (select) window.GuaNotes.setStatus(id, select.value);
          window.Gua.toast('吃瓜笔记', '已经写进本地的小本本。', 'notes');
          window.GuaSound.play('chime');
          refresh(true);
          return;
        }
        if (action === 'open-gua') {
          if (id) openGua(id);
          return;
        }
        if (action === 'delete') {
          if (!id) return;
          const g = getGuaById(id);
          window.Gua.dialog({
            title: '删除笔记',
            text: `确定要删除《${g ? g.title : '这条瓜'}》的笔记吗？`,
            icon: 'warning',
            buttons: [
              { label: '删除', value: 'delete' },
              { label: '取消', value: 'cancel', primary: true }
            ],
            onSelect: function (value) {
              if (value === 'delete') {
                window.GuaNotes.remove(id);
                notesViewState.selectedId = null;
                selectFirstIfNeeded();
                refresh(false);
                window.Gua.toast('吃瓜笔记', '这条笔记已经删掉了。', 'notes');
              }
            }
          });
          return;
        }
        if (action === 'clear') {
          if (!window.GuaNotes.list().length) {
            window.Gua.toast('吃瓜笔记', '这里本来就没有笔记。', 'info');
            return;
          }
          window.Gua.dialog({
            title: '清空吃瓜笔记',
            text: '确定要清空全部笔记吗？这个操作没有办法撤销。',
            icon: 'warning',
            buttons: [
              { label: '清空', value: 'clear' },
              { label: '取消', value: 'cancel', primary: true }
            ],
            onSelect: function (value) {
              if (value === 'clear') {
                window.GuaNotes.clear();
                notesViewState.selectedId = null;
                refresh(true);
                window.Gua.toast('吃瓜笔记', '小本本已经清空。', 'notes');
              }
            }
          });
        }
      });

      root.addEventListener('change', function (event) {
        const select = event.target.closest('[data-note-status]');
        if (!select || !notesViewState.selectedId) return;
        window.GuaNotes.setStatus(notesViewState.selectedId, select.value);
        window.GuaSound.play('click');
        renderList();
        const badge = root.querySelector('.notes-editor-meta .status-badge');
        const status = STATUS_META[select.value];
        if (badge) {
          badge.className = 'status-badge ' + status.className;
          badge.textContent = status.label;
        }
      });

      record.body.addEventListener('notes-select', function (event) {
        if (!event.detail) return;
        notesViewState.selectedId = event.detail;
        notesViewState.filter = 'all';
        refresh(false);
      });

      refresh(true);
    },
    onReopen: function (record, params) {
      if (params && params.selectedId) {
        record.body.dispatchEvent(new CustomEvent('notes-select', { detail: params.selectedId }));
      }
    }
  };

  /* ============================================================
     随机吃瓜
     ============================================================ */
  const RandomApp = {
    title: '随机吃瓜',
    icon: 'random',
    width: 490,
    height: 445,
    render: function () {
      return `
        <div class="app random-app">
          <div class="random-head">
            <label class="field-label">只在
              <select class="field98" data-random-category>${categoryOptions('all', true)}</select>
            </label>
            <span>里抽一个瓜</span>
          </div>
          <div class="random-stage">
            <div class="random-hero">
              <span class="random-watermelon">${I.watermelon}</span>
              <span class="random-kicker">GUA TIAN RANDOM SERVICE</span>
              <div class="random-title" data-random-title>准备好了吗？</div>
              <div class="random-meta" data-random-meta>点击下方按钮，把选择交给 1998—2026 的互联网。</div>
              <button type="button" class="btn98 random-draw" data-random-action="draw">随机抽个瓜</button>
              <div class="random-summary" data-random-summary></div>
              <div class="random-actions" data-random-actions hidden>
                <button type="button" class="btn98" data-random-action="open">打开完整瓜档</button>
                <button type="button" class="btn98" data-random-action="again">再抽一个</button>
              </div>
            </div>
            <div class="random-foot">“随机不是逃避选择，是把选择交给 28 年的互联网。”</div>
          </div>
        </div>
      `;
    },
    mount: function (body, record, params) {
      const root = body.querySelector('.random-app');
      const categoryEl = root.querySelector('[data-random-category]');
      const titleEl = root.querySelector('[data-random-title]');
      const metaEl = root.querySelector('[data-random-meta]');
      const summaryEl = root.querySelector('[data-random-summary]');
      const actionsEl = root.querySelector('[data-random-actions]');
      const drawBtn = root.querySelector('[data-random-action="draw"]');
      let current = null;
      let spinning = false;

      function pool() {
        const category = categoryEl.value;
        return D.gua.filter(function (g) { return category === 'all' || g.type === category; });
      }

      function startSpin() {
        if (spinning) return;
        const list = pool();
        if (!list.length) {
          window.Gua.toast('随机吃瓜', '这个圈子里暂时没有瓜。', 'info');
          window.GuaSound.play('error');
          return;
        }

        spinning = true;
        drawBtn.disabled = true;
        titleEl.classList.add('spinning');
        summaryEl.classList.remove('show');
        actionsEl.hidden = true;
        metaEl.textContent = '正在从年鉴里翻找……';
        window.GuaSound.play('click');

        let ticks = 0;
        const totalTicks = 14;
        const timer = setInterval(function () {
          if (!document.body.contains(root)) {
            clearInterval(timer);
            return;
          }
          ticks += 1;
          const preview = list[Math.floor(Math.random() * list.length)];
          titleEl.textContent = preview.title;
          if (ticks >= totalTicks) {
            clearInterval(timer);
            finishSpin(list);
          }
        }, 65);
      }

      function finishSpin(list) {
        let next = list[Math.floor(Math.random() * list.length)];
        if (list.length > 1 && current && next.id === current.id) {
          next = list[(list.indexOf(next) + 1) % list.length];
        }
        current = next;
        spinning = false;
        drawBtn.disabled = false;
        titleEl.classList.remove('spinning');
        titleEl.textContent = next.title;
        metaEl.textContent = `${formatDate(next.date)} · ${next.category} · 劲爆 ${next.heat}/5`;
        summaryEl.innerHTML = `${esc(next.summary)}<br><span class="muted" style="font-size:10px;">关键词：${(next.tags || []).map(esc).join(' / ')}</span>`;
        summaryEl.classList.add('show');
        actionsEl.hidden = false;
        actionsEl.querySelector('[data-random-action="open"]').hidden = false;
        window.GuaSound.play('chime');
      }

      root.addEventListener('click', function (event) {
        const btn = event.target.closest('[data-random-action]');
        if (!btn) return;
        const action = btn.dataset.randomAction;
        if (action === 'draw' || action === 'again') startSpin();
        if (action === 'open' && current) openGua(current.id);
      });

      if (params && params.auto) {
        setTimeout(function () {
          if (document.body.contains(root)) startSpin();
        }, 220);
      }
    }
  };

  window.GuaApps = {
    calendar: CalendarApp,
    guaDetail: GuaDetailApp,
    search: SearchApp,
    notes: NotesApp,
    random: RandomApp
  };

  window.GuaAppHelpers = {
    esc: esc,
    icon: icon,
    formatDate: formatDate,
    parseDate: parseDate,
    heatMeter: heatMeter,
    getGuaById: getGuaById,
    catMeta: catMeta,
    openGua: openGua,
    CATEGORY_META: CATEGORY_META,
    STATUS_META: STATUS_META,
    calendarState: calendarState
  };
})();
