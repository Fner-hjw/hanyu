export type Line = { who: string; zh: string; en: string };
export type Dialogue = {
  id: string;
  title: string;
  titleZh: string;
  scenario: "meetings" | "email" | "phone" | "negotiation" | "social" | "daily";
  level: number;
  intro: string;
  lines: Line[];
  questions: { q: string; options: string[]; answer: number }[];
};

export const DIALOGUES: Dialogue[] = [
  {
    id: "d-budget-review",
    title: "Quarterly budget review",
    titleZh: "季度预算审核会议",
    scenario: "meetings",
    level: 5,
    intro: "You are in a finance team meeting. The numbers for Q3 are slightly off.",
    lines: [
      { who: "李经理", zh: "好，我们开始吧。今天的议程有两项：第三季度的预算执行情况，还有明年的预算方案。", en: "Okay, let's begin. Today's agenda has two items: Q3 budget execution and next year's budget proposal." },
      { who: "我", zh: "先由我来汇报一下。总的来说，第三季度的收入达到了预期，不过支出比预算高了百分之八。", en: "Let me report first. Overall, Q3 revenue met expectations, but expenses were 8% over budget." },
      { who: "李经理", zh: "支出为什么会增加？具体来说，是哪个部门的问题？", en: "Why did expenses increase? Specifically, which department is the issue?" },
      { who: "我", zh: "主要是市场部。他们临时增加了一次推广活动，所以成本上升了。", en: "Mainly the marketing department. They added a promotion campaign at short notice, so costs went up." },
      { who: "王芳", zh: "这一点我需要说明一下。那次活动是客户要求的，如果不做，我们可能会失去这个合作。", en: "I need to clarify this. The campaign was requested by the client; if we hadn't done it, we might have lost the partnership." },
      { who: "李经理", zh: "我理解。但是以后类似的情况，请提前通知财务部，这样我们才能调整预算。", en: "I understand. But in similar cases in future, please notify finance in advance so that we can adjust the budget." },
      { who: "王芳", zh: "没问题，我们会注意的。", en: "No problem, we'll pay attention." },
      { who: "李经理", zh: "好。那么明年的预算，大家有什么建议吗？", en: "Good. So, for next year's budget, does anyone have suggestions?" },
      { who: "我", zh: "我建议先降低固定成本，然后再考虑增加投资。换句话说，我们要优先控制风险。", en: "I suggest cutting fixed costs first, then considering more investment. In other words, we should prioritize controlling risk." },
      { who: "李经理", zh: "有道理。这样吧，你下周五之前把详细方案发给大家，我们再讨论一次。", en: "Makes sense. Let's do this: send everyone the detailed plan by next Friday and we'll discuss again." },
    ],
    questions: [
      { q: "第三季度的支出怎么样？", options: ["比预算低", "比预算高了百分之八", "和预算一样", "没有人知道"], answer: 1 },
      { q: "支出增加的主要原因是什么？", options: ["财务部的错误", "市场部增加了推广活动", "客户没有付款", "汇率变化"], answer: 1 },
      { q: "下周五之前“我”要做什么？", options: ["出差", "发送详细的预算方案", "签订合同", "通知客户"], answer: 1 },
    ],
  },
  {
    id: "d-payment-terms",
    title: "Negotiating payment terms",
    titleZh: "谈付款条件",
    scenario: "negotiation",
    level: 5,
    intro: "A supplier wants 100% prepayment. You want better terms.",
    lines: [
      { who: "供应商", zh: "这是我们的报价单。按照我们的规定，需要提前支付全部货款。", en: "Here is our quotation. According to our policy, full payment is required in advance." },
      { who: "我", zh: "谢谢。价格我们可以接受，不过付款方式上我们可能有点儿困难。", en: "Thank you. We can accept the price, but the payment method might be a bit difficult." },
      { who: "供应商", zh: "是吗？具体是哪方面的问题？", en: "Is that so? What exactly is the problem?" },
      { who: "我", zh: "我们公司的现金流比较紧张。如果要全额预付，会影响其他项目。", en: "Our company's cash flow is rather tight. A full prepayment would affect other projects." },
      { who: "供应商", zh: "那你们的想法是什么？", en: "So what do you have in mind?" },
      { who: "我", zh: "我们建议分两次付款：签约时付百分之三十，收货后三十天内付清。", en: "We suggest two payments: 30% upon signing, and the balance within thirty days after receiving the goods." },
      { who: "供应商", zh: "这个比例对我们来说风险太大了。百分之五十怎么样？", en: "That ratio is too risky for us. How about 50%?" },
      { who: "我", zh: "这样吧，我们各让一步：签约时付百分之四十，另外，我们可以增加订购数量。", en: "Let's each give a little: 40% on signing, and in addition we can increase the order quantity." },
      { who: "供应商", zh: "订购数量增加多少？如果数量够大，我们可以再给一点折扣。", en: "By how much? If the quantity is large enough, we can give a bit more discount." },
      { who: "我", zh: "增加百分之二十。希望我们能实现双赢。", en: "20% more. I hope we can reach a win-win cooperation." },
      { who: "供应商", zh: "好，我回去跟经理确认一下，明天给您答复。", en: "Okay, I'll confirm with my manager and give you an answer tomorrow." },
    ],
    questions: [
      { q: "供应商一开始要求怎么付款？", options: ["货到付款", "提前支付全部货款", "分三次付款", "用现金付款"], answer: 1 },
      { q: "最后“我”提出的签约付款比例是多少？", options: ["百分之三十", "百分之五十", "百分之四十", "百分之一百"], answer: 2 },
      { q: "“我”提供了什么作为交换？", options: ["提高价格", "增加订购数量", "延长合同期限", "换一个供应商"], answer: 1 },
    ],
  },
  {
    id: "d-client-call",
    title: "A call with a client",
    titleZh: "给客户打电话",
    scenario: "phone",
    level: 4,
    intro: "You call a client about an unpaid invoice. The line is poor.",
    lines: [
      { who: "我", zh: "喂，您好，请问是陈先生吗？我是华信公司财务部的。", en: "Hello, is this Mr. Chen? I'm from the finance department of Huaxin." },
      { who: "陈先生", zh: "是我。不好意思，信号不太好，我听不清，您能再说一遍吗？", en: "Speaking. Sorry, the signal isn't good and I can't hear clearly; could you say that again?" },
      { who: "我", zh: "好的。我是华信公司财务部的，想跟您确认一下上个月的发票。", en: "Sure. I'm from Huaxin's finance department and would like to confirm last month's invoice with you." },
      { who: "陈先生", zh: "哦，那张发票我收到了，但是我还没有安排付款。", en: "Oh, I received that invoice, but haven't arranged payment yet." },
      { who: "我", zh: "了解。请问大概什么时候可以付款？", en: "I see. Roughly when could you pay?" },
      { who: "陈先生", zh: "我们财务这周比较忙，下周三之前应该可以。", en: "Our finance team is busy this week; it should be possible before next Wednesday." },
      { who: "我", zh: "好的，那我下周三再跟您确认。麻烦您尽快转账，账户信息在邮件里。", en: "Okay, I'll confirm with you again next Wednesday. Please transfer as soon as possible; the account details are in the email." },
      { who: "陈先生", zh: "没问题，我会跟财务说的。", en: "No problem, I'll tell our finance team." },
      { who: "我", zh: "谢谢您，打扰了。再见！", en: "Thank you, sorry to have disturbed you. Goodbye!" },
    ],
    questions: [
      { q: "“我”为什么给陈先生打电话？", options: ["介绍新产品", "确认上个月的发票", "安排会议", "道歉"], answer: 1 },
      { q: "陈先生说什么时候付款？", options: ["今天", "明天", "下周三之前", "下个月"], answer: 2 },
    ],
  },
  {
    id: "d-follow-up-email",
    title: "Reading a follow-up email",
    titleZh: "跟进邮件",
    scenario: "email",
    level: 5,
    intro: "A business email as a reading text. Notice the formal register.",
    lines: [
      { who: "发件人", zh: "王经理，您好！", en: "Dear Manager Wang," },
      { who: "发件人", zh: "感谢您上周抽出时间与我们见面。会上讨论的合作方案，我已经整理好，请见附件。", en: "Thank you for taking time to meet us last week. I have organized the cooperation proposal discussed at the meeting; please see the attachment." },
      { who: "发件人", zh: "为了尽快推进项目，我们建议在本月底之前确认合同的主要条款。如果您有任何疑问，请随时与我联系。", en: "To advance the project as soon as possible, we suggest confirming the main contract terms before the end of this month. If you have any questions, please contact me at any time." },
      { who: "发件人", zh: "另外，我已将此邮件抄送给财务部的李女士，方便后续付款事宜的沟通。", en: "In addition, I have cc'd Ms. Li of the finance department to facilitate communication on follow-up payment matters." },
      { who: "发件人", zh: "期待您的回复。\n此致\n敬礼！\n张伟", en: "Looking forward to your reply. Yours sincerely, Zhang Wei" },
    ],
    questions: [
      { q: "写这封邮件的主要目的是什么？", options: ["拒绝合作", "发送方案并推进合同确认", "通知会议取消", "要求退款"], answer: 1 },
      { q: "为什么抄送给李女士？", options: ["她是新同事", "方便沟通后续付款", "她要参加会议", "她负责合同"], answer: 1 },
    ],
  },
  {
    id: "d-business-dinner",
    title: "Business dinner small talk",
    titleZh: "商务晚宴",
    scenario: "social",
    level: 5,
    intro: "Relationship building (关系) matters. Practise polite, relaxed talk.",
    lines: [
      { who: "客户", zh: "久仰大名！听说你对中国市场很了解。", en: "I've long heard of you! I hear you know the Chinese market well." },
      { who: "我", zh: "您过奖了。我只是在中国工作了几年，还有很多要学习的。今天能认识您，我很高兴。", en: "You flatter me. I've only worked in China for a few years and still have a lot to learn. I'm delighted to meet you today." },
      { who: "客户", zh: "你的中文说得很好！来，我敬你一杯。", en: "Your Chinese is very good! Come, let me toast you." },
      { who: "我", zh: "谢谢！我也敬您，感谢您对我们公司的支持。", en: "Thank you! I'll toast you too, thank you for supporting our company." },
      { who: "客户", zh: "你们最近出差多吗？", en: "Have you been travelling much for work lately?" },
      { who: "我", zh: "是的，下个月要去上海。对了，您有什么好的餐厅可以推荐吗？", en: "Yes, I'm going to Shanghai next month. By the way, do you have any good restaurants to recommend?" },
      { who: "客户", zh: "当然有！我给你发几个地址。", en: "Of course! I'll send you a few addresses." },
    ],
    questions: [
      { q: "“我”问客户什么？", options: ["价格", "推荐餐厅", "合同时间", "公司地址"], answer: 1 },
    ],
  },
];
