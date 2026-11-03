/** Open questions for the HSKK-style speaking test (part 3, "回答问题"). */
export type HskkQuestion = { zh: string; en: string };

/** Intermediate (HSK 3–4): personal topics, about 1.5 minutes each */
export const HSKK_MID: HskkQuestion[] = [
  { zh: "请介绍一下你现在的工作。你每天主要做什么？", en: "Describe your current job. What do you mainly do every day?" },
  { zh: "你平时周末一般怎么过？请说说上个周末你做了什么。", en: "How do you usually spend your weekends? Tell me what you did last weekend." },
  { zh: "你为什么学习汉语？学汉语的时候，你觉得什么最难？", en: "Why are you learning Chinese? What do you find hardest?" },
  { zh: "请介绍一个你去过的城市。你喜欢那里吗？为什么？", en: "Describe a city you have been to. Did you like it, and why?" },
  { zh: "你喜欢一个人工作还是和别人一起工作？为什么？", en: "Do you prefer working alone or with others? Why?" },
  { zh: "请说说你的一个好朋友。你们是怎么认识的？", en: "Tell me about a good friend. How did you meet?" },
  { zh: "你觉得住在大城市好还是小城市好？请说说你的理由。", en: "Is it better to live in a big city or a small town? Give your reasons." },
  { zh: "你一般怎么去上班？路上要多长时间？", en: "How do you usually get to work? How long does it take?" },
  { zh: "你最近买过什么东西？你为什么买它？", en: "What have you bought recently? Why did you buy it?" },
  { zh: "如果有一个星期的假期，你想做什么？", en: "If you had a week's holiday, what would you like to do?" },
];

/** Advanced (HSK 5–6): opinions and explanations, about 2.5 minutes each */
export const HSKK_ADV: HskkQuestion[] = [
  { zh: "有人认为年轻人应该先工作几年再买房，你同意吗？请谈谈你的看法。", en: "Some say young people should work for a few years before buying a home. Do you agree?" },
  { zh: "人工智能会给金融行业带来哪些变化？请举例说明。", en: "What changes will AI bring to the finance industry? Give examples." },
  { zh: "你认为一个好的领导应该具备哪些能力？为什么？", en: "What abilities should a good leader have? Why?" },
  { zh: "现在很多公司允许员工在家办公。你觉得这样有什么好处和坏处？", en: "Many companies let staff work from home. What are the pros and cons?" },
  { zh: "请谈谈你在工作中遇到过的一个困难，以及你是怎么解决的。", en: "Describe a difficulty you met at work and how you solved it." },
  { zh: "有人说“钱是存出来的”，也有人说“钱是赚出来的”。你更同意哪一种说法？", en: "Some say wealth comes from saving, others from earning. Which do you agree with more?" },
  { zh: "如果你是公司的财务经理，你会怎样帮助公司降低成本？", en: "If you were the company's finance manager, how would you help cut costs?" },
  { zh: "你认为跨国公司在中国发展，最需要注意哪些文化差异？", en: "What cultural differences should multinationals pay most attention to in China?" },
  { zh: "选择工作的时候，你更看重工资还是发展机会？请说明理由。", en: "When choosing a job, do you value salary or career development more? Explain." },
  { zh: "你觉得网上购物对传统商店有什么影响？传统商店应该怎么应对？", en: "How does online shopping affect traditional shops, and how should they respond?" },
];
