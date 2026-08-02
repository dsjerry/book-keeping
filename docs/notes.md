# 开发注意事项

本项目开发过程中总结的约定与坑，新代码请遵守，避免重复踩坑。

## 设计语言

- **颜色一律走 `theme.colors`**，禁止硬编码 hex（深浅色模式自适应）
- **透明度用 `withAlpha(theme.colors.X, alpha)`**（`~utils`），**严禁 `theme.colors.X + 'XX'` 字符串拼接**——MD3 主题色是 `rgba(r, g, b, 1)` 格式，拼接 hex 透明度后缀会生成非法颜色（见 `docs/bugs.md` #1）
- **统一圆角 12**（卡片、输入框、按钮）
- **卡片风格**：`surfaceVariant` 背景 + `borderRadius: 12` 无边框（个人中心/设置/详情/列表统一）
- Prettier：单引号、无分号、print width 120

## 分享截图

- 截图目标 View 必须设 `ref` + `collapsable={false}`（否则 `captureRef` 截不到）
- 截图区域用 `react-native-view-shot` 的 `captureRef` + `react-native-share` 分享

## 高德地图

- **当前方案：WebView + 高德 Web JSAPI v2.0**（`react-native-webview`）——规避原生 amap3d 在 RN 0.73 旧架构下的并发拆除崩溃（见 `docs/bugs.md` #10）
- **amap-jsapi-skill 仓库**（`AMap-Web/amap-skills`）：高德 JSAPI 完整参考——地图初始化、Marker、逆编码、事件监听、周边搜索、路线规划等
- JSAPI v2.0 必须配置安全密钥：`window._AMapSecurityConfig = { securityJsCode: '...' }`（在 `AMapLoader.load` 前），开发阶段可前端暴露，生产建议用代理
- WebView 用法：`source={{ html }}` 内嵌 HTML → `AMapLoader.load` + `map.on('click')` → `postMessage` 传数据回 RN
- **高德 Web JSAPI key 需单独申请**（"Web端(JS API)"平台，与 Android key 不同）：`AMAP_JSAPI_KEY` + `AMAP_JSAPI_SECURITY_CODE`
- 高德逆地理编码只接受 **GCJ02** 坐标，GPS 返回的是 WGS84——请求前需转换（`src/utils/geo.ts` 的 `wgs84ToGcj02`）
- 坐标系统由环境变量 `COORD_SYSTEM` 控制：`gcj02`（默认，WGS84 转 GCJ02）/ `wgs84`（原样）
- 高德 key 被回收的错误：`status=0`、`infocode=10013`、`info=USER_KEY_RECYCLED`——需去高德控制台申请新 key
- **WebView FlatList 布局**：FlatList 必须设 `style={{ flex: 1 }}`，否则在 `flex: 1` 容器里会扩展覆盖 WebView 地图区域

## 环境变量（react-native-config）

- **构建期注入**：改 `.env` 后必须重新构建（`yarn android`），热更新不生效
- `.env` 不入库（`.gitignore` 已忽略），模板见 `.env.example`
- 新增环境变量时：更新 `.env`、`.env.example`（加注释）、`types/react-native-config.d.ts`（类型声明）三处
- 当前键：`APP_NAME`、`AUTHOR`、`AUTHOR_AKA`、`EMAIL`、`SITE`、`DEEPSEEK_API_KEY`、`AMAP_API_KEY`、`AMAP_ANDROID_KEY`、`AMAP_JSAPI_KEY`、`AMAP_JSAPI_SECURITY_CODE`、`COORD_SYSTEM`、`APP_VERSION`、`API_URL`

## Android 原生

- **targetSdk 35（Android 15+）强制 edge-to-edge**：第三方原生 Activity（如 Ucrop 裁剪）未适配 insets 会内容顶到状态栏，用 `windowOptOutEdgeToEdgeEnforcement` 主题属性退出（见 `docs/bugs.md` #2）
- **minSdkVersion 24**（从 23 提升）：`react-native-webview@14` 要求 minSdk 24
- **@sbaiahmed1/react-native-biometrics codegen 坏文件**：编译前自动删除 `generated` 目录（gradle hack，见 `docs/bugs.md` #11）
- 签名配置：`android/app/build.gradle` 读取 gradle.properties 的 `MYAPP_RELEASE_*`（由 CI 写入）

## 性能

- **图表（echarts/@wuba）初始化开销大**：图表数据必须 `useMemo` 缓存稳定引用，图表组件包 `React.memo`——否则每次重渲染都 `dispose + init` 全部图表（见 `docs/bugs.md` #4）
- **不要在 render 里直接调用计算函数**（如 `chartData.getLocation()`），每次渲染都会生成新引用
- 长列表用 `memo` + `useCallback`（见 `KeepingList` 的实现）

## 导航

- `useNavigationState` 的 selector 可能收到 undefined state（导航 state 事件不带 state）——必须防御式访问 `state?.routes?.[...]?.name ?? ''`（见 `docs/bugs.md` #3）
- 抽屉/嵌套导航获取当前路由：`routeNameToTarget` 映射注意 route name 与 target 的差异（首页 route name 是 `'Home'` 不是 `'HomeScreen'`）

## 开发流程

- **重大修复后读回文件确认落盘**（会话中断/checkpoint 恢复可能导致编辑丢失）
- **看不到新样式先清 Metro 缓存**：`yarn start --reset-cache`
- 提交信息用中文 Conventional Commits 前缀（`feat:`/`fix:`/`refactor:`/`docs:`）
- 验证：`npx prettier --check <files>` + `npx tsc --noEmit`

## CI 打包

- workflow 需要的 Secrets：`KEYSTORE_BASE64`、`KEY_ALIAS`、`KEYSTORE_PASSWORD`、`KEY_PASSWORD`（release 签名）
- **`.env` 通过 `ENV_BASE64` secret 注入**（workflow 的 `Create .env from secret` 步骤 `base64 --decode`）——因为 `.env` 不入库，CI checkout 后没有它，而 `react-native-config` 是构建期注入
- **改 `.env` 后要同步更新 `ENV_BASE64` secret**（重新生成 base64），否则 CI 用旧配置
- 生成 base64：Windows `[Convert]::ToBase64String([IO.File]::ReadAllBytes(".env"))`；Linux `base64 -w0 .env`
