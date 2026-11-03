export type Topic =
  | "finance"
  | "meetings"
  | "email"
  | "negotiation"
  | "phone"
  | "fluency"
  | "general";

export type Word = {
  id: string;
  zh: string;
  py: string;
  en: string;
  topic: Topic;
  /** approximate HSK level (3-6) – verify against the official list */
  level: number;
  ex: string;
  exEn: string;
};

export const TOPICS: Record<Topic, string> = {
  finance: "Finance",
  meetings: "Meetings",
  email: "Email",
  negotiation: "Negotiation",
  phone: "Phone calls",
  fluency: "Fluency phrases",
  general: "General",
};

// [zh, pinyin, english, topic, level, example zh, example en]
type Row = [string, string, string, Topic, number, string, string];

const rows: Row[] = [
  // ---------- Finance ----------
  ["预算", "yùsuàn", "budget", "finance", 6, "我们需要重新审核明年的预算。", "We need to review next year's budget again."],
  ["利润", "lìrùn", "profit", "finance", 6, "这个季度的利润比去年增加了百分之十。", "This quarter's profit rose 10% compared with last year."],
  ["成本", "chéngběn", "cost", "finance", 5, "我们必须想办法降低成本。", "We have to find a way to reduce costs."],
  ["收入", "shōurù", "income; revenue", "finance", 4, "公司的年收入超过一亿元。", "The company's annual revenue exceeds 100 million yuan."],
  ["支出", "zhīchū", "expenditure", "finance", 6, "本月的支出比预期高。", "This month's expenditure is higher than expected."],
  ["发票", "fāpiào", "invoice; receipt", "finance", 5, "请把发票发到我的邮箱。", "Please send the invoice to my email."],
  ["报销", "bàoxiāo", "to claim reimbursement", "finance", 6, "出差的费用可以报销吗？", "Can business-trip expenses be reimbursed?"],
  ["财务", "cáiwù", "finance; financial affairs", "finance", 6, "请联系财务部门确认付款。", "Please contact the finance department to confirm payment."],
  ["会计", "kuàijì", "accountant; accounting", "finance", 6, "她在一家大公司当会计。", "She works as an accountant at a big company."],
  ["审计", "shěnjì", "audit", "finance", 6, "下周审计团队会来公司。", "The audit team is coming to the company next week."],
  ["投资", "tóuzī", "to invest; investment", "finance", 5, "他们打算投资一家新能源公司。", "They plan to invest in a new-energy company."],
  ["风险", "fēngxiǎn", "risk", "finance", 5, "这个项目的风险很大。", "This project carries a lot of risk."],
  ["增长", "zēngzhǎng", "to grow; growth", "finance", 5, "今年销售额增长了百分之二十。", "Sales grew by 20% this year."],
  ["下降", "xiàjiàng", "to decline", "finance", 5, "由于市场不好，利润下降了。", "Profit fell because of the poor market."],
  ["现金流", "xiànjīnliú", "cash flow", "finance", 6, "目前公司的现金流比较紧张。", "The company's cash flow is rather tight at the moment."],
  ["资产", "zīchǎn", "assets", "finance", 6, "公司的总资产有五亿元。", "The company's total assets are 500 million yuan."],
  ["负债", "fùzhài", "liabilities; debt", "finance", 6, "我们要控制负债率。", "We need to keep the debt ratio under control."],
  ["股东", "gǔdōng", "shareholder", "finance", 6, "股东大会将在下个月召开。", "The shareholders' meeting will be held next month."],
  ["汇率", "huìlǜ", "exchange rate", "finance", 6, "最近汇率变化很大。", "The exchange rate has been fluctuating a lot recently."],
  ["利率", "lìlǜ", "interest rate", "finance", 6, "银行提高了贷款利率。", "The bank raised its loan interest rate."],
  ["通货膨胀", "tōnghuò péngzhàng", "inflation", "finance", 6, "通货膨胀影响了人们的生活。", "Inflation has affected people's lives."],
  ["季度", "jìdù", "quarter (of a year)", "finance", 6, "第三季度的业绩不错。", "Third-quarter results were good."],
  ["年度", "niándù", "annual; yearly", "finance", 6, "我们正在准备年度报告。", "We are preparing the annual report."],
  ["财报", "cáibào", "financial report", "finance", 6, "公司下周发布财报。", "The company releases its financial report next week."],
  ["税", "shuì", "tax", "finance", 5, "这笔费用需要交税吗？", "Is tax payable on this expense?"],
  ["账户", "zhànghù", "account (bank)", "finance", 6, "请把钱转到这个账户。", "Please transfer the money to this account."],
  ["转账", "zhuǎnzhàng", "to transfer money", "finance", 6, "我已经通过银行转账付款了。", "I have already paid by bank transfer."],
  ["付款", "fùkuǎn", "to pay; payment", "finance", 5, "付款期限是三十天。", "The payment term is thirty days."],
  ["欠款", "qiànkuǎn", "outstanding debt; arrears", "finance", 6, "客户还有一笔欠款没有结清。", "The client still has an outstanding balance."],
  ["对账", "duìzhàng", "to reconcile accounts", "finance", 6, "月底我们要和供应商对账。", "At month-end we have to reconcile accounts with suppliers."],
  ["亏损", "kuīsǔn", "loss; to lose money", "finance", 6, "这家公司连续三年亏损。", "This company has made a loss for three years in a row."],

  // ---------- Meetings ----------
  ["会议", "huìyì", "meeting", "meetings", 4, "今天下午的会议改到三点了。", "This afternoon's meeting has moved to 3 o'clock."],
  ["议程", "yìchéng", "agenda", "meetings", 6, "请先看一下今天的议程。", "Please take a look at today's agenda first."],
  ["汇报", "huìbào", "to report (to a superior)", "meetings", 6, "我来汇报一下上个月的情况。", "Let me report on last month's situation."],
  ["讨论", "tǎolùn", "to discuss", "meetings", 4, "我们先讨论一下这个方案。", "Let's first discuss this proposal."],
  ["方案", "fāng'àn", "plan; proposal", "meetings", 6, "你觉得哪个方案更合适？", "Which proposal do you think is more suitable?"],
  ["目标", "mùbiāo", "goal; target", "meetings", 5, "我们的目标是明年扩大市场份额。", "Our goal is to expand market share next year."],
  ["进展", "jìnzhǎn", "progress", "meetings", 6, "项目进展得怎么样了？", "How is the project progressing?"],
  ["截止日期", "jiézhǐ rìqī", "deadline", "meetings", 6, "截止日期是下周五。", "The deadline is next Friday."],
  ["负责", "fùzé", "to be responsible for", "meetings", 5, "这个项目由谁负责？", "Who is in charge of this project?"],
  ["安排", "ānpái", "to arrange; arrangement", "meetings", 4, "我来安排一下时间。", "I'll arrange the time."],
  ["同意", "tóngyì", "to agree", "meetings", 4, "我同意你的看法。", "I agree with your view."],
  ["反对", "fǎnduì", "to oppose", "meetings", 5, "没有人反对这个计划。", "Nobody objects to this plan."],
  ["建议", "jiànyì", "to suggest; suggestion", "meetings", 4, "我建议我们先做一个试点。", "I suggest we run a pilot first."],
  ["总结", "zǒngjié", "to summarize; summary", "meetings", 5, "最后我来总结一下今天的讨论。", "Finally, let me summarize today's discussion."],
  ["跟进", "gēnjìn", "to follow up", "meetings", 6, "会后我会继续跟进这件事。", "I'll keep following up on this after the meeting."],
  ["优先", "yōuxiān", "priority; to take precedence", "meetings", 6, "我们应该优先处理这个问题。", "We should deal with this issue first."],
  ["落实", "luòshí", "to carry out; to put into effect", "meetings", 6, "这些决定必须尽快落实。", "These decisions must be carried out as soon as possible."],
  ["达成共识", "dáchéng gòngshí", "to reach a consensus", "meetings", 6, "经过讨论，大家终于达成共识。", "After discussion, everyone finally reached a consensus."],
  ["项目", "xiàngmù", "project", "meetings", 5, "这个项目预计六月完成。", "This project is expected to finish in June."],
  ["部门", "bùmén", "department", "meetings", 5, "各个部门要加强沟通。", "Departments need to communicate more."],
  ["经理", "jīnglǐ", "manager", "meetings", 4, "我们经理今天出差了。", "Our manager is on a business trip today."],
  ["同事", "tóngshì", "colleague", "meetings", 4, "我的同事们都很友好。", "My colleagues are all very friendly."],
  ["客户", "kèhù", "client; customer", "meetings", 5, "客户对我们的服务很满意。", "The client is very satisfied with our service."],
  ["业绩", "yèjì", "performance; results", "meetings", 6, "团队的业绩有明显提高。", "The team's performance has clearly improved."],

  // ---------- Email ----------
  ["附件", "fùjiàn", "attachment", "email", 6, "详细资料请见附件。", "Please see the attachment for details."],
  ["转发", "zhuǎnfā", "to forward", "email", 6, "我把这封邮件转发给你。", "I'm forwarding this email to you."],
  ["抄送", "chāosòng", "to cc", "email", 6, "请把邮件抄送给经理。", "Please cc the manager on the email."],
  ["回复", "huífù", "to reply", "email", 5, "感谢您的回复。", "Thank you for your reply."],
  ["尽快", "jǐnkuài", "as soon as possible", "email", 5, "请您尽快回复我们。", "Please reply to us as soon as possible."],
  ["查收", "cháshōu", "to check and receive (formal)", "email", 6, "附件已发送，请查收。", "The attachment has been sent; please check it."],
  ["确认", "quèrèn", "to confirm", "email", 5, "请确认一下会议时间。", "Please confirm the meeting time."],
  ["通知", "tōngzhī", "to notify; notice", "email", 4, "我们会提前通知您。", "We will notify you in advance."],
  ["打扰", "dǎrǎo", "to disturb", "email", 5, "不好意思，打扰您了。", "Sorry to disturb you."],
  ["麻烦", "máfan", "to trouble; troublesome", "email", 4, "麻烦您帮我看一下这份文件。", "Could I trouble you to look at this document?"],
  ["此致敬礼", "cǐzhì jìnglǐ", "Yours sincerely (letter closing)", "email", 6, "此致敬礼！王明", "Yours sincerely, Wang Ming"],
  ["如有疑问", "rú yǒu yíwèn", "if you have any questions", "email", 6, "如有疑问，请随时联系我。", "If you have any questions, feel free to contact me."],

  // ---------- Negotiation ----------
  ["谈判", "tánpàn", "to negotiate; negotiation", "negotiation", 6, "双方的谈判持续了三天。", "The two sides' negotiations lasted three days."],
  ["报价", "bàojià", "quotation; to quote a price", "negotiation", 6, "请给我们一份详细的报价。", "Please give us a detailed quotation."],
  ["折扣", "zhékòu", "discount", "negotiation", 6, "订购数量多的话可以给折扣吗？", "Can you give a discount if we order a large quantity?"],
  ["让步", "ràngbù", "to make a concession", "negotiation", 6, "我们已经在价格上让步了。", "We have already made a concession on price."],
  ["条款", "tiáokuǎn", "clause; terms", "negotiation", 6, "这个条款需要再修改一下。", "This clause needs to be revised again."],
  ["优惠", "yōuhuì", "preferential; discount offer", "negotiation", 6, "我们可以提供一些优惠条件。", "We can offer some preferential terms."],
  ["价格", "jiàgé", "price", "negotiation", 4, "这个价格有点儿高。", "This price is a bit high."],
  ["底线", "dǐxiàn", "bottom line", "negotiation", 6, "这是我们的底线，不能再低了。", "This is our bottom line; we can't go any lower."],
  ["合作", "hézuò", "to cooperate", "negotiation", 4, "希望我们能长期合作。", "I hope we can cooperate over the long term."],
  ["双赢", "shuāngyíng", "win-win", "negotiation", 6, "我们希望找到双赢的方案。", "We hope to find a win-win solution."],
  ["违约", "wéiyuē", "to breach a contract", "negotiation", 6, "如果违约，需要赔偿损失。", "If the contract is breached, losses must be compensated."],
  ["签约", "qiānyuē", "to sign a contract", "negotiation", 6, "我们计划下周正式签约。", "We plan to sign the contract formally next week."],
  ["合同", "hétong", "contract", "negotiation", 5, "合同需要法务部门审核。", "The contract needs to be reviewed by the legal department."],
  ["考虑", "kǎolǜ", "to consider", "negotiation", 4, "我们需要时间考虑一下。", "We need some time to think it over."],
  ["妥协", "tuǒxié", "to compromise", "negotiation", 6, "双方都愿意做出一些妥协。", "Both sides are willing to make some compromises."],

  // ---------- Phone ----------
  ["稍等", "shāo děng", "please hold on a moment", "phone", 5, "请稍等，我帮您转接。", "Please hold on, I'll transfer you."],
  ["转接", "zhuǎnjiē", "to transfer (a call)", "phone", 6, "我帮您转接到财务部。", "I'll transfer you to the finance department."],
  ["留言", "liúyán", "to leave a message", "phone", 6, "您需要留言吗？", "Would you like to leave a message?"],
  ["信号", "xìnhào", "signal", "phone", 5, "这里信号不太好。", "The signal isn't good here."],
  ["听不清", "tīng bu qīng", "can't hear clearly", "phone", 4, "不好意思，我听不清，您能再说一遍吗？", "Sorry, I can't hear clearly; could you say that again?"],
  ["重复", "chóngfù", "to repeat", "phone", 5, "麻烦您重复一下刚才的号码。", "Could you repeat the number you just gave?"],
  ["占线", "zhànxiàn", "(line) busy", "phone", 6, "他的电话一直占线。", "His line has been busy all the time."],
  ["回电话", "huí diànhuà", "to call back", "phone", 5, "我一会儿给您回电话。", "I'll call you back in a moment."],

  // ---------- Fluency phrases (speaking without stuttering) ----------
  ["怎么说呢", "zěnme shuō ne", "how should I put it…", "fluency", 4, "怎么说呢，这个问题有点儿复杂。", "How should I put it… this question is a bit complicated."],
  ["我的意思是", "wǒ de yìsi shì", "what I mean is…", "fluency", 4, "我的意思是我们需要更多时间。", "What I mean is that we need more time."],
  ["换句话说", "huàn jù huà shuō", "in other words", "fluency", 5, "换句话说，我们得先降低成本。", "In other words, we first have to cut costs."],
  ["比如说", "bǐrú shuō", "for example", "fluency", 4, "比如说，我们可以先做一个小测试。", "For example, we could do a small test first."],
  ["总的来说", "zǒng de lái shuō", "overall; generally speaking", "fluency", 5, "总的来说，结果还不错。", "Overall, the results are not bad."],
  ["让我想想", "ràng wǒ xiǎngxiang", "let me think", "fluency", 4, "让我想想，这个问题不太好回答。", "Let me think; this question isn't easy to answer."],
  ["你说得对", "nǐ shuō de duì", "you're right", "fluency", 4, "你说得对，我之前没想到这一点。", "You're right; I hadn't thought of that."],
  ["不好意思，我没听懂", "bù hǎoyìsi, wǒ méi tīngdǒng", "sorry, I didn't understand", "fluency", 4, "不好意思，我没听懂，能慢一点儿说吗？", "Sorry, I didn't understand; could you speak a bit slower?"],
  ["也就是说", "yě jiù shì shuō", "that is to say", "fluency", 5, "也就是说，价格不能再低了？", "That is to say, the price can't go any lower?"],
  ["具体来说", "jùtǐ lái shuō", "specifically", "fluency", 5, "具体来说，我们需要三个人。", "Specifically, we need three people."],
  ["首先…其次…最后", "shǒuxiān… qícì… zuìhòu", "first… second… finally", "fluency", 5, "首先看成本，其次看时间，最后看风险。", "First look at cost, second at time, and finally at risk."],
  ["对了", "duì le", "oh, by the way", "fluency", 4, "对了，下周的会议你来参加吗？", "By the way, will you attend next week's meeting?"],

  // ---------- General ----------
  ["其实", "qíshí", "actually", "general", 4, "其实我也不太确定。", "Actually, I'm not very sure either."],
  ["不过", "búguò", "however; but", "general", 4, "这个想法不错，不过有点儿冒险。", "It's a good idea, but a bit risky."],
  ["大概", "dàgài", "roughly; probably", "general", 4, "大概需要两个星期。", "It will probably take about two weeks."],
  ["据说", "jùshuō", "it is said that", "general", 5, "据说公司明年要上市。", "It is said that the company will go public next year."],
  ["有道理", "yǒu dàolǐ", "makes sense", "general", 4, "你说的很有道理。", "What you say makes a lot of sense."],
  ["没问题", "méi wèntí", "no problem", "general", 3, "没问题，我马上处理。", "No problem, I'll handle it right away."],
  ["辛苦了", "xīnkǔ le", "thanks for your hard work", "general", 4, "今天大家都辛苦了！", "Thanks everyone for your hard work today!"],
  ["出差", "chūchāi", "to go on a business trip", "general", 5, "我下周要去上海出差。", "I'm going on a business trip to Shanghai next week."],
  ["加班", "jiābān", "to work overtime", "general", 5, "最近几天我们都在加班。", "We've all been working overtime these past few days."],
  ["应酬", "yìngchou", "social engagement (business dinner)", "general", 6, "晚上有一个客户的应酬。", "There's a business dinner with a client tonight."],
  ["敬酒", "jìngjiǔ", "to propose a toast", "general", 6, "我敬您一杯，感谢您的支持。", "I'd like to toast you to thank you for your support."],
  ["久仰", "jiǔyǎng", "I've long heard of you (formal greeting)", "general", 6, "久仰大名，今天终于见面了。", "I've long heard of you; finally we meet."],
];

export const VOCAB: Word[] = rows.map(([zh, py, en, topic, level, ex, exEn], i) => ({
  id: `w${String(i + 1).padStart(3, "0")}`,
  zh,
  py,
  en,
  topic,
  level,
  ex,
  exEn,
}));

export const VOCAB_BY_ZH: Map<string, Word> = new Map(VOCAB.map((w) => [w.zh, w]));
