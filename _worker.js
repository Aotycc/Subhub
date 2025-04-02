// @ts-nocheck
/**
 * KV 绑定声明
 * @typedef {Object} Env
 * @property {KVNamespace} SUBLINK_KV - 用于存储节点信息的短链接
 * @property {KVNamespace} TEMPLATE_KV - 用于存储配置模板
 * @property {string} TEMPLATE_PASSWORD - 模板管理密码
 * @property {string} DEFAULT_TEMPLATE_URL - 默认配置模板链接
 * 
 */

import { handleConvertRequest } from './base.js';
import { handleClashRequest } from './clash.js';
import { handleSingboxRequest } from './singbox.js';
import { generateHtml } from './htmlBuilder.js';
import { 
    handleGenerateConfig, 
    handleGetTemplate, 
    handleListTemplates, 
    handleDeleteTemplate,
    generateTemplateManagerHTML
} from './tempmanager.js';

/**
 * 处理请求
 * @param {Request} request
 * @param {Env} env
 */
async function handleRequest(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 处理页面请求
    if (request.method === 'GET' && path === '/') {
        return new Response(generateHtml(), {
            headers: { 'Content-Type': 'text/html' }
        });
    }

    // 处理节点保存请求
    if (path === '/save' && request.method === 'POST') {
        return handleSaveRequest(request, env);
    }

    // 处理转换请求
    if (path === '/base') {
        return await handleConvertRequest(request, env);
    }

    // 处理 SingBox 请求
    if (path === '/singbox') {
        return await handleSingboxRequest(request, env);
    }

    // 处理 Clash 请求
    if (path === '/clash') {
        return await handleClashRequest(request, env);
    }

    // 获取模板列表
    if (request.method === 'GET' && path === '/peizhi/api/templates') {
        return handleListTemplates(request, env);
    }

    // 删除模板
    if (request.method === 'DELETE' && path.startsWith('/peizhi/api/templates/')) {
        return handleDeleteTemplate(request, url, env);
    }

    // 生成配置
    if (request.method === 'POST' && path === '/peizhi/api/generate') {
        return handleGenerateConfig(request, env);
    }

    // 获取模板
    if (path.startsWith('/peizhi/template/')) {
        const response = await handleGetTemplate(request, url, env);
        // 添加 CORS 头
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        };
        
        // 处理 OPTIONS 请求
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }
        
        // 为其他请求添加 CORS 头
        Object.entries(corsHeaders).forEach(([key, value]) => {
            response.headers.set(key, value);
        });
        return response;
    }

    // 处理模板管理的主页
    if (path === '/peizhi') {
        return new Response(generateTemplateManagerHTML(), {
            headers: {
                'content-type': 'text/html;charset=UTF-8',
            },
        });
    }

    return new Response('Not Found', { status: 404 });
}

/**
 * 处理节点保存请求
 * @param {Request} request
 * @param {Env} env
 */
async function handleSaveRequest(request, env) {
    if (request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const { nodes } = await request.json();
        if (!nodes) {
            return new Response('No nodes provided', { status: 400 });
        }

        const id = crypto.randomUUID();
        
        await env.SUBLINK_KV.put(id, nodes, {
            expirationTtl: 86400 // 24小时过期
        });

        return new Response(JSON.stringify({ id }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        // 保留错误日志，这对于排查问题很重要
        console.error('Save nodes error:', error);
        return new Response(`Internal Server Error: ${error.message}`, { 
            status: 500,
            headers: { 'Content-Type': 'text/plain' }
        });
    }
}

export default {
    async fetch(request, env, ctx) {
        try {
            return await handleRequest(request, env);
        } catch (error) {
            return new Response(JSON.stringify({
                error: error.message || 'Internal Server Error'
            }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    }
};
