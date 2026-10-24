/* ============================================================
   瓜田98 · 像素图标库
   所有图标均为内联 SVG，无外部依赖，避免加载失败与风格漂移。
   ============================================================ */
(function () {
  'use strict';

  const svg = (body, viewBox) =>
    `<svg class="pixel-icon" viewBox="${viewBox || '0 0 32 32'}" xmlns="http://www.w3.org/2000/svg" ` +
    `shape-rendering="crispEdges" focusable="false" aria-hidden="true">${body}</svg>`;

  window.GuaIcons = {
    computer: svg(`
      <rect x="2" y="5" width="28" height="19" fill="#000"/>
      <rect x="3" y="6" width="26" height="17" fill="#c0c0c0"/>
      <rect x="5" y="8" width="22" height="12" fill="#008080"/>
      <rect x="7" y="10" width="9" height="2" fill="#00d4d4"/>
      <rect x="7" y="14" width="16" height="1" fill="#bff7f7"/>
      <rect x="7" y="17" width="12" height="1" fill="#5fd4d4"/>
      <rect x="13" y="24" width="6" height="3" fill="#808080"/>
      <rect x="10" y="27" width="12" height="2" fill="#c0c0c0"/>
      <rect x="10" y="29" width="12" height="1" fill="#000"/>
      <rect x="3" y="6" width="26" height="1" fill="#fff"/>
    `),

    calendar: svg(`
      <rect x="4" y="4" width="24" height="25" fill="#000"/>
      <rect x="5" y="5" width="22" height="23" fill="#fff"/>
      <rect x="5" y="5" width="22" height="7" fill="#000080"/>
      <rect x="6" y="6" width="20" height="5" fill="#0000a8"/>
      <rect x="8" y="2" width="2" height="6" fill="#808080"/>
      <rect x="22" y="2" width="2" height="6" fill="#808080"/>
      <rect x="8" y="15" width="3" height="2" fill="#000080"/>
      <rect x="13" y="15" width="3" height="2" fill="#000080"/>
      <rect x="18" y="15" width="3" height="2" fill="#000080"/>
      <rect x="23" y="15" width="2" height="2" fill="#000080"/>
      <rect x="8" y="20" width="3" height="2" fill="#000080"/>
      <rect x="13" y="20" width="3" height="2" fill="#000080"/>
      <rect x="18" y="20" width="3" height="2" fill="#000080"/>
      <rect x="23" y="20" width="2" height="2" fill="#000080"/>
      <rect x="8" y="25" width="3" height="1" fill="#000080"/>
      <rect x="13" y="25" width="3" height="1" fill="#000080"/>
      <path d="M18 27 L27 18 L29 20 L29 25 Z" fill="#e73f52" stroke="#083a14" stroke-width="2"/>
      <path d="M20 26 L27 19" stroke="#2a8b31" stroke-width="2"/>
      <rect x="22" y="22" width="1" height="2" fill="#191919"/>
      <rect x="25" y="24" width="1" height="1" fill="#191919"/>
    `),

    notes: svg(`
      <rect x="7" y="3" width="19" height="27" fill="#000"/>
      <rect x="8" y="4" width="17" height="25" fill="#fffef0"/>
      <rect x="10" y="8" width="13" height="1" fill="#6f9fd8"/>
      <rect x="10" y="12" width="13" height="1" fill="#6f9fd8"/>
      <rect x="10" y="16" width="13" height="1" fill="#6f9fd8"/>
      <rect x="10" y="20" width="9" height="1" fill="#6f9fd8"/>
      <rect x="10" y="24" width="11" height="1" fill="#6f9fd8"/>
      <g fill="#808080">
        <rect x="5" y="6" width="2" height="2"/><rect x="5" y="11" width="2" height="2"/>
        <rect x="5" y="16" width="2" height="2"/><rect x="5" y="21" width="2" height="2"/>
        <rect x="5" y="26" width="2" height="2"/>
      </g>
      <path d="M18 26 L26 16 L29 19 L21 29 L17 30 Z" fill="#2e9b3c" stroke="#083a14" stroke-width="1"/>
      <path d="M18 26 L25 17 L27 19 L20 28 Z" fill="#79d15c"/>
      <path d="M17 30 L18 26 L21 29 Z" fill="#f4d89a"/>
      <rect x="8" y="4" width="17" height="1" fill="#fff"/>
    `),

    recycle: svg(`
      <rect x="10" y="8" width="12" height="2" fill="#000"/>
      <rect x="7" y="10" width="18" height="3" fill="#000"/>
      <rect x="8" y="11" width="16" height="2" fill="#c0c0c0"/>
      <path d="M9 13 L23 13 L21 30 L11 30 Z" fill="#c0c0c0" stroke="#000"/>
      <rect x="12" y="16" width="1" height="11" fill="#808080"/>
      <rect x="16" y="16" width="1" height="11" fill="#808080"/>
      <rect x="20" y="16" width="1" height="11" fill="#808080"/>
      <path d="M16 19 L19 22 L16 25 L13 22 Z" fill="none" stroke="#008000" stroke-width="2"/>
      <rect x="15" y="18" width="2" height="2" fill="#008000"/>
      <rect x="14" y="5" width="3" height="3" fill="#fff"/>
      <rect x="18" y="4" width="4" height="4" fill="#fffde7"/>
      <rect x="22" y="6" width="3" height="2" fill="#fff"/>
    `),

    folder: svg(`
      <path d="M2 9 L2 27 L30 27 L30 11 L15 11 L12 7 L2 7 Z" fill="#000"/>
      <path d="M3 10 L3 26 L29 26 L29 12 L15 12 L12 8 L3 8 Z" fill="#ffd75a"/>
      <path d="M3 10 L3 12 L15 12 L12 8 L3 8 Z" fill="#ffeaa5"/>
      <rect x="4" y="13" width="24" height="1" fill="#e3ac2c"/>
      <rect x="4" y="25" width="24" height="1" fill="#b97c13"/>
    `),

    tools: svg(`
      <path d="M2 11 L2 28 L30 28 L30 14 L15 14 L12 10 L2 10 Z" fill="#000"/>
      <path d="M3 12 L3 27 L29 27 L29 15 L15 15 L12 11 L3 11 Z" fill="#ffd75a"/>
      <rect x="6" y="17" width="16" height="7" fill="#b87333"/>
      <rect x="7" y="18" width="14" height="5" fill="#d89a55"/>
      <rect x="14" y="18" width="1" height="5" fill="#8f521d"/>
      <path d="M7 10 L13 4 L16 7 L10 13 Z" fill="#c0c0c0" stroke="#000"/>
      <path d="M11 7 L14 10" stroke="#808080"/>
      <path d="M21 17 L21 10 L23 8 L26 11 L24 13 L24 17 Z" fill="#e04b4b" stroke="#000" stroke-width="1"/>
      <rect x="24" y="16" width="2" height="2" fill="#000"/>
    `),

    search: svg(`
      <rect x="3" y="4" width="19" height="24" fill="#000"/>
      <rect x="4" y="5" width="17" height="22" fill="#fff"/>
      <rect x="7" y="9" width="11" height="1" fill="#808080"/>
      <rect x="7" y="13" width="11" height="1" fill="#808080"/>
      <rect x="7" y="17" width="8" height="1" fill="#808080"/>
      <circle cx="20" cy="20" r="7" fill="#bdeaf5" stroke="#000" stroke-width="2"/>
      <circle cx="20" cy="20" r="5" fill="#83cfee" opacity=".75"/>
      <rect x="23" y="24" width="8" height="3" transform="rotate(45 23 24)" fill="#000"/>
      <rect x="18" y="17" width="2" height="2" fill="#fff"/>
    `),

    random: svg(`
      <path d="M3 25 L9 13 L21 8 L27 15 L29 25 Z" fill="#0b4b1d" stroke="#000"/>
      <path d="M5 24 L10 15 L21 11 L26 16 L27 24 Z" fill="#ea5060"/>
      <path d="M5 24 L10 15 L21 11 L26 16 L27 24 Z" fill="none" stroke="#ffd0d5" stroke-width="1"/>
      <rect x="12" y="16" width="2" height="3" fill="#24101a"/>
      <rect x="19" y="15" width="2" height="3" fill="#24101a"/>
      <rect x="15" y="20" width="2" height="3" fill="#24101a"/>
      <rect x="22" y="20" width="2" height="2" fill="#24101a"/>
      <path d="M3 25 L29 25 L27 27 L5 27 Z" fill="#d5ee91"/>
      <rect x="19" y="3" width="10" height="10" fill="#fff" stroke="#000"/>
      <rect x="21" y="5" width="2" height="2" fill="#000"/>
      <rect x="25" y="9" width="2" height="2" fill="#000"/>
      <rect x="21" y="9" width="2" height="2" fill="#000"/>
    `),

    timeMachine: svg(`
      <rect x="3" y="4" width="26" height="20" fill="#000"/>
      <rect x="4" y="5" width="24" height="18" fill="#c0c0c0"/>
      <rect x="6" y="7" width="20" height="14" fill="#000080"/>
      <circle cx="16" cy="14" r="6" fill="#fefefe" stroke="#000"/>
      <rect x="15" y="9" width="2" height="6" fill="#000"/>
      <rect x="16" y="14" width="4" height="1" fill="#000"/>
      <rect x="12" y="22" width="8" height="2" fill="#808080"/>
      <rect x="9" y="24" width="14" height="2" fill="#c0c0c0"/>
      <rect x="7" y="10" width="2" height="3" fill="#00d4d4"/>
      <rect x="24" y="10" width="2" height="3" fill="#00d4d4"/>
    `),

    textFile: svg(`
      <path d="M6 2 L20 2 L26 8 L26 30 L6 30 Z" fill="#000"/>
      <path d="M7 3 L19 3 L25 9 L25 29 L7 29 Z" fill="#fff"/>
      <path d="M19 3 L19 9 L25 9 Z" fill="#c0c0c0"/>
      <rect x="9" y="13" width="14" height="1" fill="#555"/>
      <rect x="9" y="17" width="14" height="1" fill="#555"/>
      <rect x="9" y="21" width="10" height="1" fill="#555"/>
      <rect x="9" y="25" width="12" height="1" fill="#555"/>
    `),

    exe: svg(`
      <rect x="3" y="5" width="26" height="22" fill="#000"/>
      <rect x="4" y="6" width="24" height="20" fill="#c0c0c0"/>
      <rect x="4" y="6" width="24" height="5" fill="#000080"/>
      <rect x="6" y="7" width="2" height="2" fill="#fff"/>
      <rect x="7" y="14" width="18" height="9" fill="#808080"/>
      <path d="M14 15 L14 18 L11 18 L17 22 L17 19 L21 19 Z" fill="#00b300"/>
      <rect x="4" y="6" width="24" height="1" fill="#fff"/>
    `),

    floppy: svg(`
      <path d="M6 3 L25 3 L28 6 L28 29 L4 29 L4 6 Z" fill="#000"/>
      <path d="M5 4 L24 4 L27 7 L27 28 L5 28 Z" fill="#2b3d7a"/>
      <rect x="9" y="4" width="12" height="9" fill="#c0c0c0"/>
      <rect x="11" y="6" width="8" height="5" fill="#333"/>
      <rect x="8" y="15" width="16" height="11" fill="#e6e6e6"/>
      <rect x="10" y="17" width="12" height="1" fill="#777"/>
      <rect x="10" y="20" width="12" height="1" fill="#777"/>
      <rect x="10" y="23" width="8" height="1" fill="#777"/>
      <rect x="24" y="7" width="2" height="4" fill="#8393d0"/>
    `),

    hdd: svg(`
      <rect x="3" y="8" width="26" height="18" fill="#000"/>
      <rect x="4" y="9" width="24" height="16" fill="#c0c0c0"/>
      <rect x="6" y="11" width="20" height="9" fill="#808080"/>
      <rect x="7" y="12" width="18" height="7" fill="#343434"/>
      <rect x="9" y="14" width="12" height="1" fill="#00d100"/>
      <rect x="6" y="22" width="9" height="2" fill="#000080"/>
      <rect x="17" y="22" width="9" height="2" fill="#808080"/>
      <rect x="8" y="25" width="2" height="1" fill="#000"/>
      <rect x="14" y="25" width="2" height="1" fill="#000"/>
      <rect x="20" y="25" width="2" height="1" fill="#000"/>
    `),

    cd: svg(`
      <circle cx="16" cy="16" r="12" fill="#000"/>
      <circle cx="16" cy="16" r="11" fill="#d9d9e8"/>
      <circle cx="16" cy="16" r="8" fill="#f7f7ff"/>
      <path d="M8 12 A9 9 0 0 1 17 6" fill="none" stroke="#8fd4ff" stroke-width="2"/>
      <path d="M19 6 A9 9 0 0 1 25 12" fill="none" stroke="#ffc2e8" stroke-width="2"/>
      <path d="M25 19 A9 9 0 0 1 20 25" fill="none" stroke="#d3ffb5" stroke-width="2"/>
      <path d="M13 25 A9 9 0 0 1 7 19" fill="none" stroke="#ffe49f" stroke-width="2"/>
      <circle cx="16" cy="16" r="3" fill="#c0c0c0" stroke="#000"/>
      <circle cx="16" cy="16" r="1" fill="#f7f7ff"/>
    `),

    printer: svg(`
      <rect x="8" y="4" width="16" height="8" fill="#fff" stroke="#000"/>
      <rect x="10" y="6" width="12" height="1" fill="#888"/>
      <rect x="10" y="9" width="12" height="1" fill="#888"/>
      <rect x="3" y="12" width="26" height="11" fill="#000"/>
      <rect x="4" y="13" width="24" height="9" fill="#c0c0c0"/>
      <rect x="6" y="15" width="6" height="2" fill="#008000"/>
      <rect x="24" y="15" width="2" height="2" fill="#ff0000"/>
      <rect x="9" y="21" width="14" height="8" fill="#fff" stroke="#000"/>
      <rect x="11" y="23" width="10" height="1" fill="#777"/>
      <rect x="11" y="26" width="8" height="1" fill="#777"/>
    `),

    controlPanel: svg(`
      <rect x="3" y="4" width="26" height="24" fill="#000"/>
      <rect x="4" y="5" width="24" height="22" fill="#c0c0c0"/>
      <rect x="4" y="5" width="24" height="4" fill="#000080"/>
      <rect x="7" y="12" width="4" height="11" fill="#808080"/>
      <rect x="14" y="12" width="4" height="11" fill="#808080"/>
      <rect x="21" y="12" width="4" height="11" fill="#808080"/>
      <rect x="6" y="15" width="6" height="2" fill="#fff"/>
      <rect x="13" y="19" width="6" height="2" fill="#fff"/>
      <rect x="20" y="13" width="6" height="2" fill="#fff"/>
      <rect x="8" y="24" width="16" height="1" fill="#000"/>
    `),

    dialup: svg(`
      <rect x="2" y="14" width="28" height="13" fill="#000"/>
      <rect x="3" y="15" width="26" height="11" fill="#c0c0c0"/>
      <rect x="5" y="17" width="10" height="5" fill="#008080"/>
      <rect x="7" y="18" width="6" height="1" fill="#9ff"/>
      <rect x="17" y="17" width="3" height="2" fill="#008000"/>
      <rect x="21" y="17" width="3" height="2" fill="#ffb000"/>
      <rect x="5" y="23" width="20" height="1" fill="#777"/>
      <path d="M8 14 L8 7 L24 7 L24 11" fill="none" stroke="#000" stroke-width="2"/>
      <rect x="6" y="3" width="5" height="10" fill="#454545"/>
      <rect x="9" y="17" width="2" height="2" fill="#ffe000"/>
    `),

    network: svg(`
      <rect x="3" y="11" width="18" height="12" fill="#000"/>
      <rect x="4" y="12" width="16" height="10" fill="#008080"/>
      <path d="M7 15 L10 13 L12 16 L9 19 L6 18 Z" fill="#70d370"/>
      <path d="M13 14 L17 15 L16 19 L13 21 L12 17 Z" fill="#70d370"/>
      <rect x="12" y="5" width="7" height="6" fill="#c0c0c0" stroke="#000"/>
      <rect x="14" y="7" width="3" height="2" fill="#008000"/>
      <rect x="21" y="20" width="8" height="3" fill="#000"/>
      <rect x="22" y="19" width="6" height="2" fill="#c0c0c0"/>
      <rect x="24" y="23" width="4" height="1" fill="#c0c0c0"/>
    `),

    volumeOn: svg(`
      <path d="M3 12 L9 12 L16 5 L16 27 L9 20 L3 20 Z" fill="#000"/>
      <path d="M4 13 L9 13 L15 7 L15 25 L9 19 L4 19 Z" fill="#c0c0c0"/>
      <path d="M18 11 Q22 16 18 21" fill="none" stroke="#000" stroke-width="2"/>
      <path d="M21 8 Q27 16 21 24" fill="none" stroke="#000" stroke-width="2"/>
    `, '0 0 32 32'),

    volumeOff: svg(`
      <path d="M3 12 L9 12 L16 5 L16 27 L9 20 L3 20 Z" fill="#000"/>
      <path d="M4 13 L9 13 L15 7 L15 25 L9 19 L4 19 Z" fill="#c0c0c0"/>
      <path d="M19 12 L26 19 M26 12 L19 19" stroke="#b00000" stroke-width="2"/>
    `),

    flag: svg(`
      <path d="M4 4 L14 9 L4 14 Z" fill="#ff3b3b"/>
      <path d="M15 9 L25 14 L15 19 Z" fill="#3b8cff"/>
      <path d="M4 15 L14 20 L4 25 Z" fill="#62c45b"/>
      <path d="M15 20 L25 25 L15 30 Z" fill="#ffd43b"/>
    `),

    popcorn: svg(`
      <path d="M7 12 L9 27 L23 27 L25 12 Z" fill="#f5f5f5" stroke="#000"/>
      <path d="M8 13 L11 27 M24 13 L21 27 M11 13 L14 27 M20 13 L17 27" stroke="#e8414f" stroke-width="2"/>
      <circle cx="10" cy="9" r="3" fill="#ffe37a" stroke="#000"/>
      <circle cx="15" cy="7" r="3" fill="#fff0a0" stroke="#000"/>
      <circle cx="20" cy="9" r="3" fill="#ffd85a" stroke="#000"/>
      <circle cx="13" cy="10" r="2" fill="#fff6c7" stroke="#000"/>
      <circle cx="19" cy="10" r="2" fill="#ffe37a" stroke="#000"/>
      <rect x="11" y="16" width="2" height="2" fill="#fff"/>
      <rect x="19" y="16" width="2" height="2" fill="#fff"/>
    `),

    keyboard: svg(`
      <rect x="2" y="9" width="28" height="15" fill="#000"/>
      <rect x="3" y="10" width="26" height="13" fill="#c0c0c0"/>
      <g fill="#808080">
        <rect x="5" y="12" width="3" height="2"/><rect x="9" y="12" width="3" height="2"/>
        <rect x="13" y="12" width="3" height="2"/><rect x="17" y="12" width="3" height="2"/>
        <rect x="21" y="12" width="3" height="2"/><rect x="25" y="12" width="2" height="2"/>
        <rect x="5" y="15" width="3" height="2"/><rect x="9" y="15" width="3" height="2"/>
        <rect x="13" y="15" width="3" height="2"/><rect x="17" y="15" width="3" height="2"/>
        <rect x="21" y="15" width="3" height="2"/><rect x="25" y="15" width="2" height="2"/>
        <rect x="8" y="18" width="16" height="2"/>
      </g>
      <rect x="3" y="10" width="26" height="1" fill="#fff"/>
    `),

    globe: svg(`
      <circle cx="16" cy="16" r="12" fill="#000"/>
      <circle cx="16" cy="16" r="11" fill="#1d84d8"/>
      <path d="M8 10 L12 9 L15 12 L12 16 L8 15 Z" fill="#78cd63"/>
      <path d="M16 7 L21 8 L22 12 L18 14 L16 12 Z" fill="#78cd63"/>
      <path d="M17 17 L23 18 L22 23 L18 25 L15 21 Z" fill="#78cd63"/>
      <path d="M4 16 Q16 10 28 16 M16 5 Q9 16 16 27" fill="none" stroke="#9fe1ff" stroke-width="1"/>
      <rect x="7" y="18" width="2" height="2" fill="#fff"/>
    `),

    loop: svg(`
      <path d="M8 10 L8 6 L20 6 L20 10" fill="none" stroke="#000" stroke-width="3"/>
      <path d="M22 22 L22 26 L10 26 L10 22" fill="none" stroke="#000" stroke-width="3"/>
      <path d="M8 8 Q6 16 15 16 L20 16" fill="none" stroke="#008000" stroke-width="3"/>
      <path d="M22 24 Q24 16 15 16 L10 16" fill="none" stroke="#008000" stroke-width="3"/>
      <path d="M18 12 L23 16 L18 20 Z" fill="#008000"/>
      <path d="M12 20 L7 16 L12 12 Z" fill="#008000"/>
    `),

    messenger: svg(`
      <rect x="2" y="7" width="28" height="19" fill="#000"/>
      <rect x="3" y="8" width="26" height="17" fill="#fff"/>
      <path d="M4 9 L16 18 L28 9" fill="none" stroke="#000080" stroke-width="2"/>
      <path d="M4 24 L12 16 M28 24 L20 16" stroke="#808080"/>
      <circle cx="23" cy="21" r="5" fill="#ffd43b" stroke="#000"/>
      <rect x="21" y="20" width="4" height="2" fill="#000"/>
      <rect x="22" y="19" width="2" height="4" fill="#000"/>
    `),

    gear: svg(`
      <path d="M14 3 L18 3 L19 7 L23 9 L27 7 L29 10 L26 13 L27 18 L30 20 L28 24 L24 23 L21 26 L21 30 L16 30 L15 26 L11 24 L7 27 L4 24 L7 20 L6 16 L2 14 L4 10 L8 11 L11 8 L11 4 Z" fill="#000"/>
      <circle cx="16" cy="17" r="8" fill="#c0c0c0"/>
      <circle cx="16" cy="17" r="3" fill="#008080"/>
      <path d="M14 4 L18 4 L18 8 L14 8 Z" fill="#c0c0c0"/>
      <path d="M23 9 L26 8 L28 11 L25 13 Z" fill="#c0c0c0"/>
    `),

    help: svg(`
      <path d="M4 4 L16 4 L16 28 L4 28 Z" fill="#000080"/>
      <path d="M5 5 L15 5 L15 27 L5 27 Z" fill="#0000a8"/>
      <path d="M16 4 L28 4 L28 28 L16 28 Z" fill="#fff"/>
      <rect x="18" y="8" width="7" height="1" fill="#777"/>
      <rect x="18" y="12" width="7" height="1" fill="#777"/>
      <rect x="18" y="16" width="7" height="1" fill="#777"/>
      <rect x="18" y="20" width="5" height="1" fill="#777"/>
      <rect x="7" y="8" width="6" height="2" fill="#ffd43b"/>
      <circle cx="22" cy="23" r="4" fill="#000080"/>
      <rect x="21" y="21" width="2" height="5" fill="#fff"/>
      <rect x="22" y="26" width="1" height="1" fill="#fff"/>
    `),

    power: svg(`
      <circle cx="16" cy="16" r="12" fill="#000"/>
      <circle cx="16" cy="16" r="10" fill="#c0c0c0"/>
      <path d="M16 7 L16 16" stroke="#c00000" stroke-width="3"/>
      <path d="M10 11 Q6 16 10 21 Q16 27 22 21 Q26 16 22 11" fill="none" stroke="#c00000" stroke-width="3"/>
    `),

    info: svg(`
      <circle cx="16" cy="16" r="13" fill="#000"/>
      <circle cx="16" cy="16" r="11" fill="#fff"/>
      <circle cx="16" cy="16" r="9" fill="#000080"/>
      <rect x="15" y="12" width="2" height="10" fill="#fff"/>
      <rect x="15" y="8" width="2" height="2" fill="#fff"/>
    `),

    warning: svg(`
      <path d="M16 3 L30 28 L2 28 Z" fill="#000"/>
      <path d="M16 5 L28 26 L4 26 Z" fill="#ffe000"/>
      <rect x="15" y="11" width="2" height="9" fill="#000"/>
      <rect x="15" y="22" width="2" height="2" fill="#000"/>
    `),

    error: svg(`
      <circle cx="16" cy="16" r="13" fill="#000"/>
      <circle cx="16" cy="16" r="11" fill="#ff3b3b"/>
      <path d="M10 10 L22 22 M22 10 L10 22" stroke="#fff" stroke-width="3"/>
    `),

    watermelon: svg(`
      <path d="M3 23 L8 12 L18 5 L27 7 L30 17 L28 25 L8 29 Z" fill="#0b4b1d" stroke="#000"/>
      <path d="M5 23 L10 13 L19 7 L26 9 L28 17 L26 24 L9 27 Z" fill="#35a33c"/>
      <path d="M7 23 L11 14 L19 9 L25 11 L26 17 L24 22 L10 25 Z" fill="#ff5b6e"/>
      <rect x="14" y="13" width="2" height="3" fill="#24101a"/>
      <rect x="20" y="14" width="2" height="3" fill="#24101a"/>
      <rect x="17" y="19" width="2" height="3" fill="#24101a"/>
      <rect x="11" y="20" width="2" height="2" fill="#24101a"/>
      <rect x="23" y="20" width="2" height="2" fill="#24101a"/>
      <path d="M4 25 L28 25 L26 28 L6 29 Z" fill="#d9f08a"/>
    `),

    folderOpen: svg(`
      <path d="M2 8 L12 8 L15 11 L30 11 L30 26 L4 26 L2 20 Z" fill="#000"/>
      <path d="M3 9 L12 9 L15 12 L29 12 L29 25 L4 25 L3 20 Z" fill="#ffd75a"/>
      <path d="M6 15 L32 15 L28 26 L3 26 Z" fill="#ffeaa5" stroke="#000"/>
      <rect x="7" y="18" width="16" height="1" fill="#d6a62a"/>
    `),

    star: svg(`
      <path d="M16 3 L20 12 L30 13 L23 20 L25 29 L16 24 L7 29 L9 20 L2 13 L12 12 Z" fill="#000"/>
      <path d="M16 5 L19 12 L27 13 L21 18 L23 26 L16 22 L9 26 L11 18 L5 13 L13 12 Z" fill="#ffe000"/>
    `),

    run: svg(`
      <rect x="3" y="5" width="26" height="22" fill="#000"/>
      <rect x="4" y="6" width="24" height="20" fill="#c0c0c0"/>
      <rect x="4" y="6" width="24" height="4" fill="#000080"/>
      <rect x="7" y="14" width="10" height="2" fill="#008080"/>
      <rect x="7" y="18" width="7" height="2" fill="#008080"/>
      <path d="M20 14 L25 18 L20 22 Z" fill="#008000"/>
    `),

    screenshot: svg(`
      <rect x="2" y="5" width="28" height="22" fill="#000"/>
      <rect x="3" y="6" width="26" height="20" fill="#008080"/>
      <rect x="5" y="8" width="22" height="14" fill="#b9e6f5"/>
      <path d="M5 21 L12 14 L17 18 L21 13 L27 20 L27 22 L5 22 Z" fill="#4a9b45"/>
      <circle cx="22" cy="11" r="2" fill="#ffe000"/>
      <rect x="10" y="27" width="12" height="2" fill="#c0c0c0"/>
    `)
  };
})();
