export default hydrogenRoutes([
    ...(await flatRoutes()),
    // 可以在这个数组中添加手动路由定义，作为文件路由约定的补充或替代
    // 更多详情请参考 https://remix.run/docs/en/main/guides/routing
  ]) satisfies RouteConfig;