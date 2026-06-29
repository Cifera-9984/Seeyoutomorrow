document.addEventListener('DOMContentLoaded', () => {

  // ================= 0. 网站设置面板 (主题色 / 特效开关) =================
  const SETTINGS_KEY = 'site-settings';
  const DEFAULT_SETTINGS = {
    hue: 220,
    textColor: '#ffffff',
    bgSlideshow: true,
    sakura: true,
    textShadow: true,
    welcome: true
  };

  function loadSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
      return Object.assign({}, DEFAULT_SETTINGS, saved);
    } catch (e) {
      return Object.assign({}, DEFAULT_SETTINGS);
    }
  }

  function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  function updateHue(hue) {
    document.documentElement.style.setProperty('--primary-hue', hue);
  }

  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function hslToHex(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = (x) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return '#' + toHex(r) + toHex(g) + toHex(b);
  }

  function getTextHueFromColor(hex) {
    const rgb = hexToRgb(hex);
    return rgbToHsl(rgb.r, rgb.g, rgb.b).h;
  }

  function updateTextColor(color) {
    const rgb = hexToRgb(color);
    document.documentElement.style.setProperty('--text-color', color);
    document.documentElement.style.setProperty('--text-color-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
  }

  function updateTextShadow(enabled) {
    document.documentElement.classList.toggle('no-text-shadow', !enabled);
  }

  // 设置面板元素
  const settingsPanel = document.getElementById('settings-panel');
  const settingsToggle = document.getElementById('settings-toggle');
  const settingsClose = document.getElementById('settings-close');
  const settingsReset = document.getElementById('settings-reset');
  const hueSlider = document.getElementById('hue-slider');
  const huePreview = document.getElementById('hue-preview');
  const hueValue = document.getElementById('hue-value');
  const textColorPicker = document.getElementById('text-color-picker');
  const textColorSlider = document.getElementById('text-color-slider');
  const bgToggle = document.getElementById('bg-toggle');
  const sakuraToggle = document.getElementById('sakura-toggle');
  const textShadowToggle = document.getElementById('textshadow-toggle');
  const welcomeToggle = document.getElementById('welcome-toggle');

  const settings = loadSettings();

  // 初始化控件状态
  if (hueSlider) hueSlider.value = settings.hue;
  if (huePreview) huePreview.style.background = `hsl(${settings.hue}, 100%, 50%)`;
  if (hueValue) hueValue.textContent = `${settings.hue}°`;
  if (textColorPicker) textColorPicker.value = settings.textColor;
  if (textColorSlider) textColorSlider.value = getTextHueFromColor(settings.textColor);
  if (bgToggle) bgToggle.checked = settings.bgSlideshow;
  if (sakuraToggle) sakuraToggle.checked = settings.sakura;
  if (textShadowToggle) textShadowToggle.checked = settings.textShadow;
  if (welcomeToggle) welcomeToggle.checked = settings.welcome;

  // 确保 hue / 文字颜色 / 文字阴影同步（即便 head 脚本已设置，也再确认一次）
  updateHue(settings.hue);
  updateTextColor(settings.textColor);
  updateTextShadow(settings.textShadow);

  if (settingsToggle && settingsPanel) {
    settingsToggle.addEventListener('click', () => settingsPanel.classList.remove('collapsed'));
  }
  if (settingsClose && settingsPanel) {
    settingsClose.addEventListener('click', () => settingsPanel.classList.add('collapsed'));
  }
  // 点击面板外部关闭
  if (settingsPanel && settingsToggle) {
    window.addEventListener('click', (e) => {
      if (!settingsPanel.classList.contains('collapsed')) {
        if (!settingsPanel.contains(e.target) && !settingsToggle.contains(e.target)) {
          settingsPanel.classList.add('collapsed');
        }
      }
    });
  }

  if (hueSlider) {
    hueSlider.addEventListener('input', () => {
      const hue = parseInt(hueSlider.value, 10);
      settings.hue = hue;
      updateHue(hue);
      if (huePreview) huePreview.style.background = `hsl(${hue}, 100%, 50%)`;
      if (hueValue) hueValue.textContent = `${hue}°`;
      saveSettings(settings);
    });
  }

  if (textColorPicker) {
    textColorPicker.addEventListener('input', () => {
      const color = textColorPicker.value;
      settings.textColor = color;
      updateTextColor(color);
      if (textColorSlider) textColorSlider.value = getTextHueFromColor(color);
      saveSettings(settings);
    });
  }

  if (textColorSlider) {
    textColorSlider.addEventListener('input', () => {
      const hue = parseInt(textColorSlider.value, 10);
      const color = hslToHex(hue, 100, 70);
      settings.textColor = color;
      updateTextColor(color);
      if (textColorPicker) textColorPicker.value = color;
      saveSettings(settings);
    });
  }

  if (bgToggle) {
    bgToggle.addEventListener('change', () => {
      settings.bgSlideshow = bgToggle.checked;
      saveSettings(settings);
      if (settings.bgSlideshow) {
        restartBgSlideshow();
      } else if (window.bgSlideshowInterval) {
        clearInterval(window.bgSlideshowInterval);
        window.bgSlideshowInterval = null;
      }
    });
  }

  if (sakuraToggle) {
    sakuraToggle.addEventListener('change', () => {
      settings.sakura = sakuraToggle.checked;
      saveSettings(settings);
      if (settings.sakura) {
        startSakura();
      } else {
        stopSakura();
      }
    });
  }

  if (textShadowToggle) {
    textShadowToggle.addEventListener('change', () => {
      settings.textShadow = textShadowToggle.checked;
      updateTextShadow(settings.textShadow);
      saveSettings(settings);
    });
  }

  if (welcomeToggle) {
    welcomeToggle.addEventListener('change', () => {
      settings.welcome = welcomeToggle.checked;
      saveSettings(settings);
    });
  }

  if (settingsReset) {
    settingsReset.addEventListener('click', () => {
      localStorage.removeItem(SETTINGS_KEY);
      // 将当前 settings 对象重置为默认值
      Object.assign(settings, DEFAULT_SETTINGS);
      if (hueSlider) hueSlider.value = settings.hue;
      if (huePreview) huePreview.style.background = `hsl(${settings.hue}, 100%, 50%)`;
      if (hueValue) hueValue.textContent = `${settings.hue}°`;
      if (textColorPicker) textColorPicker.value = settings.textColor;
      if (textColorSlider) textColorSlider.value = getTextHueFromColor(settings.textColor);
      if (bgToggle) bgToggle.checked = settings.bgSlideshow;
      if (sakuraToggle) sakuraToggle.checked = settings.sakura;
      if (textShadowToggle) textShadowToggle.checked = settings.textShadow;
      if (welcomeToggle) welcomeToggle.checked = settings.welcome;
      updateHue(settings.hue);
      updateTextColor(settings.textColor);
      updateTextShadow(settings.textShadow);
      // 重置后重启背景轮播与樱花
      if (window.bgSlideshowInterval) { clearInterval(window.bgSlideshowInterval); window.bgSlideshowInterval = null; }
      restartBgSlideshow();
      if (!document.getElementById('canvas_sakura') && settings.sakura) startSakura();
      else if (document.getElementById('canvas_sakura') && !settings.sakura) stopSakura();
    });
  }

  // ================= 1. 打字机效果 (仅主页) =================
  const logoEl = document.querySelector('.logo');
  // 只在主页且 logo 不包含 href 到 index.html 时才启用打字机（子页面的 logo 是链接回主页的）
  if (logoEl && !logoEl.getAttribute('href')?.includes('index.html')) {
    const phrases = ['SEE YOU TOMORROW ♪', '明天见 ♪', '在遥远的未来 我们一定会重逢!'];
    let idx = 0, pos = 0, forward = true, delay = 2000;
    let cursorOn = true;

    // 光标闪烁
    setInterval(() => { 
      cursorOn = !cursorOn; 
      // 只有在静止等待时才更新光标，避免打字时闪烁频率混乱
      if (pos === 0 || pos === phrases[idx].length) updateText(); 
    }, 500);

    function updateText() {
      // 这里的逻辑是：如果字还没打完，加上光标；如果删完了，显示空
      // 为了防止文字跳动，pos=0 时清空
      const currentText = phrases[idx].slice(0, pos);
      logoEl.textContent = currentText + (cursorOn ? '_' : '\u00A0'); // \u00A0 是不占位空格，防止高度塌陷
    }

    function tick() {
      const text = phrases[idx];
      
      if (forward) {
        // 向前打字
        if (++pos <= text.length) {
          logoEl.textContent = text.slice(0, pos) + '_';
        }
        if (pos === text.length) { 
          forward = false; 
          setTimeout(tick, delay); // 打完后停留 delay 毫秒
          return; 
        }
      } else {
        // 向后删除
        if (--pos >= 0) {
          logoEl.textContent = text.slice(0, pos) + '_';
        }
        if (pos < 0) {
          // 彻底删完，切换到下一句
          forward = true;
          idx = (idx + 1) % phrases.length;
          pos = 0;
          setTimeout(tick, 300); // 稍微停顿一下再开始打下一句
          return;
        }
      }
      
      // 打字速度 (打字快，删除慢一点点)
      const speed = forward ? 120 : 60; 
      setTimeout(tick, speed);
    }
    
    // 启动打字机
    tick();
  }

  // ================= 1.5 首页简介一言轮播 =================
  const bioEl = document.getElementById('home-bio');
  if (bioEl) {
    const fallbackQuotes = [
      '愿开拓之旅，永远有涟漪相伴♪',
      '在遥远的未来，我们一定会重逢！',
      '星光不问赶路人，时光不负有心人。',
      '去发光，而不是被照亮。',
      '保持热爱，奔赴山海。',
      '愿你的生活常温暖，日子总是温柔又闪光。',
      '每一个不曾起舞的日子，都是对生命的辜负。'
    ];
    let currentIdx = -1;
    let isSwitching = false;
    const ROTATE_INTERVAL = 6000;
    const FADE_DURATION = 800;

    function fetchQuote() {
      return fetch('https://v1.hitokoto.cn/?c=a&c=b&c=c&c=d&c=e&c=f&c=g&c=h&c=i&c=j&c=k&l=')
        .then(res => res.json())
        .then(data => {
          if (data && data.hitokoto) return data.hitokoto;
          throw new Error('no hitokoto');
        });
    }

    function showQuote(text) {
      if (isSwitching) return;
      isSwitching = true;
      bioEl.style.transition = `opacity ${FADE_DURATION}ms ease-in-out`;
      bioEl.style.opacity = '0';
      setTimeout(() => {
        bioEl.textContent = text;
        bioEl.style.opacity = '1';
        setTimeout(() => { isSwitching = false; }, FADE_DURATION);
      }, FADE_DURATION);
    }

    function nextQuote() {
      if (isSwitching) return;
      fetchQuote()
        .then(text => showQuote(text))
        .catch(() => {
          // 接口失败时用本地备选句
          currentIdx = (currentIdx + 1) % fallbackQuotes.length;
          showQuote(fallbackQuotes[currentIdx]);
        });
    }

    // 首次加载：成功就渐隐替换，失败不动
    fetchQuote()
      .then(text => {
        showQuote(text);
        // 加载成功后开始轮播
        setInterval(nextQuote, ROTATE_INTERVAL);
      })
      .catch(() => {
        // 失败：保留原简介，但也启动轮播（用本地备选）
        currentIdx = 0;
        setInterval(nextQuote, ROTATE_INTERVAL);
      });
  }

  // ================= 1.6 时间显示和网站运行时间 =================
  const startTime = new Date('2024-06-25T00:00:00');
  const timeEl = document.getElementById('current-time');
  const uptimeEl = document.getElementById('uptime-status');

  function updateTime() {
    if (!timeEl) return;
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    timeEl.textContent = `${h}:${m}:${s}`;
  }

  function formatUptime(diff) {
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) {
      return `网站已稳定运行: ${days}天${hours}小时${mins}分`;
    } else if (hours > 0) {
      return `网站已稳定运行: ${hours}小时${mins}分`;
    } else {
      return `网站已稳定运行: ${mins}分钟`;
    }
  }

  function updateUptime() {
    if (!uptimeEl) return;
    const isLocal = window.location.protocol === 'file:' || window.location.hostname === 'localhost';
    if (isLocal) {
      uptimeEl.textContent = '网站在本地运行';
      uptimeEl.classList.add('is-local');
      uptimeEl.classList.remove('is-remote');
      return;
    }
    uptimeEl.classList.add('is-remote');
    uptimeEl.classList.remove('is-local');
    const now = new Date();
    const diff = now - startTime;
    uptimeEl.textContent = formatUptime(diff);
  }

  if (timeEl) {
    updateTime();
    setInterval(updateTime, 1000);
  }
  if (uptimeEl) {
    updateUptime();
    setInterval(updateUptime, 60000);
  }

  // ================= 2. 移动端导航切换 =================
  const toggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  
  if (toggle && navList) {
    toggle.addEventListener('click', () => {
      navList.classList.toggle('open');
    });

    // 点击链接自动关闭菜单
    document.querySelectorAll('.nav-list a').forEach(link =>
      link.addEventListener('click', () => navList.classList.remove('open'))
    );
  }

  // ================= 3. 平滑滚动 (兼容 Lenis) =================
  // 如果页面使用了 Lenis，优先用 lenis.scrollTo
  const lenis = window.lenis || null;

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId.startsWith('#') && targetId.length > 1) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          if (lenis) {
            lenis.scrollTo(targetElement, { offset: 0, duration: 1.2 });
          } else {
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }
    });
  });

  // ================= 3.5 跨页面锚点滚动 =================
  if (window.location.hash && window.location.hash.length > 1) {
    const target = document.querySelector(window.location.hash);
    if (target) {
      requestAnimationFrame(() => {
        if (lenis) {
          lenis.scrollTo(target, { offset: 0, duration: 1.2 });
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  }

  // ================= 4. 音乐面板切换 =================
  const musicToggle = document.getElementById('music-toggle');
  const musicPanel = document.getElementById('music-panel');
  if (musicToggle && musicPanel) {
    musicToggle.addEventListener('click', () => {
      musicPanel.classList.toggle('collapsed');
    });
  }

  // ================= 5. 更新日志面板 =================
  const logPanel = document.getElementById('log-panel');
  const logToggle = document.getElementById('log-toggle');
  const logClose = document.getElementById('log-close');

  if (logToggle && logPanel) {
      logToggle.addEventListener('click', () => logPanel.classList.remove('collapsed'));
  }
  if (logClose && logPanel) {
      logClose.addEventListener('click', () => logPanel.classList.add('collapsed'));
  }

  // 点击面板外部（遮罩部分）关闭日志
  /* 如果你想点击空白处关闭日志，取消下面注释即可 */
  /*
  window.addEventListener('click', (e) => {
    if (logPanel && !logPanel.classList.contains('collapsed')) {
       // 如果点击的目标既不是面板内部，也不是打开按钮
       if (!logPanel.contains(e.target) && !logToggle.contains(e.target)) {
         logPanel.classList.add('collapsed');
       }
    }
  });
  */

  // ================= 6. 开屏动画遮罩移除 =================
  const splash = document.getElementById('splash');
  if (splash) {
    // 等页面资源(背景图等)加载完后再淡出白屏，避免闪一下
    function hideSplash() {
      setTimeout(() => {
        splash.classList.add('hide');
        setTimeout(() => splash.remove(), 700);
      }, 400);
    }
    if (document.readyState === 'complete') {
      hideSplash();
    } else {
      window.addEventListener('load', hideSplash);
    }
  }

  // ================= 7. 页面跳转跳跃动画拦截 =================
  const CHAR_COUNT = 9; // b1.png ~ b9.png

  // 预加载图片避免首次跳转空白
  for (let i = 1; i <= CHAR_COUNT; i++) {
    const img = new Image();
    img.src = `images/b${i}.png`;
  }

  function playBounceThenGo(href) {
    // 创建全屏白遮罩
    const overlay = document.createElement('div');
    overlay.id = 'transition-overlay';
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 99999;
      background: #fff; overflow: hidden;
      opacity: 0; transition: opacity 0.25s ease;
      pointer-events: none;
    `;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.style.opacity = '1');

    // 随机选一张图
    const idx = Math.floor(Math.random() * CHAR_COUNT) + 1;
    const char = document.createElement('img');
    char.src = `images/b${idx}.png`;
    char.className = 'bounce-char';

    const startX = 10 + Math.random() * 80;  // 水平起始位置 10% ~ 90%
    const size = 150 + Math.random() * 130;  // 150px ~ 280px
    char.style.width = size + 'px';
    char.style.left = startX + '%';
    char.style.bottom = '-200px';
    char.style.transform = 'translateX(-50%)';
    char.style.opacity = '0';
    overlay.appendChild(char);

    // Loading 文字
    const loading = document.createElement('div');
    loading.innerHTML = 'LOADING<span class="loading-dots"><span>.</span><span>.</span><span>.</span></span>';
    loading.style.cssText = `
      position: absolute; left: 50%; top: 50%;
      transform: translate(-50%, -50%);
      font-size: clamp(1rem, 3vw, 1.6rem);
      font-weight: 700; letter-spacing: 4px;
      color: #0066ff; z-index: 2;
      text-shadow: 0 0 20px rgba(0,102,255,0.3);
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
    `;
    loading.querySelectorAll('.loading-dots span').forEach((dot, i) => {
      dot.style.cssText = `
        display: inline-block; animation: loadingBounce 1s ease-in-out infinite;
        animation-delay: ${i * 0.15}s;
      `;
    });
    // 插入 keyframes
    if (!document.getElementById('loading-anim-style')) {
      const s = document.createElement('style');
      s.id = 'loading-anim-style';
      s.textContent = `
        @keyframes loadingBounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-8px); opacity: 1; }
        }
      `;
      document.head.appendChild(s);
    }
    overlay.appendChild(loading);

    // 一言句子
    const hitokoto = document.createElement('div');
    hitokoto.style.cssText = `
      position: absolute; left: 50%; top: calc(50% + 50px);
      transform: translateX(-50%);
      text-align: center; max-width: 80vw;
      font-size: clamp(0.85rem, 2.2vw, 1.15rem);
      color: #444; z-index: 2; line-height: 1.6;
      font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica, Arial, sans-serif;
      opacity: 0; transition: opacity 0.4s ease;
    `;
    hitokoto.innerHTML = '<span class="hk-text">正在寻找一句合适的话…</span>';
    overlay.appendChild(hitokoto);
    requestAnimationFrame(() => hitokoto.style.opacity = '1');

    // 请求一言
    fetch('https://v1.hitokoto.cn/?c=a&c=b&c=c&c=d&c=e&c=f&c=g&c=h&c=i&c=j&c=k&l=') // 全分类，支持中文
      .then(res => res.json())
      .then(data => {
        const from = data.from ? ` ——《${data.from}》` : '';
        const author = data.from_who ? ` ${data.from_who}` : '';
        hitokoto.innerHTML = `<span class="hk-text">${data.hitokoto}</span><br><span style="font-size:0.8em;opacity:0.6;margin-top:6px;display:inline-block;">${from}${author}</span>`;
      })
      .catch(() => {
        const backups = [
          '愿你的生活常温暖，日子总是温柔又闪光。',
          '每一个不曾起舞的日子，都是对生命的辜负。',
          '星光不问赶路人，时光不负有心人。',
          '去发光，而不是被照亮。',
          '保持热爱，奔赴山海。'
        ];
        hitokoto.innerHTML = `<span class="hk-text">${backups[Math.floor(Math.random() * backups.length)]}</span>`;
      });

    // 物理参数 (bottom 向上为正，所以 vy0 向上为正，重力向下为负)
    const gravity = 2200;
    const vy0 = 1300 + Math.random() * 500;           // 初始向上速度
    const vx = (Math.random() - 0.5) * 450;           // 水平速度
    const spinSpeed = (Math.random() - 0.5) * 700;    // 旋转速度 deg/s

    let startTime = null;

    function step(time) {
      if (!startTime) startTime = time;
      const t = (time - startTime) / 1000;

      // 垂直位置：bottom = 初始 + vy0*t - 0.5*g*t^2
      const y = vy0 * t - 0.5 * gravity * t * t;
      const currentBottom = -200 + y;
      const x = vx * t;
      const rot = spinSpeed * t;

      // 渐入
      if (t < 0.25) char.style.opacity = (t / 0.25).toString();
      else char.style.opacity = '1';

      char.style.bottom = currentBottom + 'px';
      char.style.left = `calc(${startX}% + ${x}px)`;
      char.style.transform = `translateX(-50%) rotate(${rot}deg)`;

      // 角色完全掉出屏幕底部后再跳转
      if (currentBottom < -size - 50 && t > 0.6) {
        window.location.href = href;
        return;
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  document.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    if (href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript:')) return;

    link.addEventListener('click', function (e) {
      e.preventDefault();
      playBounceThenGo(href);
    });
  });

  // ================= 8. 樱花飘落效果 =================
  let sakuraStop;
  const sakuraImg = new Image();
  sakuraImg.src = 'images/sakura.png';

  const _s = { list: [], w: 0, h: 0 };

  function Sakura(x, y, s, r, vx, vy, vr, swayAmp, swayFreq, phase) {
    this.x = x; this.y = y; this.s = s; this.r = r;
    this.vx = vx; this.vy = vy; this.vr = vr;
    this.swayAmp = swayAmp; this.swayFreq = swayFreq; this.phase = phase;
  }
  Sakura.prototype.draw = function(cxt) {
    cxt.save();
    cxt.translate(this.x, this.y);
    cxt.rotate(this.r);
    cxt.drawImage(sakuraImg, -20 * this.s, -20 * this.s, 40 * this.s, 40 * this.s);
    cxt.restore();
  };
  Sakura.prototype.update = function() {
    // 水平摆动：在 vx 基础上叠加正弦左右摇摆
    this.x += this.vx + Math.sin(Date.now() * this.swayFreq + this.phase) * this.swayAmp;
    this.y += this.vy;
    this.r += this.vr;
    // 出界判定：必须完全离开屏幕（带缓冲 100px）才重置
    const margin = 100;
    if (this.y > _s.h + margin || this.y < -margin ||
        this.x > _s.w + margin || this.x < -margin) {
      // 从顶部重新出现
      this.x = Math.random() * _s.w;
      this.y = -40 - Math.random() * 60;
      this.s = 0.4 + Math.random() * 0.7;
      this.vy = 0.5 + Math.random() * 1.2;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vr = (Math.random() - 0.5) * 0.04;
    }
  };

  function startSakura() {
    // 如果用户关闭了樱花特效，则不再启动
    const saved = JSON.parse(localStorage.getItem('site-settings') || '{}');
    if (saved.sakura === false) return;
    // 避免重复创建
    if (document.getElementById('canvas_sakura')) return;

    _s.w = window.innerWidth;
    _s.h = window.innerHeight;
    const canvas = document.createElement('canvas');
    const isMobile = _s.w < 768;
    // 手机端降低 canvas 分辨率提升性能
    const dpr = isMobile ? 1 : Math.min(window.devicePixelRatio, 2);
    canvas.height = _s.h * dpr;
    canvas.width = _s.w * dpr;
    canvas.style.height = _s.h + 'px';
    canvas.style.width = _s.w + 'px';
    canvas.setAttribute('style', `position: fixed; left: 0; top: 0; pointer-events: none; z-index: 9998; width: ${_s.w}px; height: ${_s.h}px;`);
    canvas.setAttribute('id', 'canvas_sakura');
    document.body.appendChild(canvas);
    const cxt = canvas.getContext('2d');
    cxt.scale(dpr, dpr);
    const count = isMobile ? 25 : 50;
    for (let i = 0; i < count; i++) {
      _s.list.push(new Sakura(
        Math.random() * _s.w,
        Math.random() * _s.h,
        0.4 + Math.random() * 0.7,
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * 0.6,     // vx
        0.5 + Math.random() * 1.2,       // vy
        (Math.random() - 0.5) * 0.04,    // vr
        0.15 + Math.random() * 0.35,     // swayAmp
        0.001 + Math.random() * 0.003,   // swayFreq
        Math.random() * Math.PI * 2      // phase
      ));
    }
    function frame() {
      cxt.clearRect(0, 0, _s.w, _s.h);
      for (let i = 0, len = _s.list.length; i < len; i++) _s.list[i].update();
      for (let i = 0, len = _s.list.length; i < len; i++) _s.list[i].draw(cxt);
      sakuraStop = requestAnimationFrame(frame);
    }
    sakuraStop = requestAnimationFrame(frame);
  }

  function stopSakura() {
    const c = document.getElementById('canvas_sakura');
    if (c) {
      window.cancelAnimationFrame(sakuraStop);
      c.remove();
      _s.list = [];
    }
  }

  window.addEventListener('resize', function() {
    const c = document.getElementById('canvas_sakura');
    if (c) {
      window.cancelAnimationFrame(sakuraStop);
      c.remove();
      _s.list = [];
      if (sakuraImg.complete) startSakura();
    }
  });

  sakuraImg.onload = function() { startSakura(); };

  // ================= 天气卡片 =================
  const weatherCard = document.getElementById('weather-card');
  if (weatherCard) {
    initWeather(weatherCard);
  }

  // ================= 首页向下滚动按钮 =================
  const scrollDownBtn = document.querySelector('.scroll-down-btn');
  if (scrollDownBtn) {
    scrollDownBtn.addEventListener('click', () => {
      const weatherSection = document.getElementById('weather');
      if (weatherSection) {
        if (typeof lenis !== 'undefined' && lenis) {
          lenis.scrollTo(weatherSection, { offset: 0, duration: 1.2 });
        } else {
          weatherSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  }

  // ================= 隐藏项目切换（FLIP 位移动画） =================
  const toggleHiddenBtn = document.getElementById('toggle-hidden-projects');
  const projectGrid = document.getElementById('project-grid');
  if (toggleHiddenBtn && projectGrid) {
    let hiddenVisible = false;
    const hiddenCards = projectGrid.querySelectorAll('.hidden-project');

    // 初始确保隐藏且不占用布局空间
    hiddenCards.forEach(card => {
      card.style.display = 'none';
      card.classList.remove('revealing', 'visible', 'hiding');
    });

    toggleHiddenBtn.addEventListener('click', () => {
      hiddenVisible = !hiddenVisible;
      toggleHiddenBtn.innerHTML = hiddenVisible
        ? '<i class="fa fa-eye-slash"></i> 隐藏项目'
        : '<i class="fa fa-eye"></i> 显示隐藏项目';

      const allCards = Array.from(projectGrid.querySelectorAll('.project-card'));
      const gridRect = projectGrid.getBoundingClientRect();

      // First：记录所有可见卡片当前位置
      const firstRects = new Map();
      allCards.forEach(card => {
        if (card.style.display !== 'none' || card.classList.contains('hiding')) {
          firstRects.set(card, card.getBoundingClientRect());
        }
      });

      if (hiddenVisible) {
        // 显示：让隐藏卡片先占位但透明
        hiddenCards.forEach(card => {
          card.style.display = 'block';
          card.classList.remove('visible', 'hiding');
          card.classList.add('revealing');
        });
      } else {
        // 隐藏：让隐藏卡片脱离文档流并淡出
        hiddenCards.forEach(card => {
          const rect = card.getBoundingClientRect();
          card.style.position = 'absolute';
          card.style.left = (rect.left - gridRect.left) + 'px';
          card.style.top = (rect.top - gridRect.top) + 'px';
          card.style.width = rect.width + 'px';
          card.classList.remove('revealing', 'visible');
          card.classList.add('hiding');
        });
      }

      // 强制重排
      void projectGrid.offsetWidth;

      // Last + Invert：计算位移并应用 transform 抵消
      requestAnimationFrame(() => {
        allCards.forEach(card => {
          const first = firstRects.get(card);
          if (!first) return;
          const last = card.getBoundingClientRect();
          const dx = first.left - last.left;
          const dy = first.top - last.top;
          if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
            card.style.transition = 'none';
            card.style.transform = `translate(${dx}px, ${dy}px)`;
          }
        });

        // Play：下一帧移除 transform，触发 CSS transition
        requestAnimationFrame(() => {
          allCards.forEach(card => {
            card.style.transition = '';
            card.style.transform = '';
          });

          if (hiddenVisible) {
            hiddenCards.forEach(card => {
              card.classList.remove('revealing');
              card.classList.add('visible');
            });
          } else {
            hiddenCards.forEach(card => {
              card.addEventListener('transitionend', function handler(e) {
                if (e.propertyName === 'opacity') {
                  card.style.display = 'none';
                  card.style.position = '';
                  card.style.left = '';
                  card.style.top = '';
                  card.style.width = '';
                  card.classList.remove('hiding');
                  card.removeEventListener('transitionend', handler);
                }
              }, { once: true });
            });
          }
        });
      });
    });
  }
});

// 天气代码映射（WMO code -> 中文 + Font Awesome 图标）
function getWeatherInfo(code) {
  const map = {
    0: { text: '晴', icon: 'fa-sun' },
    1: { text: ' mainly clear', icon: 'fa-cloud-sun' },
    2: { text: '多云', icon: 'fa-cloud-sun' },
    3: { text: '阴', icon: 'fa-cloud' },
    45: { text: '雾', icon: 'fa-smog' },
    48: { text: '雾凇', icon: 'fa-smog' },
    51: { text: '毛毛雨', icon: 'fa-cloud-rain' },
    53: { text: '中雨', icon: 'fa-cloud-rain' },
    55: { text: '大雨', icon: 'fa-cloud-showers-heavy' },
    56: { text: '冻雨', icon: 'fa-cloud-meatball' },
    57: { text: '冻雨', icon: 'fa-cloud-meatball' },
    61: { text: '小雨', icon: 'fa-cloud-rain' },
    63: { text: '中雨', icon: 'fa-cloud-rain' },
    65: { text: '大雨', icon: 'fa-cloud-showers-heavy' },
    66: { text: '雨夹雪', icon: 'fa-cloud-meatball' },
    67: { text: '雨夹雪', icon: 'fa-cloud-meatball' },
    71: { text: '小雪', icon: 'fa-snowflake' },
    73: { text: '中雪', icon: 'fa-snowflake' },
    75: { text: '大雪', icon: 'fa-snowflake' },
    77: { text: '雪粒', icon: 'fa-snowflake' },
    80: { text: '阵雨', icon: 'fa-cloud-showers-heavy' },
    81: { text: '强阵雨', icon: 'fa-cloud-showers-heavy' },
    82: { text: '暴雨', icon: 'fa-cloud-showers-heavy' },
    85: { text: '阵雪', icon: 'fa-snowflake' },
    86: { text: '强阵雪', icon: 'fa-snowflake' },
    95: { text: '雷雨', icon: 'fa-bolt' },
    96: { text: '雷暴伴冰雹', icon: 'fa-bolt' },
    99: { text: '强雷暴', icon: 'fa-bolt' }
  };
  return map[code] || { text: '未知', icon: 'fa-cloud' };
}

function getWindDirection(degree) {
  const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
  const index = Math.round(degree / 45) % 8;
  return directions[index];
}

function getAqiInfo(aqi) {
  if (aqi <= 50) return { level: '优', class: 'good' };
  if (aqi <= 100) return { level: '良', class: 'moderate' };
  if (aqi <= 150) return { level: '轻度污染', class: 'unhealthy-sensitive' };
  if (aqi <= 200) return { level: '中度污染', class: 'unhealthy' };
  if (aqi <= 300) return { level: '重度污染', class: 'very-unhealthy' };
  return { level: '严重污染', class: 'hazardous' };
}

async function getLocationByIP() {
  try {
    const res = await fetch('https://v2.xxapi.cn/api/ip');
    const data = await res.json();
    if (data.code === 200 && data.data) {
      return {
        address: data.data.address || '本地',
        city: data.data.city || '',
        province: data.data.province || '',
        district: data.data.district || '',
        lat: parseFloat(data.data.lat) || null,
        lng: parseFloat(data.data.lng) || null
      };
    }
  } catch (e) {
    console.log('IP定位失败');
  }
  return { address: '本地', city: '', province: '', district: '', lat: null, lng: null };
}

async function getWeather(lat, lon) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_max,uv_index_max&timezone=auto`;
    const res = await fetch(url);
    return await res.json();
  } catch (e) {
    console.log('天气获取失败');
    return null;
  }
}

async function getAirQuality(lat, lon) {
  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi,pm10,pm2_5,nitrogen_dioxide,sulphur_dioxide,ozone&timezone=auto`;
    const res = await fetch(url);
    return await res.json();
  } catch (e) {
    console.log('空气质量获取失败');
    return null;
  }
}

function formatTime(isoString) {
  if (!isoString) return '--:--';
  const date = new Date(isoString);
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

function renderWeather(card, location, weather, airQuality) {
  const current = weather.current;
  const daily = weather.daily;
  const info = getWeatherInfo(current.weather_code);
  const aqi = airQuality?.current?.us_aqi || 0;
  const aqiInfo = getAqiInfo(aqi);
  const high = Math.round(daily.temperature_2m_max[0]);
  const low = Math.round(daily.temperature_2m_min[0]);
  const cityText = location.address || [location.province, location.city, location.district].filter(Boolean).join(' ') || '本地';

  const pm25 = airQuality?.current?.pm2_5 ?? '--';
  const pm10 = airQuality?.current?.pm10 ?? '--';
  const o3 = airQuality?.current?.ozone ?? '--';
  const no2 = airQuality?.current?.nitrogen_dioxide ?? '--';
  const so2 = airQuality?.current?.sulphur_dioxide ?? '--';
  const co = airQuality?.current?.carbon_monoxide ?? '--';

  // 生成未来5天预报（从明天开始）
  let forecastHTML = '';
  for (let i = 1; i <= 5 && i < daily.time.length; i++) {
    const date = new Date(daily.time[i]);
    const dayName = i === 1 ? '明天' : ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()];
    const fInfo = getWeatherInfo(daily.weather_code[i]);
    const fHigh = Math.round(daily.temperature_2m_max[i]);
    const fLow = Math.round(daily.temperature_2m_min[i]);
    forecastHTML += `
      <div class="weather-forecast-item">
        <span class="weather-forecast-day">${dayName}</span>
        <i class="fa ${fInfo.icon} weather-forecast-icon"></i>
        <span class="weather-forecast-temp">${fLow}° / ${fHigh}°</span>
      </div>
    `;
  }

  card.classList.add('simple');
  card.classList.remove('detail');

  card.innerHTML = `
    <div class="weather-simple">
      <div class="weather-simple-main">
        <div class="weather-simple-temp">${Math.round(current.temperature_2m)}°</div>
        <div class="weather-simple-info">
          <div class="weather-simple-location">
            <i class="fa fa-location-dot"></i>
            <span>${cityText || '未知位置'}</span>
          </div>
          <div class="weather-simple-condition">${info.text} · 空气质量${aqiInfo.level}</div>
        </div>
      </div>
      <div class="weather-forecast">
        ${forecastHTML}
      </div>
    </div>
    <div class="weather-detail">
      <div class="weather-header">
        <div class="weather-location">
          <i class="fa fa-location-dot"></i>
          <span>${cityText || '未知位置'}</span>
        </div>
      </div>
      <div class="weather-main">
        <div class="weather-temp-box">
          <div class="weather-temp">${Math.round(current.temperature_2m)}°</div>
          <div class="weather-temp-desc">
            <div class="weather-condition">${info.text}</div>
            <div class="weather-high-low">
              <span class="high">高温 ${high}°C</span> / <span class="low">低温 ${low}°C</span>
            </div>
          </div>
        </div>
        <div class="weather-icon"><i class="fa ${info.icon}"></i></div>
      </div>
      <div class="weather-grid">
        <div class="weather-item">
          <i class="fa fa-wind"></i>
          <div class="weather-item-text">
            <span class="weather-item-label">风力</span>
            <span class="weather-item-value">${getWindDirection(current.wind_direction_10m)}风 ${current.wind_speed_10m}级</span>
          </div>
        </div>
        <div class="weather-item">
          <i class="fa fa-eye"></i>
          <div class="weather-item-text">
            <span class="weather-item-label">能见度</span>
            <span class="weather-item-value">${(current.visibility / 1000).toFixed(1)}km</span>
          </div>
        </div>
        <div class="weather-item">
          <i class="fa fa-temperature-high"></i>
          <div class="weather-item-text">
            <span class="weather-item-label">体感温度</span>
            <span class="weather-item-value">${Math.round(current.apparent_temperature)}°C</span>
          </div>
        </div>
        <div class="weather-item">
          <i class="fa fa-tint"></i>
          <div class="weather-item-text">
            <span class="weather-item-label">湿度</span>
            <span class="weather-item-value">${current.relative_humidity_2m}%</span>
          </div>
        </div>
        <div class="weather-item">
          <i class="fa fa-gauge-high"></i>
          <div class="weather-item-text">
            <span class="weather-item-label">气压</span>
            <span class="weather-item-value">${Math.round(current.pressure_msl)}hPa</span>
          </div>
        </div>
        <div class="weather-item">
          <i class="fa fa-leaf"></i>
          <div class="weather-item-text">
            <span class="weather-item-label">空气质量</span>
            <span class="weather-item-value">${aqi}<span class="weather-aqi ${aqiInfo.class}">${aqiInfo.level}</span></span>
          </div>
        </div>
        <div class="weather-item">
          <i class="fa fa-cloud"></i>
          <div class="weather-item-text">
            <span class="weather-item-label">云量</span>
            <span class="weather-item-value">${current.cloud_cover}%</span>
          </div>
        </div>
        <div class="weather-item">
          <i class="fa fa-sun"></i>
          <div class="weather-item-text">
            <span class="weather-item-label">紫外线</span>
            <span class="weather-item-value">${daily.uv_index_max[0]}</span>
          </div>
        </div>
        <div class="weather-item">
          <i class="fa fa-cloud-showers-heavy"></i>
          <div class="weather-item-text">
            <span class="weather-item-label">降水量</span>
            <span class="weather-item-value">${daily.precipitation_sum[0]}mm</span>
          </div>
        </div>
        <div class="weather-item">
          <i class="fa fa-droplet"></i>
          <div class="weather-item-text">
            <span class="weather-item-label">降水概率</span>
            <span class="weather-item-value">${daily.precipitation_probability_max[0]}%</span>
          </div>
        </div>
        <div class="weather-item">
          <i class="fa fa-sun"></i>
          <div class="weather-item-text">
            <span class="weather-item-label">日出</span>
            <span class="weather-item-value">${formatTime(daily.sunrise[0])}</span>
          </div>
        </div>
        <div class="weather-item">
          <i class="fa fa-moon"></i>
          <div class="weather-item-text">
            <span class="weather-item-label">日落</span>
            <span class="weather-item-value">${formatTime(daily.sunset[0])}</span>
          </div>
        </div>
      </div>
      <div class="weather-pollutants">
        <div class="weather-pollutants-title">污染物浓度</div>
        <div class="weather-pollutants-grid">
          <div class="weather-pollutant">
            <div class="weather-pollutant-name">PM2.5</div>
            <div class="weather-pollutant-value">${pm25}</div>
          </div>
          <div class="weather-pollutant">
            <div class="weather-pollutant-name">PM10</div>
            <div class="weather-pollutant-value">${pm10}</div>
          </div>
          <div class="weather-pollutant">
            <div class="weather-pollutant-name">O₃</div>
            <div class="weather-pollutant-value">${o3}</div>
          </div>
          <div class="weather-pollutant">
            <div class="weather-pollutant-name">NO₂</div>
            <div class="weather-pollutant-value">${no2}</div>
          </div>
          <div class="weather-pollutant">
            <div class="weather-pollutant-name">SO₂</div>
            <div class="weather-pollutant-value">${so2}</div>
          </div>
          <div class="weather-pollutant">
            <div class="weather-pollutant-name">CO</div>
            <div class="weather-pollutant-value">${co}</div>
          </div>
        </div>
      </div>
      <div class="weather-update">
        <i class="fa fa-clock"></i>
        <span>${new Date().toLocaleString('zh-CN')} 发布</span>
      </div>
    </div>
  `;
}

function toggleWeatherDetail() {
  const card = document.getElementById('weather-card');
  const btn = document.getElementById('weather-toggle');
  if (!card || !btn) return;

  const isSimple = card.classList.contains('simple');
  if (isSimple) {
    card.classList.remove('simple');
    card.classList.add('detail');
    btn.querySelector('span').textContent = '收起详情';
  } else {
    card.classList.remove('detail');
    card.classList.add('simple');
    btn.querySelector('span').textContent = '查看详情';
  }
}

async function initWeather(card) {
  try {
    const location = await getLocationByIP();
    if (!location.lat || !location.lng) {
      throw new Error('无法获取地理位置坐标');
    }
    const [weather, airQuality] = await Promise.all([
      getWeather(location.lat, location.lng),
      getAirQuality(location.lat, location.lng)
    ]);
    if (!weather) {
      throw new Error('无法获取天气数据');
    }
    renderWeather(card, location, weather, airQuality);
  } catch (e) {
    console.error(e);
    card.innerHTML = `
      <div class="weather-error">
        <i class="fa fa-cloud-sun-rain"></i>
        <p>天气数据加载失败，请稍后再试</p>
      </div>
    `;
  }
}

// ================= 背景图幻灯片效果 =================
const pcBgImages = ['beijin.jpg', 'beijin2.jpg', 'beijin3.jpg', 'beijin4.jpg'];
const mobileBgImages = ['beijin.jpg', 'beijinsj.jpg', 'beijinsj2.jpg'];

function getBgImages() {
  return window.innerWidth < 768 ? mobileBgImages : pcBgImages;
}

function initBgSlideshow() {
  const slides = document.querySelectorAll('.bg-slide');
  if (slides.length < 2) return;

  const images = getBgImages();
  let currentIdx = 0;
  let prevIdx = 1;
  let imageIndex = Math.floor(Math.random() * images.length);

  slides[currentIdx].style.backgroundImage = `url("images/${images[imageIndex]}")`;
  slides[currentIdx].classList.add('active');

  // 如果用户关闭了背景轮播，则不启动定时切换
  const saved = JSON.parse(localStorage.getItem('site-settings') || '{}');
  if (saved.bgSlideshow === false) return;

  window.bgSlideshowInterval = setInterval(() => {
    let nextIndex;
    if (images.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * images.length);
      } while (nextIndex === imageIndex);
    } else {
      nextIndex = 0;
    }
    imageIndex = nextIndex;

    slides[prevIdx].style.backgroundImage = `url("images/${images[imageIndex]}")`;
    slides[currentIdx].classList.remove('active');
    slides[prevIdx].classList.add('active');

    [currentIdx, prevIdx] = [prevIdx, currentIdx];
  }, 6000);
}

function restartBgSlideshow() {
  if (window.bgSlideshowInterval) {
    clearInterval(window.bgSlideshowInterval);
    window.bgSlideshowInterval = null;
  }
  initBgSlideshow();
}

document.addEventListener('DOMContentLoaded', initBgSlideshow);
