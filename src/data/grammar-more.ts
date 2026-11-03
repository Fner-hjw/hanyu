import type { GrammarPoint } from "./types";

export const GRAMMAR_MORE: GrammarPoint[] = [
  // ───────────── HSK 1 ─────────────
  {
    id: "g-shi",
    pattern: "A 是 B",
    title: "是 sentences (A is B)",
    level: 1,
    category: "sentence structure",
    explain:
      "是 links two nouns or noun phrases: A is B. It does not mean “is” before an adjective, so don’t use it to say “I am busy”. Negate it with 不是, and ask a yes/no question with 是不是 or by adding 吗.",
    pitfalls: "✗ 我是很忙。 ✓ 我很忙。 (Adjectives take 很, not 是.)",
    examples: [
      { zh: "我是学生。", en: "I am a student." },
      { zh: "他不是我的同事，是我的客户。", en: "He is not my colleague; he is my client." },
      { zh: "今天是星期五。", en: "Today is Friday." },
      { zh: "这是我们公司的新产品。", en: "This is our company’s new product." },
    ],
    exercises: [
      { prompt: "我___经理，不是会计。", options: ["有", "是", "在", "很"], answer: 1, why: "是 links two nouns: 我 = 经理." },
      { prompt: "这个办公室___大。", options: ["是", "很", "在", "有"], answer: 1, why: "Before an adjective use 很, not 是." },
      { prompt: "明天___星期几？", options: ["是", "有", "在", "去"], answer: 0, why: "Dates and weekdays use 是 to link the subject and the answer." },
    ],
  },
  {
    id: "g-de",
    pattern: "N / Pron. + 的 + N",
    title: "的 for possession and modification",
    level: 1,
    category: "particles",
    explain:
      "的 links a describing word to the noun it describes, and most often shows possession: 我的手机 means “my phone”. With very close relationships and units you can drop it: 我妈妈, 我们公司. When the noun is obvious, it can also stand alone: 这是我的.",
    pitfalls: "✗ 这是我书。 ✓ 这是我的书。 (Ordinary possession needs 的; only close family and units like 我妈妈, 我们公司 usually drop it.)",
    examples: [
      { zh: "这是我的手机。", en: "This is my phone." },
      { zh: "我们公司的客户很多。", en: "Our company has a lot of clients." },
      { zh: "那个红色的包是谁的？", en: "Whose is that red bag?" },
      { zh: "这是经理的电脑，不是我的。", en: "This is the manager’s computer, not mine." },
    ],
    exercises: [
      { prompt: "这是我___书。", options: ["得", "的", "地", "了"], answer: 1, why: "的 marks possession between 我 and 书." },
      { prompt: "那本书是老师___。", options: ["了", "吗", "的", "呢"], answer: 2, why: "老师的 = the teacher’s; the noun 书 is understood." },
    ],
  },
  {
    id: "g-ma",
    pattern: "Statement + 吗？",
    title: "吗 yes/no questions",
    level: 1,
    category: "questions",
    explain:
      "Add 吗 to the end of any statement to turn it into a yes/no question; the word order does not change. Answer by repeating the verb: 你忙吗？ — 忙 / 不忙. Don’t add 吗 to a sentence that already has a question word like 什么 or 谁.",
    pitfalls: "✗ 你是谁吗？ ✓ 你是谁？ (No 吗 with question words.)",
    examples: [
      { zh: "你喝茶吗？", en: "Do you drink tea?" },
      { zh: "你们公司在北京吗？", en: "Is your company in Beijing?" },
      { zh: "你有时间吗？", en: "Do you have time?" },
      { zh: "这个价格可以吗？", en: "Is this price okay?" },
    ],
    exercises: [
      { prompt: "你喜欢这个方案___？", options: ["吗", "呢", "吧", "了"], answer: 0, why: "吗 turns a statement into a yes/no question." },
      { prompt: "Which is a correct yes/no question?", options: ["你是学生吗不？", "你吗是学生？", "你是学生吗？", "吗你是学生？"], answer: 2, why: "吗 always comes at the end of the sentence." },
      { prompt: "Which question is correct?", options: ["你叫什么名字吗？", "你叫什么名字？", "你叫吗什么名字？", "什么你叫名字？"], answer: 1, why: "A question word like 什么 already makes it a question, so 吗 is not added." },
    ],
  },
  {
    id: "g-ne",
    pattern: "Topic + 呢？",
    title: "呢 for follow-up questions (“and you?”)",
    level: 1,
    category: "questions",
    explain:
      "After you have said something, attach 呢 to a noun or pronoun to ask the same question back: 我很好，你呢？ Alone, 呢 after a noun asks “where is it?”: 我的手机呢？ It sounds friendly and keeps small talk moving.",
    pitfalls: "✗ 我很忙，你吗？ ✓ 我很忙，你呢？ (吗 needs a full statement; use 呢 for “and you?”.)",
    examples: [
      { zh: "我今天很忙，你呢？", en: "I’m busy today. And you?" },
      { zh: "我喝咖啡，你呢？", en: "I’m having coffee. What about you?" },
      { zh: "我的笔记本电脑呢？", en: "Where is my laptop?" },
      { zh: "这个方案我同意，王经理呢？", en: "I agree with this plan. What about Manager Wang?" },
    ],
    exercises: [
      { prompt: "我今天很忙，你___？", options: ["吗", "呢", "了", "的"], answer: 1, why: "呢 asks the same question back." },
      { prompt: "我的钥匙___？我找不到。", options: ["呢", "吗", "吧", "的"], answer: 0, why: "Noun + 呢 asks where something is." },
    ],
  },
  {
    id: "g-bu-mei",
    pattern: "不 + V / adj.；没(有) + V",
    title: "不 vs 没 negation",
    level: 1,
    category: "sentence structure",
    explain:
      "不 negates habits, preferences, future plans and states: 我不喝咖啡, 明天我不去. 没(有) negates completed or past events and the verb 有: 他没来, 我没有钱. A quick rule: 不 = “don’t / won’t / isn’t”, 没 = “didn’t / haven’t / there isn’t”.",
    pitfalls: "✗ 我昨天不去公司。 ✓ 我昨天没去公司。 (Past event, so 没.)",
    examples: [
      { zh: "我不喝咖啡。", en: "I don’t drink coffee." },
      { zh: "他今天没来上班。", en: "He didn’t come to work today." },
      { zh: "我们没有预算。", en: "We have no budget." },
      { zh: "明天我不去开会。", en: "I’m not going to the meeting tomorrow." },
    ],
    exercises: [
      { prompt: "我昨天___吃早饭。", options: ["不", "没", "非", "别"], answer: 1, why: "A past event that did not happen takes 没." },
      { prompt: "我们公司___有这个产品。", options: ["不", "别", "没", "很"], answer: 2, why: "有 is only ever negated with 没." },
      { prompt: "他明天___来开会。", options: ["没", "不", "未", "别"], answer: 1, why: "A future plan is negated with 不." },
    ],
  },
  {
    id: "g-ye-dou",
    pattern: "S + 也 / 都 + V / adj.",
    title: "也 and 都 placement",
    level: 1,
    category: "sentence structure",
    explain:
      "也 (also) and 都 (all, both) go after the subject and before the verb or adjective, never at the end like in English. When both are needed, the order is 也都: 我们也都喜欢. 都 refers to something plural that comes before it.",
    pitfalls: "✗ 我们是都学生。 ✓ 我们都是学生。 (都 goes before 是.)",
    examples: [
      { zh: "我也想去。", en: "I want to go too." },
      { zh: "我们都是财务部的。", en: "We are all from the finance department." },
      { zh: "他们也都不会说中文。", en: "None of them speak Chinese either." },
      { zh: "我和同事都喜欢吃面条。", en: "My colleague and I both like noodles." },
    ],
    exercises: [
      { prompt: "你喜欢茶，我___喜欢茶。", options: ["都", "也", "还", "就"], answer: 1, why: "也 means “also” and sits before the verb." },
      { prompt: "我和他___是上海人。", options: ["也", "又", "都", "还"], answer: 2, why: "都 sums up the two people before it." },
      { prompt: "我们___喜欢这个方案。(we also all)", options: ["也都", "都也", "也只", "只也"], answer: 0, why: "The fixed order is 也 before 都." },
    ],
  },
  {
    id: "g-zai-place",
    pattern: "S + 在 + place + V",
    title: "在 for location (在 + place + verb)",
    level: 1,
    category: "prepositions",
    explain:
      "在 + place goes before the verb to say where an action happens: 我在家吃饭. Also 在 alone as a verb means “be at”: 经理在办公室. English puts the place last, but Chinese puts it first.",
    pitfalls: "✗ 我吃饭在家。 ✓ 我在家吃饭。 (The place comes before the verb.)",
    examples: [
      { zh: "我在家吃早饭。", en: "I eat breakfast at home." },
      { zh: "经理在办公室。", en: "The manager is in the office." },
      { zh: "他在一家银行工作。", en: "He works at a bank." },
      { zh: "我们在会议室开会。", en: "We are having a meeting in the meeting room." },
    ],
    exercises: [
      { prompt: "我们___会议室开会。", options: ["从", "在", "有", "是"], answer: 1, why: "在 + place marks where the action happens." },
      { prompt: "你的手机___桌子上。", options: ["在", "有", "去", "是"], answer: 0, why: "A specific thing is located 在 a place." },
      { prompt: "Which is correct?", options: ["我工作在银行。", "我在银行工作。", "在我银行工作。", "我银行在工作。"], answer: 1, why: "The pattern is S + 在 + place + V." },
    ],
  },
  {
    id: "g-you",
    pattern: "S + 有 + O；place + 有 + thing",
    title: "有 for possession and existence",
    level: 1,
    category: "sentence structure",
    explain:
      "有 means “to have” and also “there is / there are”: 桌子上有一台电脑. Its negative is only 没有 (never 不有). In a yes/no question you can add 吗 or use 有没有.",
    pitfalls: "✗ 我不有时间。 ✓ 我没有时间。 (有 is negated with 没.)",
    examples: [
      { zh: "我有两个孩子。", en: "I have two children." },
      { zh: "桌子上有一台电脑。", en: "There is a computer on the desk." },
      { zh: "公司附近有很多餐厅。", en: "There are many restaurants near the company." },
      { zh: "你们有没有预算？", en: "Do you have a budget?" },
    ],
    exercises: [
      { prompt: "桌子上___三份文件。", options: ["在", "有", "到", "给"], answer: 1, why: "Place + 有 + thing means “there are …”." },
      { prompt: "我___有时间，明天再说吧。", options: ["不", "没", "别", "非"], answer: 1, why: "有 is negated with 没." },
      { prompt: "附近___银行吗？", options: ["有", "在", "去", "到"], answer: 0, why: "有 asks whether something exists in a place." },
    ],
  },
  {
    id: "g-wh-in-place",
    pattern: "S + V + 什么 / 谁 / 哪儿 / 几 / 多少",
    title: "Question words stay in place",
    level: 1,
    category: "questions",
    explain:
      "Chinese question words do not move to the front. Put 什么, 谁, 哪儿, 几 or 多少 exactly where the answer would go: 你想吃什么？ Use 几 for small numbers (usually under ten) and 多少 for larger or unknown numbers.",
    pitfalls: "✗ 什么你想吃？ ✓ 你想吃什么？ (The question word takes the place of the answer.)",
    examples: [
      { zh: "你想吃什么？", en: "What do you want to eat?" },
      { zh: "你住在哪儿？", en: "Where do you live?" },
      { zh: "你有几个孩子？", en: "How many children do you have?" },
      { zh: "你们公司有多少人？", en: "How many people does your company have?" },
    ],
    exercises: [
      { prompt: "你们部门有___人？", options: ["几", "多少", "谁", "哪儿"], answer: 1, why: "A larger, unknown number takes 多少." },
      { prompt: "你家有___口人？", options: ["多少", "什么", "几", "谁"], answer: 2, why: "Family size is a small number, so 几." },
      { prompt: "你在___工作？", options: ["谁", "哪儿", "几", "多少"], answer: 1, why: "哪儿 replaces the place in 在 + place + V." },
    ],
  },
  {
    id: "g-tai-le",
    pattern: "太 + adj. + 了",
    title: "太…了 (too / so …)",
    level: 1,
    category: "emphasis",
    explain:
      "太 + adj. + 了 means “too …” or an enthusiastic “so …!”: 太好了！ can be praise, 太贵了 a complaint. For a mild negative, use 不太 + adj., meaning “not very”: 不太方便.",
    pitfalls: "✗ 这个太好。 ✓ 这个太好了！ (Don’t forget the final 了.)",
    examples: [
      { zh: "太好了！", en: "Great!" },
      { zh: "这家酒店太贵了。", en: "This hotel is too expensive." },
      { zh: "今天的会议太长了，我有点累。", en: "Today’s meeting was too long; I’m a bit tired." },
      { zh: "这个价格不太合适。", en: "This price isn’t very suitable." },
    ],
    exercises: [
      { prompt: "今天太热___！", options: ["吗", "了", "呢", "的"], answer: 1, why: "The pattern is 太 + adj. + 了." },
      { prompt: "这个方案不___好，我们再改改。", options: ["太", "很", "都", "也"], answer: 0, why: "不太 + adj. is the usual way to say “not very”." },
    ],
  },
  {
    id: "g-xiang-yao",
    pattern: "S + 想 / 要 + V",
    title: "想 and 要 (want / will)",
    level: 1,
    category: "modal verbs",
    explain:
      "想 + verb means “would like to” or “feel like”, and is the polite way to state a wish. 要 + verb means a firmer “want to / need to / will”, and 要 + noun is how you order: 我要一杯水. For “don’t want to”, use 不想; 不要 means “don’t!”",
    pitfalls: "Careful: 我不要去开会 sounds blunt, even childish; the polite way to say you don’t want to is 我不想去开会. On its own, 不要 + V means “Don’t …!”",
    examples: [
      { zh: "我想喝杯咖啡。", en: "I’d like a cup of coffee." },
      { zh: "服务员，我要一杯热茶。", en: "Waiter, I’ll have a cup of hot tea." },
      { zh: "下个月我要去上海出差。", en: "Next month I’m going to Shanghai on a business trip." },
      { zh: "我今天不想加班。", en: "I don’t feel like working overtime today." },
    ],
    exercises: [
      { prompt: "服务员，我___一杯水。", options: ["想", "要", "会", "能"], answer: 1, why: "要 + noun is the way to order something." },
      { prompt: "下个星期我们___去北京出差。", options: ["要", "吗", "了", "过"], answer: 0, why: "要 + verb expresses a plan or intention." },
    ],
  },

  // ───────────── HSK 2 ─────────────
  {
    id: "g-le",
    pattern: "V + 了；sentence + 了",
    title: "了 for completed actions and change",
    level: 2,
    category: "aspect & time",
    explain:
      "了 right after a verb marks that an action is completed: 我买了一台电脑. At the end of a sentence, it shows a new situation: 下班了. To negate a completed action, use 没(有) and drop 了.",
    pitfalls: "✗ 我昨天没去了。 ✓ 我昨天没去。 (After 没, there is no 了.)",
    examples: [
      { zh: "我昨天给客户发了一封邮件。", en: "Yesterday I sent a client an email." },
      { zh: "他昨天没来公司。", en: "He didn’t come to the company yesterday." },
      { zh: "经理已经批准了预算。", en: "The manager has already approved the budget." },
      { zh: "下班了，我们走吧。", en: "Work is over; let’s go." },
    ],
    exercises: [
      { prompt: "昨天我买___一台新电脑。", options: ["过", "了", "着", "的"], answer: 1, why: "了 after the verb marks a completed action." },
      { prompt: "天黑___，我们回家吧。", options: ["着", "过", "了", "呢"], answer: 2, why: "Sentence-final 了 shows a change of state: it has become dark." },
      { prompt: "他们已经签___合同了。", options: ["了", "着", "地", "得"], answer: 0, why: "Completed signing takes 了 after the verb." },
    ],
  },
  {
    id: "g-guo",
    pattern: "V + 过",
    title: "过 for past experience",
    level: 2,
    category: "aspect & time",
    explain:
      "过 after a verb says someone has had that experience at least once: 我去过北京. It does not focus on when, only on whether it has happened. The negative is 没(有) + V + 过, often with 从来: 从来没吃过.",
    pitfalls: "✗ 我不去过上海。 ✓ 我没去过上海。 (Negate experience with 没.)",
    examples: [
      { zh: "我去过北京。", en: "I’ve been to Beijing." },
      { zh: "你吃过北京烤鸭吗？", en: "Have you ever eaten Peking duck?" },
      { zh: "我从来没做过这种分析。", en: "I have never done this kind of analysis." },
      { zh: "他在银行工作过两年。", en: "He once worked at a bank for two years." },
    ],
    exercises: [
      { prompt: "我从来没吃___这种水果。", options: ["过", "了", "着", "的"], answer: 0, why: "从来没 + V + 过 describes a lack of experience." },
      { prompt: "你以前在国外工作___吗？", options: ["着", "过", "的", "地"], answer: 1, why: "Asking about experience uses V + 过 + 吗." },
      { prompt: "我___去过上海，对那里不熟。", options: ["不", "别", "没", "要"], answer: 2, why: "Experience is negated with 没." },
    ],
  },
  {
    id: "g-zhengzai",
    pattern: "S + (正)在 + V + (呢)",
    title: "正在…呢 (progressive)",
    level: 2,
    category: "aspect & time",
    explain:
      "在, 正 or 正在 before a verb shows an action in progress: 他正在开会. A final 呢 makes it more conversational. Don’t add 了 to show “right now”; the negative is 没在 + V.",
    pitfalls: "✗ 我正在吃饭了。 ✓ 我正在吃饭（呢）。 (No 了 for an ongoing action.)",
    examples: [
      { zh: "他正在开会呢。", en: "He is in a meeting right now." },
      { zh: "我在写报告，等一下再说。", en: "I’m writing a report; let’s talk in a bit." },
      { zh: "别打扰他，他正在打电话。", en: "Don’t disturb him; he’s on the phone." },
      { zh: "客户现在正在看我们的方案。", en: "The client is looking at our proposal right now." },
    ],
    exercises: [
      { prompt: "经理现在___开会，请你等一下。", options: ["已经", "正在", "曾经", "将要"], answer: 1, why: "正在 shows an action in progress right now." },
      { prompt: "我___吃饭呢，一会儿给你回电话。", options: ["过", "了", "在", "着"], answer: 2, why: "在 + V + 呢 is the progressive." },
    ],
  },
  {
    id: "g-bi",
    pattern: "A 比 B + adj. (+ difference)",
    title: "比 comparisons",
    level: 2,
    category: "comparison",
    explain:
      "A 比 B + adj. says A is more … than B. Never put 很 or 非常 before the adjective; instead add a degree after it: 高一点, 高很多, 大三岁. For “not as … as”, use 没有: 北京没有上海热.",
    pitfalls: "✗ 他比我很高。 ✓ 他比我高。 / 他比我高很多。",
    examples: [
      { zh: "今天比昨天冷。", en: "Today is colder than yesterday." },
      { zh: "这个方案比那个便宜一点。", en: "This plan is a bit cheaper than that one." },
      { zh: "今年的利润比去年高了百分之十。", en: "This year’s profit is 10 percent higher than last year’s." },
      { zh: "他比我大三岁。", en: "He is three years older than me." },
    ],
    exercises: [
      { prompt: "这家银行的利率比那家___。", options: ["很高", "非常高", "高", "太高"], answer: 2, why: "No intensifier like 很 is allowed after 比." },
      { prompt: "他比我大___。", options: ["很", "三岁", "非常", "太"], answer: 1, why: "A specific difference goes after the adjective." },
      { prompt: "今年的成本比去年___了百分之五。", options: ["很", "增加", "非常", "更"], answer: 1, why: "A verb of change plus the amount works after 比." },
    ],
  },
  {
    id: "g-gen-yiyang",
    pattern: "A 跟 / 和 B 一样 (+ adj.)",
    title: "跟…一样 (the same as)",
    level: 2,
    category: "comparison",
    explain:
      "A 跟 B 一样 means A is the same as B; add an adjective to say in what way: 一样贵. The negative is 不一样 (“different”); for “not as … as”, use 没有 instead. 和 can replace 跟 with the same meaning.",
    pitfalls: "✗ 他跟我一样是高。 ✓ 他跟我一样高。 (No 是 before the adjective.)",
    examples: [
      { zh: "我的手机跟你的一样。", en: "My phone is the same as yours." },
      { zh: "这家店的价格跟那家一样贵。", en: "The prices at this shop are as high as at that one." },
      { zh: "这两个方案的风险不一样。", en: "The risks of these two plans are different." },
      { zh: "他说汉语跟中国人一样流利。", en: "He speaks Chinese as fluently as a Chinese person." },
    ],
    exercises: [
      { prompt: "我的看法跟你的___。", options: ["一起", "一样", "一定", "一共"], answer: 1, why: "跟…一样 means “the same as”." },
      { prompt: "这个办公室___那个一样大。", options: ["比", "把", "跟", "被"], answer: 2, why: "跟 + B + 一样 is the pattern." },
      { prompt: "他说汉语跟中国人一样___。", options: ["很流利", "是流利", "流利", "不流利"], answer: 2, why: "Use the bare adjective after 一样." },
    ],
  },
  {
    id: "g-yinwei-suoyi",
    pattern: "因为 A，所以 B",
    title: "因为…所以… (because…so…)",
    level: 2,
    category: "connectors",
    explain:
      "Chinese happily uses both 因为 and 所以 in one sentence, even though English drops one. The result clause with 所以 cannot be joined by 但是 or 可是. You can also give the result first: 他没来，是因为生病了.",
    pitfalls: "✗ 因为他生病了，但是他没来。 ✓ 因为他生病了，所以他没来。",
    examples: [
      { zh: "因为下雨，所以我没骑车。", en: "Because it rained, I didn’t ride my bike." },
      { zh: "因为客户要求很高，所以我们加班了。", en: "Because the client’s demands were high, we worked overtime." },
      { zh: "他没来，是因为他生病了。", en: "He didn’t come because he was sick." },
      { zh: "因为预算不够，所以项目推迟了。", en: "Because the budget wasn’t enough, the project was postponed." },
    ],
    exercises: [
      { prompt: "因为路上堵车，___我迟到了。", options: ["但是", "所以", "而且", "如果"], answer: 1, why: "所以 introduces the result of the cause." },
      { prompt: "___今天是周末，所以银行不开门。", options: ["因为", "虽然", "如果", "除了"], answer: 0, why: "因为 introduces the cause." },
      { prompt: "因为数据有问题，___我们要重新做报告。", options: ["可是", "不过", "然而", "所以"], answer: 3, why: "A result clause needs 所以, not a contrast word." },
    ],
  },
  {
    id: "g-hui-neng-keyi",
    pattern: "会 / 能 / 可以 + V",
    title: "会 / 能 / 可以 (can)",
    level: 2,
    category: "modal verbs",
    explain:
      "会 means you have learned how to do something (会开车), and also predicts the future (明天会下雨). 能 is about ability in the circumstances, such as health, time or conditions. 可以 asks or gives permission: 这里可以拍照吗？",
    pitfalls: "✗ 我的手机坏了，不会打电话。 ✓ 我的手机坏了，不能打电话。 (Circumstance, not a skill.)",
    examples: [
      { zh: "我会说一点儿中文。", en: "I can speak a little Chinese." },
      { zh: "他今天发烧，不能来上班。", en: "He has a fever today and can’t come to work." },
      { zh: "这里可以拍照吗？", en: "May I take photos here?" },
      { zh: "明天会下雨，你带伞吧。", en: "It will rain tomorrow, so take an umbrella." },
    ],
    exercises: [
      { prompt: "我第一次来中国，还不___用筷子。", options: ["可以", "要", "会", "得"], answer: 2, why: "会 is a learned skill." },
      { prompt: "老板，我___先走吗？", options: ["会", "可以", "正在", "一直"], answer: 1, why: "可以 asks permission." },
      { prompt: "天气预报说明天___下雨。", options: ["能", "会", "可以", "想"], answer: 1, why: "会 expresses a prediction." },
    ],
  },
  {
    id: "g-jiu-cai",
    pattern: "S + 时间 + 就 / 才 + V",
    title: "就 vs 才 (earlier or later than expected)",
    level: 2,
    category: "emphasis",
    explain:
      "就 after a time or quantity suggests it was early, quick or easy: 七点就到了. 才 suggests it was late, slow or small: 十点才到. The speaker’s expectation decides which one you choose.",
    pitfalls: "✗ 他十点才到了。 ✓ 他十点才到。 (才 usually isn’t followed by sentence-final 了.)",
    examples: [
      { zh: "我七点就到公司了。", en: "I was already at the office by seven." },
      { zh: "会议三点开始，他三点半才到。", en: "The meeting started at three; he only arrived at three thirty." },
      { zh: "这么简单，五分钟就做完了。", en: "It was so simple that it was done in just five minutes." },
      { zh: "客户昨天才回复我们的邮件。", en: "The client only replied to our email yesterday." },
    ],
    exercises: [
      { prompt: "他很早，六点___到公司了。", options: ["才", "就", "都", "还"], answer: 1, why: "就 shows it was earlier than expected." },
      { prompt: "路上堵车，我十点___到公司。", options: ["才", "就", "都", "又"], answer: 0, why: "才 shows it was later than expected." },
      { prompt: "这个报告很简单，我半个小时___写完了。", options: ["才", "还", "就", "却"], answer: 2, why: "就 shows it took little time." },
    ],
  },
  {
    id: "g-chongdie",
    pattern: "V V / V 一 V / V 了 V",
    title: "Verb reduplication (看看, 试一试)",
    level: 2,
    category: "sentence structure",
    explain:
      "Doubling a verb makes the action short, light or tentative: 看看, 尝尝, 试一试. It sounds casual and polite, softening requests. For a completed action, put 了 in the middle: 看了看. Don’t combine it with 一下.",
    pitfalls: "✗ 我想看看一下。 ✓ 我想看看。 / 我想看一下。",
    examples: [
      { zh: "你尝尝这个菜。", en: "Try this dish." },
      { zh: "我想试一试这个新软件。", en: "I want to give this new software a try." },
      { zh: "请你帮我看看这份合同。", en: "Please have a look at this contract for me." },
      { zh: "周末我们去公园走走。", en: "Let’s take a walk in the park at the weekend." },
    ],
    exercises: [
      { prompt: "这件衣服不错，我可以___吗？", options: ["试试了", "试试", "试一下试", "一试"], answer: 1, why: "Reduplication gives a casual, light request." },
      { prompt: "你先___这份报告，有问题再告诉我。", options: ["看看一下", "看着看", "看看", "看了看了"], answer: 2, why: "看看 is correct; 看看 and 一下 shouldn’t be combined." },
      { prompt: "我们坐下来___吧。", options: ["谈谈", "谈着谈", "谈了谈", "谈谈了"], answer: 0, why: "A suggestion with 吧 uses the plain reduplicated form." },
    ],
  },
  {
    id: "g-de-complement",
    pattern: "V + 得 + adj.；S + V + O + V + 得 + adj.",
    title: "Degree complement with 得",
    level: 2,
    category: "complements",
    explain:
      "V + 得 + adj. says how well or how much an action is done: 说得很好. When there is an object, repeat the verb or move the object forward: 他说汉语说得很好 / 他汉语说得很好. The negative is 说得不好.",
    pitfalls: "✗ 他说汉语很好。 ✓ 他汉语说得很好。 (You need 得 after the verb.)",
    examples: [
      { zh: "她说得很流利。", en: "She speaks very fluently." },
      { zh: "他开车开得很快。", en: "He drives very fast." },
      { zh: "你昨天睡得好吗？", en: "Did you sleep well last night?" },
      { zh: "这份报告写得很清楚。", en: "This report is written very clearly." },
    ],
    exercises: [
      { prompt: "他汉语说___很流利。", options: ["的", "得", "地", "了"], answer: 1, why: "得 links the verb and the degree complement." },
      { prompt: "你今天起___真早！", options: ["得", "的", "地", "着"], answer: 0, why: "起得真早 is a degree complement." },
      { prompt: "他报告写得___清楚。", options: ["在", "把", "很", "是"], answer: 2, why: "The complement after 得 is usually 很 + adj." },
    ],
  },
  {
    id: "g-haishi-huozhe",
    pattern: "A 还是 B？；A 或者 B",
    title: "还是 vs 或者 (or)",
    level: 2,
    category: "connectors",
    explain:
      "Both mean “or”. Use 还是 when asking a choice question: 你喝茶还是咖啡？ Use 或者 in statements, offering alternatives: 发邮件或者打电话都可以. Mixing them up is one of the most common errors.",
    pitfalls: "✗ 你喝茶或者咖啡？ ✓ 你喝茶还是咖啡？",
    examples: [
      { zh: "你喝茶还是咖啡？", en: "Do you want tea or coffee?" },
      { zh: "我们今天开会还是明天开会？", en: "Do we meet today or tomorrow?" },
      { zh: "周末我想看电影或者逛街。", en: "At the weekend I want to watch a movie or go shopping." },
      { zh: "你可以发邮件或者打电话给我。", en: "You can email me or call me." },
    ],
    exercises: [
      { prompt: "你想坐地铁___坐出租车？", options: ["还是", "或者", "和", "跟"], answer: 0, why: "Question with a choice uses 还是." },
      { prompt: "请用邮件___微信联系我，都可以。", options: ["还是", "或者", "可是", "而且"], answer: 1, why: "A statement offering options uses 或者." },
      { prompt: "你是中国人___日本人？", options: ["或者", "就是", "还是", "只是"], answer: 2, why: "A choice question needs 还是." },
    ],
  },
  {
    id: "g-yaole",
    pattern: "(就 / 快)要 + V / time + 了",
    title: "要…了 (about to)",
    level: 2,
    category: "aspect & time",
    explain:
      "要…了 says something is about to happen: 要下雨了. 快要 and 就要 are stronger; 就要 can follow a time word (下个月就要放假了), but 快要 cannot. The pattern always ends in 了.",
    pitfalls: "✗ 下个月快要放假了。 ✓ 下个月就要放假了。 (快要 doesn’t go with a specific time word.)",
    examples: [
      { zh: "要下雨了，带伞吧。", en: "It’s about to rain, so take an umbrella." },
      { zh: "火车快要开了。", en: "The train is about to leave." },
      { zh: "下个月就要过年了。", en: "Next month it will already be the New Year." },
      { zh: "财年快结束了，我们要抓紧时间。", en: "The fiscal year is about to end, so we need to hurry." },
    ],
    exercises: [
      { prompt: "天阴了，___下雨了。", options: ["已经", "刚", "要", "曾经"], answer: 2, why: "要…了 means “about to”." },
      { prompt: "下个星期___放假了，大家都很高兴。", options: ["快要", "就要", "正在", "刚刚"], answer: 1, why: "With a time word like 下个星期, use 就要." },
      { prompt: "电影___开始了，我们快进去吧。", options: ["快", "才", "刚", "曾"], answer: 0, why: "快…了 means “almost, about to”." },
    ],
  },

  // ───────────── HSK 3 ─────────────
  {
    id: "g-result-comp",
    pattern: "V + 完 / 好 / 懂 / 到 / 见",
    title: "Result complements",
    level: 3,
    category: "complements",
    explain:
      "A result complement follows the verb and tells the outcome of the action: 做完 (finished), 做好 (done properly), 听懂 (understood by hearing), 找到 (found), 看见 (saw). The verb alone only says the action took place. Negate with 没: 没听懂, 没找到.",
    pitfalls: "✗ 我找了钥匙。(means “I searched for it”) ✓ 我找到了钥匙。 (I found it.)",
    examples: [
      { zh: "我已经做完报告了。", en: "I’ve finished the report." },
      { zh: "老师的话你听懂了吗？", en: "Did you understand what the teacher said?" },
      { zh: "我终于找到了那份合同。", en: "I finally found that contract." },
      { zh: "晚饭做好了，快来吃吧。", en: "Dinner is ready; come and eat." },
    ],
    exercises: [
      { prompt: "这本书很难，我看了三遍还没看___。", options: ["懂", "见", "完", "到"], answer: 0, why: "看懂 means to read and understand; the book is hard." },
      { prompt: "我找了半天，终于找___我的钥匙了。", options: ["完", "到", "懂", "好"], answer: 1, why: "找到 means to find successfully." },
      { prompt: "晚饭已经做___了，快来吃吧。", options: ["见", "懂", "好", "到"], answer: 2, why: "做好 means finished and ready." },
    ],
  },
  {
    id: "g-directional",
    pattern: "V + 来 / 去；V + 上 / 下 / 进 / 出 / 回 / 过 / 起 + 来 / 去",
    title: "Directional complements",
    level: 3,
    category: "complements",
    explain:
      "来 means movement toward the speaker and 去 away from the speaker. Combine with 上, 下, 进, 出, 回, 过, 起 for compound directions: 走进来, 拿出去, 带回来. A place object goes before 来 or 去: 他走进办公室来了.",
    pitfalls: "✗ 他进来了办公室。 ✓ 他进办公室来了。 (The place goes between 进 and 来.)",
    examples: [
      { zh: "外面很冷，请进来。", en: "It’s cold outside; please come in." },
      { zh: "他刚从办公室出去。", en: "He just went out of the office." },
      { zh: "他从国外给公司带回来一份礼物。", en: "He brought a gift back to the company from abroad." },
      { zh: "经理走进会议室去了。", en: "The manager walked into the meeting room." },
    ],
    exercises: [
      { prompt: "外面太冷了，你快进___吧。", options: ["来", "去", "过", "到"], answer: 0, why: "The speaker is inside, so the movement is toward the speaker: 进来." },
      { prompt: "他刚才出___买咖啡了，一会儿就回来。", options: ["来", "去", "到", "上"], answer: 1, why: "He moved away from the speaker: 出去." },
      { prompt: "他从国外给公司带___一份礼物。", options: ["进去", "回去", "出来", "回来"], answer: 3, why: "The gift comes back toward the company where the speaker is: 回来." },
    ],
  },
  {
    id: "g-potential",
    pattern: "V + 得 / 不 + complement",
    title: "Potential complements (听得懂 / 看不清)",
    level: 3,
    category: "complements",
    explain:
      "Insert 得 or 不 between a verb and its result complement to say whether it is possible: 听得懂 (can understand), 听不懂 (can’t). The negative form 不 is the one you hear most. It describes ability in the actual circumstances.",
    pitfalls: "✗ 我没听得懂。 ✓ 我听不懂。 (Use 不 inside the verb, not 没.)",
    examples: [
      { zh: "你说得太快，我听不懂。", en: "You speak too fast; I can’t understand." },
      { zh: "屏幕太小，我看不清数字。", en: "The screen is too small; I can’t see the numbers clearly." },
      { zh: "这么多菜，我们吃不完。", en: "With so many dishes, we can’t finish them." },
      { zh: "明天之前，这份报告做得完吗？", en: "Can this report be finished before tomorrow?" },
    ],
    exercises: [
      { prompt: "字太小了，我看___清。", options: ["没", "不", "别", "非"], answer: 1, why: "不 inside the verb gives “cannot see clearly”." },
      { prompt: "这么多工作，今天肯定做___完。", options: ["不", "没有", "别", "未"], answer: 0, why: "做不完 means cannot finish." },
      { prompt: "他的口音太重，我听___懂。", options: ["没", "着", "不", "得"], answer: 2, why: "听不懂 means cannot understand; 太重 shows it is negative." },
    ],
  },
  {
    id: "g-yuelaiyue",
    pattern: "越来越 + adj. / V",
    title: "越来越 (more and more)",
    level: 3,
    category: "comparison",
    explain:
      "越来越 + adj. shows a gradual change over time: 越来越冷, “colder and colder”. It is often followed by 了. Do not add 很 or 非常 after it.",
    pitfalls: "✗ 天气越来越很冷。 ✓ 天气越来越冷了。",
    examples: [
      { zh: "天气越来越冷了。", en: "The weather is getting colder and colder." },
      { zh: "他的中文越来越好了。", en: "His Chinese is getting better and better." },
      { zh: "我们的客户越来越多。", en: "We have more and more clients." },
      { zh: "最近工作越来越忙，我很少回家吃饭。", en: "Work has been getting busier, so I rarely eat at home." },
    ],
    exercises: [
      { prompt: "最近房价___来越贵。", options: ["很", "越", "更", "太"], answer: 1, why: "越来越 is the fixed pattern." },
      { prompt: "你的汉语越来越___了！", options: ["好", "很好", "比好", "太好"], answer: 0, why: "Use a bare adjective after 越来越." },
      { prompt: "公司的利润___来越高。", options: ["最", "更", "再", "越"], answer: 3, why: "越来越 + adj. shows gradual increase." },
    ],
  },
  {
    id: "g-yueyue",
    pattern: "越 A 越 B",
    title: "越…越… (the more…the more…)",
    level: 3,
    category: "comparison",
    explain:
      "越 A 越 B links two changing degrees: the more A, the more B. A and B are usually verbs or adjectives, and they can have different subjects: 价格越低，客户越愿意买. Don’t put 很 before the second adjective.",
    pitfalls: "✗ 价格越低越很好。 ✓ 价格越低越好。",
    examples: [
      { zh: "他越说越生气。", en: "The more he spoke, the angrier he got." },
      { zh: "越早越好，请尽快回复我。", en: "The sooner the better; please reply as soon as possible." },
      { zh: "这首歌我越听越喜欢。", en: "The more I listen to this song, the more I like it." },
      { zh: "方案越简单，客户越容易理解。", en: "The simpler the plan, the easier it is for the client to understand." },
    ],
    exercises: [
      { prompt: "价格越低，客户___愿意买。", options: ["很", "越", "最", "才"], answer: 1, why: "越…越… needs 越 in both halves." },
      { prompt: "越早交报告越___。", options: ["很好", "好了", "好", "最"], answer: 2, why: "No degree word is added after the second 越." },
      { prompt: "这本书我越看越___。", options: ["喜欢", "很喜欢", "喜欢了", "太喜欢"], answer: 0, why: "A plain verb or adjective follows the second 越." },
    ],
  },
  {
    id: "g-yibian",
    pattern: "S + 一边 V1，一边 V2",
    title: "一边…一边… (doing two things at once)",
    level: 3,
    category: "connectors",
    explain:
      "一边 V1 一边 V2 describes one person doing two actions at the same time. Both parts must be actions, not states. The main or longer-lasting action usually follows the second 一边.",
    pitfalls: "✗ 我一边累一边开车。 ✓ 我一边开车一边听音乐。 (Both parts must be actions, not states.)",
    examples: [
      { zh: "他一边走路一边打电话。", en: "He walks while talking on the phone." },
      { zh: "我喜欢一边喝咖啡一边看新闻。", en: "I like to read the news while drinking coffee." },
      { zh: "请不要一边开会一边玩手机。", en: "Please don’t play with your phone during the meeting." },
      { zh: "她一边上班，一边学习金融课程。", en: "She works while studying finance courses." },
    ],
    exercises: [
      { prompt: "我们一边吃饭，___谈工作。", options: ["一起", "一直", "一边", "一定"], answer: 2, why: "The second half repeats 一边." },
      { prompt: "他喜欢一边做饭，一边___。", options: ["听音乐", "很累", "很高", "是学生"], answer: 0, why: "Both parts must be actions." },
    ],
  },
  {
    id: "g-xian-ranhou",
    pattern: "先 A，然后 / 再 B",
    title: "先…然后 / 再… (first…then…)",
    level: 3,
    category: "connectors",
    explain:
      "先 marks the first step, 然后 or 再 the next one. 再 looks ahead (plans, suggestions), while 然后 can describe the past or the future. 先 goes after the subject, before the verb.",
    pitfalls: "✗ 昨天我先回家，再做饭了。 ✓ 昨天我先回家，然后做了饭。 (For past sequences 然后 is more natural; 再 is mainly for steps still to come.)",
    examples: [
      { zh: "我们先开会，然后讨论预算。", en: "First we meet, then we discuss the budget." },
      { zh: "你先坐一会儿，我再给你倒水。", en: "Sit down for a while first, and then I’ll pour you some water." },
      { zh: "先把数据整理好，再做图表。", en: "First organise the data, then make the charts." },
      { zh: "昨天我先去银行，然后去超市。", en: "Yesterday I went to the bank first, then to the supermarket." },
    ],
    exercises: [
      { prompt: "我们先吃午饭，___去开会。", options: ["如果", "因为", "然后", "虽然"], answer: 2, why: "然后 follows 先 to give the next step." },
      { prompt: "先做作业，___看电视。", options: ["再", "却", "都", "也"], answer: 0, why: "先…再… is the standard sequence for a future step." },
      { prompt: "你___把表格填好，然后给我。", options: ["还", "先", "又", "才"], answer: 1, why: "先 marks the first step." },
    ],
  },
  {
    id: "g-chule",
    pattern: "除了 A (以外)，都 / 还 / 也 …",
    title: "除了…以外 (except / besides)",
    level: 3,
    category: "connectors",
    explain:
      "除了 A 以外 has two opposite uses depending on what follows. With 都 it means “except A”: 除了他，大家都来了. With 还 or 也 it means “in addition to A”: 除了英语，他还会法语. 以外 is optional.",
    pitfalls: "✗ 除了他以外，大家去开会。 ✓ 除了他以外，大家都去开会。 (Excluding someone needs 都.)",
    examples: [
      { zh: "除了周末以外，我每天都要上班。", en: "Except for weekends, I go to work every day." },
      { zh: "除了英语以外，他还会说法语和日语。", en: "Besides English, he also speaks French and Japanese." },
      { zh: "除了小王，大家都同意这个方案。", en: "Except Xiao Wang, everyone agrees with this plan." },
      { zh: "除了做预算，我还要负责审核发票。", en: "Besides doing the budget, I’m also responsible for reviewing invoices." },
    ],
    exercises: [
      { prompt: "除了咖啡以外，我什么饮料___不喝。", options: ["还", "都", "就", "才"], answer: 1, why: "都 expresses “everything except coffee”." },
      { prompt: "除了做销售，他___负责客户服务。", options: ["都", "就", "才", "还"], answer: 3, why: "还 adds an additional duty." },
      { prompt: "除了小李以外，其他同事___来了。", options: ["都", "还", "再", "才"], answer: 0, why: "都 means everybody else came." },
    ],
  },
  {
    id: "g-shi-de",
    pattern: "S + 是 + time / place / manner + V + 的",
    title: "是…的 (emphasising time, place, manner)",
    level: 3,
    category: "emphasis",
    explain:
      "When an action is already known to have happened, 是…的 highlights how, when, where or by whom it happened. The focus goes between 是 and the verb, and 的 comes at the end. Don’t add 了, and 是 is often dropped in positive sentences.",
    pitfalls: "✗ 你是什么时候来了的？ ✓ 你是什么时候来的？ (No 了 in 是…的.)",
    examples: [
      { zh: "你是什么时候到的？", en: "When did you arrive?" },
      { zh: "我是坐高铁来的。", en: "I came by high-speed train." },
      { zh: "这份合同是谁签的？", en: "Who signed this contract?" },
      { zh: "他是在上海读的大学。", en: "He went to university in Shanghai." },
    ],
    exercises: [
      { prompt: "你是怎么来公司___？", options: ["了", "的", "过", "着"], answer: 1, why: "是…的 ends with 的." },
      { prompt: "我们是去年在北京认识___。", options: ["了", "着", "的", "过"], answer: 2, why: "Time and place are being emphasised, so 是…的." },
      { prompt: "这个邮件是谁___的？", options: ["发", "发了", "发过", "发着"], answer: 0, why: "No aspect particle inside 是…的." },
    ],
  },
  {
    id: "g-zhe",
    pattern: "V + 着；V1 + 着 + V2",
    title: "着 for continuing states",
    level: 3,
    category: "aspect & time",
    explain:
      "着 after a verb describes a state that continues, such as posture, position or something left on: 门开着, 墙上挂着地图. In V1着V2, the first verb describes how the second is done: 站着打电话.",
    pitfalls: "✗ 他站了在门口等你。 ✓ 他在门口站着等你。 (A continuing posture uses 着.)",
    examples: [
      { zh: "门开着，谁在里面？", en: "The door is open; who is inside?" },
      { zh: "墙上挂着一张世界地图。", en: "There is a world map hanging on the wall." },
      { zh: "会议室的灯还开着。", en: "The lights in the meeting room are still on." },
      { zh: "别站着，请坐。", en: "Don’t stand; please sit." },
    ],
    exercises: [
      { prompt: "窗户没关，还开___呢。", options: ["着", "了", "过", "的"], answer: 0, why: "A continuing state takes 着." },
      { prompt: "老板在办公室里站___打电话。", options: ["了", "过", "着", "得"], answer: 2, why: "站着 describes how he is making the call." },
      { prompt: "墙上挂___一张公司的组织结构图。", options: ["着", "过", "呢", "地"], answer: 0, why: "Location + V着 + noun describes what is there." },
    ],
  },
  {
    id: "g-ruguo-jiu",
    pattern: "如果 A，(S) 就 B",
    title: "如果…就… (if…then…)",
    level: 3,
    category: "connectors",
    explain:
      "如果 introduces the condition and 就 introduces the consequence. 就 sits before the verb in the second clause and is more natural than leaving it out. In speech, 要是 often replaces 如果.",
    pitfalls: "✗ 如果你有时间，就我们见面。 ✓ 如果你有时间，我们就见面。 (就 comes after the subject.)",
    examples: [
      { zh: "如果明天下雨，我们就不去了。", en: "If it rains tomorrow, we won’t go." },
      { zh: "如果你有问题，就随时问我。", en: "If you have a question, just ask me any time." },
      { zh: "如果预算不够，我们就得减少开支。", en: "If the budget isn’t enough, we’ll have to cut spending." },
      { zh: "要是你不舒服，就早点回家。", en: "If you’re unwell, go home early." },
    ],
    exercises: [
      { prompt: "如果价格合适，客户___会买。", options: ["却", "倒", "就", "才"], answer: 2, why: "就 introduces the consequence of the condition." },
      { prompt: "___你明天有时间，我们就一起吃饭。", options: ["虽然", "如果", "因为", "除了"], answer: 1, why: "如果 sets the condition." },
      { prompt: "如果天气不好，我们___取消活动。", options: ["就", "都", "也", "又"], answer: 0, why: "就 follows the condition." },
    ],
  },
  {
    id: "g-zhiyao-jiu",
    pattern: "只要 A，就 B",
    title: "只要…就… (as long as)",
    level: 3,
    category: "connectors",
    explain:
      "只要 A，就 B means A is enough to guarantee B: as long as A, then B. It states a sufficient condition and always pairs with 就. Contrast with 只有…才, which states the only way.",
    pitfalls: "✗ 只要你努力才能成功。 ✓ 只要你努力，就能成功。",
    examples: [
      { zh: "只要你有时间，我们就见面。", en: "As long as you have time, we’ll meet." },
      { zh: "只要多练习，口语就会进步。", en: "As long as you practise more, your speaking will improve." },
      { zh: "只要客户满意，我们就不用修改方案。", en: "As long as the client is satisfied, we don’t need to revise the plan." },
      { zh: "只要按时交报告，经理就不会批评你。", en: "As long as you hand in the report on time, the manager won’t criticise you." },
    ],
    exercises: [
      { prompt: "只要你努力，___能学好中文。", options: ["才", "就", "却", "倒"], answer: 1, why: "只要 is paired with 就." },
      { prompt: "___客户同意，这个合同就可以签。", options: ["只要", "只有", "虽然", "因为"], answer: 0, why: "只要…就… gives a sufficient condition." },
      { prompt: "只要天气好，我们明天___去爬山。", options: ["才", "却", "就", "倒"], answer: 2, why: "就 completes 只要." },
    ],
  },

  // ───────────── HSK 4 ─────────────
  {
    id: "g-zhiyou-cai",
    pattern: "只有 A，才 B",
    title: "只有…才… (only if)",
    level: 4,
    category: "connectors",
    explain:
      "只有 A，才 B states a necessary condition: B happens only if A does. It always pairs with 才, never 就. Compare 只要…就…, where A is merely enough.",
    pitfalls: "✗ 只有你来，我就去。 ✓ 只有你来，我才去。",
    examples: [
      { zh: "只有认真准备，才能通过考试。", en: "Only by preparing seriously can you pass the exam." },
      { zh: "只有经理签字，付款才能生效。", en: "Payment takes effect only when the manager signs." },
      { zh: "只有多听多说，才能提高口语。", en: "Only by listening and speaking a lot can you improve your spoken Chinese." },
      { zh: "这个系统只有管理员才可以登录。", en: "Only administrators can log in to this system." },
    ],
    exercises: [
      { prompt: "只有得到批准，我们___能开始这个项目。", options: ["就", "也", "才", "都"], answer: 2, why: "只有 pairs with 才." },
      { prompt: "___你亲自去，他才会同意。", options: ["只有", "只要", "虽然", "因为"], answer: 0, why: "才 shows a necessary condition, introduced by 只有." },
      { prompt: "这个文件只有财务部的人___能看。", options: ["都", "也", "就", "才"], answer: 3, why: "Only the finance staff can see it, so 才." },
    ],
  },
  {
    id: "g-buguan",
    pattern: "不管 / 无论 + question / A 还是 B，都 …",
    title: "不管 / 无论…都… (no matter)",
    level: 4,
    category: "connectors",
    explain:
      "不管 or 无论 introduces a range of possibilities that makes no difference to the result, which follows with 都 (or 也). The clause after 不管 must contain a question word, a 还是 choice, or an A不A pattern. 无论 is slightly more formal.",
    pitfalls: "✗ 不管天气很好，我都去。 ✓ 不管天气好不好，我都去。",
    examples: [
      { zh: "不管多忙，他都会回邮件。", en: "No matter how busy he is, he always replies to emails." },
      { zh: "无论价格高还是低，客户都要看合同。", en: "Whether the price is high or low, the client wants to see the contract." },
      { zh: "不管谁来，都要先登记。", en: "No matter who comes, they must register first." },
      { zh: "无论遇到什么问题，我们都会帮你解决。", en: "Whatever problem you run into, we will help you solve it." },
    ],
    exercises: [
      { prompt: "不管工作多忙，他每天___锻炼。", options: ["才", "都", "就", "却"], answer: 1, why: "都 follows 不管 to state the constant result." },
      { prompt: "不管你同意___不同意，会议都要按时开始。", options: ["而且", "和", "虽然", "还是"], answer: 3, why: "A 还是 not-A gives the range." },
      { prompt: "___谁问你，你都不要说。", options: ["因为", "除了", "不管", "虽然"], answer: 2, why: "不管 + 谁 + 都 means whoever asks." },
    ],
  },
  {
    id: "g-ji-you",
    pattern: "S + 既 A 又 B",
    title: "既…又… (both…and…)",
    level: 4,
    category: "connectors",
    explain:
      "既 A 又 B joins two qualities or actions of the same subject, both true at once. It sounds a little more written than 又…又…. A and B should be the same type of word, either both adjectives or both verbs.",
    pitfalls: "✗ 既他聪明又努力。 ✓ 他既聪明又努力。 (Put the subject before 既.)",
    examples: [
      { zh: "这家酒店既干净又便宜。", en: "This hotel is both clean and cheap." },
      { zh: "他既是我的同事，又是我的朋友。", en: "He is both my colleague and my friend." },
      { zh: "这个产品既实用又好看。", en: "This product is both practical and good-looking." },
      { zh: "新方案既能降低成本，又能提高效率。", en: "The new plan can both lower costs and raise efficiency." },
    ],
    exercises: [
      { prompt: "这个办公室既明亮___安静。", options: ["就", "又", "才", "却"], answer: 1, why: "既…又… is the fixed pair." },
      { prompt: "他___会说英语，又会说日语。", options: ["虽", "就", "才", "既"], answer: 3, why: "既 begins the pair." },
      { prompt: "新软件既能节省时间，___能减少错误。", options: ["又", "却", "但", "所以"], answer: 0, why: "又 completes 既…又…." },
    ],
  },
  {
    id: "g-bushi-ershi",
    pattern: "不是 A，而是 B",
    title: "不是…而是… (not A but B)",
    level: 4,
    category: "connectors",
    explain:
      "不是 A，而是 B denies one thing and replaces it with the correct one. It is used to correct a misunderstanding. Use 而是, not 但是, to introduce the replacement.",
    pitfalls: "✗ 不是价格问题，但是质量问题。 ✓ 不是价格问题，而是质量问题。",
    examples: [
      { zh: "他不是不想来，而是没有时间。", en: "It’s not that he doesn’t want to come; he has no time." },
      { zh: "问题不是预算不够，而是流程太慢。", en: "The problem is not an insufficient budget but a slow process." },
      { zh: "我要的不是礼物，而是你的理解。", en: "What I want is not a gift but your understanding." },
      { zh: "这不是失败，而是一次学习的机会。", en: "This is not a failure but a learning opportunity." },
    ],
    exercises: [
      { prompt: "我不是不同意，___是想再考虑一下。", options: ["但", "而", "因", "所"], answer: 1, why: "而是 introduces the corrected statement." },
      { prompt: "他想要的不是钱，___是尊重。", options: ["可是", "但是", "而是", "所以"], answer: 2, why: "不是…而是… replaces one thing with another." },
      { prompt: "这次问题不是技术原因，___是管理原因。", options: ["然", "才", "就", "而"], answer: 3, why: "而是 is the standard counterpart to 不是." },
    ],
  },
  {
    id: "g-youyu",
    pattern: "由于 A，(因此 / 所以) B",
    title: "由于…因此… (owing to…therefore…)",
    level: 4,
    category: "formal & written",
    explain:
      "由于 is the written, formal version of 因为, often used in announcements, emails and reports. It pairs with 因此 or 所以 for the result. In casual speech, people say 因为…所以… instead.",
    pitfalls: "✗ 由于市场变化，可是公司调整了战略。 ✓ 由于市场变化，因此公司调整了战略。",
    examples: [
      { zh: "由于天气原因，航班推迟了。", en: "Due to weather, the flight was delayed." },
      { zh: "由于原材料涨价，我们的成本增加了。", en: "Because raw material prices rose, our costs went up." },
      { zh: "由于客户临时有事，会议因此改到了下周。", en: "Because the client had something come up, the meeting was moved to next week." },
      { zh: "由于系统升级，今晚十点以后无法登录。", en: "Due to a system upgrade, login is unavailable after 10 p.m. tonight." },
    ],
    exercises: [
      { prompt: "由于原材料价格上涨，公司___提高了产品价格。", options: ["虽然", "因此", "如果", "除非"], answer: 1, why: "因此 gives the result of 由于." },
      { prompt: "___系统故障，付款推迟了一天。", options: ["虽然", "只有", "由于", "除了"], answer: 2, why: "由于 introduces the cause in formal writing." },
      { prompt: "由于天气不好，航班取消了，我们___改签了明天的票。", options: ["虽然", "即使", "不管", "因此"], answer: 3, why: "因此 gives the consequence." },
    ],
  },
  {
    id: "g-shenzhi",
    pattern: "A，甚至 B (都 / 也)",
    title: "甚至 (even)",
    level: 4,
    category: "emphasis",
    explain:
      "甚至 adds an extreme example to a list or statement: “even …”. It is often followed by 连…都… or 都 for extra force. The example after 甚至 is more surprising than what came before.",
    pitfalls: "✗ 他很忙，甚至吃饭。 ✓ 他很忙，甚至连吃饭的时间都没有。",
    examples: [
      { zh: "他太忙了，甚至忘了吃午饭。", en: "He was so busy that he even forgot to eat lunch." },
      { zh: "这个问题很简单，甚至小孩子都会。", en: "This problem is so simple that even a child can do it." },
      { zh: "最近物价上涨，甚至连蔬菜都贵了不少。", en: "Prices have risen recently; even vegetables are a lot more expensive." },
      { zh: "他甚至没看合同就签了字。", en: "He even signed without reading the contract." },
    ],
    exercises: [
      { prompt: "他工作太忙，___连周末都不休息。", options: ["可是", "因为", "除非", "甚至"], answer: 3, why: "甚至 introduces the extreme example." },
      { prompt: "这个软件很容易，___老人都会用。", options: ["所以", "甚至", "如果", "只要"], answer: 1, why: "甚至 + 都 emphasises that even the elderly can use it." },
      { prompt: "他太累了，甚至连饭___没吃就睡了。", options: ["都", "才", "就", "又"], answer: 0, why: "连…都… pairs with 甚至." },
    ],
  },
  {
    id: "g-faner",
    pattern: "A，(S) 反而 B",
    title: "反而 (on the contrary)",
    level: 4,
    category: "connectors",
    explain:
      "反而 introduces a result that is the opposite of what you would expect. The first clause sets up the expectation; the second delivers the surprise. It is not just a plain contrast like 但是.",
    pitfalls: "✗ 我喜欢茶，反而他喜欢咖啡。 ✓ 我喜欢茶，但是他喜欢咖啡。 (反而 needs a reversed expectation.)",
    examples: [
      { zh: "吃了药，他的病反而更重了。", en: "After taking the medicine, he got even sicker." },
      { zh: "我帮他，他反而生气了。", en: "I helped him, but instead he got angry." },
      { zh: "价格降了，销量反而下降了。", en: "The price was lowered, yet sales actually fell." },
      { zh: "我们加了人手，进度反而变慢了。", en: "We added staff, but progress actually slowed down." },
    ],
    exercises: [
      { prompt: "他没有感谢我，___批评了我。", options: ["所以", "反而", "因此", "如果"], answer: 1, why: "反而 signals the opposite of the expected thanks." },
      { prompt: "我们加了人手，进度___变慢了。", options: ["因为", "只要", "然后", "反而"], answer: 3, why: "Adding staff should speed things up, so 反而." },
      { prompt: "天气越来越热，他穿得___更多了。", options: ["反而", "只有", "不管", "既然"], answer: 0, why: "Wearing more in hotter weather is unexpected." },
    ],
  },
  {
    id: "g-bing",
    pattern: "并 + 不 / 没 / 非",
    title: "并不 / 并没 (not at all, in fact not)",
    level: 4,
    category: "emphasis",
    explain:
      "并 placed before a negative strengthens it and corrects an assumption: “actually not”, “not at all”. It can only come before 不, 没 or 非. Without a negative it is wrong.",
    pitfalls: "✗ 这个价格并很高。 ✓ 这个价格并不高。",
    examples: [
      { zh: "这个方案并不复杂。", en: "This plan is actually not complicated." },
      { zh: "我并没有生气，只是有点累。", en: "I’m not angry at all; I’m just a bit tired." },
      { zh: "他并不是经理，只是助理。", en: "He is not actually a manager, just an assistant." },
      { zh: "报告并没有错，是你理解错了。", en: "There’s nothing wrong with the report; you misunderstood." },
    ],
    exercises: [
      { prompt: "你别担心，这个问题___不严重。", options: ["很", "并", "才", "再"], answer: 1, why: "并不 emphasises that it is not serious." },
      { prompt: "我___没说过这句话，你记错了。", options: ["才", "再", "正", "并"], answer: 3, why: "并没 denies an assumption." },
      { prompt: "他看起来很年轻，其实___不年轻了。", options: ["并", "很", "最", "更"], answer: 0, why: "并不 corrects the impression." },
    ],
  },
  {
    id: "g-yi-wei",
    pattern: "以 A 为 B",
    title: "以…为… (take A as B)",
    level: 4,
    category: "formal & written",
    explain:
      "以 A 为 B means to take A as B: 以客户为中心 (customer-centred), 以质量为原则. It is formal and common in slogans, company values and reports. 为 here means “as / to be”.",
    pitfalls: "✗ 我们以客户是中心。 ✓ 我们以客户为中心。 (Use 为, not 是.)",
    examples: [
      { zh: "我们公司以客户为中心。", en: "Our company is customer-centred." },
      { zh: "以过去三年的数据为基础，我们制定了新的预算。", en: "Based on the data of the last three years, we drew up a new budget." },
      { zh: "我们以年底前完成融资为目标。", en: "We take completing the financing before year-end as our goal." },
      { zh: "这家银行以服务中小企业为主。", en: "This bank mainly serves small and medium-sized enterprises." },
    ],
    exercises: [
      { prompt: "我们的服务以客户满意___最高目标。", options: ["是", "有", "为", "在"], answer: 2, why: "以 A 为 B is the fixed pattern." },
      { prompt: "以过去三年的数据___基础，我们制定了新的预算。", options: ["给", "为", "对", "把"], answer: 1, why: "以…为基础 means “taking … as the basis”." },
      { prompt: "公司以“质量第一”___原则。", options: ["被", "为", "把", "是"], answer: 1, why: "以…为原则 takes 为." },
    ],
  },

  // ───────────── HSK 5 ─────────────
  {
    id: "g-yuqi",
    pattern: "与其 A，不如 B",
    title: "与其…不如… (rather than…better to…)",
    level: 5,
    category: "connectors",
    explain:
      "与其 A，不如 B gives advice: instead of A, B is the better choice. A is the rejected option and B the recommended one. Native speakers also use it to correct a description: 与其说…，不如说….",
    pitfalls: "✗ 与其等他，还是自己去。 ✓ 与其等他，不如自己去。",
    examples: [
      { zh: "与其在家看电视，不如出去走走。", en: "Rather than watching TV at home, you’d better go out for a walk." },
      { zh: "与其花钱请外部顾问，不如培训自己的员工。", en: "Rather than hire outside consultants, it’s better to train our own staff." },
      { zh: "与其继续争论，不如先看数据。", en: "Rather than keep arguing, let’s look at the data first." },
      { zh: "与其说他不愿意，不如说他没有时间。", en: "It’s more that he lacks time than that he is unwilling." },
    ],
    exercises: [
      { prompt: "与其继续等，___现在就去问他。", options: ["不管", "不如", "不但", "不过"], answer: 1, why: "与其…不如… recommends the better option." },
      { prompt: "与其花时间抱怨，___想办法解决。", options: ["也许", "而且", "因此", "不如"], answer: 3, why: "不如 introduces what is preferable." },
      { prompt: "___借钱买车，不如坐地铁。", options: ["既然", "与其", "即使", "尽管"], answer: 1, why: "与其 begins the rejected option." },
    ],
  },
  {
    id: "g-ningke",
    pattern: "宁可 A，也要 / 也不 B",
    title: "宁可…也… (would rather…than…)",
    level: 5,
    category: "connectors",
    explain:
      "宁可 A，也 B expresses a hard choice: accept the cost A rather than give up B. Use 也要 for what you insist on and 也不 for what you refuse. The sacrifice comes first, the priority second.",
    pitfalls: "✗ 宁可加班，不放弃这个客户。 ✓ 宁可加班，也不放弃这个客户。",
    examples: [
      { zh: "我宁可多花点钱，也要买质量好的。", en: "I’d rather spend a bit more to buy good quality." },
      { zh: "他宁可加班到半夜，也不愿意拖到明天。", en: "He’d rather work late into the night than put it off until tomorrow." },
      { zh: "宁可少赚一点，也不能失去客户的信任。", en: "We would rather earn a little less than lose the client’s trust." },
      { zh: "我宁可走路去，也不想坐拥挤的地铁。", en: "I’d rather walk than take the crowded subway." },
    ],
    exercises: [
      { prompt: "我宁可少睡几个小时，___要把报告做完。", options: ["就", "才", "也", "还"], answer: 2, why: "宁可…也要… is the fixed pair." },
      { prompt: "宁可晚一天交货，___不能交有问题的产品。", options: ["就", "也", "才", "却"], answer: 1, why: "也 follows the sacrifice to state what must not happen." },
      { prompt: "他___亏钱，也不肯涨价。", options: ["因为", "只要", "既然", "宁可"], answer: 3, why: "宁可 introduces the acceptable cost." },
    ],
  },
  {
    id: "g-hekuang",
    pattern: "A 尚且 / 都 …，何况 B？",
    title: "何况 (let alone / all the more so)",
    level: 5,
    category: "connectors",
    explain:
      "何况 adds a stronger reason: if the easy case is already true, then the harder case is even more so. It often appears as a rhetorical question ending in 呢. It can also add a further reason: 又…，何况….",
    pitfalls: "✗ 我喜欢吃苹果，何况我也喜欢香蕉。 ✓ 苹果我都不爱吃，何况榴莲。 (何况 needs a lesser-to-greater logic.)",
    examples: [
      { zh: "大人都搬不动，何况孩子呢？", en: "Adults can’t even move it, let alone children." },
      { zh: "这家餐厅很远，何况现在又下雨，我们别去了。", en: "That restaurant is far, and besides it’s raining now; let’s not go." },
      { zh: "专家都没把握，何况我们新人呢？", en: "Even the experts aren’t sure, let alone us newcomers." },
      { zh: "平时就很忙，何况现在是年底。", en: "We’re busy as usual, never mind now at year-end." },
    ],
    exercises: [
      { prompt: "简单的问题他都答不上来，___这么难的问题呢？", options: ["所以", "不过", "何况", "虽然"], answer: 2, why: "何况 means “let alone”." },
      { prompt: "这个价格已经很高了，___质量还不好。", options: ["宁可", "何况", "除非", "即使"], answer: 1, why: "何况 adds a further reason." },
      { prompt: "他一个人都完成了，___我们这么多人？", options: ["何况", "即使", "假如", "除非"], answer: 0, why: "If one person did it, many people surely can." },
    ],
  },

  // ───────────── HSK 6 / formal ─────────────
  {
    id: "g-zhisuoyi",
    pattern: "S + 之所以 A，是因为 B",
    title: "之所以…是因为… (the reason why…is that…)",
    level: 6,
    category: "formal & written",
    explain:
      "之所以 A，是因为 B puts the result first and the reason second, to explain or emphasise why something happened. The reason clause starts with 是因为; don’t add 所以. It is common in reports, interviews and analysis.",
    pitfalls: "✗ 之所以他迟到，所以堵车。 ✓ 他之所以迟到，是因为堵车。",
    examples: [
      { zh: "我之所以选择这家公司，是因为它的发展前景好。", en: "The reason I chose this company is that it has good prospects." },
      { zh: "项目之所以延期，是因为需求变更太多。", en: "The reason the project was delayed is that there were too many changes in requirements." },
      { zh: "他之所以能成功，主要是因为从不放弃。", en: "He was able to succeed mainly because he never gave up." },
      { zh: "银行之所以提高利率，是因为要控制通胀。", en: "The reason the bank raised interest rates is to control inflation." },
    ],
    exercises: [
      { prompt: "他之所以辞职，___因为想去国外发展。", options: ["就", "是", "才", "还"], answer: 1, why: "之所以…是因为… is the fixed pair." },
      { prompt: "公司之所以亏损，___因为成本太高。", options: ["却", "就", "是", "才"], answer: 2, why: "是因为 introduces the reason." },
      { prompt: "我们之所以推迟发布，是___客户要求修改。", options: ["因为", "所以", "虽然", "即使"], answer: 0, why: "是因为 states the cause." },
    ],
  },
  {
    id: "g-jiuerlan",
    pattern: "就 A 而言，B",
    title: "就…而言 (as far as … is concerned)",
    level: 6,
    category: "formal & written",
    explain:
      "就 A 而言 narrows the topic to one angle: “as far as A is concerned, …”. It is typical of meetings, analysis and written evaluation, and the comment follows after a comma. 而言 can’t be left out.",
    pitfalls: "✗ 就这个项目，风险太高。 ✓ 就这个项目而言，风险太高。",
    examples: [
      { zh: "就我个人而言，我更喜欢第二个方案。", en: "Personally, I prefer the second plan." },
      { zh: "就成本而言，这个供应商最便宜。", en: "In terms of cost, this supplier is the cheapest." },
      { zh: "就目前的市场情况而言，现在投资并不合适。", en: "Given the current market conditions, investing now isn’t suitable." },
      { zh: "就这个季度的业绩而言，我们已经超额完成了目标。", en: "As far as this quarter’s performance goes, we have exceeded our target." },
    ],
    exercises: [
      { prompt: "就风险___，这个产品比较高。", options: ["而且", "而言", "而是", "以为"], answer: 1, why: "就…而言 is the fixed frame." },
      { prompt: "___我个人而言，我支持这个计划。", options: ["把", "被", "让", "就"], answer: 3, why: "就 starts the frame." },
      { prompt: "就长期___，这笔投资很有价值。", options: ["而言", "而已", "而是", "而且"], answer: 0, why: "而言 closes the frame; 而已 means “only”." },
    ],
  },
];
