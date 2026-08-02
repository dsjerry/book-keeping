# Bug 记录与修复

本文档记录本项目开发过程中遇到并解决的 bug，以及排查思路，供后续开发参考。

## 1. 颜色拼接崩溃：MD3 主题色是 rgba 格式（严重）

**现象**：运行时崩溃 `Unable to parse color from string: rgba(255, 255, 255, 1)1A`，位置在 `Chip`/`LinearCard`。

**根因**：react-native-paper 5.12 的 MD3 tokens 里**所有颜色都是 `rgba(r, g, b, 1)` 格式**（`onPrimary: 'rgba(255, 255, 255, 1)'`、`primary: 'rgba(103, 80, 164, 1)'`），而不是 hex。代码里用字符串拼接透明度后缀 `theme.colors.onPrimary + '1A'`，生成 `rgba(255, 255, 255, 1)1A` 这种非法颜色。

**影响范围**：所有 `theme.colors.X + 'XX'` 拼接（全项目搜出 5 个文件 16 处，含 `LinearCard`、`DetailScreen`、`AddressList`、`AddingScreen`、`UserScreen` 的渐变卡——个人中心渐变其实也一直在崩，只是没访问到）。

**修复**：
- 新增 `src/utils/color.ts` 的 `withAlpha(value, alpha)` 工具（用 `color` 库安全解析任意颜色格式并叠加透明度）
- 新增 `types/color.d.ts` 最小类型声明（`color` 是 paper 的传递依赖，无 `@types/color`）
- 全量替换所有 `theme.colors.X + 'XX'` 拼接为 `withAlpha(theme.colors.X, alpha)`

**教训**：**永远不要用字符串拼接给主题色加透明度**。任何颜色都要走 `withAlpha`。Hex 透明度后缀（`+'80'`）只在颜色确定是 hex 时有效，而 MD3 主题色是 rgba。

---

## 2. Ucrop 裁剪界面顶到状态栏（Android 15 edge-to-edge）

**现象**：编辑信息页裁剪头像时，裁剪界面顶部内容飞到状态栏后面。

**根因**：项目 `targetSdk = 35`（Android 15）+ 真机 Android 16。**Android 15+ 强制 edge-to-edge**，所有 Activity 默认绘制到系统栏后面。Ucrop 裁剪 Activity（`com.yalantis.ucrop.UCropActivity`，由 `react-native-image-crop-picker` 的 `openCropper` 使用）布局未适配 insets，toolbar 被状态栏遮挡。

**排查**：解压 gradle 缓存里的 `ucrop-2.2.6-native.aar`，确认其布局 `ucrop_activity_photobox.xml` 根节点无 `fitsSystemWindows`，classes.jar 无 insets 处理。

**修复**（纯原生配置）：
1. `android/app/src/main/res/values/styles.xml` 新增主题：
   ```xml
   <style name="UcropTheme" parent="Theme.AppCompat.Light.NoActionBar">
       <item name="android:windowOptOutEdgeToEdgeEnforcement">true</item>
   </style>
   ```
   `windowOptOutEdgeToEdgeEnforcement` 是 Android 15 官方提供的 edge-to-edge 退出开关（API 35+ 生效，低版本自动忽略）。
2. `AndroidManifest.xml` 覆盖 Ucrop Activity 主题：
   ```xml
   <activity
       android:name="com.yalantis.ucrop.UCropActivity"
       android:theme="@style/UcropTheme"
       tools:replace="android:theme" />
   ```
   `tools:replace` 解决与库 manifest 声明的主题合并冲突。

**验证**：`./gradlew :app:processDebugMainManifest` 后检查 `merged_manifest/.../AndroidManifest.xml` 确认 `@style/UcropTheme` 生效。

---

## 3. 抽屉高亮崩溃：useNavigationState 收到 undefined state

**现象**：`Cannot read property 'routes' of undefined`，崩溃栈在 `CustomDrawerContent`。

**根因**：react-navigation 6.x 的 `useNavigationState` 源码：
```js
navigation.addListener('state', e => {
  setResult(selectorRef.current(e.data.state)) // ← 部分导航事件 e.data.state 是 undefined
})
```
导航的 `state` 事件中 `e.data.state` 并非总是携带 state（嵌套导航切换时可能为 undefined），selector 直接访问 `state.routes[state.index].name` 就崩了。这是 react-navigation 的已知行为，不是业务逻辑错误。

**修复**：防御式访问：
```ts
const currentRouteName = useNavigationState(state => state?.routes?.[state?.index ?? 0]?.name ?? '')
```
state 为 undefined 时返回 `''`，`currentTarget` 为 `''`，导航项不高亮（安全降级）。

**教训**：**会话中断/checkpoint 恢复可能导致已做的磁盘编辑丢失**。本 bug 修复过一次但未落盘（用户复测仍报错），排查发现第 39 行还是旧代码。重大修复后务必**读回文件确认落盘**。

---

## 4. 分析页卡顿：echarts 图表反复销毁重建

**现象**：分析页进入时即使只有一条数据也很卡顿。

**根因**：
- `Home.tsx` 在 render 里直接调用 `chartData.getLocation(false)` → 每次重渲染生成**新数组引用**
- `Charts.tsx` 图表组件（`PiePane`/`CountBarChart`）的 `useEffect` 依赖 `data` → 引用一变就 `dispose()` 旧图表 + `echarts.init()` 重建
- 结果：页面任何重渲染（切 tab、AI 分析、loading 变化）都让 **4 个 echarts 实例全部销毁重建**。`echarts.init` 是重操作，一条数据也卡。

**修复**：
1. `Home.tsx` 用 `useMemo` 缓存所有图表数据（`tagCounts`/`aliasCountArray`/`data`/新增 `locationData`），传稳定引用
2. `Charts.tsx` 两个图表组件包 `React.memo`——Home 重渲染时 props 稳定则不重渲染、effect 不重跑

**效果**：图表只在首次挂载和数据真正变化时初始化。

**教训**：图表/重量级组件的 props 必须稳定（useMemo）；`React.memo` 是必要防线。

---

## 5. 分析页卡片阴影异常

**现象**：分析页卡片出现阴影。

**根因**：`Animated.View` 的 `opacity: fadeAnim` 动画（支出/收入切换的淡入淡出）导致卡片阴影渲染异常。

**修复**：移除动画。删除 `fadeAnim`/`slideAnim` 状态、`onCountTypePress` 简化为直接切换、`Animated.View` 改回 `View`（保留分享截图的 `ref`/`collapsable={false}`）、移除 `Animated` import。

---

## 6. 编辑标签页业务逻辑 bug 集合

`src/pages/user/AddTagsScreen.tsx` + `src/store/userStore.ts` 审查发现的逻辑问题：

| 问题 | 说明 | 修复 |
|---|---|---|
| 全角逗号只替换第一个 | `replace('，', ',')` 字符串参数只替换首个匹配，`"吃，喝，玩"` 拆分错误 | `replace(/[,，]/g, ',')` 全局替换 |
| 多标签同 ID | `Date.now().toString()` 在同一次 map 里所有 id 相同 → key 冲突 | `` `${Date.now()}-${index}` `` |
| 改名不保存 | 对话框 `onChangeText` 只改本地 state，关闭无保存动作 | store 新增 `updateTag`（按 id 更新）+ 对话框"保存"按钮 + 关闭自动保存 |
| Set 去重失效 | `[...new Set([...old, ...new])]` 对对象做引用去重，新建 tag 每次新引用 → 去重无效 | 按 id 用 `Map` 去重 |
| removeTag 引用比较 | `filter(t => t !== tag)` 依赖渲染 item 与 store 内同一引用，脆弱 | 改为 `t.id !== tag.id` |
| 空态永远不显示 | `currentUser?.tags?.length == 0` 判断"全部标签为空"，默认标签常在则恒 false | 改为 `customTags.length === 0`（只针对自定义标签） |

---

## 7. Metro 缓存导致看不到新代码

**现象**：代码已改（磁盘确认），但真机/模拟器样式还是旧版。

**原因**：Metro bundler 缓存旧 bundle。

**解决**：`yarn start --reset-cache`，或直接 `yarn android` 重新构建安装。改 `.env` 后必须重新构建（react-native-config 是原生构建期注入，热更新不生效）。

---

## 8. CI 打包缺少 .env（已解决）

**现象**：`.github/workflows/android-build.yml` 打包的 APK 功能残缺（AI 分析、高德定位、后端同步用不了）。

**根因**：`.env` 已 git 忽略（`.gitignore` 治理），但 workflow **没有任何创建 `.env` 的步骤**。`react-native-config` 构建期注入 `.env`（`DEEPSEEK_API_KEY`、`AMAP_API_KEY`、`AMAP_ANDROID_KEY`、`API_URL` 等），CI checkout 后无 `.env` → 全部为空。

**修复（ENV_BASE64 方案）**：
1. workflow 增加 `Create .env from secret` 步骤：
   ```yaml
   - name: Create .env from secret
     run: echo "${{ secrets.ENV_BASE64 }}" | base64 --decode > .env
   ```
2. 在 GitHub 仓库 **Settings → Secrets and variables → Actions** 添加 secret `ENV_BASE64`（值为本地 `.env` 的 base64 编码）：
   - Windows: `[Convert]::ToBase64String([IO.File]::ReadAllBytes(".env"))`
   - Linux: `base64 -w0 .env`

**CI 需要的 Secrets**（release 签名）：`KEYSTORE_BASE64`（keystore 的 base64）、`KEY_ALIAS`、`KEYSTORE_PASSWORD`、`KEY_PASSWORD`。`GITHUB_TOKEN` 自动注入无需配置（workflow 需 `permissions: contents: write`）。

**注意**：每次改 `.env`（换 key 等）都要重新生成 base64 并更新 `ENV_BASE64` secret，否则 CI 用的还是旧值。

---

## 9. expo 模块与 RN 版本硬绑定：expo-gaode-map 需要 SDK 51+（已回退）

**背景**：想从 `react-native-amap3d` 切换到 `expo-gaode-map`（TomWq/expo-gaode-map-skill）。按 Skill 文档接入，最终**回退**——记录踩坑过程供参考。

**踩坑过程**：
1. 装了 `expo-modules-core` + `expo-gaode-map` + `expo`，按 SDK 50 模板配置原生：
   - `settings.gradle` 加 `useExpoModules()`（expo 的 autolinking）
   - `MainApplication.kt` 包 `ReactNativeHostWrapper` + `ApplicationLifecycleDispatcher`
   - `MainActivity.kt` 包 `ReactActivityDelegateWrapper`
2. 连续遇到 gradle 报错：
   - `expo-modules-core` 版本不匹配（顶层装 1.12.26 vs expo@50 需要 1.11.14）→ `SoftwareComponent 'release' not found`
   - AGP 8.6 下 `components.release` 不存在（AGP 8.2+ 移除默认 release component）
   - `Plugin [id: 'expo-module-gradle-plugin'] was not found`

**根因（决定性）**：`expo-gaode-map` 的 `build.gradle` 强制 `id 'expo-module-gradle-plugin'`——这是 **expo SDK 51+ 引入的机制**（`expo-modules-core` 的 `expo-module-gradle-plugin` 子项目只在 main/SDK 51+ 分支存在）。而本项目 **RN 0.73 对应 expo SDK 50**，SDK 50 的 expo 模块用旧机制 `applyKotlinExpoModulesCorePlugin()`（`ExpoModulesCorePlugin.gradle`）。**版本断层，非配置问题**。

**教训**：
- **expo 模块与 RN/expo SDK 版本强绑定**。选型前先确认：模块要求的 gradle 插件机制 ↔ 项目 RN 版本对应的 expo SDK。
- SDK 50 的 expo 模块（`ExpoModulesCorePlugin.gradle`）≠ SDK 51+ 的模块（`expo-module-gradle-plugin`），二者构建脚本不互通。
- 用 expo-gaode-map 需 RN 0.73 → 0.74+（expo SDK 51+），是大工程。

**处理**：回退到 `react-native-amap3d@3.2.4`（移除 expo 三件套、回滚原生配置）。amap3d 之前的"Element type is invalid"崩溃是**默认导入错误**（amap3d 无 `export default`，需命名导入 `import { MapView, Marker, AMapSdk } from 'react-native-amap3d'`），已修复，地图功能可用。

---

## 10. amap3d 地图选点在 RN 0.73 旧架构下崩溃（最终方案：WebView + JSAPI）

**背景**：amap3d 地图选点在页面关闭（goBack）时原生崩溃（`concurrent teardown`），与 RN 架构有关。

**排错过程**：

1. **第一反应：交互模式问题**——查到 gowherer 项目（RN 0.83 新架构）用 amap3d 选点正常，其 `confirmLocation` 在返回前先 `setMapVisible(false)` 卸载地图再 goBack。但将相同模式应用到本项目（RN 0.73 旧架构）后**仍崩溃**。

2. **架构差异确认**——gowherer 是 **RN 0.83（新架构）**，当前项目是 **RN 0.73（旧架构）**。同一 amap3d 3.2.4 版本、同一交互模式，一个能用一个崩。**amap3d 3.x 原生视图在 RN 0.73 旧架构下销毁路径有缺陷，JS 层无法规避**。

3. **尝试 expo-gaode-map**——分析了 gowherer（expo SDK 55）的迁移方案。但 expo-gaode-map 2.x 强制用 `expo-module-gradle-plugin`（SDK 51+ 机制），与本项目的 RN 0.73/SDK 50 **硬性不兼容**（见 #9）。

4. **最终方案：WebView + 高德 Web JSAPI**——用 `react-native-webview` 内嵌高德 JSAPI v2.0 地图（参考 `AMap-Web/amap-skills` Skill），完全绕开原生 SDK。

**当前方案（WebView + 高德 JSAPI）**：
- `AddressList.tsx` 顶部用 `react-native-webview` 加载内嵌 HTML（`buildMapHtml`）
- HTML 加载 `webapi.amap.com/loader.js` + `AMapLoader.load({ key, version: '2.0' })`
- 地图点击：`map.on('click')` → `AMap.Marker` → `AMap.Geocoder` 逆编码 → `postMessage` 回传 RN
- RN 侧 `onMessage` 收到地址 → 显示"使用该位置"确认按钮 → `dispatch` + `goBack`
- 下方保留地址列表（Web 服务 API regeo，原有逻辑不变）
- 点击地图返回崩溃问题**完全规避**——WebView 组件的卸载由 RN 系统管理，不涉及原生视图并发拆除

**踩坑（WebView 布局）**：FlatList 未设 `style={{ flex: 1 }}`，在 `flex: 1` 容器里会扩展覆盖 WebView（地图区域不可见）。修复：给 FlatList 加 `style={{ flex: 1 }}`。

**依赖变更**：安装 `react-native-webview@14.0.1`（原生库），移除 `react-native-amap3d`（废弃的 `src/components/Map.tsx` 一并删除）。`react-native-webview` 要求 `minSdkVersion 24`（项目从 23 提升到 24）。删除 biometrics 库 codegen 坏文件的 gradle hack 仍保留（见 #11）。

**需要的 key**：
- `AMAP_JSAPI_KEY`：高德控制台 → Web端(JS API) → 申请 key
- `AMAP_JSAPI_SECURITY_CODE`：高德控制台 → 对应的 JSAPI 安全密钥（v2.0 必须）
- 写入 `.env` + `.env.example`（需重新构建注入）

**可扩展**：高德 Web JSAPI 还提供周边搜索（`PlaceSearch`）、路线规划（`Driving/Walking`）、选址组件（`Geocoder`），如后续需要可在 WebView 内集成。

**参考**：高德 Web JSAPI Skill 仓库 `AMap-Web/amap-skills`——含地图初始化、Marker、逆编码、事件监听等完整参考文档。

---

## 11. @sbaiahmed1/react-native-biometrics codegen 坏文件问题

**现象**：`compileDebugJavaWithJavac` 失败，错误 `NativeReactNativeBiometricsSpec.java:38: mEventEmitterCallback.invoke("onBiometricChange", value)` 找不到符号。

**根因**：该库（0.7.2）的 codegen 生成的 `NativeReactNativeBiometricsSpec.java` 引用了不存在的方法（codegen 生成代码有 bug）。生成的文件在 `node_modules/@sbaiahmed1/react-native-biometrics/android/src/main/java/.../generated/`（源码目录内）。

**修复**：`android/build.gradle` 加 gradle 任务——编译前自动删除该 `generated` 目录：
```gradle
gradle.projectsEvaluated {
    def bioProject = gradle.rootProject.subprojects.find { it.path == ':sbaiahmed1_react-native-biometrics' }
    if (bioProject != null) {
        bioProject.tasks.configureEach { task ->
            if (task.name == 'compileDebugJavaWithJavac' || task.name == 'compileReleaseJavaWithJavac') {
                task.doFirst {
                    def genDir = new File(bioProject.projectDir, 'src/main/java/com/sbaiahmed1/reactnativebiometrics/generated')
                    if (genDir.exists()) genDir.deleteDir()
                }
            }
        }
    }
}
```
删除后 codegen 重新生成，再次被编译前任务删除。库自身实现（无 spec）可正常编译。

**注意**：CI workflow 也有同样的删除步骤（`Remove problematic generated directory`），是同一个 workaround 的 CI 版本。
