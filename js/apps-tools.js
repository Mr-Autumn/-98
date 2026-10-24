/* ============================================================
   瓜田98 · 应用层（工具与彩蛋）
   我的电脑、工具文件夹、回收站、文件阅读器、代码时光机、
   显示属性、高级显示属性、1024 特辑、年度技术注脚、关于、帮助
   ============================================================ */
(function () {
  'use strict';

  const D = window.GuaData;
  const I = window.GuaIcons;
  const H = window.GuaAppHelpers;
  const esc = H.esc;
  const parseDate = H.parseDate;
  const catMeta = H.catMeta;
  const formatDate = H.formatDate;

  function px(name) {
    return I[name] || I.exe;
  }

  function is1024Today() {
    const now = new Date();
    return now.getMonth() === 9 && now.getDate() === 24;
  }

  function openApp(appId, params) {
    if (window.Gua && typeof window.Gua.openApp === 'function') {
      window.Gua.openApp(appId, params || {});
    }
  }

  function toast(title, text, icon) {
    if (window.Gua && typeof window.Gua.toast === 'function') {
      window.Gua.toast(title, text, icon);
    }
  }

  /* ============================================================
     通用资源管理器窗口工厂
     ============================================================ */
  function explorerMarkup(config) {
    let items = '';
    config.items.forEach(function (item) {
      items += `
        <button type="button" class="explorer-item" data-explorer-open="${esc(item.key)}" title="${esc(item.label)}">
          <span class="explorer-icon">${px(item.icon)}</span>
          <span class="explorer-label">${esc(item.label)}</span>
        </button>
      `;
    });

    const extra = config.extraAction
      ? `<button type="button" class="btn98 small" data-explorer-action="${esc(config.extraAction.key)}">${esc(config.extraAction.label)}</button>`
      : '';

    return `
      <div class="app explorer-app">
        <div class="explorer-address">
          <span class="addr-label">地址</span>
          <span class="addr-field">${px(config.icon)}<span>${esc(config.address)}</span></span>
          ${extra}
        </div>
        <div class="explorer-content">
          <div class="explorer-grid">${items}</div>
          ${config.note ? `<div class="explorer-note">${config.note}</div>` : ''}
          <div class="explorer-info-strip">${esc(config.footer || '')}</div>
        </div>
        <div class="app-statusbar">
          <span class="status-cell">${config.items.length} 个对象</span>
          <span class="status-spacer"></span>
          <span class="status-cell">双击打开</span>
        </div>
      </div>
    `;
  }

  function makeExplorerApp(config) {
    return {
      icon: config.icon,
      width: config.width || 620,
      height: config.height || 480,
      meta: function () {
        return {
          title: config.title,
          icon: config.icon,
          width: config.width || 620,
          height: config.height || 480
        };
      },
      render: function () {
        return explorerMarkup(config);
      },
      mount: function (body, record) {
        const root = body.querySelector('.explorer-app');
        if (!root) return;

        function findItem(key) {
          return config.items.filter(function (item) { return item.key === key; })[0] || null;
        }

        root.addEventListener('click', function (event) {
          const actionBtn = event.target.closest('[data-explorer-action]');
          if (actionBtn) {
            window.GuaSound.play('click');
            if (config.onAction) config.onAction(actionBtn.dataset.explorerAction, root, record);
            return;
          }
          const itemEl = event.target.closest('[data-explorer-open]');
          if (itemEl) {
            root.querySelectorAll('.explorer-item').forEach(function (el) {
              el.classList.toggle('selected', el === itemEl);
            });
            window.GuaSound.play('click');
            return;
          }
          root.querySelectorAll('.explorer-item').forEach(function (el) {
            el.classList.remove('selected');
          });
        });

        root.addEventListener('dblclick', function (event) {
          const itemEl = event.target.closest('[data-explorer-open]');
          if (!itemEl) return;
          const item = findItem(itemEl.dataset.explorerOpen);
          if (!item) return;
          if (item.run) item.run();
          else if (item.app) openApp(item.app, item.params || {});
        });

        root.addEventListener('keydown', function (event) {
          const itemEl = event.target.closest('[data-explorer-open]');
          if (itemEl && event.key === 'Enter') {
            const item = findItem(itemEl.dataset.explorerOpen);
            if (!item) return;
            if (item.run) item.run();
            else if (item.app) openApp(item.app, item.params || {});
          }
        });
      }
    };
  }

  /* ============================================================
     我的电脑
     ============================================================ */
  const MyComputerApp = makeExplorerApp({
    title: '我的电脑',
    icon: 'computer',
    address: '我的电脑',
    width: 640,
    height: 470,
    footer: '9 个对象 · 可用空间 1.44 MB（软盘）',
    note: '提示：这台电脑里没有显卡驱动，也没有「等我有空再整理」的文件夹。<br>但它装得下 1998—2026 的所有瓜。',
    items: [
      {
        key: 'floppy', label: '3.5 英寸软盘 (A:)', icon: 'floppy',
        run: function () { toast('软盘驱动器', '请插入标有「瓜」的软盘。容量 1.44 MB，刚好放得下一张壁纸。', 'floppy'); }
      },
      {
        key: 'hdd', label: '本地磁盘 (C:)', icon: 'hdd',
        run: function () { toast('本地磁盘 (C:)', 'C:\\ 里放着 Windows、autoexec.bat，以及 28 年舍不得删的聊天记录。', 'hdd'); }
      },
      {
        key: 'cdrom', label: '光驱 (D:)', icon: 'cd',
        run: function () { toast('光驱 (D:)', '光盘还在转。里面是那张装机必备软件合集。', 'cd'); }
      },
      {
        key: 'control', label: '控制面板', icon: 'controlPanel',
        run: function () { openApp('displayProperties'); }
      },
      {
        key: 'printer', label: '打印机', icon: 'printer',
        run: function () { toast('打印机', '打印机脱机：墨盒在 1998 年就用完了。', 'printer'); }
      },
      {
        key: 'dialup', label: '拨号网络', icon: 'dialup',
        run: function () {
          window.GuaSound.play('modem');
          toast('拨号网络', '正在拨号…… 已连接。56.6 Kbps，请勿接听电话。', 'network');
        }
      },
      {
        key: 'calendar', label: '瓜田日历', icon: 'calendar',
        run: function () { openApp('calendar'); }
      },
      {
        key: 'recycle', label: '回收站', icon: 'recycle',
        run: function () { openApp('recycle'); }
      },
      {
        key: 'tools', label: '工具', icon: 'tools',
        run: function () { openApp('tools'); }
      }
    ]
  });

  /* ============================================================
     工具文件夹（代码时光机藏在这里）
     ============================================================ */
  function toolsItems() {
    const list = [
      { key: 'tm', label: '代码时光机.exe', icon: 'timeMachine', run: function () { openApp('timeMachine'); } },
      { key: 'props', label: '显示属性', icon: 'controlPanel', run: function () { openApp('displayProperties'); } },
      { key: 'search', label: '瓜田检索器', icon: 'search', run: function () { openApp('search'); } },
      { key: 'random', label: '随机吃瓜', icon: 'random', run: function () { openApp('random'); } },
      { key: 'about', label: '关于瓜田98', icon: 'info', run: function () { openApp('about'); } },
      { key: 'help', label: '使用说明', icon: 'help', run: function () { openApp('help'); } }
    ];
    if (is1024Today()) {
      list.push({ key: 'special', label: '1024 特辑.lnk', icon: 'star', run: function () { openApp('special1024'); } });
    }
    return list;
  }

  const ToolsApp = makeExplorerApp({
    title: '工具',
    icon: 'tools',
    address: 'C:\\瓜田98\\工具',
    width: 620,
    height: 470,
    footer: '其中一个程序改变了写代码的方式',
    note: '「代码时光机.exe」是 1998 年留下的程序。<br>输入你想做的事，它会告诉你：同样一件事，28 年前和今天分别怎么写。',
    items: toolsItems()
  });

  /* ============================================================
     回收站
     ============================================================ */
  function trashItems() {
    return [
      {
        key: 'tools', label: '那些年我们用过的开发工具.exe', icon: 'exe',
        run: function () { openApp('fileViewer', { key: 'tools' }); }
      },
      {
        key: 'companies', label: '已经凉了的互联网公司.txt', icon: 'textFile',
        run: function () { openApp('fileViewer', { key: 'companies' }); }
      },
      {
        key: 'gossip', label: '没人再提起的上古大瓜.doc', icon: 'notes',
        run: function () { openApp('fileViewer', { key: 'gossip' }); }
      }
    ];
  }

  const RecycleApp = makeExplorerApp({
    title: '回收站',
    icon: 'recycle',
    address: '回收站',
    width: 600,
    height: 450,
    footer: '3 个对象 · 共 0 字节（回忆不计入磁盘）',
    note: '回收站里没有垃圾，只有一些暂时不用的旧时光。<br>右键清空是不可逆的，就像那些真的过去了的年代。',
    extraAction: { key: 'empty', label: '清空回收站' },
    items: trashItems(),
    onAction: function (action) {
      if (action !== 'empty') return;
      window.Gua.dialog({
        title: '清空回收站',
        icon: 'warning',
        text: '确定要清空回收站吗？',
        subtext: '系统提示：这 3 个文件受「情怀」保护，不会被真正删除。',
        buttons: [
          { label: '还是清空', value: 'empty' },
          { label: '算了', value: 'cancel', primary: true }
        ],
        onSelect: function (value) {
          if (value === 'empty') {
            window.GuaSound.play('error');
            toast('回收站', '清空失败：这些文件仍在被 1998 年的某个人使用。', 'error');
          }
        }
      });
    }
  });

  /* ============================================================
     怀旧文件阅读器
     ============================================================ */
  const FileViewerApp = {
    icon: 'textFile',
    width: 640,
    height: 540,
    key: function (params) {
      return 'file:' + (params && params.key ? params.key : 'tools');
    },
    meta: function (params) {
      const file = D.trash[params && params.key] || D.trash.tools;
      return {
        title: '回收站 · ' + file.file,
        icon: file.icon,
        width: 640,
        height: 540
      };
    },
    render: function (params) {
      const file = D.trash[params && params.key] || D.trash.tools;
      let items = '';
      file.items.forEach(function (text) {
        items += `<li>${esc(text)}</li>`;
      });
      return `
        <div class="app file-viewer-app">
          <div class="file-viewer-head">
            <span class="file-icon">${px(file.icon)}</span>
            <div class="file-head-text">
              <h2>${esc(file.file)}</h2>
              <p>只读文件 · 来自回收站 · 最后修改时间未知</p>
            </div>
          </div>
          <div class="file-viewer-body">
            <p class="file-intro">${esc(file.intro)}</p>
            <ol class="nostalgia-list">${items}</ol>
          </div>
          <div class="app-statusbar">
            <span class="status-cell">只读 · 请勿在深夜独自打开</span>
            <span class="status-spacer"></span>
            <button type="button" class="btn98" data-window-action="close">关闭</button>
          </div>
        </div>
      `;
    }
  };

  /* ============================================================
     代码时光机
     ============================================================ */
  function highlightCode(code) {
    const re = /(\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(var|function|for|if|else|return|while|new|const|let|import|from|await|async|class|int|void|do|typedef|open|print|printf|die|or)\b|(\b\d+\b)/g;
    let out = '';
    let last = 0;
    let match;
    while ((match = re.exec(code)) !== null) {
      out += esc(code.slice(last, match.index));
      if (match[1]) out += `<span class="tok-com">${esc(match[1])}</span>`;
      else if (match[2]) out += `<span class="tok-str">${esc(match[2])}</span>`;
      else if (match[3]) out += `<span class="tok-key">${esc(match[3])}</span>`;
      else out += `<span class="tok-num">${esc(match[4])}</span>`;
      last = re.lastIndex;
    }
    out += esc(code.slice(last));
    return out;
  }

  function lineNumbers(code) {
    const total = code.split('\n').length;
    const rows = [];
    for (let i = 1; i <= total; i += 1) rows.push(i);
    return rows.join('<br>');
  }

  function codePane(example, era) {
    const isBefore = era === 'before';
    return `
      <div class="tm-pane ${era}">
        <div class="tm-pane-head">
          <span class="era-badge">${isBefore ? '1998' : '2026'}</span>
          ${isBefore ? '古法写法' : 'AI 写法'}
          <span class="tm-lang">${esc(isBefore ? example.beforeLang : example.afterLang)}</span>
        </div>
        <div class="tm-code-wrap">
          <div class="tm-line-numbers">${lineNumbers(isBefore ? example.before : example.after)}</div>
          <pre class="tm-code">${highlightCode(isBefore ? example.before : example.after)}</pre>
        </div>
      </div>
    `;
  }

  function panesHTML(example) {
    return codePane(example, 'before') + codePane(example, 'after');
  }

  function findExample(description) {
    const q = String(description || '').trim().toLowerCase();
    if (!q) return { example: D.codeExamples[0], score: 0 };
    let best = D.codeExamples[0];
    let bestScore = 0;
    D.codeExamples.forEach(function (example) {
      let score = 0;
      if (example.title.toLowerCase().indexOf(q) !== -1) score += 6;
      if (example.description.toLowerCase().indexOf(q) !== -1) score += 4;
      example.keywords.forEach(function (keyword) {
        if (q.indexOf(keyword.toLowerCase()) !== -1) score += 3;
      });
      if (score > bestScore) {
        bestScore = score;
        best = example;
      }
    });
    return { example: best, score: bestScore };
  }

  const TimeMachineApp = {
    title: '代码时光机',
    icon: 'timeMachine',
    width: 820,
    height: 580,
    render: function () {
      const presets = D.codeExamples.map(function (example) {
        return `<button type="button" class="btn98 tm-preset" data-tm-preset="${esc(example.id)}">${esc(example.title)}</button>`;
      }).join('');

      return `
        <div class="app tm-app">
          <div class="tm-head">
            <div class="tm-intro">
              <span class="tm-intro-icon">${I.timeMachine}</span>
              <div class="tm-intro-text">
                <h2>代码时光机</h2>
                <p>输入你想做的事情，看看 1998 年和 2026 年分别怎么写。技术换了一代，问题还是那个问题。</p>
              </div>
            </div>
            <div class="tm-form">
              <input class="field98" type="text" data-tm-input placeholder="例如：把数组里的重复项去掉" autocomplete="off" aria-label="描述你想实现的功能">
              <button type="button" class="btn98" data-tm-go>启动</button>
            </div>
          </div>
          <div class="tm-presets"><span>试试：</span>${presets}</div>
          <div class="tm-view-bar">
            <button type="button" class="btn98 tm-view-btn active" data-tm-view="both">双栏对照</button>
            <button type="button" class="btn98 tm-view-btn" data-tm-view="before">只看 1998</button>
            <button type="button" class="btn98 tm-view-btn" data-tm-view="after">只看 2026</button>
            <span class="tm-match" data-tm-match>已找到：${esc(D.codeExamples[0].title)}</span>
          </div>
          <div class="tm-panes" data-tm-panes>${panesHTML(D.codeExamples[0])}</div>
          <div class="tm-foot">运行结果是一样的，那不一样的是什么呢？</div>
        </div>
      `;
    },
    mount: function (body) {
      const root = body.querySelector('.tm-app');
      const input = root.querySelector('[data-tm-input]');
      const panes = root.querySelector('[data-tm-panes]');
      const matchEl = root.querySelector('[data-tm-match]');
      const viewBtns = root.querySelectorAll('[data-tm-view]');

      function paint(example, note) {
        panes.innerHTML = panesHTML(example);
        matchEl.textContent = note || ('已找到：' + example.title);
      }

      function setView(view) {
        panes.classList.remove('show-before', 'show-after');
        if (view === 'before') panes.classList.add('show-before');
        if (view === 'after') panes.classList.add('show-after');
        viewBtns.forEach(function (btn) {
          btn.classList.toggle('active', btn.dataset.tmView === view);
        });
        window.GuaSound.play('click');
      }

      function run() {
        const result = findExample(input.value);
        if (!input.value.trim()) {
          toast('代码时光机', '先告诉它你想做什么，比如「数组去重」。', 'timeMachine');
          window.GuaSound.play('error');
          return;
        }
        if (result.score === 0) {
          paint(result.example, '没找到完全匹配的，先给你看这段最接近的：' + result.example.title);
          toast('代码时光机', '年鉴里还没有这段需求，先看看最接近的一段。', 'info');
        } else {
          paint(result.example);
        }
        window.GuaSound.play('chime');
      }

      root.addEventListener('click', function (event) {
        const go = event.target.closest('[data-tm-go]');
        if (go) {
          run();
          return;
        }
        const preset = event.target.closest('[data-tm-preset]');
        if (preset) {
          const example = D.codeExamples.filter(function (item) { return item.id === preset.dataset.tmPreset; })[0];
          if (!example) return;
          input.value = example.description;
          paint(example);
          window.GuaSound.play('click');
          return;
        }
        const view = event.target.closest('[data-tm-view]');
        if (view) setView(view.dataset.tmView);
      });

      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          run();
        }
      });

      setTimeout(function () {
        if (document.body.contains(root)) input.focus();
      }, 60);
    }
  };

  /* ============================================================
     显示属性（高级里藏着穿越入口）
     ============================================================ */
  const DisplayPropertiesApp = {
    title: '显示属性',
    icon: 'controlPanel',
    width: 430,
    height: 480,
    render: function () {
      const crtOn = document.body.classList.contains('crt-on');
      return `
        <div class="app props-app">
          <div class="props-tabs">
            <button type="button" class="props-tab active" data-props-tab="background">背景</button>
            <button type="button" class="props-tab" data-props-tab="screensaver">屏幕保护</button>
            <button type="button" class="props-tab" data-props-tab="appearance">外观</button>
            <button type="button" class="props-tab" data-props-tab="settings">设置</button>
          </div>
          <div class="props-body">
            <div class="props-panel active" data-props-panel="background">
              <div class="props-monitor">
                <div class="props-monitor-screen"></div>
                <div class="props-monitor-stand"></div>
              </div>
              <div class="props-copy">
                <h3>Windows 98 桌面</h3>
                <p>选择一张背景图片。经典壁纸里藏着一块西瓜，找到它算你厉害。</p>
                <div class="wallpaper-list">
                  <button type="button" class="wallpaper-option active" data-props-wallpaper="classic">
                    <span class="wallpaper-thumb"></span>蓝天白云草地（经典）
                  </button>
                  <button type="button" class="wallpaper-option" data-props-wallpaper="watermelon">
                    <span class="wallpaper-thumb" style="background:#0b4b1d;"></span>瓜田（未安装）
                  </button>
                  <button type="button" class="wallpaper-option" data-props-wallpaper="solid">
                    <span class="wallpaper-thumb" style="background:#008080;"></span>纯色（太寂寞了）
                  </button>
                </div>
                <label class="props-check-row">
                  <input type="checkbox" class="check98" data-props-crt ${crtOn ? 'checked' : ''}>
                  启用 CRT 显示效果（扫描线 / 呼吸闪烁）
                </label>
              </div>
            </div>

            <div class="props-panel" data-props-panel="screensaver">
              <div class="props-copy">
                <h3>屏幕保护程序</h3>
                <p>1998 年的屏幕保护，是给显示器防烧屏用的。现在的屏幕保护，是给打工人防尴尬用的。</p>
                <div class="props-settings-preview">
                  <div class="props-monitor">
                    <div class="props-monitor-screen"></div>
                    <div class="props-monitor-stand"></div>
                  </div>
                </div>
                <div class="settings-grid">
                  <span>屏幕保护</span>
                  <select class="field98" data-props-saver>
                    <option>无</option>
                    <option>瓜田星空（未安装）</option>
                    <option>滚动字幕：早点下班</option>
                  </select>
                  <span>等待</span>
                  <select class="field98">
                    <option>5 分钟</option>
                    <option>10 分钟</option>
                    <option>从不</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="props-panel" data-props-panel="appearance">
              <div class="props-copy">
                <h3>外观</h3>
                <p>Windows 标准配色。28 年后它看起来像一种刻意的复古，当年它只是默认值。</p>
                <div class="props-settings-preview">
                  <div class="props-monitor">
                    <div class="props-monitor-screen"></div>
                    <div class="props-monitor-stand"></div>
                  </div>
                </div>
                <div class="settings-grid">
                  <span>方案</span>
                  <select class="field98">
                    <option>Windows 标准</option>
                    <option>Windows 标准（大字体）</option>
                  </select>
                  <span>项目</span>
                  <select class="field98">
                    <option>桌面</option>
                    <option>窗口标题栏</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="props-panel" data-props-panel="settings">
              <div class="props-settings-preview">
                <div class="props-monitor">
                  <div class="props-monitor-screen"></div>
                  <div class="props-monitor-stand"></div>
                </div>
              </div>
              <div class="settings-grid">
                <span>颜色</span>
                <select class="field98">
                  <option>16 位色（65536 色）</option>
                  <option>256 色</option>
                </select>
                <span>屏幕区域</span>
                <select class="field98">
                  <option>1024 × 768 像素</option>
                  <option>800 × 600 像素</option>
                </select>
              </div>
              <div class="props-advanced-row">
                <button type="button" class="btn98" data-props-advanced>高级(A)...</button>
              </div>
              <p class="drive-dialog-note" style="margin-top:9px;">某些显示模式需要更高的权限。它们不在这个面板里。</p>
            </div>
          </div>
          <div class="props-buttons">
            <button type="button" class="btn98" data-props-action="apply">应用</button>
            <button type="button" class="btn98" data-props-action="ok">确定</button>
            <button type="button" class="btn98" data-props-action="cancel">取消</button>
          </div>
        </div>
      `;
    },
    mount: function (body, record) {
      const root = body.querySelector('.props-app');

      root.addEventListener('click', function (event) {
        const tab = event.target.closest('[data-props-tab]');
        if (tab) {
          root.querySelectorAll('[data-props-tab]').forEach(function (btn) {
            btn.classList.toggle('active', btn === tab);
          });
          root.querySelectorAll('[data-props-panel]').forEach(function (panel) {
            panel.classList.toggle('active', panel.dataset.propsPanel === tab.dataset.propsTab);
          });
          window.GuaSound.play('click');
          return;
        }

        const wallpaper = event.target.closest('[data-props-wallpaper]');
        if (wallpaper) {
          if (wallpaper.dataset.propsWallpaper !== 'classic') {
            toast('显示属性', '这张壁纸没有随系统一起装进来。经典桌面将继续使用。', 'info');
            window.GuaSound.play('error');
            return;
          }
          root.querySelectorAll('[data-props-wallpaper]').forEach(function (btn) {
            btn.classList.toggle('active', btn === wallpaper);
          });
          toast('显示属性', '桌面背景已恢复为 1998 年的那片天。', 'screenshot');
          return;
        }

        if (event.target.closest('[data-props-advanced]')) {
          openApp('advancedDisplay');
          return;
        }

        const action = event.target.closest('[data-props-action]');
        if (!action) return;
        if (action.dataset.propsAction === 'ok') {
          window.GuaSound.play('click');
          if (record) record.api.close();
        } else if (action.dataset.propsAction === 'cancel') {
          record.api.close();
        } else {
          toast('显示属性', '设置已应用（大部分）。', 'gear');
          window.GuaSound.play('chime');
        }
      });

      root.addEventListener('change', function (event) {
        if (event.target.closest('[data-props-crt]')) {
          if (window.Gua) window.Gua.setCRT(event.target.checked);
          return;
        }
        if (event.target.closest('[data-props-saver]')) {
          toast('屏幕保护', '这个屏幕保护程序没有安装。建议直接休息五分钟。', 'info');
        }
      });
    }
  };

  /* ============================================================
     高级显示属性（隐藏的穿越入口）
     ============================================================ */
  const AdvancedDisplayApp = {
    title: '高级显示属性',
    icon: 'gear',
    width: 480,
    height: 455,
    render: function () {
      const isWin11 = window.Gua && window.Gua.theme === 'win11';
      return `
        <div class="app advanced-app">
          <div class="advanced-body">
            <div class="advanced-head">
              <span class="pixel-icon">${I.gear}</span>
              <div>
                <h2>高级显示属性</h2>
                <p>通用即插即用监视器 · 瓜田 98 显示适配器<br>这里的设置通常不应该被普通用户修改。</p>
              </div>
            </div>
            <div class="advanced-table">
              <div class="adv-row"><span class="adv-key">适配器</span><span>GUA TIAN 98 Display Adapter</span></div>
              <div class="adv-row"><span class="adv-key">芯片类型</span><span>Imagination 8-bit</span></div>
              <div class="adv-row"><span class="adv-key">显存</span><span>1 MB（共享 28 年记忆）</span></div>
              <div class="adv-row"><span class="adv-key">刷新率</span><span>60 Hz（轻微闪烁属正常现象）</span></div>
              <div class="adv-row"><span class="adv-key">系统版本</span><span>4.10.1998 / 2026 Edition</span></div>
            </div>
            <div class="advanced-warning">
              警告：更改显示模式可能导致窗口位置、系统主题甚至时间线发生变化。<br>
              如果屏幕突然变得很圆，请不要惊慌，那只是 2026 年。
            </div>
          </div>
          <div class="advanced-actions">
            <button type="button" class="btn98 time-travel" data-adv-travel>${isWin11 ? '回到 1998' : '穿越到 2026'}</button>
            <span class="spacer" style="flex:1;"></span>
            <button type="button" class="btn98" data-window-action="close">确定</button>
            <button type="button" class="btn98" data-window-action="close">取消</button>
          </div>
        </div>
      `;
    },
    mount: function (body) {
      const root = body.querySelector('.advanced-app');
      const travelBtn = root.querySelector('[data-adv-travel]');

      root.addEventListener('click', function (event) {
        if (!event.target.closest('[data-adv-travel]')) return;
        if (window.Gua && typeof window.Gua.timeTravel === 'function') {
          window.Gua.timeTravel();
        }
      });

      document.addEventListener('gua-theme-change', function update(event) {
        if (!document.body.contains(root)) {
          document.removeEventListener('gua-theme-change', update);
          return;
        }
        const isWin11 = event.detail && event.detail.theme === 'win11';
        travelBtn.textContent = isWin11 ? '回到 1998' : '穿越到 2026';
      });
    }
  };

  /* ============================================================
     1024 特辑（程序员翻车名场面合集）
     ============================================================ */
  const Special1024App = {
    title: '1024 特辑',
    icon: 'star',
    width: 680,
    height: 550,
    render: function () {
      const list = D.gua
        .filter(function (g) { return g.special1024; })
        .sort(function (a, b) { return b.date.localeCompare(a.date); });

      let rows = '';
      list.forEach(function (g) {
        rows += `
          <button type="button" class="special-row" data-special-id="${esc(g.id)}">
            <span class="sr-date">${esc(g.date)}</span>
            <span class="sr-title">${esc(g.title)}</span>
            <span class="sr-cat">${esc(g.category)}</span>
          </button>
        `;
      });

      if (!list.length) {
        rows = '<div class="empty-state">这一栏暂时没有瓜。互联网今天很安静，安静得让人害怕。</div>';
      }

      return `
        <div class="app special-app">
          <div class="special-hero">
            <div class="special-badge">1024</div>
            <div class="special-hero-text">
              <h2>程序员翻车名场面合集</h2>
              <p>致 28 年前的你：你不用担心未来的程序员会失业，他们只是换了种方式，继续和代码死磕。<br>以下是那些年，值班的人从床上坐起来的瞬间。</p>
            </div>
          </div>
          <div class="special-list-wrap">${rows}</div>
          <div class="special-foot">共 ${list.length} 条 · 1024 程序员节快乐。今天不写需求，只吃瓜。</div>
        </div>
      `;
    },
    mount: function (body) {
      const root = body.querySelector('.special-app');
      root.addEventListener('click', function (event) {
        const row = event.target.closest('[data-special-id]');
        if (!row) return;
        window.GuaSound.play('click');
        H.openGua(row.dataset.specialId);
      });
    }
  };

  /* ============================================================
     年度技术注脚
     ============================================================ */
  function annualHTML(year) {
    const text = D.footnotes[year] || '这一年的技术故事，还在整理中。';
    return `
      <div class="app-toolbar">
        <button type="button" class="btn98 small" data-annual-prev ${year <= 1998 ? 'disabled' : ''}>‹ 上一年</button>
        <span class="field-label" style="margin:0 6px;">技术注脚</span>
        <button type="button" class="btn98 small" data-annual-next ${year >= 2026 ? 'disabled' : ''}>下一年 ›</button>
        <span class="status-spacer" style="flex:1;"></span>
        <span class="muted" style="font-size:10px;">1998 — 2026</span>
      </div>
      <div class="annual-sheet">
        <div class="annual-year">${year}</div>
        <div class="annual-kicker">TECH FOOTNOTE · ${year} 年的技术圈</div>
        <div class="annual-rule"></div>
        <p class="annual-text">${esc(text)}</p>
        <div class="annual-foot">技术一直在变，好奇心没有。<br>GUA TIAN 98 · ANNUAL ARCHIVE</div>
      </div>
    `;
  }

  const AnnualNoteApp = {
    icon: 'calendar',
    width: 480,
    height: 430,
    key: function (params) {
      return 'annual:' + (params && params.year ? params.year : new Date().getFullYear());
    },
    meta: function (params) {
      const year = params && params.year ? Number(params.year) : new Date().getFullYear();
      return {
        title: '年度技术注脚 · ' + year,
        icon: 'calendar',
        width: 480,
        height: 430
      };
    },
    render: function (params) {
      const year = params && params.year ? Number(params.year) : new Date().getFullYear();
      return `<div class="app annual-app">${annualHTML(year)}</div>`;
    },
    mount: function (body, record, params) {
      const root = body.querySelector('.annual-app');
      let year = params && params.year ? Number(params.year) : new Date().getFullYear();

      root.addEventListener('click', function (event) {
        const prev = event.target.closest('[data-annual-prev]');
        const next = event.target.closest('[data-annual-next]');
        if (!prev && !next) return;
        const nextYear = Math.max(1998, Math.min(2026, year + (prev ? -1 : 1)));
        if (nextYear === year) {
          window.GuaSound.play('error');
          return;
        }
        year = nextYear;
        root.innerHTML = annualHTML(year);
        if (record && record.api) record.api.setTitle('年度技术注脚 · ' + year);
        window.GuaSound.play('click');
      });
    }
  };

  /* ============================================================
     关于
     ============================================================ */
  const AboutApp = {
    title: '关于瓜田98',
    icon: 'info',
    width: 520,
    height: 420,
    render: function () {
      const specs = D.about.specs.map(function (row) {
        return `<div class="about-spec-row"><span class="about-spec-key">${esc(row[0])}</span><span class="about-spec-val">${esc(row[1])}</span></div>`;
      }).join('');

      return `
        <div class="app about-app">
          <div class="about-body">
            <span class="about-logo">${I.watermelon}</span>
            <div class="about-text">
              <h2>${esc(D.about.product)}</h2>
              <div class="about-version">${esc(D.about.version)}</div>
              <p class="about-line">${esc(D.about.line1)}<br>${esc(D.about.line2)}</p>
              <div class="about-specs">${specs}</div>
              <div class="about-foot">© 1998—2026 瓜田软件 · 保留所有好奇心</div>
            </div>
          </div>
          <div class="app-statusbar">
            <span class="status-cell">系统运行正常（情绪略有波动）</span>
            <span class="status-spacer"></span>
            <button type="button" class="btn98" data-window-action="close">确定</button>
          </div>
        </div>
      `;
    }
  };

  /* ============================================================
     使用说明
     ============================================================ */
  const HelpApp = {
    title: '使用说明',
    icon: 'help',
    width: 580,
    height: 520,
    render: function () {
      return `
        <div class="app help-app">
          <div class="help-body">
            <h2>瓜田 98 使用说明</h2>
            <p>这是一台装着互联网吃瓜年鉴的 Windows 98。桌面、窗口、任务栏都是真的可以用的。</p>
            <h3>基本操作</h3>
            <ul>
              <li>双击桌面图标打开程序；单击选中。</li>
              <li>拖动窗口标题栏移动；双击标题栏最大化；右上角三个按钮分别是最小化、最大化、关闭。</li>
              <li>点击任务栏上的窗口标签切换程序；再次点击当前窗口会最小化。</li>
              <li>桌面空白处右键，可以随机抽瓜、切换 CRT 显示模式、打开显示属性。</li>
            </ul>
            <h3>吃瓜日历</h3>
            <ul>
              <li>有标记的日期收录了大瓜：爆米花是娱乐圈，键盘是科技圈，循环箭头是反转连续剧。</li>
              <li>单击带标记的日期会打开瓜档；顶部可以切换年份与月份（1998—2026）。</li>
              <li>每一年 1 月 1 日，点击日期会多出一条年度技术注脚。</li>
            </ul>
            <h3>小提示</h3>
            <ul>
              <li>任务栏右侧的音量图标控制全部音效，默认关闭。</li>
              <li>吃瓜笔记保存在本机浏览器里，刷新页面不会丢。</li>
              <li>工具文件夹里有一个 1998 年的程序，叫「代码时光机.exe」。</li>
              <li>显示属性 → 设置 → 高级，里面有一个不太正常的选项。</li>
            </ul>
            <div class="help-note">GUA TIAN 98 HELP · 如果屏幕突然变蓝，按任意键即可回来。</div>
          </div>
          <div class="app-statusbar">
            <span class="status-cell">帮助主题 · 1 个</span>
            <span class="status-spacer"></span>
            <button type="button" class="btn98" data-window-action="close">关闭</button>
          </div>
        </div>
      `;
    }
  };

  /* ============================================================
     注册到全局应用表
     ============================================================ */
  Object.assign(window.GuaApps, {
    myComputer: MyComputerApp,
    tools: ToolsApp,
    recycle: RecycleApp,
    fileViewer: FileViewerApp,
    timeMachine: TimeMachineApp,
    displayProperties: DisplayPropertiesApp,
    advancedDisplay: AdvancedDisplayApp,
    special1024: Special1024App,
    annualNote: AnnualNoteApp,
    about: AboutApp,
    help: HelpApp
  });
})();
