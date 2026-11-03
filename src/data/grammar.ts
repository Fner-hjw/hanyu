export type Grammar = {
  id: string;
  pattern: string;
  title: string;
  level: number;
  explain: string;
  examples: { zh: string; en: string }[];
  exercise: { prompt: string; options: string[]; answer: number; why: string };
};

export const GRAMMAR: Grammar[] = [
  {
    id: "g-ba",
    pattern: "S + 把 + O + V + 结果/方向",
    title: "把 construction (disposal)",
    level: 4,
    explain:
      "Use 把 to bring the object forward and say what happens to it. The verb must be followed by a result, direction, or complement – never a bare verb. Very common in instructions and reports.",
    examples: [
      { zh: "请把发票发给我。", en: "Please send me the invoice." },
      { zh: "我已经把合同改好了。", en: "I've already finished revising the contract." },
      { zh: "他把预算交给了经理。", en: "He handed the budget to the manager." },
    ],
    exercise: {
      prompt: "我已经___报告写完了。",
      options: ["把", "被", "对", "给"],
      answer: 0,
      why: "把 + object + 写完 (result complement).",
    },
  },
  {
    id: "g-bei",
    pattern: "O + 被 + (agent) + V + 其他成分",
    title: "被 construction (passive)",
    level: 4,
    explain:
      "被 marks the passive. Often implies something unwelcome or a formal report of events. In writing, 被 + V is used more freely than in speech.",
    examples: [
      { zh: "这个项目被取消了。", en: "This project was cancelled." },
      { zh: "文件被同事拿走了。", en: "The file was taken away by a colleague." },
      { zh: "他的建议被大家接受了。", en: "His suggestion was accepted by everyone." },
    ],
    exercise: {
      prompt: "那份合同___客户退回来了。",
      options: ["把", "被", "让", "跟"],
      answer: 1,
      why: "The contract is the one being acted on → 被 (客户 is the agent).",
    },
  },
  {
    id: "g-suiran",
    pattern: "虽然 A，但是/可是 B",
    title: "Although A, but B",
    level: 4,
    explain:
      "Concession. Unlike English, Chinese keeps BOTH 虽然 and 但是 – you don't drop one. 虽然 can also come after the subject.",
    examples: [
      { zh: "虽然价格很高，但是质量很好。", en: "Although the price is high, the quality is very good." },
      { zh: "他虽然很忙，但是还是来参加会议了。", en: "Although he is busy, he still came to the meeting." },
      { zh: "虽然这个方案有风险，可是值得试一试。", en: "Although this plan is risky, it is worth trying." },
    ],
    exercise: {
      prompt: "___条件不太好，我们还是决定签约。",
      options: ["因为", "虽然", "如果", "所以"],
      answer: 1,
      why: "Concession: 虽然 … 还是 …",
    },
  },
  {
    id: "g-budan",
    pattern: "不但 A，而且 B",
    title: "Not only A, but also B",
    level: 4,
    explain:
      "Progression. B is stronger or additional. When the subjects differ, 不但 goes before the first subject: 不但他…，而且我…",
    examples: [
      { zh: "这个方案不但便宜，而且很安全。", en: "This plan is not only cheap, but also very safe." },
      { zh: "她不但会说英语，而且会说中文。", en: "She not only speaks English, but also Chinese." },
      { zh: "不但客户满意，而且老板也很满意。", en: "Not only the client, but the boss is also satisfied." },
    ],
    exercise: {
      prompt: "新系统不但速度快，___错误少。",
      options: ["但是", "而且", "所以", "然后"],
      answer: 1,
      why: "不但 pairs with 而且 (often with 也/还).",
    },
  },
  {
    id: "g-jishi",
    pattern: "即使/就算 A，也 B",
    title: "Even if A, still B",
    level: 5,
    explain:
      "Hypothetical concession: B holds regardless of A. 也 (or 还) is required in the second clause.",
    examples: [
      { zh: "即使价格再低，我们也不会买。", en: "Even if the price were lower, we wouldn't buy." },
      { zh: "就算加班，我们也要按时完成。", en: "Even if we have to work overtime, we must finish on time." },
      { zh: "即使有风险，他也愿意投资。", en: "Even if there is risk, he is willing to invest." },
    ],
    exercise: {
      prompt: "即使客户不同意，我们___会坚持这个价格。",
      options: ["就", "也", "才", "却"],
      answer: 1,
      why: "即使…也… (even if … still …).",
    },
  },
  {
    id: "g-yidan",
    pattern: "一旦 A，(就) B",
    title: "Once A happens, B",
    level: 5,
    explain:
      "Used for conditions with serious consequences: 'once X happens, then Y'. Typical in contracts and risk talk.",
    examples: [
      { zh: "一旦违约，就要赔偿损失。", en: "Once the contract is breached, losses must be compensated." },
      { zh: "一旦发现问题，请马上通知我。", en: "Once you find a problem, notify me immediately." },
      { zh: "一旦签约，价格就不能改了。", en: "Once signed, the price can't be changed." },
    ],
    exercise: {
      prompt: "___资金出了问题，整个项目就会停下来。",
      options: ["虽然", "一旦", "不但", "即使"],
      answer: 1,
      why: "一旦…就… — a consequential condition.",
    },
  },
  {
    id: "g-chufei",
    pattern: "除非 A，否则 B",
    title: "Unless A, otherwise B",
    level: 5,
    explain:
      "A is the only condition that avoids B. 否则 = 'otherwise' and introduces the negative outcome. Useful when you set conditions in negotiation.",
    examples: [
      { zh: "除非你们降价，否则我们不能签约。", en: "Unless you lower the price, we can't sign." },
      { zh: "除非有特殊情况，否则会议不会取消。", en: "Unless something special comes up, the meeting won't be cancelled." },
      { zh: "除非提前付款，否则不能发货。", en: "Unless payment is made in advance, we can't ship." },
    ],
    exercise: {
      prompt: "除非客户同意，___我们不能改合同。",
      options: ["而且", "否则", "因此", "然后"],
      answer: 1,
      why: "除非…否则… (unless … otherwise …).",
    },
  },
  {
    id: "g-genju",
    pattern: "根据/按照/依照 + N，…",
    title: "According to … (根据 / 按照)",
    level: 5,
    explain:
      "根据 = on the basis of (data, facts, reports). 按照 = following (rules, plans, procedures). 根据 is for evidence, 按照 for standards.",
    examples: [
      { zh: "根据最新的数据，销售额在增长。", en: "According to the latest data, sales are growing." },
      { zh: "按照合同，我们应该三十天内付款。", en: "According to the contract, we should pay within thirty days." },
      { zh: "请按照这个流程操作。", en: "Please proceed following this procedure." },
    ],
    exercise: {
      prompt: "___公司规定，报销需要发票。",
      options: ["关于", "按照", "对于", "为了"],
      answer: 1,
      why: "A rule/regulation → 按照.",
    },
  },
  {
    id: "g-guanyu",
    pattern: "关于 / 对于 + N，…",
    title: "About… vs. as for… (关于 / 对于)",
    level: 5,
    explain:
      "关于 introduces a topic ('regarding'): 关于这个问题. 对于 marks a person's attitude toward something ('as for'): 对于这个方案，我有不同的看法. Never use 关于 with attitudes.",
    examples: [
      { zh: "关于预算，我们下次再讨论。", en: "Regarding the budget, we'll discuss next time." },
      { zh: "对于这个价格，客户不太满意。", en: "As for this price, the client is not very satisfied." },
      { zh: "关于合同的问题，请联系法务部。", en: "For matters regarding the contract, contact the legal department." },
    ],
    exercise: {
      prompt: "___这个报价，我们有一些不同的意见。",
      options: ["关于", "对于", "按照", "根据"],
      answer: 1,
      why: "Our opinion toward the quote → 对于.",
    },
  },
  {
    id: "g-weile",
    pattern: "为了 + 目的，…",
    title: "In order to / for the sake of (为了)",
    level: 4,
    explain:
      "为了 introduces the goal. It commonly goes at the start of the sentence, before the action taken to achieve it.",
    examples: [
      { zh: "为了降低成本，我们换了供应商。", en: "To reduce cost, we changed supplier." },
      { zh: "为了按时完成，大家都在加班。", en: "To finish on time, everyone is working overtime." },
      { zh: "为了提高效率，公司引进了新系统。", en: "To raise efficiency, the company brought in a new system." },
    ],
    exercise: {
      prompt: "___让客户满意，我们修改了方案。",
      options: ["为了", "因为", "如果", "虽然"],
      answer: 0,
      why: "Purpose → 为了.",
    },
  },
  {
    id: "g-lian",
    pattern: "连 A 都/也 B",
    title: "Even A (连…都)",
    level: 5,
    explain:
      "Emphasises an extreme example: 'even A'. 都 or 也 is required after the subject/verb phrase.",
    examples: [
      { zh: "他忙得连饭都没吃。", en: "He was so busy he didn't even eat." },
      { zh: "这个问题连经理都不知道。", en: "Even the manager doesn't know this." },
      { zh: "连这么小的错误都被发现了。", en: "Even such a small mistake was spotted." },
    ],
    exercise: {
      prompt: "这个词太难了，___老师都不认识。",
      options: ["连", "把", "被", "对"],
      answer: 0,
      why: "连…都… for 'even'.",
    },
  },
  {
    id: "g-jiran",
    pattern: "既然 A，(那么) 就 B",
    title: "Since A (already true), then B",
    level: 5,
    explain:
      "既然 introduces a known fact as the basis for a conclusion or suggestion. Unlike 因为, the fact is already accepted by both sides.",
    examples: [
      { zh: "既然大家都同意，我们就开始吧。", en: "Since everyone agrees, let's begin." },
      { zh: "既然价格太高，就再谈一谈吧。", en: "Since the price is too high, let's negotiate again." },
      { zh: "既然你有时间，就帮我看看这份文件。", en: "Since you have time, take a look at this document for me." },
    ],
    exercise: {
      prompt: "___你已经答应了，就应该按时完成。",
      options: ["既然", "即使", "除非", "虽然"],
      answer: 0,
      why: "A is an accepted fact → 既然.",
    },
  },
];
