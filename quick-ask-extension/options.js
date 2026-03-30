/* global chrome */
'use strict';

const domesticIds = ['deepseek', 'qwen', 'doubao', 'zhipu', 'kimi'];
const intlIds = ['openai', 'claude'];

const FREE_TAGS = {
  deepseek: '极低价',
  qwen: '有免费模型',
  doubao: '有免费额度',
  zhipu: '有免费模型',
  kimi: '有免费额度',
  openai: '付费',
  claude: '付费',
};

let providers = {};
let selectedProvider = null;

document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage({ type: 'getProviders' }, (res) => {
    if (res && res.providers) {
      providers = res.providers;
      renderProviders();
      loadSavedConfig();
    }
  });

  document.getElementById('toggle-key').addEventListener('click', () => {
    const input = document.getElementById('api-key');
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  document.getElementById('save-btn').addEventListener('click', saveConfig);
  document.getElementById('test-btn').addEventListener('click', testConnection);
});

function renderProviders() {
  renderProviderGroup('domestic-providers', domesticIds);
  renderProviderGroup('intl-providers', intlIds);
}

function renderProviderGroup(containerId, ids) {
  const container = document.getElementById(containerId);
  ids.forEach(id => {
    const p = providers[id];
    if (!p) return;

    const btn = document.createElement('button');
    btn.className = 'provider-btn';
    btn.dataset.id = id;

    const isFree = ['deepseek', 'qwen', 'doubao', 'zhipu', 'kimi'].includes(id);
    btn.innerHTML = `
      <span class="provider-name">${p.name}</span>
      <span class="provider-tag ${isFree ? 'free' : ''}">${FREE_TAGS[id] || ''}</span>
    `;

    btn.addEventListener('click', () => selectProvider(id));
    container.appendChild(btn);
  });
}

function selectProvider(id) {
  selectedProvider = id;

  document.querySelectorAll('.provider-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.provider-btn[data-id="${id}"]`)?.classList.add('active');

  const configCard = document.getElementById('config-card');
  configCard.style.display = 'block';

  const p = providers[id];
  document.getElementById('key-link').href = p.keyUrl;
  document.getElementById('key-link').textContent = `获取 ${p.name} API Key ↗`;

  const select = document.getElementById('model-select');
  select.innerHTML = '';
  p.models.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.id;
    opt.textContent = m.name;
    select.appendChild(opt);
  });

  hideTestResult();
}

function saveConfig() {
  const apiKey = document.getElementById('api-key').value.trim();
  const model = document.getElementById('model-select').value;

  if (!selectedProvider) {
    showTestResult('请先选择一个 AI 提供商', false);
    return;
  }
  if (!apiKey) {
    showTestResult('请填写 API Key', false);
    return;
  }

  chrome.storage.sync.set({
    provider: selectedProvider,
    apiKey: apiKey,
    model: model,
  }, () => {
    showToast('设置已保存');
  });
}

async function testConnection() {
  const apiKey = document.getElementById('api-key').value.trim();
  const model = document.getElementById('model-select').value;

  if (!selectedProvider || !apiKey) {
    showTestResult('请先选择提供商并填写 API Key', false);
    return;
  }

  const btn = document.getElementById('test-btn');
  btn.disabled = true;
  btn.textContent = '测试中...';
  hideTestResult();

  chrome.runtime.sendMessage(
    { type: 'testConnection', provider: selectedProvider, apiKey, model },
    (res) => {
      btn.disabled = false;
      btn.textContent = '测试连接';

      if (res && res.success) {
        showTestResult(`连接成功！AI 回复: "${res.content}"`, true);
      } else {
        showTestResult(res?.error || '连接失败，请检查 API Key', false);
      }
    }
  );
}

function loadSavedConfig() {
  chrome.storage.sync.get(['provider', 'apiKey', 'model'], (data) => {
    if (data.provider && providers[data.provider]) {
      selectProvider(data.provider);

      if (data.apiKey) {
        document.getElementById('api-key').value = data.apiKey;
      }
      if (data.model) {
        document.getElementById('model-select').value = data.model;
      }
    }
  });
}

function showTestResult(msg, success) {
  const el = document.getElementById('test-result');
  el.textContent = msg;
  el.className = 'test-result ' + (success ? 'success' : 'error');
}

function hideTestResult() {
  const el = document.getElementById('test-result');
  el.className = 'test-result';
}

function showToast(msg) {
  let toast = document.querySelector('.saved-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'saved-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}
