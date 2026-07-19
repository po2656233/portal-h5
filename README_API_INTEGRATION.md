# 某某视频 & 漫画小说社区 后端 API 接口对接指南 (ThinkPHP 5.x)

本指南旨在指导后端开发人员如何基于 **ThinkPHP 5.0 / 5.1** 框架，无缝实现与本前端应用进行生产数据接入的接口规范，并详细介绍如何进行 **Base64 格式图像资源** 的防盗链安全设计与前端渲染对接。

---

## 一、 系统架构与网络配置说明

在您部署 ThinkPHP 5.x 服务端之后，可直接在前端应用的 **【我的】->【系统设置】** 中配置：
1. **服务端 API 域名**（例如：`https://api.banana-tp5.com`）
2. **Referer 请求头**（防盗链校验头，例如：`https://h5.banana-tp5.com`）

**工作流逻辑：**
- 当 **域名不为空** 时，前端会优先自动发起真正的 `fetch` 网络请求访问您的 TP5 服务器，并在 Header 中附带您配置的 `Referer`。
- 当 **域名为空** 时，前端会自动降级并无缝回退至本地精美、全功能的 Mock 沙箱环境，保证应用永远能够流畅运行。

---

## 二、 ThinkPHP 5.x 路由配置规范 (`route/route.php`)

请在您的 ThinkPHP 5 项目路由配置文件中定义以下 RESTful 接口路由，确保与前端默认路径完全契合：

```php
use think\Route;

// 开启全局跨域劫持（推荐在 API 模块下通过中间件或全局配置实现）
Route::group('api', function() {
    
    // 1. 用户与主副钱包模块
    Route::get('user/profile', 'api/User/getProfile');          // 获取用户资料
    Route::post('user/profile/update', 'api/User/updateProfile'); // 更新资料
    Route::get('user/wallet', 'api/User/getWallet');            // 获取钱包余额
    Route::post('wallet/deposit', 'api/Wallet/deposit');        // 资金充值 (USDT / 银行卡)
    Route::post('wallet/transfer', 'api/Wallet/transfer');      // 一键额度转换 (主钱包 <-> 游戏钱包)
    Route::post('wallet/redeem', 'api/Wallet/redeem');          // 充值卡密激活
    
    // 2. 视频资源管理模块
    Route::get('video/long/categories', 'api/Video/getLongCategories'); // 获取长视频分类
    Route::get('video/long/list', 'api/Video/getLongList');             // 过滤并获取长视频列表
    Route::get('video/short/recommend', 'api/Video/getShortRecommend'); // 获取瀑布流短视频
    Route::get('video/short/curated', 'api/Video/getShortCurated');     // 获取精选合辑短视频
    
    // 3. 游戏与实时播报模块
    Route::get('chess/list', 'api/Chess/getGames');                    // 获取游戏列表
    Route::get('games/winners', 'api/Chess/getWinners');               // 实时中奖榜单轮播
    
})->header([
    'Access-Control-Allow-Origin'  => '*', // 生产环境请修改为您的实际 H5 域名
    'Access-Control-Allow-Headers' => 'Authorizations, Content-Type, If-Match, If-None-Match, If-Modified-Since, X-Requested-With, X-Referer, Referer',
    'Access-Control-Allow-Methods' => 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
]);
```

---

## 三、 统一 API 响应格式 (ThinkPHP5 基类 Controller)

为保持通信规范一致，请在您的 TP5 核心基类控制器（如 `app\api\controller\Base.php`）中封装统一输出 JSON 格式的方法：

```php
<?php
namespace app\api\controller;

use think\Controller;
use think\Response;

class Base extends Controller
{
    /**
     * 统一成功 JSON 返回
     */
    protected function successJson($data = [], $message = '成功', $code = 200)
    {
        $response = [
            'code'    => $code,
            'message' => $message,
            'data'    => $data
        ];
        return Response::create($response, 'json')->code(200);
    }

    /**
     * 统一错误 JSON 返回
     */
    protected function errorJson($message = '操作失败', $code = 400, $data = null)
    {
        $response = [
            'code'    => $code,
            'message' => $message,
            'data'    => $data
        ];
        return Response::create($response, 'json')->code(200); // 即使业务错误，HTTP状态码仍建议返回200
    }
}
```

---

## 四、 Base64 格式图片资源加密传输与前端渲染机制

在成人漫画、小说插图、私密写真等高保密和防爬虫防盗链场景中，**使用 Base64 图片协议流** 是业界最常用的高强度保护手段。

### 1. 服务端 TP5 将本地保密图片流转化为 Base64

在您的 ThinkPHP 控制器（例如 `app\api\controller\Manga.php`）中，编写转换逻辑：

```php
<?php
namespace app\api\controller;

class Manga extends Base
{
    /**
     * 获取受保护的漫画页面图片 (加密转化为 Base64)
     */
    public function getMangaPage()
    {
        // 1. 防盗链请求头校验 (根据前端设置的 Referer 或 X-Referer)
        $referer = request()->header('referer') ?: request()->header('x-referer');
        $allowedReferer = 'https://h5.banana-tp5.com'; // 允许的Referer

        if (empty($referer) || strpos($referer, $allowedReferer) === false) {
            return $this->errorJson('非法盗链请求，IP已记录！', 403);
        }

        // 2. 获取图片真实磁盘路径
        $imagePath = ROOT_PATH . 'public/uploads/manga/page_01.jpg';
        
        if (!file_exists($imagePath)) {
            return $this->errorJson('图片不存在', 404);
        }

        // 3. 读取二进制字节并转换为标准 Base64 字符串
        $imgData   = file_get_contents($imagePath);
        $mimeType  = mime_content_type($imagePath); // e.g. "image/jpeg"
        $base64Str = 'data:' . $mimeType . ';base64,' . base64_encode($imgData);

        return $this->successJson([
            'image' => $base64Str
        ]);
    }
}
```

### 2. 前端 React/TypeScript 解析与流畅渲染

在前端接收到服务端返回的 `base64` 字符串后，**无需任何多余的转换步骤**，可以直接绑定在 HTML `<img>` 标签的 `src` 属性中进行渲染，极为高效：

```tsx
import React, { useState, useEffect } from 'react';

export default function MangaReader({ pageId }) {
  const [imgSrc, setImgSrc] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // 调用 TP5 封装后的获取接口
    fetch(`https://api.banana-tp5.com/api/manga/page?id=${pageId}`, {
      headers: {
        'X-Referer': 'https://h5.banana-tp5.com' // 附加防盗链校验头
      }
    })
      .then(res => res.json())
      .then(res => {
        if (res.code === 200) {
          // 直接将 "data:image/jpeg;base64,xxxx..." 塞入状态
          setImgSrc(res.data.image);
        }
      })
      .finally(() => setLoading(false));
  }, [pageId]);

  if (loading) return <div>高清资源加载中...</div>;

  return (
    <div className="w-full flex justify-center">
      <img 
        src={imgSrc || 'placeholder.jpg'} 
        alt="Protected Manga Page" 
        className="w-full h-auto object-contain shadow-2xl rounded-xl"
        // 强烈推荐配置 referrerPolicy="no-referrer" 或带有 referer 请求保护
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
```

---

## 五、 防盗链 Referer 与跨域配置 (CORS) 避坑指南

1. **防盗链 Bypass 机制**：
   在纯浏览器环境下，因为同源策略的安全限制，`fetch` 行为的 `Referer` 是浏览器内核强制锁定的（通常是当前网页所在的 Origin，如 `https://pre-domain... Asia-southeast1.run.app`）。
   - **解决方案**：您的 TP5 后端应该读取自定义头 `request()->header('x-referer')` 或 `request()->header('x-target-referer')` 来替代或作为 `referer` 的平滑回退，这样前端设置的 `X-Referer` 将会100%成功匹配，从而彻底解决浏览器锁死 Referer 头的问题。
   
2. **CORS OPTIONS 预检请求**：
   自定义请求头（如 `X-Referer`）会导致浏览器触发 OPTIONS 跨域预检。您的 TP5 必须能快速响应任何带 `OPTIONS` 的请求（HTTP 状态码 200 或 204），并包含以下关键 CORS 头部：
   - `Access-Control-Allow-Origin: *` 或者特定的域名。
   - `Access-Control-Allow-Headers: Content-Type, X-Referer, Referer, Authorization`。

按照此套指南开发，即可享受最高安全、极致防爬的无缝全功能对接！
