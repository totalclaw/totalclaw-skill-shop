# TODO · 待办备注

## 收费项目线上自助购买（暂未开放）

**现状（2026-06-05）**：所有 TotalClaw 自营的收费项目（skill / AI 员工），详情页点击
「购买下载 / 购买员工」**不走线上自助购买**，而是弹出联系窗口，引导联系销售：

> 请联系销售：**13141015749**

**实现位置**：
- `server/market-routes.js` 详情页 `acquire`（收费分支）+ `salesModal`（联系弹窗），常量 `SALES_PHONE`。
- 卡片 CTA「购买下载 →/购买员工 →」点进详情页后再触发弹窗。

**后续恢复线上自助购买**：
- 接入真实支付渠道后，把收费分支的 `data-contact-sales` 按钮换回原下单按钮
  （`btn-buy` + `data-skill` + `data-price`，由 `assets/js/app.js` 的 buy 流程处理：
  创建订单 → 支付 → 解锁正文只读查看/水印）。
- 同步恢复 `/login` 路由（当前 `router.get('/login')` 已临时改为 `redirect('/')`，
  原实现在其下方注释块中），购买需登录态。
- 可移除 `salesModal` 与联系销售文案。

## 其它暂时隐藏项（后续恢复）
- 登录入口：`server/partials.js` header 的 `authSlot` 当前 `hidden`；`/login` 路由重定向到首页。
- 开发者中心：`/developer` 路由与导航入口已注释。
- 价格标签（¥X / 免费）：`server/partials.js` 的 `badge()` 已注释价格 span。
- 卡片/详情页下载统计（↓ N）：已隐藏。
