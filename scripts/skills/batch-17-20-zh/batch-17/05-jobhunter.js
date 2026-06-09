module.exports = {
  skillId: 'totalclaw:totalclaw~oyi77-joko-jobhunter',
  descriptionZh:
    '激进求职技能，超越「一键投递」。涵盖调研、筛选、定制简历与求职信、找人脉、多渠道触达与跟进节奏，将求职当作销售流程。',
  bodyZh: `# JobHunter Master

**超越「Easy Apply」的激进求职技能。**

多数求职者广撒网碰运气。本技能是主动狩猎。

## 理念

Easy Apply = 买彩票。真正的求职 = 销售流程。

漏斗：
1. **调研** — 比员工更了解公司
2. **筛选** — 将经历匹配到他们的痛点
3. **定制** — 为**该职位**量身简历与求职信
4. **找到人** — HR、招聘经理、团队负责人、内部人
5. **触达** — 评论、连接、私信、邮件
6. **跟进** — 坚持但不烦人

## 工作流

### 阶段 1：目标获取

\`\`\`bash
# 寻找值得追求的职位（不只是 Easy Apply）
# 来源：LinkedIn、公司招聘页、AngelList、RemoteOK、HN Who's Hiring
\`\`\`

**调研清单：**
- [ ] 公司规模、融资阶段、近期新闻
- [ ] 技术栈（查职位、GitHub、StackShare、博客）
- [ ] 公司文化（Glassdoor、Blind、LinkedIn 动态）
- [ ] 类似岗位近期入职者（LinkedIn）
- [ ] 痛点（他们在做什么？面临什么挑战？）

### 阶段 2：情报收集

**找到关键人：**
1. **招聘经理** — 通常在职位描述中提及，或通过 LinkedIn 查找
2. **HR/猎头** — LinkedIn 搜索「[公司] Recruiter」
3. **团队成员** — 公司内类似头衔的人
4. **人脉** — 共同好友？校友？

**找联系方式：**
- LinkedIn 私信
- 邮箱模式：firstname@company.com、f.lastname@company.com
- 工具：Hunter.io、Apollo.io、RocketReach
- Twitter/X 动态
- 公司博客作者

### 阶段 3：材料定制

**简历调整：**
- 以与该岗位最相关的经历开头
- 镜像他们的用语（使用职位关键词）
- 量化与需求匹配的成就
- 删除无关内容

**求职信公式：**
\`\`\`
第 1 段：为何是**这家公司**（展示你做过调研）
第 2 段：为何是**你**（具体经历匹配需求）
第 3 段：你将**做什么**（你能带来的具体价值）
第 4 段：行动号召（约会议）
\`\`\`

### 阶段 4：多渠道触达

**LinkedIn：**
1. 连接 HR/招聘经理（个性化附言）
2. 有见地地评论他们的帖子
3. 分享他们可能看到的相关内容
4. 有 Premium 可用 InMail

**邮件：**
\`\`\`
主题：[职位] 申请 - [你的名字] | [独特价值主张]

简短有力，展示你做过功课。
附简历。附作品集/GitHub 链接。
明确诉求：「希望约 15 分钟聊聊。」
\`\`\`

**Twitter/X：**
- 关注公司及关键人
- 真诚互动他们的内容
- 合适时私信（先预热）

### 阶段 5：跟进节奏

\`\`\`
第 0 天：投递 + LinkedIn 连接
第 3 天：无回复则跟进邮件
第 7 天：LinkedIn 消息或评论其内容
第 14 天：最终跟进，换新角度
\`\`\`

**切勿：**
- 发送相同消息两次
- 语气绝望或卑微
- 同时向同公司多人群发

## 模板

### LinkedIn 连接请求
\`\`\`
Hi [Name]，我刚申请了 [Role] 职位，想直接与你建立联系。
你在 [具体事项] 上的工作让我很感兴趣。很想了解更多关于 [Company] 工程文化的信息。
\`\`\`

### 冷邮件
\`\`\`
主题：关于 [Company] [Role] 的快速问题

Hi [Name]，

注意到 [Company] 正在招聘 [Role]，我对 [公司具体方面 - 产品、使命、技术] 非常感兴趣。

简要背景：我在 [相关领域] 有 [X 年] 经验，最近 [与需求匹配的具体成就]。

很想了解更多你们对这个角色的期望。本周能抽 15 分钟通话吗？

Best,
[Name]
[LinkedIn] | [Portfolio/GitHub]
\`\`\`

### 跟进
\`\`\`
主题：Re: [上一主题]

Hi [Name]，

跟进我关于 [Role] 的申请。

自上次联系以来，我 [做了相关的事 - 做了项目、写了文章等]。

仍非常感兴趣加入 [Company]。方便时随时可聊。

Best,
[Name]
\`\`\`

## 执行命令

### 调研公司
\`\`\`bash
web_search "[Company] engineering blog"
web_search "[Company] tech stack"
web_search "[Company] series [A/B/C] funding"
web_search "site:glassdoor.com [Company] reviews"
\`\`\`

### 找人
\`\`\`bash
# 通过浏览器 LinkedIn 搜索
# 搜索：「[Company] recruiter」或「[Company] engineering manager」
# 查看共同好友
\`\`\`

### 邮箱发现
\`\`\`bash
# 常见模式：
# firstname@company.com
# firstname.lastname@company.com
# f.lastname@company.com
# firstnamelastname@company.com
\`\`\`

## 与其他技能集成

- **browser**：LinkedIn 自动化、公司调研
- **bird**：与公司/员工 Twitter 互动
- **gog**：通过 Gmail 邮件触达
- **nano-pdf**：简历编辑与定制

## 成功指标

每个申请跟踪：
- [ ] 公司已调研
- [ ] 简历已定制
- [ ] 求职信已写
- [ ] HR/招聘经理已识别
- [ ] 连接请求已发送
- [ ] 跟进已排期

## 文件

求职数据存放于：
- \`memory/job-targets.md\` — 活跃目标与状态
- \`memory/job-templates/\` — 定制简历与求职信

---

*「职位不给最优秀的人，而给最会求职的人。」*`,
};
