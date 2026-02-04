// src/worker.mjs - Brave Search API 代理
export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const pathname = url.pathname;

        // 1. 定义路由：将不同的路径映射到Brave Search的不同端点
        const routeMap = {
            '/v1/web/search': 'https://api.search.brave.com/res/v1/web/search',
            '/v1/images/search': 'https://api.search.brave.com/res/v1/images/search',
            '/v1/news/search': 'https://api.search.brave.com/res/v1/news/search',
            // 你可以根据需要添加更多端点，例如视频、建议等
        };

        // 2. 查找匹配的路由
        let targetUrl = null;
        for (const [route, apiEndpoint] of Object.entries(routeMap)) {
            if (pathname.startsWith(route)) {
                // 保留原始请求中路径名在路由之后的部分（如果有的话，虽然Brave API通常不需要）
                const suffix = pathname.slice(route.length);
                targetUrl = `${apiEndpoint}${suffix}${url.search}`; // 拼接查询参数
                break;
            }
        }

        // 3. 如果没有匹配到路由，返回404或提示信息
        if (!targetUrl) {
            return new Response('Not Found. Available endpoints: /v1/web/search, /v1/images/search, /v1/news/search', {
                status: 404,
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        // 4. 从环境变量中获取Brave API密钥 (需要在部署平台设置，如 Vercel)
        const BRAVE_API_KEY = env.BRAVE_API_KEY || process.env.BRAVE_API_KEY;
        if (!BRAVE_API_KEY) {
            return new Response('Server configuration error: BRAVE_API_KEY is not set.', { status: 500 });
        }

        // 5. 构建转发到Brave API的请求
        // 注意：我们主要传递原始请求的查询参数（?q=keyword&count=10...），通常不需要请求体。
        const braveRequest = new Request(targetUrl, {
            method: request.method,
            headers: {
                // 携带认证密钥，这是Brave API的要求
                'X-Subscription-Token': BRAVE_API_KEY,
                // 可以选择性传递或设置其他头，如用户代理、接受格式等
                'Accept': 'application/json',
                'User-Agent': request.headers.get('User-Agent') || 'Brave-Search-Proxy/1.0',
            },
            // 如果需要支持POST请求（例如某些高级搜索），你可能需要传递body。
            // 但Brave Search API的GET请求足以完成大部分搜索，这里为了安全，不默认传递body。
            // body: request.body
        });

        try {
            // 6. 转发请求并获取Brave API的响应
            const response = await fetch(braveRequest);
            // 7. 将Brave API的响应返回给客户端
            // 可以在这里对响应进行加工（如统一错误格式、过滤数据等）
            return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
            });
        } catch (error) {
            // 处理网络错误等异常情况
            return new Response(`Proxy error: ${error.message}`, { status: 502 });
        }
    }
};
