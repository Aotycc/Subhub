import { styleCSS } from './style.js';

// 修改 API 路径
const API_BASE = '/template-manager';

// 修改 HTML 部分
const configSection = `
<div class="config-section">
    <div class="form-group">
        <label for="templateUrl">模板链接:</label>
        <input type="text" id="templateUrl" placeholder="可填入链接或选择下方的模版" />
    </div>
    
    <div class="form-group template-list">
        <div class="template-header mb-3">
            <label class="block font-medium text-gray-700">选择已保存的模板:</label>
            <button id="manageTemplateBtn" class="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                </svg>
                <span>模板管理</span>
            </button>
        </div>
        <div id="templateList" class="template-items bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-2 gap-2 p-2">
            <div class="loading col-span-2">加载中...</div>
        </div>
    </div>
</div>
`;

// 修改 JavaScript 部分
const templateManagerScript = `
class TemplateManager {
    constructor() {
        this.loadTemplates();
        this.initManageButton();
    }

    initManageButton() {
        const manageBtn = document.getElementById('manageTemplateBtn');
        if (manageBtn) {
            manageBtn.addEventListener('click', () => {
                window.open('/peizhi', '_blank');
            });
        }
    }

    async loadTemplates() {
        try {
            const response = await fetch('/peizhi/api/templates');
            if (!response.ok) throw new Error('Failed to load templates');
            
            const templates = await response.json();
            this.renderTemplates(templates);
        } catch (error) {
            console.error('Load templates error:', error);
            document.getElementById('templateList').innerHTML = 
                '<div class="error col-span-2">加载模板失败，请刷新重试</div>';
        }
    }

    renderTemplates(templates) {
        const templateList = document.getElementById('templateList');
        if (!templates.length) {
            templateList.innerHTML = '<div class="empty col-span-2">暂无保存的模板</div>';
            return;
        }

        templateList.innerHTML = templates
            .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
            .map(template => {
                const createTime = new Date(template.createTime).toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                // 生成内部模板URL
                const internalTemplateUrl = 'https://inner.template.secret/id-' + template.id;
                
                return \`
                    <div class="template-item hover:bg-gray-100 transition-colors duration-200 p-3 rounded-lg border border-gray-200" 
                       data-url="\${internalTemplateUrl}"
                        onclick="document.getElementById('templateUrl').value = this.dataset.url">
                        <div class="template-info">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center space-x-2">
                                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                    </svg>
                                    <span class="template-name font-medium text-gray-900">\${template.name}</span>
                                </div>
                                <button class="view-btn p-1 hover:bg-gray-200 rounded" onclick="window.open('/peizhi/template/\${template.id}', '_blank')">
                                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                    </svg>
                                </button>
                            </div>
                            <div class="flex items-center mt-1 space-x-2">
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <span class="template-time text-gray-500">\${createTime}</span>
                            </div>
                        </div>
                    </div>
                \`;
            })
            .join('');

        // 添加点击事件
        templateList.querySelectorAll('.template-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // 如果点击的是查看按钮，不触发选择事件
                if (e.target.closest('.view-btn')) return;
                
                const templateUrl = item.dataset.url;
                document.getElementById('templateUrl').value = templateUrl;
                
                // 更新选中状态
                templateList.querySelectorAll('.template-item').forEach(i => 
                    i.classList.remove('selected'));
                item.classList.add('selected');
            });
        });
    }
}

// 初始化模板管理器
new TemplateManager();
`;

// 修改 generateHtml 函数
export function generateHtml() {
    return `<!DOCTYPE html>
<html lang="zh">
<head>
    <title>SubHub</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://unpkg.com/tailwindcss@2/dist/tailwind.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"></script>
    <style>${styleCSS}</style>
</head>
<body class="bg-gray-50">
    <div class="max-w-3xl mx-auto p-4">
        <h1 class="text-2xl font-bold text-center mb-6">SubHub订阅转换</h1>
        
        <div class="bg-white rounded-lg shadow p-6 space-y-6">
            <!-- 输入类型选择 -->
            <div class="input-type-section bg-gray-50 p-4 rounded-lg">
                <h2 class="text-lg font-semibold mb-3">输入类型</h2>
                <div class="space-x-4">
                    <label class="radio-label inline-flex items-center">
                        <input type="radio" name="inputType" value="single" checked class="mr-2">
                        <span>独立订阅链接</span>
                    </label>
                    <label class="radio-label inline-flex items-center">
                        <input type="radio" name="inputType" value="multi" class="mr-2">
                        <span>多条节点</span>
                    </label>
 
                </div>
            </div>

            <!-- 节点输入区域 -->
            <div class="space-y-2">
                <label class="block font-medium text-gray-700">节点信息</label>
                <textarea 
                    id="nodeInput" 
                    class="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="输入节点信息或者订阅链接&#10;1、独立订阅不会保留订阅信息&#10;2、多条节点信息会保存入后台，有有效期，谨慎使用！！"
                ></textarea>
            </div>

            <!-- 配置区域 -->
            <div class="space-y-4">
                <div class="form-group">
                    <label for="templateUrl" class="block font-medium text-gray-700">外部模板链接:</label>
                    <input 
                        type="text" 
                        id="templateUrl" 
                        class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="https://raw.githubusercontent.com/..." 
                    />
                </div>
                
                <div class="form-group template-list">
                    <div class="template-header mb-3">
                        <label class="block font-medium text-gray-700">选择已保存的模板:</label>
                        <button id="manageTemplateBtn" class="px-4 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                            </svg>
                            <span>模板管理</span>
                        </button>
                    </div>
                    
                    <div id="templateList" class="template-items bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-2 gap-2 p-2">
                        <div class="loading col-span-2">加载中...</div>
                    </div>
                </div>
            </div>

            <!-- 生成按钮 -->
            <div class="flex justify-center">
                <button 
                    id="generateAllBtn" 
                    type="button" 
                    class="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                    生成所有订阅
                </button>
            </div>

            <!-- 结果区域 -->
            <div id="convertResult" class="space-y-4"></div>
        </div>
    </div>

    <script type="module">
        ${templateManagerScript}
        
        // 工具函数
        window.copyToClipboard = async function(text) {
            try {
                await navigator.clipboard.writeText(text);
                showToast('链接已复制到剪贴板');
            } catch (err) {
                const input = document.createElement('input');
                input.value = text;
                document.body.appendChild(input);
                input.select();
                document.execCommand('copy');
                document.body.removeChild(input);
                showToast('链接已复制到剪贴板');
            }
        };

        window.showQRCode = function(text) {
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            modal.onclick = (e) => {
                if (e.target === modal) modal.remove();
            };

            const content = document.createElement('div');
            content.className = 'bg-white p-6 rounded-lg max-w-sm w-full mx-4';
            
            const title = document.createElement('div');
            title.className = 'text-lg font-bold mb-4 text-center';
            title.textContent = '扫描二维码';

            const qrContainer = document.createElement('canvas');
            qrContainer.className = 'mx-auto';
            
            content.appendChild(title);
            content.appendChild(qrContainer);
            modal.appendChild(content);
            document.body.appendChild(modal);

            // 生成二维码
            QRCode.toCanvas(qrContainer, text, {
                width: 256,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            }, function (error) {
                if (error) {
                    console.error('QR Code generation error:', error);
                    showToast('生成二维码失败');
                }
            });
        };

        window.showToast = function(message) {
            const toast = document.createElement('div');
            toast.className = 'fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300';
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            }, 2000);
        };

        // 检查订阅类型函数
        async function checkSubscriptionType(url) {
            try {
                // 如果不是URL，直接返回空对象
                if (!url.startsWith('http')) return {};
                
                const response = await fetch(url);
                if (!response.ok) return {};
                
                const content = await response.text();
                const isClashFormat = content.includes('proxies:');
                const isCompleteClash = isClashFormat && 
                                        content.includes('proxy-groups:') && 
                                        (content.includes('rules:') || content.includes('rule-providers:'));
                
                return {
                    isClashFormat,
                    isCompleteClash
                };
            } catch (error) {
                console.error('检查订阅类型失败:', error);
                return {};
            }
        }

        class SubscriptionGenerator {
            constructor() {
                this.initEventListeners();
            }

            initEventListeners() {
                var generateAllBtn = document.getElementById('generateAllBtn');
                if (generateAllBtn) {
                    generateAllBtn.onclick = async function() {
                        // 移除之前的结果
                        const oldResults = document.querySelectorAll('.link-block');
                        oldResults.forEach(result => result.remove());

                        var multiRadio = document.querySelector('input[value="multi"]');
                        var singleRadio = document.querySelector('input[value="single"]');
                        var nodeInput = document.getElementById('nodeInput');
                        var templateUrl = document.getElementById('templateUrl');
                        
                        if (!nodeInput || !nodeInput.value) {
                            alert("请输入内容");
                            return;
                        }

                        if (!multiRadio.checked && !singleRadio.checked) {
                            alert("请选择订阅模式");
                            return;
                        }

                        const container = document.querySelector('#convertResult');
                        const templateParam = (templateUrl && templateUrl.value) ? '&template=' + encodeURIComponent(templateUrl.value) : '';
                        
                        if (multiRadio && multiRadio.checked) {
                            try {
                                const response = await fetch('/save', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify({ nodes: nodeInput.value })
                                });

                                if (response.ok) {
                                    const { id } = await response.json();
                                    
                                    // 生成通用订阅链接
                                    const baseUrl = window.location.origin + '/base?url=' + encodeURIComponent('http://inner.nodes.secret/id-' + id);
                                    const baseBlock = \`
                                        <div class="link-block bg-gray-800 p-4 rounded-lg">
                                            <div class="flex justify-between items-center mb-2">
                                                <div class="link-title text-blue-400 font-bold">通用订阅链接</div>
                                                <div class="flex space-x-2">
                                                    <button onclick="showQRCode('\${baseUrl}')" class="p-2 hover:bg-gray-700 rounded transition-colors" title="显示二维码">
                                                        <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v-4m6 0h-2m2 0v4m-6 0h-2m2 0v4m-6-4h2m-2 0v4m0-11v-4m0 0h2m-2 0h10a2 2 0 002-2V4a2 2 0 00-2-2H4a2 2 0 00-2 2v2a2 2 0 002 2z"/>
                                                        </svg>
                                                    </button>
                                                    <button onclick="copyToClipboard('\${baseUrl}')" class="p-2 hover:bg-gray-700 rounded transition-colors" title="复制链接">
                                                        <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <div class="link-url bg-gray-900 p-3 rounded text-white font-mono break-all">
                                                \${baseUrl}
                                            </div>
                                        </div>
                                    \`;
                                    container.insertAdjacentHTML('beforeend', baseBlock);
                                    
                                    // 生成 SingBox 订阅链接
                                    const singboxUrl = window.location.origin + '/singbox?url=' + encodeURIComponent('http://inner.nodes.secret/id-' + id) + templateParam;
                                    const singboxBlock = \`
                                        <div class="link-block bg-gray-800 p-4 rounded-lg">
                                            <div class="flex justify-between items-center mb-2">
                                                <div class="link-title text-blue-400 font-bold">SingBox 订阅链接</div>
                                                <div class="flex space-x-2">
                                                    <button onclick="showQRCode('\${singboxUrl}')" class="p-2 hover:bg-gray-700 rounded transition-colors" title="显示二维码">
                                                        <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v-4m6 0h-2m2 0v4m-6 0h-2m2 0v4m-6-4h2m-2 0v4m0-11v-4m0 0h2m-2 0h10a2 2 0 002-2V4a2 2 0 00-2-2H4a2 2 0 00-2 2v2a2 2 0 002 2z"/>
                                                        </svg>
                                                    </button>
                                                    <button onclick="copyToClipboard('\${singboxUrl}')" class="p-2 hover:bg-gray-700 rounded transition-colors" title="复制链接">
                                                        <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <div class="link-url bg-gray-900 p-3 rounded text-white font-mono break-all">
                                                \${singboxUrl}
                                            </div>
                                        </div>
                                    \`;
                                    container.insertAdjacentHTML('beforeend', singboxBlock);
                                    
                                    // 生成 Clash 订阅链接
                                    const clashUrl = window.location.origin + '/clash?url=' + encodeURIComponent('http://inner.nodes.secret/id-' + id) + templateParam;
                                    const clashDisplayUrl = clashUrl + '&display=true';
                                    const clashBlock = \`
                                        <div class="link-block bg-gray-800 p-4 rounded-lg">
                                            <div class="flex justify-between items-center mb-2">
                                                <div class="link-title text-blue-400 font-bold">Clash 订阅链接</div>
                                                <div class="flex space-x-2">
                                                    <button onclick="showQRCode('\${clashUrl}')" class="p-2 hover:bg-gray-700 rounded transition-colors" title="显示二维码">
                                                        <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v-4m6 0h-2m2 0v4m-6 0h-2m2 0v4m-6-4h2m-2 0v4m0-11v-4m0 0h2m-2 0h10a2 2 0 002-2V4a2 2 0 00-2-2H4a2 2 0 00-2 2v2a2 2 0 002 2z"/>
                                                        </svg>
                                                    </button>
                                                    <button onclick="copyToClipboard('\${clashUrl}')" class="p-2 hover:bg-gray-700 rounded transition-colors" title="复制下载链接">
                                                        <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                                                        </svg>
                                                    </button>
                                                    <button onclick="copyToClipboard('\${clashDisplayUrl}')" class="p-2 hover:bg-gray-700 rounded transition-colors" title="复制查看链接">
                                                        <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <div class="link-url bg-gray-900 p-3 rounded text-white font-mono break-all">
                                                \${clashUrl}
                                            </div>
                                            <div class="mt-2 grid grid-cols-2 gap-2">
                                                <button onclick="window.open('\${clashUrl}', '_blank')" class="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                                    下载配置
                                                </button>
                                                <button onclick="window.open('\${clashDisplayUrl}', '_blank')" class="p-2 bg-green-600 text-white rounded hover:bg-green-700">
                                                    浏览器查看
                                                </button>
                                            </div>
                                        </div>
                                    \`;
                                    container.insertAdjacentHTML('beforeend', clashBlock);
                                } else {
                                    const errorText = await response.text();
                                    alert("节点保存失败: " + errorText);
                                }
                            } catch (error) {
                                alert("节点保存错误: " + error.message);
                            }
                        } else if (singleRadio && singleRadio.checked) {
                            // 检查是否为完整Clash配置
                            const subscriptionType = await checkSubscriptionType(nodeInput.value);
                            
                            // 生成通用订阅链接
                            const baseUrl = window.location.origin + '/base?url=' + encodeURIComponent(nodeInput.value);
                            const baseBlock = \`
                                <div class="link-block bg-gray-800 p-4 rounded-lg">
                                    <div class="flex justify-between items-center mb-2">
                                        <div class="link-title text-blue-400 font-bold">通用订阅链接</div>
                                        <div class="flex space-x-2">
                                            <button onclick="showQRCode('\${baseUrl}')" class="p-2 hover:bg-gray-700 rounded transition-colors" title="显示二维码">
                                                <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v-4m6 0h-2m2 0v4m-6 0h-2m2 0v4m-6-4h2m-2 0v4m0-11v-4m0 0h2m-2 0h10a2 2 0 002-2V4a2 2 0 00-2-2H4a2 2 0 00-2 2v2a2 2 0 002 2z"/>
                                                </svg>
                                            </button>
                                            <button onclick="copyToClipboard('\${baseUrl}')" class="p-2 hover:bg-gray-700 rounded transition-colors" title="复制链接">
                                                <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="link-url bg-gray-900 p-3 rounded text-white font-mono break-all">
                                        \${baseUrl}
                                    </div>
                                </div>
                            \`;
                            container.insertAdjacentHTML('beforeend', baseBlock);
                            
                            // 生成 SingBox 订阅链接
                            const singboxUrl = window.location.origin + '/singbox?url=' + encodeURIComponent(nodeInput.value) + templateParam;
                            const singboxBlock = \`
                                <div class="link-block bg-gray-800 p-4 rounded-lg">
                                    <div class="flex justify-between items-center mb-2">
                                        <div class="link-title text-blue-400 font-bold">SingBox 订阅链接</div>
                                        <div class="flex space-x-2">
                                            <button onclick="showQRCode('\${singboxUrl}')" class="p-2 hover:bg-gray-700 rounded transition-colors" title="显示二维码">
                                                <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v-4m6 0h-2m2 0v4m-6 0h-2m2 0v4m-6-4h2m-2 0v4m0-11v-4m0 0h2m-2 0h10a2 2 0 002-2V4a2 2 0 00-2-2H4a2 2 0 00-2 2v2a2 2 0 002 2z"/>
                                                </svg>
                                            </button>
                                            <button onclick="copyToClipboard('\${singboxUrl}')" class="p-2 hover:bg-gray-700 rounded transition-colors" title="复制链接">
                                                <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="link-url bg-gray-900 p-3 rounded text-white font-mono break-all">
                                        \${singboxUrl}
                                    </div>
                                </div>
                            \`;
                            container.insertAdjacentHTML('beforeend', singboxBlock);
                            
                            // 生成 Clash 订阅链接
                            const clashUrl = window.location.origin + '/clash?url=' + encodeURIComponent(nodeInput.value) + templateParam;
                            const clashDisplayUrl = clashUrl + '&display=true';
                            
                            // 添加保留原始配置选项（如果检测到是完整Clash配置）
                            let clashOriginalUrl = '';
                            let originalConfigSection = '';
                            
                            if (subscriptionType.isCompleteClash) {
                                clashOriginalUrl = clashUrl + '&useOriginal=true';
                                const clashOriginalDisplayUrl = clashOriginalUrl + '&display=true';
                                
                                originalConfigSection = \`
                                    <div class="mt-2 p-2 bg-yellow-100 rounded text-sm">
                                        <p>检测到完整Clash配置，是否保留原始规则？</p>
                                        <div class="grid grid-cols-2 gap-2 mt-2">
                                            <button onclick="window.open('\${clashUrl}', '_blank')" class="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                                应用模板规则
                                            </button>
                                            <button onclick="window.open('\${clashOriginalUrl}', '_blank')" class="p-2 bg-green-600 text-white rounded hover:bg-green-700">
                                                保留原始规则
                                            </button>
                                        </div>
                                    </div>
                                \`;
                            }
                            
                            const clashBlock = \`
                                <div class="link-block bg-gray-800 p-4 rounded-lg">
                                    <div class="flex justify-between items-center mb-2">
                                        <div class="link-title text-blue-400 font-bold">Clash 订阅链接</div>
                                        <div class="flex space-x-2">
                                            <button onclick="showQRCode('\${clashUrl}')" class="p-2 hover:bg-gray-700 rounded transition-colors" title="显示二维码">
                                                <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v-4m6 0h-2m2 0v4m-6 0h-2m2 0v4m-6-4h2m-2 0v4m0-11v-4m0 0h2m-2 0h10a2 2 0 002-2V4a2 2 0 00-2-2H4a2 2 0 00-2 2v2a2 2 0 002 2z"/>
                                                </svg>
                                            </button>
                                            <button onclick="copyToClipboard('\${clashUrl}')" class="p-2 hover:bg-gray-700 rounded transition-colors" title="复制下载链接">
                                                <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                                                </svg>
                                            </button>
                                            <button onclick="copyToClipboard('\${clashDisplayUrl}')" class="p-2 hover:bg-gray-700 rounded transition-colors" title="复制查看链接">
                                                <svg class="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="link-url bg-gray-900 p-3 rounded text-white font-mono break-all">
                                        \${clashUrl}
                                    </div>
                                    <div class="mt-2 grid grid-cols-2 gap-2">
                                        <button onclick="window.open('\${clashUrl}', '_blank')" class="p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                                            下载配置
                                        </button>
                                        <button onclick="window.open('\${clashDisplayUrl}', '_blank')" class="p-2 bg-green-600 text-white rounded hover:bg-green-700">
                                            浏览器查看
                                        </button>
                                    </div>
                                    \${originalConfigSection}
                                </div>
                            \`;
                            container.insertAdjacentHTML('beforeend', clashBlock);
                        }
                    };
                }
            }
        }

        window.onload = function() {
            new SubscriptionGenerator();
        };
    </script>
</body>
</html>`;
}
