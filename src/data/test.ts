export type TestQ = {
  id: string;
  section: "vocab" | "grammar" | "reading" | "listening";
  level: 3 | 4 | 5 | 6;
  /** passage / sentence shown (or spoken for listening) */
  text?: string;
  prompt: string;
  options: string[];
  answer: number;
};

export const TEST: TestQ[] = [
  // ---- Vocabulary: choose the best meaning / word ----
  { id: "v1", section: "vocab", level: 3, prompt: "“经常”的意思是？", options: ["often", "never", "suddenly", "maybe"], answer: 0 },
  { id: "v2", section: "vocab", level: 4, prompt: "“麻烦”的意思是？", options: ["to forget", "to trouble / troublesome", "to prepare", "to refuse"], answer: 1 },
  { id: "v3", section: "vocab", level: 4, prompt: "“收入”的意思是？", options: ["expense", "income", "tax", "price"], answer: 1 },
  { id: "v4", section: "vocab", level: 5, prompt: "“尽快”的意思是？", options: ["as soon as possible", "slowly", "at any time", "next year"], answer: 0 },
  { id: "v5", section: "vocab", level: 5, prompt: "“风险”的意思是？", options: ["opportunity", "risk", "profit", "habit"], answer: 1 },
  { id: "v6", section: "vocab", level: 6, prompt: "“预算”的意思是？", options: ["budget", "invoice", "audit", "contract"], answer: 0 },
  { id: "v7", section: "vocab", level: 6, prompt: "“妥协”的意思是？", options: ["to oppose", "to compromise", "to sign", "to postpone"], answer: 1 },
  { id: "v8", section: "vocab", level: 6, prompt: "“落实”的意思是？", options: ["to carry out / implement", "to fall down", "to postpone", "to cancel"], answer: 0 },

  // ---- Grammar: fill the blank ----
  { id: "g1", section: "grammar", level: 3, prompt: "我___中国菜很感兴趣。", options: ["对", "把", "被", "比"], answer: 0 },
  { id: "g2", section: "grammar", level: 4, prompt: "请你___这份文件发给经理。", options: ["被", "把", "让", "从"], answer: 1 },
  { id: "g3", section: "grammar", level: 4, prompt: "___他很忙，但是还是来了。", options: ["因为", "如果", "虽然", "所以"], answer: 2 },
  { id: "g4", section: "grammar", level: 5, prompt: "这个方案不但成本低，___效果也很好。", options: ["而且", "但是", "然后", "所以"], answer: 0 },
  { id: "g5", section: "grammar", level: 5, prompt: "除非你们同意降价，___我们不会签约。", options: ["因此", "否则", "而且", "于是"], answer: 1 },
  { id: "g6", section: "grammar", level: 5, prompt: "他忙得___吃饭的时间都没有。", options: ["连", "把", "被", "对"], answer: 0 },
  { id: "g7", section: "grammar", level: 6, prompt: "___合同的规定，违约方需要赔偿。", options: ["对于", "关于", "按照", "至于"], answer: 2 },
  { id: "g8", section: "grammar", level: 6, prompt: "___项目进展顺利，我们也不能放松警惕。", options: ["即使", "既然", "以便", "何况"], answer: 0 },

  // ---- Reading ----
  {
    id: "r1", section: "reading", level: 3,
    text: "明天上午九点有一个会议，在三楼的会议室。请大家不要迟到。",
    prompt: "会议在哪里开？", options: ["一楼", "二楼", "三楼", "四楼"], answer: 2,
  },
  {
    id: "r2", section: "reading", level: 4,
    text: "小王本来打算坐火车去上海出差，但是听说明天有大雨，火车可能会晚点，所以他改坐飞机了。",
    prompt: "小王为什么改坐飞机？", options: ["飞机更便宜", "火车可能晚点", "他不喜欢火车", "没有火车票"], answer: 1,
  },
  {
    id: "r3", section: "reading", level: 5,
    text: "虽然公司今年的收入增长了百分之十五，但是由于原材料价格上涨，成本也增加了不少，所以利润并没有明显提高。管理层决定明年重点控制成本。",
    prompt: "根据这段话，下面哪个正确？", options: ["利润增长了百分之十五", "成本没有变化", "利润没有明显提高", "明年不控制成本"], answer: 2,
  },
  {
    id: "r4", section: "reading", level: 5,
    text: "尊敬的客户：由于系统升级，本周六晚十点至周日早六点，网上银行将暂停服务。给您带来的不便，敬请谅解。",
    prompt: "这个通知的主要内容是？", options: ["银行提高了利率", "网上银行将暂停服务", "客户可以免费升级", "系统出现了严重错误"], answer: 1,
  },
  {
    id: "r5", section: "reading", level: 6,
    text: "近年来，随着消费观念的转变，越来越多的消费者不再单纯追求低价，而是更看重产品的品质和服务。这一趋势迫使许多企业重新审视自己的定价策略，并在研发上加大投入。",
    prompt: "这一趋势带来了什么影响？", options: ["企业都开始降价", "企业重新考虑定价并加大研发投入", "消费者不再购买产品", "服务质量下降了"], answer: 1,
  },
  {
    id: "r6", section: "reading", level: 6,
    text: "该合同一经双方签字即生效。如任何一方未能按期履行义务，须向对方支付合同总额百分之五的违约金，并承担由此造成的一切损失。",
    prompt: "如果一方没有按期履行义务，会怎么样？", options: ["合同自动结束", "要支付违约金并承担损失", "双方重新谈判", "只需要道歉"], answer: 1,
  },

  // ---- Listening (text is spoken by the browser; hidden by default) ----
  {
    id: "l1", section: "listening", level: 3,
    text: "女：你明天几点来公司？男：我八点半到，你呢？",
    prompt: "男的明天几点到公司？", options: ["八点", "八点半", "九点", "九点半"], answer: 1,
  },
  {
    id: "l2", section: "listening", level: 4,
    text: "女：这个月的报销单你交了吗？男：还没有，我得先找发票。",
    prompt: "男的为什么还没交报销单？", options: ["他很忙", "他在找发票", "他忘了", "他不想交"], answer: 1,
  },
  {
    id: "l3", section: "listening", level: 5,
    text: "女：客户说价格有点儿高，希望再优惠一点。男：我们已经让步了两次，这已经是底线了。",
    prompt: "男的是什么意思？", options: ["可以继续降价", "价格不能再低了", "客户不满意", "不想合作"], answer: 1,
  },
  {
    id: "l4", section: "listening", level: 5,
    text: "男：会议改到下周二了，你能参加吗？女：下周二我要出差，除非他们把时间改到周三。",
    prompt: "女的下周二能参加会议吗？", options: ["能", "不能，因为出差", "不知道", "能，但是会迟到"], answer: 1,
  },
  {
    id: "l5", section: "listening", level: 6,
    text: "女：这家公司连续两年亏损，现金流也很紧张，你觉得值得投资吗？男：风险确实不小，不过它的新产品很有潜力，我建议再观察一个季度。",
    prompt: "男的的建议是什么？", options: ["马上投资", "不要投资", "再观察一个季度", "投资另一家公司"], answer: 2,
  },
  {
    id: "l6", section: "listening", level: 6,
    text: "男：这份预算方案还需要完善，尤其是成本部分。女：好的，我下午跟财务部对完账，晚上把修改版发给您。",
    prompt: "女的打算什么时候发修改版？", options: ["上午", "下午对完账后", "当天晚上", "明天"], answer: 2,
  },
];
