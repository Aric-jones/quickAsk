/* global chrome */
(function () {
  'use strict';

  if (document.getElementById('quick-ask-root')) return;

  function isExtensionAlive() {
    try {
      return !!chrome.runtime?.id;
    } catch { return false; }
  }

  function safeChromeCall(fn, critical) {
    if (!isExtensionAlive()) {
      if (critical) cleanup();
      return;
    }
    try { fn(); }
    catch (e) {
      if (e.message?.includes('Extension context invalidated') && critical) cleanup();
    }
  }

  function cleanup() {
    const el = document.getElementById('quick-ask-root');
    if (el) el.remove();
  }

  const ICONS = {
    question: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>`,
    close: `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
    clear: `<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`,
    send: `<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>`,
    settings: `<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1112 8.4a3.6 3.6 0 010 7.2z"/></svg>`,
  };

  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap';
  document.head.appendChild(fontLink);

  const root = document.createElement('div');
  root.id = 'quick-ask-root';
  document.body.appendChild(root);

  // ===== Floating Ball =====
  const ball = document.createElement('button');
  ball.className = 'qa-floating-ball';
  ball.innerHTML = ICONS.question;
  ball.title = 'Quick Ask - 快速提问';
  root.appendChild(ball);

  // ===== Chat Panel =====
  const panel = document.createElement('div');
  panel.className = 'qa-chat-panel qa-hidden';
  panel.innerHTML = `
    <div class="qa-header">
      <span class="qa-header-title">Quick Ask</span>
      <div class="qa-header-actions">
        <button class="qa-header-btn" data-action="settings" title="设置">${ICONS.settings}</button>
        <button class="qa-header-btn" data-action="clear" title="清空对话">${ICONS.clear}</button>
        <button class="qa-header-btn" data-action="close" title="关闭">${ICONS.close}</button>
      </div>
    </div>
    <div class="qa-messages">
      <div class="qa-welcome">
        <span class="qa-welcome-icon">?</span>
        <div class="qa-welcome-title">看不懂？问我</div>
        <div class="qa-welcome-desc">AI 回复中不理解的地方，粘贴到这里<br/>独立对话，不占用主线上下文<br/>精简回复，不废话<br/>拖右下角调整大小</div>
      </div>
    </div>
    <div class="qa-input-area">
      <textarea class="qa-input" placeholder="有什么不理解的..." rows="1"></textarea>
      <button class="qa-send-btn" title="发送">${ICONS.send}</button>
    </div>
    <div class="qa-footer">your AI · settings</div>
  `;
  root.appendChild(panel);

  const messagesEl = panel.querySelector('.qa-messages');
  const inputEl = panel.querySelector('.qa-input');
  const sendBtn = panel.querySelector('.qa-send-btn');
  const headerEl = panel.querySelector('.qa-header');

  let isOpen = false;
  let isLoading = false;
  let conversationHistory = [];
  // 悬浮球尺寸与边缘吸附参数（与 CSS 中尺寸保持一致）
  const BALL_SIZE = 50;
  const EDGE_PADDING = 8;
  const EDGE_DOCK_THRESHOLD = 72;
  const PANEL_GAP = 8;
  const PANEL_MIN_WIDTH = 320;
  const PANEL_MIN_HEIGHT = 420;
  let hasManualPanelPosition = false;

  // ===== Ball Drag Logic =====
  let isDragging = false;
  let dragStartX, dragStartY, ballStartX, ballStartY;
  let hasMoved = false;
  let lastDockSide = null; // 保存上一次的吸附状态，用于关闭面板时恢复

  // 获取当前吸附边（用于持久化和窗口 resize 后恢复）
  function getDockSide() {
    if (ball.classList.contains('qa-docked-left')) return 'left';
    if (ball.classList.contains('qa-docked-right')) return 'right';
    return null;
  }

  // 清除吸附状态，让悬浮球回到自由拖拽态
  function clearDockSide() {
    ball.classList.remove('qa-docked-left', 'qa-docked-right');
    ball.style.transform = '';
  }

  // 应用吸附状态并将球放到边缘参考位置（真实“露出”由 CSS translate 控制）
  function applyDockSide(side) {
    clearDockSide();
    if (side === 'left') {
      ball.classList.add('qa-docked-left');
      ball.style.left = EDGE_PADDING + 'px';
    } else if (side === 'right') {
      ball.classList.add('qa-docked-right');
      ball.style.left = (window.innerWidth - BALL_SIZE - EDGE_PADDING) + 'px';
    }
    ball.style.right = 'auto';
    ball.style.bottom = 'auto';
  }

  // 开始拖拽前先解除吸附，避免 transform 位移干扰拖拽手感
  function undockForDrag() {
    const side = getDockSide();
    if (!side) return;
    lastDockSide = side; // 保存吸附状态
    clearDockSide();
    const rect = ball.getBoundingClientRect();
    const safeX = Math.max(EDGE_PADDING, Math.min(window.innerWidth - BALL_SIZE - EDGE_PADDING, rect.left));
    const safeY = Math.max(EDGE_PADDING, Math.min(window.innerHeight - BALL_SIZE - EDGE_PADDING, rect.top));
    ball.style.left = safeX + 'px';
    ball.style.top = safeY + 'px';
    ball.style.right = 'auto';
    ball.style.bottom = 'auto';
  }

  ball.addEventListener('pointerdown', (e) => {
    undockForDrag();
    isDragging = true;
    hasMoved = false;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    const rect = ball.getBoundingClientRect();
    ballStartX = rect.left;
    ballStartY = rect.top;
    ball.classList.add('qa-dragging');
    ball.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  ball.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) hasMoved = true;
    if (!hasMoved) return;

    // 拖拽位置限制在可视区域内，避免球被拖出屏幕
    const newX = Math.max(EDGE_PADDING, Math.min(window.innerWidth - BALL_SIZE - EDGE_PADDING, ballStartX + dx));
    const newY = Math.max(EDGE_PADDING, Math.min(window.innerHeight - BALL_SIZE - EDGE_PADDING, ballStartY + dy));
    ball.style.left = newX + 'px';
    ball.style.top = newY + 'px';
    ball.style.right = 'auto';
    ball.style.bottom = 'auto';

    // 悬浮球拖动时不联动弹窗位置，避免干扰当前阅读/输入
  });

  ball.addEventListener('pointerup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    ball.classList.remove('qa-dragging');
    ball.releasePointerCapture(e.pointerId);

    if (!hasMoved) {
      togglePanel();
    } else {
      const rect = ball.getBoundingClientRect();
      // 拖拽结束后，如果足够靠近左右边缘则自动吸附
      const nearLeft = rect.left <= EDGE_DOCK_THRESHOLD;
      const nearRight = (window.innerWidth - rect.right) <= EDGE_DOCK_THRESHOLD;
      if (nearLeft) {
        applyDockSide('left');
      } else if (nearRight) {
        applyDockSide('right');
      } else {
        clearDockSide();
      }
      saveBallPosition();
    }
  });

  // 根据悬浮球位置计算面板位置，避免越界
  function updatePanelPosition(ballX, ballY) {
    const panelWidth = panel.offsetWidth || 400;
    const panelHeight = panel.offsetHeight || 520;
    let left = ballX + BALL_SIZE - panelWidth;
    let top = ballY - panelHeight + BALL_SIZE + 12;

    left = Math.max(PANEL_GAP, Math.min(window.innerWidth - panelWidth - PANEL_GAP, left));
    top = Math.max(PANEL_GAP, Math.min(window.innerHeight - panelHeight - PANEL_GAP, top));

    panel.style.left = left + 'px';
    panel.style.top = top + 'px';
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
  }

  // 保证面板尺寸在当前可视窗口允许范围内
  function keepPanelSizeInViewport() {
    const maxWidth = Math.max(PANEL_MIN_WIDTH, window.innerWidth - PANEL_GAP * 2);
    const maxHeight = Math.max(PANEL_MIN_HEIGHT, window.innerHeight - PANEL_GAP * 2);
    const currentWidth = panel.offsetWidth || 400;
    const currentHeight = panel.offsetHeight || 520;
    const nextWidth = Math.max(PANEL_MIN_WIDTH, Math.min(maxWidth, currentWidth));
    const nextHeight = Math.max(PANEL_MIN_HEIGHT, Math.min(maxHeight, currentHeight));
    panel.style.width = nextWidth + 'px';
    panel.style.height = nextHeight + 'px';
  }

  // 保证面板位置可见，避免拖动/缩放后跑出屏幕
  function keepPanelPositionInViewport() {
    const rect = panel.getBoundingClientRect();
    const width = panel.offsetWidth || rect.width;
    const height = panel.offsetHeight || rect.height;
    const safeLeft = Math.max(PANEL_GAP, Math.min(window.innerWidth - width - PANEL_GAP, rect.left));
    const safeTop = Math.max(PANEL_GAP, Math.min(window.innerHeight - height - PANEL_GAP, rect.top));
    panel.style.left = safeLeft + 'px';
    panel.style.top = safeTop + 'px';
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
  }

  // 保存悬浮球位置与吸附状态（left/top 存“逻辑位置”，不受 transform 影响）
  function saveBallPosition() {
    const rect = ball.getBoundingClientRect();
    const inlineLeft = parseFloat(ball.style.left);
    const inlineTop = parseFloat(ball.style.top);
    const dockSide = getDockSide();
    safeChromeCall(() => {
      chrome.storage.local.set({
        ballPosition: {
          left: Number.isFinite(inlineLeft) ? inlineLeft : rect.left,
          top: Number.isFinite(inlineTop) ? inlineTop : rect.top,
          dockSide
        }
      });
    });
  }

  // 恢复悬浮球位置与吸附状态，并进行窗口边界安全修正
  function restoreBallPosition() {
    safeChromeCall(() => {
      chrome.storage.local.get('ballPosition', (data) => {
        if (data?.ballPosition) {
          const { left, top, dockSide } = data.ballPosition;
          const safeX = Math.max(EDGE_PADDING, Math.min(window.innerWidth - BALL_SIZE - EDGE_PADDING, left));
          const safeY = Math.max(EDGE_PADDING, Math.min(window.innerHeight - BALL_SIZE - EDGE_PADDING, top));
          ball.style.left = safeX + 'px';
          ball.style.top = safeY + 'px';
          ball.style.right = 'auto';
          ball.style.bottom = 'auto';
          if (dockSide === 'left' || dockSide === 'right') {
            applyDockSide(dockSide);
          } else {
            clearDockSide();
          }
        }
      });
    });
  }

  restoreBallPosition();

  // ===== Panel Toggle =====
  function togglePanel() {
    isOpen = !isOpen;
    if (isOpen) {
      keepPanelSizeInViewport();
      if (hasManualPanelPosition) {
        keepPanelPositionInViewport();
      } else {
        const rect = ball.getBoundingClientRect();
        updatePanelPosition(rect.left, rect.top);
      }
      panel.classList.remove('qa-hidden');
      requestAnimationFrame(() => panel.classList.add('qa-visible'));
      checkConfig();
      inputEl.focus();
      // 打开面板时清除吸附状态，让悬浮球完全显示
      // 如果 lastDockSide 还没保存（在点击情况下），先保存
      if (!lastDockSide) {
        lastDockSide = getDockSide();
      }
      clearDockSide();
    } else {
      panel.classList.remove('qa-visible');
      panel.classList.add('qa-hidden');
      // 关闭面板时恢复悬浮球吸附状态
      if (lastDockSide) {
        applyDockSide(lastDockSide);
      }
      lastDockSide = null;
    }
  }

  // ===== Header Actions =====
  panel.querySelector('.qa-header-actions').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'close') {
      togglePanel();
    } else if (action === 'clear') {
      clearConversation();
    } else if (action === 'settings') {
      safeChromeCall(() => chrome.runtime.sendMessage({ type: 'openOptions' }));
    }
  });

  // ===== Panel Drag Logic =====
  let isPanelDragging = false;
  let panelDragStartX = 0;
  let panelDragStartY = 0;
  let panelStartLeft = 0;
  let panelStartTop = 0;

  headerEl.addEventListener('pointerdown', (e) => {
    // 顶部按钮区不触发拖拽，避免与设置/清空/关闭操作冲突
    if (e.target.closest('.qa-header-actions')) return;
    isPanelDragging = true;
    panelDragStartX = e.clientX;
    panelDragStartY = e.clientY;
    const rect = panel.getBoundingClientRect();
    panelStartLeft = rect.left;
    panelStartTop = rect.top;
    panel.classList.add('qa-panel-dragging');
    headerEl.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  headerEl.addEventListener('pointermove', (e) => {
    if (!isPanelDragging) return;
    const dx = e.clientX - panelDragStartX;
    const dy = e.clientY - panelDragStartY;
    const width = panel.offsetWidth || 400;
    const height = panel.offsetHeight || 520;
    const nextLeft = Math.max(PANEL_GAP, Math.min(window.innerWidth - width - PANEL_GAP, panelStartLeft + dx));
    const nextTop = Math.max(PANEL_GAP, Math.min(window.innerHeight - height - PANEL_GAP, panelStartTop + dy));
    panel.style.left = nextLeft + 'px';
    panel.style.top = nextTop + 'px';
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
    hasManualPanelPosition = true;
  });

  headerEl.addEventListener('pointerup', (e) => {
    if (!isPanelDragging) return;
    isPanelDragging = false;
    panel.classList.remove('qa-panel-dragging');
    headerEl.releasePointerCapture(e.pointerId);
  });

  // 监听面板 resize（用户拖动右下角）后做边界修正
  const panelResizeObserver = new ResizeObserver(() => {
    if (!isOpen) return;
    keepPanelSizeInViewport();
    keepPanelPositionInViewport();
  });
  panelResizeObserver.observe(panel);

  function clearConversation() {
    conversationHistory = [];
    messagesEl.innerHTML = `
      <div class="qa-welcome">
        <span class="qa-welcome-icon">?</span>
        <div class="qa-welcome-title">看不懂？问我</div>
        <div class="qa-welcome-desc">AI 回复中不理解的地方，粘贴到这里<br/>独立对话，不占用主线上下文<br/>精简回复，不废话<br/>拖右下角调整大小</div>
      </div>
    `;
  }

  // ===== Check Config =====
  function checkConfig() {
    safeChromeCall(() => {
      chrome.storage.sync.get(['provider', 'apiKey'], (data) => {
        if (chrome.runtime.lastError) return;
        const existing = panel.querySelector('.qa-no-config');
        if (!data?.provider || !data?.apiKey) {
          if (!existing) {
            const banner = document.createElement('div');
            banner.className = 'qa-no-config';
            banner.innerHTML = '尚未配置 AI 服务，请先 <a data-action="settings">前往设置</a>';
            banner.querySelector('a').addEventListener('click', () => {
              safeChromeCall(() => chrome.runtime.sendMessage({ type: 'openOptions' }));
            });
            panel.querySelector('.qa-header').insertAdjacentElement('afterend', banner);
          }
        } else if (existing) {
          existing.remove();
        }
      });
    });
  }

  // ===== Auto-resize Input =====
  inputEl.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = Math.min(inputEl.scrollHeight, 100) + 'px';
  });

  // ===== Send Message =====
  function sendMessage() {
    const text = inputEl.value.trim();
    if (!text || isLoading) return;

    removeWelcome();
    appendMessage('user', text);
    conversationHistory.push({ role: 'user', content: text });

    inputEl.value = '';
    inputEl.style.height = 'auto';

    showLoading();
    setLoading(true);

    if (!isExtensionAlive()) {
      hideLoading();
      setLoading(false);
      appendError('插件已更新，请刷新页面（F5）后重试');
      return;
    }

    try {
      chrome.runtime.sendMessage(
        { type: 'askAI', messages: conversationHistory },
        (response) => {
          hideLoading();
          setLoading(false);

          if (chrome.runtime.lastError) {
            appendError('插件连接中断，请刷新页面（F5）后重试');
            return;
          }

          if (response && response.error) {
            appendError(response.error);
            return;
          }

          if (response && response.content) {
            appendMessage('ai', response.content);
            conversationHistory.push({ role: 'assistant', content: response.content });
          }
        }
      );
    } catch {
      hideLoading();
      setLoading(false);
      appendError('插件已更新，请刷新页面（F5）后重试');
    }
  }

  sendBtn.addEventListener('click', sendMessage);

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // ===== UI Helpers =====
  function removeWelcome() {
    const welcome = messagesEl.querySelector('.qa-welcome');
    if (welcome) welcome.remove();
  }

  function appendMessage(role, content) {
    const div = document.createElement('div');
    div.className = `qa-message qa-message-${role}`;

    if (role === 'ai') {
      div.innerHTML = renderMarkdown(content);
    } else {
      div.textContent = content;
    }

    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function appendError(msg) {
    const div = document.createElement('div');
    div.className = 'qa-error';
    div.textContent = msg;
    messagesEl.appendChild(div);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showLoading() {
    const el = document.createElement('div');
    el.className = 'qa-loading';
    el.id = 'qa-loading';
    el.innerHTML = '<div class="qa-loading-dot"></div><div class="qa-loading-dot"></div><div class="qa-loading-dot"></div>';
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideLoading() {
    const el = messagesEl.querySelector('#qa-loading');
    if (el) el.remove();
  }

  function setLoading(state) {
    isLoading = state;
    sendBtn.disabled = state;
    inputEl.disabled = state;
  }

  // ===== Simple Markdown Renderer =====
  // 轻量 Markdown 渲染：满足常见文本、列表、代码块展示需求
  function renderMarkdown(text) {
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
      return `<pre><code>${code.trim()}</code></pre>`;
    });

    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    const lines = html.split('\n');
    let result = '';
    let inList = false;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.match(/^[-*]\s/)) {
        if (!inList) { result += '<ul>'; inList = true; }
        result += `<li>${trimmed.replace(/^[-*]\s/, '')}</li>`;
      } else if (trimmed.match(/^\d+\.\s/)) {
        if (!inList) { result += '<ol>'; inList = true; }
        result += `<li>${trimmed.replace(/^\d+\.\s/, '')}</li>`;
      } else {
        if (inList) { result += '</ul>'; inList = false; }
        if (trimmed.startsWith('<pre>')) {
          result += trimmed;
        } else if (trimmed) {
          result += `<p>${trimmed}</p>`;
        }
      }
    });

    if (inList) result += '</ul>';
    return result;
  }

  // ===== Keyboard Shortcut (Ctrl+Shift+K) =====
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'K') {
      e.preventDefault();
      togglePanel();
    }
  });

  window.addEventListener('resize', () => {
    // 窗口变化时保持球可见，并维持原吸附边
    const rect = ball.getBoundingClientRect();
    const safeY = Math.max(EDGE_PADDING, Math.min(window.innerHeight - BALL_SIZE - EDGE_PADDING, rect.top));
    ball.style.top = safeY + 'px';

    const side = getDockSide();
    if (side === 'left' || side === 'right') {
      applyDockSide(side);
    } else {
      const safeX = Math.max(EDGE_PADDING, Math.min(window.innerWidth - BALL_SIZE - EDGE_PADDING, rect.left));
      ball.style.left = safeX + 'px';
    }

    if (isOpen) {
      keepPanelSizeInViewport();
      if (hasManualPanelPosition) {
        keepPanelPositionInViewport();
      } else {
        const nextRect = ball.getBoundingClientRect();
        updatePanelPosition(nextRect.left, nextRect.top);
      }
    }
    saveBallPosition();
  });

})();
