# TODO

1. [ ] 统一颜色

# 问题

1. [ ] navigation 导航的时候导航参数要断言为 never

# 依赖

## 渐变色

启用渐变色与 web 端不同，需要安装另外依赖

```shell
yarn add react-native-linear-gradient
```

## 路径别名

需要另外安装依赖

```shell
yarn add babel-plugin-module-resolver
```

然后在 babel 配置的 plugins 数组中添加别名配置，也需要在 `tsconfig.json` 中配置对应路径

```js
;[
  'module-resolver',
  {
    root: ['./src'],
    alias: {
      pages: './src/pages',
    },
  },
]
```
