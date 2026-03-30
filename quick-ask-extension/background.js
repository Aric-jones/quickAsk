/* global chrome */
'use strict';

const PROVIDERS = {
  deepseek: {
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com',
    path: '/chat/completions',
    format: 'openai',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek-V3 (推荐)' },
      { id: 'deepseek-reasoner', name: 'DeepSeek-R1 (推理)' },
    ],
    keyUrl: 'https://platform.deepseek.com/api_keys',
  },
  doubao: {
    name: '豆包 (火山引擎)',
    baseUrl: 'https://ark.cn-beijing.volces.com',
    path: '/api/v3/chat/completions',
    format: 'openai',
    models: [
      { id: 'doubao-1-5-lite-32k-250115', name: 'Doubao-1.5-lite (免费)' },
      { id: 'doubao-1-5-pro-32k-250115', name: 'Doubao-1.5-pro' },
    ],
    keyUrl: 'https://console.volcengine.com/ark/region:ark+cn-beijing/apiKey',
  },
  qwen: {
    name: '通义千问 (阿里)',
    baseUrl: 'https://dashscope.aliyuncs.com',
    path: '/compatible-mode/v1/chat/completions',
    format: 'openai',
    models: [
      { id: 'qwen-turbo', name: 'Qwen-Turbo (免费)' },
      { id: 'qwen-plus', name: 'Qwen-Plus' },
      { id: 'qwen-max', name: 'Qwen-Max' },
    ],
    keyUrl: 'https://dashscope.console.aliyun.com/apiKey',
  },
  zhipu: {
    name: '智谱 AI',
    baseUrl: 'https://open.bigmodel.cn',
    path: '/api/paas/v4/chat/completions',
    format: 'openai',
    models: [
      { id: 'glm-4-flash', name: 'GLM-4-Flash (免费)' },
      { id: 'glm-4-air', name: 'GLM-4-Air' },
      { id: 'glm-4-plus', name: 'GLM-4-Plus' },
    ],
    keyUrl: 'https://open.bigmodel.cn/usercenter/apikeys',
  },
  kimi: {
    name: 'Kimi (月之暗面)',
    baseUrl: 'https://api.moonshot.cn',
    path: '/v1/chat/completions',
    format: 'openai',
    models: [
      { id: 'moonshot-v1-8k', name: 'Moonshot-v1-8k' },
      { id: 'moonshot-v1-32k', name: 'Moonshot-v1-32k' },
    ],
    keyUrl: 'https://platform.moonshot.cn/console/api-keys',
  },
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com',
    path: '/v1/chat/completions',
    format: 'openai',
    models: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (推荐)' },
      { id: 'gpt-4o', name: 'GPT-4o' },
    ],
    keyUrl: 'https://platform.openai.com/api-keys',
  },
  claude: {
    name: 'Claude (Anthropic)',
    baseUrl: 'https://api.anthropic.com',
    path: '/v1/messages',
    format: 'claude',
    models: [
      { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku (快速)' },
      { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
    ],
    keyUrl: 'https://console.anthropic.com/settings/keys',
  },
};

const SYSTEM_PROMPT = `你是一个简洁解释助手。用户会发来他们不理解的内容或问题。

你的回答规则：
1. 用最简洁的语言解释，控制在2-3句话以内
2. 使用用户提问的语言回复
3. 如果是专业术语，用通俗易懂的比喻或例子
4. 不要说"当然"、"好的"等废话开头
5. 如果内容确实复杂，给出核心要点后说"如需详细了解可继续追问"`;

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'askAI') {
    handleAskAI(msg.messages).then(sendResponse).catch(err => {
      sendResponse({ error: err.message || '请求失败' });
    });
    return true;
  }

  if (msg.type === 'openOptions') {
    chrome.runtime.openOptionsPage();
    return;
  }

  if (msg.type === 'getProviders') {
    sendResponse({ providers: PROVIDERS });
    return;
  }

  if (msg.type === 'testConnection') {
    testConnection(msg.provider, msg.apiKey, msg.model)
      .then(sendResponse)
      .catch(err => sendResponse({ error: err.message }));
    return true;
  }
});

async function handleAskAI(messages) {
  const config = await getConfig();
  if (!config.provider || !config.apiKey) {
    return { error: '请先在插件设置中配置 AI 服务和 API Key' };
  }

  const provider = PROVIDERS[config.provider];
  if (!provider) {
    return { error: `未知的 AI 提供商: ${config.provider}` };
  }

  const model = config.model || provider.models[0].id;

  try {
    if (provider.format === 'claude') {
      return await callClaude(provider, config.apiKey, model, messages);
    } else {
      return await callOpenAICompatible(provider, config.apiKey, model, messages);
    }
  } catch (err) {
    const msg = err.message || '请求 AI 失败';
    if (msg.includes('401') || msg.includes('Unauthorized')) {
      return { error: 'API Key 无效，请在设置中检查你的 Key' };
    }
    if (msg.includes('429') || msg.includes('rate')) {
      return { error: '请求太频繁，请稍后再试' };
    }
    if (msg.includes('insufficient') || msg.includes('quota')) {
      return { error: 'API 额度不足，请检查你的账户余额' };
    }
    return { error: msg };
  }
}

async function callOpenAICompatible(provider, apiKey, model, messages) {
  const url = provider.baseUrl + provider.path;
  const body = {
    model,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages,
    ],
    max_tokens: 500,
    temperature: 0.7,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API 请求失败 (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('AI 返回了空内容');
  }

  return { content };
}

async function callClaude(provider, apiKey, model, messages) {
  const url = provider.baseUrl + provider.path;
  const body = {
    model,
    system: SYSTEM_PROMPT,
    messages: messages.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
    max_tokens: 500,
    temperature: 0.7,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API 请求失败 (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const content = data.content?.[0]?.text;
  if (!content) {
    throw new Error('AI 返回了空内容');
  }

  return { content };
}

async function testConnection(providerId, apiKey, model) {
  const provider = PROVIDERS[providerId];
  if (!provider) return { error: '未知提供商' };

  const testMessages = [{ role: 'user', content: '你好，请回复"连接成功"两个字' }];
  try {
    let result;
    if (provider.format === 'claude') {
      result = await callClaude(provider, apiKey, model, testMessages);
    } else {
      result = await callOpenAICompatible(provider, apiKey, model, testMessages);
    }
    return { success: true, content: result.content };
  } catch (err) {
    return { error: err.message };
  }
}

function getConfig() {
  return new Promise(resolve => {
    chrome.storage.sync.get(['provider', 'apiKey', 'model'], resolve);
  });
}
