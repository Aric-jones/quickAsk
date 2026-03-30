/* global chrome */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const statusEl = document.getElementById('status');

  chrome.storage.sync.get(['provider', 'apiKey'], (data) => {
    if (data.provider && data.apiKey) {
      chrome.runtime.sendMessage({ type: 'getProviders' }, (res) => {
        const name = res?.providers?.[data.provider]?.name || data.provider;
        statusEl.textContent = `已连接 · ${name}`;
        statusEl.className = 'popup-status ok';
      });
    } else {
      statusEl.textContent = '尚未配置，请先设置 API Key';
      statusEl.className = 'popup-status no';
    }
  });

  document.getElementById('settings-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
    window.close();
  });
});
