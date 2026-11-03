import type { EmailTemplate, PhraseGroup, MeasureWord, EtiquetteTip } from "./types";

export const EMAILS: EmailTemplate[] = [
  {
    id: "e-request-meeting",
    title: "Requesting a meeting",
    when: "Use this to propose a first or follow-up meeting with a client or partner.",
    zh: "尊敬的王总：\n您好！\n我是华信资本的投资经理【您的名字】。我们希望就贵公司下一轮融资的相关事宜与您当面沟通，不知您下周是否方便？\n如蒙应允，下周二或周四下午均可，时长约一小时，地点由您安排。\n烦请告知您方便的时间，谢谢！\n此致\n敬礼\n【您的名字】\n华信资本　投资经理",
    en: "Dear Mr. Wang,\nHello!\nI am [Your Name], an investment manager at Huaxin Capital. We would like to speak with you in person about your company's next funding round. Would you be available next week?\nIf you agree, either Tuesday or Thursday afternoon would work for us. The meeting would take about an hour, and the location is up to you.\nCould you please let me know a time that suits you? Thank you!\nSincerely,\n[Your Name]\nInvestment Manager, Huaxin Capital",
    notes: [
      "尊敬的 + surname + title is the standard formal salutation; 王总 is short for 王总经理.",
      "不知您……是否方便？ is a soft, deferential way to ask about availability.",
      "如蒙应允 means “should you kindly agree” and is very formal written style.",
      "烦请 is a polite way of saying “would you please” and is stronger than 请."
    ]
  },
  {
    id: "e-follow-up-meeting",
    title: "Follow-up after a meeting",
    when: "Use this to summarise a meeting and confirm action items the same or next day.",
    zh: "李经理，您好：\n感谢您今天抽出宝贵时间与我们会面。现将会议要点整理如下：\n一、贵方将于本月十五日前提供最新的财务报表；\n二、我方将于下周三前提交合作方案初稿。\n如有遗漏或不准确之处，敬请指正。期待我们的进一步合作。\n顺颂商祺！\n【您的名字】",
    en: "Dear Manager Li,\nThank you for taking the time to meet with us today. The key points of the meeting are summarised below:\n1. Your side will provide the latest financial statements by the 15th of this month;\n2. Our side will submit the first draft of the cooperation proposal by next Wednesday.\nPlease correct us if anything has been omitted or is inaccurate. We look forward to further cooperation.\nBest regards,\n[Your Name]",
    notes: [
      "抽出宝贵时间 (“spare your valuable time”) is a stock phrase of thanks after a meeting.",
      "现将……整理如下 introduces a list; 如下 signals that the list follows.",
      "贵方 (your side) and 我方 (our side) are standard in contracts and formal correspondence.",
      "顺颂商祺 is a formal business closing; 敬请指正 invites correction politely."
    ]
  },
  {
    id: "e-payment-reminder",
    title: "Payment reminder (polite to firmer)",
    when: "Use this when an invoice is overdue and you want to press for payment while keeping the relationship.",
    zh: "刘会计，您好：\n贵司编号为 INV-2026-0318 的发票已于10月31日到期，截至目前我方尚未收到相应款项。\n可能是付款流程上有所延误，烦请您协助核实，并于本周五前安排付款。若款项已经支付，请忽略此邮件，并麻烦提供付款凭证。\n如逾期未付，我们将不得不按合同约定收取滞纳金，还望理解。\n祝好！\n【您的名字】\n财务部",
    en: "Dear Accountant Liu,\nInvoice No. INV-2026-0318 issued to your company fell due on October 31, and we have not yet received the corresponding payment.\nThere may have been a delay in the payment process. Could you please help check and arrange payment by this Friday? If payment has already been made, please disregard this email and kindly send us the proof of payment.\nIf it remains unpaid past the deadline, we will have to charge a late fee as stipulated in the contract. We hope you understand.\nBest wishes,\n[Your Name]\nFinance Department",
    notes: [
      "The first paragraph states facts neutrally; the second offers a face-saving explanation (可能是……) before the request.",
      "贵司 means “your company” and is more formal than 你们公司.",
      "按合同约定 and 滞纳金 (late fee) signal the firmer tone without being aggressive.",
      "还望理解 (“we hope you understand”) softens a warning at the end."
    ]
  },
  {
    id: "e-apologise-delay",
    title: "Apologising for a delay",
    when: "Use this when you are late with a deliverable, a reply, or a payment.",
    zh: "陈总，您好：\n非常抱歉未能按原定时间向您提交尽调报告。由于部分数据需要与第三方进一步核对，报告将推迟至下周一上午十点前发送给您。\n由此给您带来的不便，我们深表歉意。我们已安排专人跟进，以确保不再出现类似情况。\n感谢您的理解与包容。\n此致\n敬礼\n【您的名字】",
    en: "Dear Mr. Chen,\nWe sincerely apologise for failing to submit the due diligence report at the originally scheduled time. As some data needs to be verified further with a third party, the report will be delayed and sent to you by 10 a.m. next Monday.\nWe deeply apologise for the inconvenience this has caused you. We have assigned a dedicated person to follow up to make sure this does not happen again.\nThank you for your understanding and patience.\nSincerely,\n[Your Name]",
    notes: [
      "Give the reason briefly (由于……) and then a new, specific deadline (推迟至……前).",
      "深表歉意 is a formal written apology, stronger than 对不起.",
      "带来的不便 (the inconvenience caused) is the usual object of an apology in business writing.",
      "理解与包容 thanks the reader for being understanding; it is a common closing line."
    ]
  },
  {
    id: "e-send-documents",
    title: "Sending documents for review",
    when: "Use this when attaching a draft contract, report or proposal for the other side to check.",
    zh: "赵经理，您好：\n随函附上《股权转让协议》草案及相关附件，请查收。\n烦请贵司法务部门审阅，如有修改意见，请在文件中以修订模式标注，并于本月二十日前反馈给我们。\n如有任何疑问，欢迎随时与我联系，电话：【您的电话】。\n谢谢！\n顺颂商祺\n【您的名字】",
    en: "Dear Manager Zhao,\nAttached to this email are the draft Equity Transfer Agreement and related annexes. Please check and confirm receipt.\nWe would ask your legal department to review them. If there are any amendments, please mark them in track-changes mode and send them back to us by the 20th of this month.\nIf you have any questions, please feel free to contact me at any time. Telephone: [Your Phone].\nThank you!\nBest regards,\n[Your Name]",
    notes: [
      "随函附上 (“enclosed with this letter”) is the formal way to say “attached”; 请查收 means “please check and receive”.",
      "审阅 is used for reviewing documents, 修订模式 is “track-changes mode” in Word.",
      "Contract titles are placed in 《 》 book-title marks.",
      "欢迎随时与我联系 is a standard friendly-but-formal offer of further help."
    ]
  },
  {
    id: "e-request-quotation",
    title: "Requesting a quotation",
    when: "Use this to ask a supplier or service provider for a price offer.",
    zh: "孙经理，您好：\n我司计划采购一批服务器设备，数量约五十台，具体规格见附件。\n请您根据附件需求提供正式报价，内容包括单价、总价、交货期、付款方式及质保期限。\n如能在本周四前收到报价，我们将不胜感激。\n期待您的回复。\n祝好！\n【您的名字】\n采购部",
    en: "Dear Manager Sun,\nOur company plans to purchase a batch of server equipment, about fifty units. The detailed specifications are in the attachment.\nPlease provide a formal quotation based on the requirements in the attachment, including unit price, total price, delivery time, payment terms and warranty period.\nWe would be most grateful to receive the quotation by this Thursday.\nWe look forward to your reply.\nBest wishes,\n[Your Name]\nProcurement Department",
    notes: [
      "我司 (our company) is the written-style equivalent of 我们公司.",
      "报价 is a price quotation; 单价 is unit price and 总价 is total price.",
      "质保期限 means warranty period; 交货期 is the delivery time.",
      "不胜感激 (“would be extremely grateful”) is a polite way to attach a deadline to a request."
    ]
  },
  {
    id: "e-counter-offer",
    title: "Replying to a quotation with a counter-offer",
    when: "Use this to push back on a price while keeping the door open.",
    zh: "周总，您好：\n感谢贵司提供的报价。经内部评估，我们对产品质量和服务十分认可，但总价超出了我方预算。\n考虑到我们的订单量较大，且有长期合作的意向，希望贵司能将单价下调8%，并将付款期延长至六十天。\n若能达成一致，我们可在本月底前签订合同。期待您的回复。\n顺颂商祺！\n【您的名字】",
    en: "Dear Mr. Zhou,\nThank you for the quotation provided by your company. After internal evaluation, we highly appreciate the quality of your products and services, but the total price exceeds our budget.\nGiven our large order volume and our intention to cooperate over the long term, we hope your company can lower the unit price by 8% and extend the payment term to sixty days.\nIf we can reach agreement, we can sign the contract before the end of this month. We look forward to your reply.\nBest regards,\n[Your Name]",
    notes: [
      "Start with praise (十分认可) before the objection (但……超出了预算); this protects face.",
      "考虑到…… (“taking into account…”) introduces your justification for the request.",
      "下调 means to lower a price or rate; 延长至 means extend to a stated period.",
      "若能达成一致 (“if we can reach agreement”) ties the concession to a concrete next step."
    ]
  },
  {
    id: "e-thank-you-visit",
    title: "Thank-you after a visit",
    when: "Use this after visiting a client's office or hosting a delegation.",
    zh: "吴总，您好：\n非常感谢您和团队昨天在上海的热情接待。此次参访让我们对贵公司的业务模式和发展规划有了更深入的了解，收获良多。\n您在晚宴上的盛情款待也令我们印象深刻。\n期待不久后有机会在北京回请您，也希望双方的合作早日结出硕果。\n再次致谢！\n顺颂商祺\n【您的名字】",
    en: "Dear Mr. Wu,\nThank you very much to you and your team for the warm welcome in Shanghai yesterday. This visit gave us a deeper understanding of your company's business model and development plans, and we gained a great deal.\nWe were also deeply impressed by your generous hospitality at the dinner.\nWe look forward to having the opportunity to host you in Beijing before long, and we also hope our cooperation will bear fruit soon.\nOnce again, our thanks!\nBest regards,\n[Your Name]",
    notes: [
      "热情接待 and 盛情款待 are set phrases for warm hosting; use them for hospitality.",
      "收获良多 (“gained a great deal”) is a modest, positive way to praise the visit.",
      "回请 means to return an invitation, which is expected in Chinese business culture.",
      "结出硕果 (“bear rich fruit”) is a typical optimistic closing about cooperation."
    ]
  },
  {
    id: "e-out-of-office",
    title: "Out-of-office auto-reply",
    when: "Use this as your automatic reply during holidays or business trips.",
    zh: "您好！\n感谢您的来信。我目前正在休假（或出差），预计10月8日回到工作岗位，期间无法及时查看邮件。\n如有紧急事务，请联系我的同事张莉，邮箱：【同事邮箱】，电话：【同事电话】。\n我将在返回后尽快回复您，给您带来不便，敬请谅解。\n祝好！\n【您的名字】",
    en: "Hello!\nThank you for your email. I am currently on leave (or on a business trip) and expect to return to work on October 8, so I will not be able to check email promptly in the meantime.\nFor urgent matters, please contact my colleague Zhang Li, email: [colleague's email], telephone: [colleague's phone].\nI will reply as soon as possible after I return. We apologise for any inconvenience and ask for your understanding.\nBest wishes,\n[Your Name]",
    notes: [
      "休假 is leave or vacation; 出差 is a business trip.",
      "预计……回到工作岗位 (“expect to be back at my post”) is the usual way to state a return date.",
      "紧急事务 means urgent matters; always give a backup contact.",
      "敬请谅解 is a formal request for understanding at the end."
    ]
  },
  {
    id: "e-introduce-yourself",
    title: "Introducing yourself to a new client",
    when: "Use this for a first email to a client you have been assigned or referred to.",
    zh: "郑总，您好：\n我是中信联合银行新任客户经理【您的名字】，经由贵司财务总监林先生介绍，冒昧致信。\n我在跨境金融领域有八年的从业经验，今后将负责贵司的日常业务对接。我们希望了解贵司在融资和外汇管理方面的需求，以便提供更合适的方案。\n不知下周是否方便通话十分钟？\n谨祝商祺！\n【您的名字】",
    en: "Dear Mr. Zheng,\nI am [Your Name], the newly appointed relationship manager at CITIC United Bank. I am writing to you, if I may be so bold, on the introduction of Mr. Lin, your company's Chief Financial Officer.\nI have eight years of experience in cross-border finance and will be responsible for day-to-day contact with your company going forward. We hope to learn about your company's needs in financing and foreign exchange management so that we can offer more suitable solutions.\nWould you be free for a ten-minute call next week?\nWith best wishes,\n[Your Name]",
    notes: [
      "冒昧致信 (“forgive my presumption in writing”) is a humble phrase for contacting someone unsolicited.",
      "经由……介绍 names your referrer, which builds trust quickly.",
      "日常业务对接 means day-to-day business liaison; 对接 is common modern business vocabulary.",
      "谨祝商祺 is an even more formal variant of 顺颂商祺."
    ]
  },
  {
    id: "e-decline-politely",
    title: "Declining a request politely",
    when: "Use this to say no to a proposal, discount or request without damaging the relationship.",
    zh: "黄总，您好：\n感谢贵司对我们的信任，也感谢您提出的合作建议。\n经过慎重考虑，目前我们暂时无法接受降低服务费的方案，主要原因是近期运营成本有所上升，现有价格已接近成本线。\n对此我们深感遗憾。如日后情况有所变化，我们非常乐意重新讨论。\n希望今后仍有合作的机会。\n顺颂商祺！\n【您的名字】",
    en: "Dear Mr. Huang,\nThank you for your company's trust in us, and thank you for the cooperation proposal you put forward.\nAfter careful consideration, we are unable to accept the plan to reduce service fees for the time being. The main reason is that operating costs have risen recently and the current price is already close to cost.\nWe feel real regret about this. If circumstances change in future, we would be very glad to discuss it again.\nWe hope there will still be opportunities to work together.\nBest regards,\n[Your Name]",
    notes: [
      "Chinese refusals usually begin with thanks and give a reason; a bare 不行 would be abrupt.",
      "暂时无法 (“temporarily unable”) leaves the door open, unlike a flat 不能.",
      "深感遗憾 expresses regret formally; 乐意重新讨论 signals future flexibility.",
      "Blaming external factors such as costs helps the other side save face."
    ]
  },
  {
    id: "e-confirm-agreement",
    title: "Confirming an agreement and next steps",
    when: "Use this to put what was agreed orally into writing.",
    zh: "马总，您好：\n很高兴今天与贵司就合作事宜达成共识。现确认如下：\n一、合作期限为三年，自2027年1月1日起算；\n二、首期款项30%，于合同签署后七个工作日内支付；\n三、我方法务部将于本周五前发出合同正本。\n以上内容如有不符，请及时告知。\n感谢您的支持与信任！\n此致\n敬礼\n【您的名字】",
    en: "Dear Mr. Ma,\nWe are delighted to have reached a consensus with your company today on the cooperation. We confirm the following:\n1. The cooperation period is three years, starting from January 1, 2027;\n2. The first installment is 30%, payable within seven working days after the contract is signed;\n3. Our legal department will send out the original contract by this Friday.\nIf any of the above is inconsistent with your understanding, please let's know promptly.\nThank you for your support and trust!\nSincerely,\n[Your Name]",
    notes: [
      "达成共识 means to reach a consensus; 达成一致 is a close alternative.",
      "现确认如下 is the formal opener for a written confirmation.",
      "工作日 means working days, not calendar days, so state it clearly in payment terms.",
      "以上内容如有不符 invites correction and gives you a paper trail."
    ]
  }
];

export const PHRASES: PhraseGroup[] = [
  {
    id: "p-meetings",
    situation: "Opening & running a meeting",
    intro: "Phrases to start on time, keep to the agenda and close with clear actions.",
    phrases: [
      { zh: "各位，人都到齐了，我们开始吧。", en: "Everyone, we are all here, so let's begin." },
      { zh: "今天的会议主要讨论三个议题。", en: "Today's meeting will mainly discuss three agenda items." },
      { zh: "首先，请允许我简单介绍一下今天的议程。", en: "First, allow me to briefly introduce today's agenda.", note: "请允许我 is formal and suits a larger meeting." },
      { zh: "我们先请财务部汇报上个季度的情况。", en: "Let's first ask the finance department to report on last quarter.", note: "请 + department + verb is how a chair hands over the floor." },
      { zh: "时间有限，我们尽量控制在一小时以内。", en: "Time is limited, so let's try to keep it within an hour." },
      { zh: "这个问题我们稍后再讨论。", en: "We will discuss this issue later.", note: "A polite way to park an off-topic point." },
      { zh: "我们回到正题。", en: "Let's return to the main topic." },
      { zh: "大家还有什么补充吗？", en: "Does anyone have anything to add?" },
      { zh: "我来总结一下刚才的讨论。", en: "Let me summarise the discussion just now." },
      { zh: "会后请各位在周五之前把意见发给我。", en: "After the meeting, please send me your comments before Friday." },
      { zh: "那么今天的会议就到这里，谢谢大家。", en: "That concludes today's meeting. Thank you, everyone." },
      { zh: "会议纪要我会在今天下班前发给大家。", en: "I will send out the minutes before the end of today." },
      { zh: "抱歉，我来晚了。", en: "Sorry, I am late.", note: "Say it quietly when entering; do not interrupt the speaker." }
    ]
  },
  {
    id: "p-opinions",
    situation: "Giving opinions, agreeing & disagreeing politely",
    intro: "Soften disagreement and frame your view as a suggestion to keep harmony.",
    phrases: [
      { zh: "我个人认为，这个方案风险偏高。", en: "I personally think this plan carries rather high risk.", note: "偏 + adjective is a softer way to criticise." },
      { zh: "在我看来，我们应该先做市场调研。", en: "In my view, we should do market research first." },
      { zh: "我完全同意您的看法。", en: "I completely agree with your view." },
      { zh: "您说得有道理。", en: "What you say makes sense.", note: "Often a prelude to “but…”." },
      { zh: "您的观点我能理解，不过我有一点不同的看法。", en: "I can understand your viewpoint, but I see one point differently.", note: "Classic polite disagreement: acknowledge first, then 不过." },
      { zh: "恕我直言，这个预算可能不太现实。", en: "With respect, this budget may not be very realistic.", note: "恕我直言 means “forgive my frankness” and is formal." },
      { zh: "我想补充一点。", en: "I would like to add one point." },
      { zh: "我对这一点持保留意见。", en: "I have reservations about this point.", note: "持保留意见 is the diplomatic way of saying you do not agree." },
      { zh: "也许我们可以换个角度考虑。", en: "Perhaps we could consider it from another angle." },
      { zh: "这个想法很好，但执行起来可能有难度。", en: "That is a good idea, but it may be hard to carry out." },
      { zh: "我们是不是可以折中一下？", en: "Could we perhaps find a middle ground?" },
      { zh: "我倾向于第二个方案。", en: "I lean toward the second option." }
    ]
  },
  {
    id: "p-numbers",
    situation: "Presenting numbers & trends",
    intro: "Core vocabulary for reporting growth, decline and comparisons in results meetings.",
    phrases: [
      { zh: "本季度营业收入同比增长12%。", en: "Operating revenue this quarter grew 12% year on year.", note: "同比 = year on year; 环比 = quarter on quarter." },
      { zh: "与上个季度相比，利润率环比下降了3个百分点。", en: "Compared with last quarter, the profit margin fell 3 percentage points.", note: "百分点 is the unit for differences between percentages; 3% 下降 would be a relative change." },
      { zh: "净利润达到两亿三千万元。", en: "Net profit reached 230 million yuan.", note: "Chinese groups digits by 万 (10,000) and 亿 (100 million)." },
      { zh: "毛利率保持在35%左右。", en: "Gross margin stayed at around 35%." },
      { zh: "成本较去年同期上升了约一成。", en: "Costs rose by roughly 10% over the same period last year.", note: "一成 = 10%, 两成 = 20%." },
      { zh: "销售额比预期低了将近二十万。", en: "Sales were nearly 200,000 lower than expected." },
      { zh: "市场份额从15%提高到18%。", en: "Market share rose from 15% to 18%.", note: "从……提高到…… shows start and end values." },
      { zh: "今年的增速明显放缓。", en: "This year's growth rate has slowed noticeably." },
      { zh: "整体呈现稳步上升的趋势。", en: "Overall there is a trend of steady increase." },
      { zh: "现金流出现了小幅波动。", en: "Cash flow has seen slight fluctuations." },
      { zh: "同比大幅下滑，主要受汇率影响。", en: "There was a sharp year-on-year decline, mainly due to exchange rates." },
      { zh: "这一数据已经超过了年度目标的80%。", en: "This figure has already exceeded 80% of the annual target." },
      { zh: "请看第五页的图表。", en: "Please look at the chart on page five." }
    ]
  },
  {
    id: "p-clarify",
    situation: "Asking for clarification & checking understanding",
    intro: "Use these to slow things down without losing face, yours or the speaker's.",
    phrases: [
      { zh: "不好意思，能请您再说一遍吗？", en: "Excuse me, could you say that once more?" },
      { zh: "请问您刚才说的是哪个数字？", en: "May I ask which figure you just mentioned?" },
      { zh: "您能不能说得慢一点？", en: "Could you speak a little more slowly?" },
      { zh: "我想确认一下，您的意思是……？", en: "I would like to confirm, you mean…?", note: "Frames a misunderstanding as your need to check, not their poor explanation." },
      { zh: "如果我没理解错的话，付款期限是六十天。", en: "If I have not misunderstood, the payment term is sixty days." },
      { zh: "您能举个例子吗？", en: "Could you give an example?" },
      { zh: "这个词是什么意思？", en: "What does this word mean?" },
      { zh: "请问“同比”和“环比”有什么区别？", en: "May I ask what is the difference between “year on year” and “quarter on quarter”?" },
      { zh: "我可能没听明白，您能再解释一下吗？", en: "I may not have understood; could you explain again?", note: "我可能没听明白 puts the problem on yourself, a face-saving habit." },
      { zh: "您的意思是说，我们需要重新报价吗？", en: "Do you mean that we need to requote?" },
      { zh: "请问这件事由谁负责？", en: "May I ask who is responsible for this?" },
      { zh: "好的，我来重复一下，看我理解得对不对。", en: "OK, let me repeat it to see whether I have understood correctly." },
      { zh: "能不能请您把这些内容用邮件发给我？", en: "Could you send me this content by email?" }
    ]
  },
  {
    id: "p-negotiation",
    situation: "Negotiating price & terms",
    intro: "Stay polite and indirect while still moving the price and terms in your favour.",
    phrases: [
      { zh: "这个价格超出了我们的预算。", en: "This price exceeds our budget." },
      { zh: "您能给我们一个更优惠的价格吗？", en: "Could you give us a more favourable price?", note: "优惠 is the standard word for discount or preferential." },
      { zh: "如果订单量增加一倍，价格能不能再降一点？", en: "If the order volume doubles, could the price come down a bit more?" },
      { zh: "我们希望付款期限能延长到九十天。", en: "We hope the payment term can be extended to ninety days." },
      { zh: "这已经是我们能给出的最低价了。", en: "This is already the lowest price we can offer.", note: "A common seller line; often not final, so keep talking." },
      { zh: "我们各让一步，您看怎么样？", en: "Suppose we each give a little, what do you think?", note: "各让一步 is the classic compromise phrase." },
      { zh: "这个条款我们需要再商量一下。", en: "We need to discuss this clause again.", note: "Indirect way to say you do not accept it." },
      { zh: "我需要回去请示领导。", en: "I need to go back and consult my superiors.", note: "Shows that decision-making is hierarchical; used to buy time." },
      { zh: "除了价格，交货期也很重要。", en: "Besides price, the delivery time is also important." },
      { zh: "双方都有诚意，我相信一定能谈成。", en: "Both sides are sincere, and I believe we can certainly make a deal." },
      { zh: "只要质保期延长一年，我们可以接受这个价格。", en: "As long as the warranty is extended by one year, we can accept this price." },
      { zh: "合同条款写清楚比较好，以免日后产生争议。", en: "It is better to write the contract terms clearly to avoid disputes later." },
      { zh: "那我们就这么定了。", en: "Then it is settled." }
    ]
  },
  {
    id: "p-calls",
    situation: "Making & handling phone/video calls",
    intro: "Common phrases for answering, connecting, and fixing technical problems on calls.",
    phrases: [
      { zh: "喂，您好，请问是李经理吗？", en: "Hello, may I ask if this is Manager Li?" },
      { zh: "我是华信资本的小陈，打电话是想跟您确认一下明天的会议。", en: "This is Chen from Huaxin Capital; I am calling to confirm tomorrow's meeting.", note: "Calling yourself 小 + surname is a humble, friendly self-introduction for younger staff; with very senior clients, give your full name." },
      { zh: "请问您现在方便接电话吗？", en: "Is it convenient for you to talk now?" },
      { zh: "请稍等，我帮您转接。", en: "One moment please, I will transfer you." },
      { zh: "他现在不在办公室，需要我转告吗？", en: "He is not in the office now; shall I pass on a message?" },
      { zh: "麻烦您让他回我电话。", en: "Please ask him to call me back." },
      { zh: "不好意思，信号不太好，我听不清。", en: "Sorry, the signal is not good and I cannot hear clearly." },
      { zh: "您那边能听到我的声音吗？", en: "Can you hear me on your end?" },
      { zh: "我的麦克风好像有问题，我重新连一下。", en: "There seems to be a problem with my microphone; I will reconnect." },
      { zh: "我把屏幕共享给大家。", en: "I will share my screen with everyone." },
      { zh: "您可以看到我的屏幕吗？", en: "Can you see my screen?" },
      { zh: "请先静音，谢谢。", en: "Please mute yourself first, thank you." },
      { zh: "我稍后把链接发到群里。", en: "I will send the link to the group chat later." },
      { zh: "那就先这样，再联系。", en: "Let's leave it at that for now, and be in touch.", note: "A casual, common call ending between colleagues and familiar clients." }
    ]
  },
  {
    id: "p-smalltalk",
    situation: "Small talk with colleagues & clients",
    intro: "Safe, friendly topics that build relationships before and after business.",
    phrases: [
      { zh: "好久不见，最近忙吗？", en: "Long time no see. Have you been busy lately?" },
      { zh: "您路上辛苦了，还习惯这里的天气吗？", en: "You must be tired from the journey; are you getting used to the weather here?", note: "辛苦了 acknowledges effort and is said constantly in China." },
      { zh: "这是您第几次来北京？", en: "How many times have you been to Beijing?" },
      { zh: "您的中文说得真好！", en: "Your Chinese is really good!" },
      { zh: "我还在学习，请多多指教。", en: "I am still learning, please give me guidance.", note: "A modest reply to praise; 请多多指教 is a standard humble expression." },
      { zh: "周末有什么安排吗？", en: "Do you have any plans for the weekend?" },
      { zh: "您是哪里人？", en: "Where are you from?" },
      { zh: "你们中午一般在哪儿吃饭？", en: "Where do you usually have lunch?" },
      { zh: "听说你们最近搬了新办公室，恭喜！", en: "I heard you recently moved to a new office, congratulations!" },
      { zh: "您的孩子多大了？", en: "How old is your child?", note: "Family questions are friendly in China, but avoid asking about salary." },
      { zh: "最近天气变化大，注意身体。", en: "The weather has changed a lot lately, take care of your health." },
      { zh: "有空一起喝杯咖啡吧。", en: "Let's have a coffee together when we are free." }
    ]
  },
  {
    id: "p-requests",
    situation: "Making requests and following up",
    intro: "Ask for things and chase progress while staying courteous.",
    phrases: [
      { zh: "麻烦您帮我看一下这份文件。", en: "Could I trouble you to take a look at this document?", note: "麻烦您 is a polite everyday request." },
      { zh: "能否请您在周三前回复？", en: "Would you be able to reply before Wednesday?", note: "能否 is a formal, written-style version of 能不能." },
      { zh: "请问进展如何了？", en: "May I ask how things are progressing?" },
      { zh: "想跟您确认一下上次提到的事情。", en: "I would like to confirm with you the matter mentioned last time." },
      { zh: "不好意思再次打扰您，请问报告准备好了吗？", en: "Sorry to bother you again; is the report ready?" },
      { zh: "如果方便的话，请把资料发给我。", en: "If it is convenient, please send me the materials." },
      { zh: "我们这边比较着急，能不能请您加快一下？", en: "We are in a bit of a hurry; could you speed things up?", note: "比较着急 is a gentle way to express urgency." },
      { zh: "请您务必在月底前完成。", en: "Please be sure to finish by the end of the month.", note: "务必 is firm; use it with subordinates or after earlier reminders." },
      { zh: "我把会议邀请发给您了，请查收。", en: "I have sent you the meeting invitation, please check it." },
      { zh: "我下周再跟进一下。", en: "I will follow up again next week." },
      { zh: "请您抄送给财务部。", en: "Please copy it to the finance department." },
      { zh: "拜托了！", en: "Many thanks in advance!", note: "拜托了 is warm and slightly informal." }
    ]
  },
  {
    id: "p-apologies",
    situation: "Apologising & handling complaints",
    intro: "Take responsibility, offer a fix, and rebuild trust.",
    phrases: [
      { zh: "非常抱歉，给您添麻烦了。", en: "I am very sorry for causing you trouble." },
      { zh: "这是我们的疏忽，真的很抱歉。", en: "This was our oversight, we are truly sorry.", note: "疏忽 (oversight) accepts responsibility without sounding incompetent." },
      { zh: "请您放心，我们会尽快处理。", en: "Please rest assured, we will deal with it as soon as possible." },
      { zh: "我们马上核实一下情况，再给您答复。", en: "We will check the situation right away and then give you a reply." },
      { zh: "您的意见对我们很重要。", en: "Your feedback is important to us." },
      { zh: "我们完全理解您的心情。", en: "We completely understand how you feel." },
      { zh: "我们会提供相应的补偿。", en: "We will provide appropriate compensation." },
      { zh: "我们已经采取措施，避免类似问题再次发生。", en: "We have taken measures to prevent similar problems happening again." },
      { zh: "请问您希望我们怎么解决？", en: "How would you like us to resolve this?" },
      { zh: "对于这次延误，我们深表歉意。", en: "We deeply regret this delay.", note: "深表歉意 is formal; suitable for emails and speeches." },
      { zh: "这件事我会亲自跟进。", en: "I will personally follow up on this." },
      { zh: "谢谢您的耐心与理解。", en: "Thank you for your patience and understanding." },
      { zh: "我对此表示不满，希望贵司尽快给出解释。", en: "I am dissatisfied with this and hope your company will explain soon.", note: "For making a formal complaint; 表示不满 is firm yet polite." }
    ]
  },
  {
    id: "p-dinners",
    situation: "Business dinners & toasts",
    intro: "Phrases for hosting, being a guest, and drinking toasts at a banquet.",
    phrases: [
      { zh: "您请上座。", en: "Please take the seat of honour.", note: "The host seats the most senior guest facing the door or at the centre." },
      { zh: "今天我做东，大家不要客气。", en: "I am hosting today, please everyone feel at home.", note: "做东 means to be the host who pays." },
      { zh: "请随意，多吃点。", en: "Make yourself at home and eat more." },
      { zh: "这道菜是这里的招牌菜，您尝尝。", en: "This dish is the house specialty, please try it." },
      { zh: "我敬您一杯，感谢您一直以来的支持。", en: "I would like to toast you, thank you for your support all along.", note: "Hold your glass lower than a senior person's when clinking." },
      { zh: "祝我们合作愉快！", en: "Here is to a pleasant cooperation!" },
      { zh: "干杯！", en: "Cheers!", note: "干杯 literally means “dry the glass”; sip if you can't finish." },
      { zh: "我不太能喝酒，以茶代酒，可以吗？", en: "I can't drink much; may I use tea instead of wine?", note: "以茶代酒 is widely accepted and polite." },
      { zh: "我先干为敬。", en: "I will drain mine first as a show of respect.", note: "Said when you finish your glass to honour the other person." },
      { zh: "随意随意，您喝多少都行。", en: "As you like, drink as much as you want." },
      { zh: "今天的晚餐非常丰盛，谢谢您的款待。", en: "Tonight's dinner was very abundant, thank you for your hospitality." },
      { zh: "请允许我买单。", en: "Please allow me to pay the bill.", note: "Hosts often compete to pay, so settle quietly in advance." }
    ]
  }
];

export const MEASURE_WORDS: MeasureWord[] = [
  { mw: "个", py: "gè", usage: "The general measure word for people, things and abstract nouns.", examples: [{ zh: "一个问题", en: "a question" }, { zh: "三个客户", en: "three clients" }] },
  { mw: "份", py: "fèn", usage: "Counts documents, copies, portions of food, and jobs.", examples: [{ zh: "一份合同", en: "a contract" }, { zh: "两份报告", en: "two reports" }] },
  { mw: "笔", py: "bǐ", usage: "Counts sums of money, transactions and payments.", examples: [{ zh: "一笔交易", en: "a transaction" }, { zh: "这笔钱已经到账了。", en: "This sum of money has arrived in the account." }] },
  { mw: "家", py: "jiā", usage: "Counts companies, shops, banks and restaurants.", examples: [{ zh: "一家银行", en: "a bank" }, { zh: "我们和三家供应商合作。", en: "We work with three suppliers." }] },
  { mw: "项", py: "xiàng", usage: "Counts items, tasks, projects, policies and tests.", examples: [{ zh: "一项任务", en: "a task" }, { zh: "这是公司的一项新政策。", en: "This is a new company policy." }] },
  { mw: "届", py: "jiè", usage: "Counts sessions of a recurring event such as conferences and graduating classes.", examples: [{ zh: "第十届论坛", en: "the tenth forum" }, { zh: "他是2020届毕业生。", en: "He is a class of 2020 graduate." }] },
  { mw: "批", py: "pī", usage: "Counts batches of goods or groups of people.", examples: [{ zh: "一批货", en: "a batch of goods" }, { zh: "第一批样品已经发出。", en: "The first batch of samples has been sent." }] },
  { mw: "台", py: "tái", usage: "Counts machines, computers, and appliances.", examples: [{ zh: "一台电脑", en: "a computer" }, { zh: "办公室有两台打印机。", en: "The office has two printers." }] },
  { mw: "张", py: "zhāng", usage: "Counts flat things such as paper, tickets, invoices, tables and cards.", examples: [{ zh: "一张发票", en: "an invoice" }, { zh: "请给我两张名片。", en: "Please give me two business cards." }] },
  { mw: "封", py: "fēng", usage: "Counts letters and emails.", examples: [{ zh: "一封邮件", en: "an email" }, { zh: "我给他发了三封信。", en: "I sent him three letters." }] },
  { mw: "场", py: "chǎng", usage: "Counts meetings, matches, performances and events.", examples: [{ zh: "一场会议", en: "a meeting" }, { zh: "明天有两场谈判。", en: "There are two negotiations tomorrow." }] },
  { mw: "次", py: "cì", usage: "Counts occurrences of an action (times).", examples: [{ zh: "去过一次上海", en: "have been to Shanghai once" }, { zh: "这是我第三次来。", en: "This is my third visit." }] },
  { mw: "位", py: "wèi", usage: "A polite measure word for people.", examples: [{ zh: "一位客户", en: "a client" }, { zh: "各位来宾", en: "all the guests" }] },
  { mw: "条", py: "tiáo", usage: "Counts long, narrow things, and clauses, rules and messages.", examples: [{ zh: "一条消息", en: "a message" }, { zh: "合同有二十条条款。", en: "The contract has twenty clauses." }] },
  { mw: "件", py: "jiàn", usage: "Counts items of clothing, pieces of luggage, matters and cases.", examples: [{ zh: "一件事", en: "a matter" }, { zh: "两件行李", en: "two pieces of luggage" }] },
  { mw: "本", py: "běn", usage: "Counts books, magazines and bound volumes.", examples: [{ zh: "一本书", en: "a book" }, { zh: "他写了两本专著。", en: "He wrote two monographs." }] },
  { mw: "支", py: "zhī", usage: "Counts pens, teams and stick-like objects.", examples: [{ zh: "一支笔", en: "a pen" }, { zh: "我们有一支很强的销售队伍。", en: "We have a very strong sales team." }] },
  { mw: "种", py: "zhǒng", usage: "Counts kinds or types of things.", examples: [{ zh: "三种方案", en: "three kinds of plans" }, { zh: "这种产品很受欢迎。", en: "This kind of product is very popular." }] },
  { mw: "套", py: "tào", usage: "Counts sets, suites and systems.", examples: [{ zh: "一套系统", en: "a system" }, { zh: "两套方案", en: "two sets of plans" }] },
  { mw: "段", py: "duàn", usage: "Counts sections, stretches of time or distance and paragraphs.", examples: [{ zh: "一段时间", en: "a period of time" }, { zh: "请看第二段。", en: "Please look at the second paragraph." }] },
  { mw: "篇", py: "piān", usage: "Counts articles, essays and papers.", examples: [{ zh: "一篇文章", en: "an article" }, { zh: "他发表了五篇论文。", en: "He published five papers." }] },
  { mw: "名", py: "míng", usage: "Counts people formally, often with a professional role.", examples: [{ zh: "一名律师", en: "a lawyer" }, { zh: "公司新招了三名员工。", en: "The company recruited three new employees." }] },
  { mw: "间", py: "jiān", usage: "Counts rooms and houses.", examples: [{ zh: "一间会议室", en: "a meeting room" }, { zh: "我们订了两间房。", en: "We booked two rooms." }] },
  { mw: "辆", py: "liàng", usage: "Counts vehicles.", examples: [{ zh: "一辆车", en: "a car" }, { zh: "公司派了两辆车来接我们。", en: "The company sent two cars to pick us up." }] },
  { mw: "部", py: "bù", usage: "Counts phones, films, and large works or machines.", examples: [{ zh: "一部手机", en: "a mobile phone" }, { zh: "一部纪录片", en: "a documentary" }] },
  { mw: "杯", py: "bēi", usage: "Counts cups or glasses of a drink.", examples: [{ zh: "一杯咖啡", en: "a cup of coffee" }, { zh: "我们喝一杯吧。", en: "Let's have a drink." }] },
  { mw: "瓶", py: "píng", usage: "Counts bottles of a liquid.", examples: [{ zh: "一瓶白酒", en: "a bottle of baijiu" }, { zh: "来两瓶水。", en: "Two bottles of water, please." }] },
  { mw: "双", py: "shuāng", usage: "Counts pairs of things, such as shoes and chopsticks.", examples: [{ zh: "一双筷子", en: "a pair of chopsticks" }, { zh: "两双鞋", en: "two pairs of shoes" }] },
  { mw: "页", py: "yè", usage: "Counts pages of a document or book.", examples: [{ zh: "第三页", en: "page three" }, { zh: "这份报告共五十页。", en: "This report is fifty pages in total." }] },
  { mw: "期", py: "qī", usage: "Counts phases, issues, instalments and periods.", examples: [{ zh: "第二期项目", en: "phase two of the project" }, { zh: "分三期付款", en: "pay in three instalments" }] },
  { mw: "轮", py: "lún", usage: "Counts rounds, such as funding or negotiation rounds.", examples: [{ zh: "一轮融资", en: "a round of financing" }, { zh: "经过三轮谈判", en: "after three rounds of negotiation" }] },
  { mw: "趟", py: "tàng", usage: "Counts trips or journeys there and back.", examples: [{ zh: "去一趟深圳", en: "make a trip to Shenzhen" }, { zh: "这个月出差了两趟。", en: "I went on two business trips this month." }] },
  { mw: "遍", py: "biàn", usage: "Counts complete times through an action, such as reading or saying something from start to finish.", examples: [{ zh: "再说一遍", en: "say it once more" }, { zh: "我把合同看了两遍。", en: "I read the contract through twice." }] },
  { mw: "顿", py: "dùn", usage: "Counts meals, scoldings and beatings.", examples: [{ zh: "一顿晚饭", en: "a dinner" }, { zh: "请您吃顿饭", en: "treat you to a meal" }] },
  { mw: "座", py: "zuò", usage: "Counts large, fixed things such as buildings, mountains and bridges.", examples: [{ zh: "一座大楼", en: "a building" }, { zh: "这座城市", en: "this city" }] },
  { mw: "栋", py: "dòng", usage: "Counts buildings or houses.", examples: [{ zh: "一栋办公楼", en: "an office building" }, { zh: "公司买下了三栋楼。", en: "The company bought three buildings." }] },
  { mw: "道", py: "dào", usage: "Counts dishes, questions, orders and long things like lines.", examples: [{ zh: "一道菜", en: "a dish" }, { zh: "一道难题", en: "a difficult problem" }] },
  { mw: "门", py: "mén", usage: "Counts courses, subjects and skills.", examples: [{ zh: "一门课", en: "a course" }, { zh: "他学了两门外语。", en: "He studied two foreign languages." }] },
  { mw: "只", py: "zhī", usage: "Counts animals and one of a pair of things; also used for stocks.", examples: [{ zh: "一只猫", en: "a cat" }, { zh: "买了两只股票", en: "bought two stocks" }] },
  { mw: "副", py: "fù", usage: "Counts pairs or sets, such as glasses, gloves and facial expressions.", examples: [{ zh: "一副眼镜", en: "a pair of glasses" }, { zh: "一副手套", en: "a pair of gloves" }] }
];

export const ETIQUETTE: EtiquetteTip[] = [
  {
    title: "Titles and forms of address",
    body: "Address people by surname plus job title rather than by first name, for example 王总 (General Manager Wang) or 李经理 (Manager Li). Use 您 instead of 你 for seniors and clients. Only switch to first names or nicknames like 小李 when a senior colleague does so first."
  },
  {
    title: "Exchanging business cards",
    body: "Offer and receive a card with both hands, with the Chinese side facing the recipient. Look at the card for a moment and say something like “久仰大名” (I have long heard of you) before putting it away carefully. Never write on it or shove it into a back pocket in front of the giver."
  },
  {
    title: "WeChat etiquette",
    body: "WeChat is where much real business happens, so add clients after meeting and send a short greeting with your name and company. Use text for formal matters and avoid long voice messages to senior people; a short voice note is fine with colleagues. Reply within a few hours during work hours, and move contracts or numbers into email for a record."
  },
  {
    title: "Banquet seating and toasting",
    body: "The host sits facing the door and the guest of honour sits to the host's right. Wait for the host to start the meal and make the first toast. When toasting 敬酒, hold your glass lower than that of someone senior and say “我敬您”. If you do not drink, say “以茶代酒” (tea instead of wine) with a smile."
  },
  {
    title: "Gift giving",
    body: "Gifts show respect and strengthen relationships, especially at 春节 and the Mid-Autumn Festival. Choose items from your home country or good tea, and wrap them nicely. Avoid clocks (送钟 sounds like 送终, attending a funeral), umbrellas, and green hats. A gift may be politely refused two or three times, and it is usually opened later rather than in front of you."
  },
  {
    title: "Saying no indirectly",
    body: "A direct “不行” can cause loss of face, so Chinese colleagues often say “有点困难”, “我们再研究研究” or “回头再说”. These usually mean no or not now, not a real maybe. Listen for hesitation and ask open follow-up questions instead of pushing for a clear yes or no."
  },
  {
    title: "Face (面子)",
    body: "面子 is about reputation and dignity. Praise people in public and give criticism privately, and never make someone look wrong in front of their team or boss. Offering a way out, such as “可能是我没说清楚”, lets both sides keep face while still fixing the problem."
  },
  {
    title: "Punctuality",
    body: "Arrive on time or slightly early for meetings and banquets, since being late signals disrespect, especially to senior hosts. If you will be late, send a message in advance with a new arrival time and “抱歉”. Meetings may start later or overrun, and that is normal, so keep your schedule flexible."
  },
  {
    title: "Holidays and deadlines",
    body: "Spring Festival (春节) brings around one to two weeks of holiday, and many companies shut down for even longer, so plan deliveries and payments well before. Golden Week at 国庆节 (October 1) and 劳动节 also bring travel and closures. Confirm 调休 (swapped working days) in the official calendar, as some weekends become working days."
  },
  {
    title: "Hierarchy in meetings",
    body: "The most senior person usually speaks first and last, and junior members often stay silent unless asked. Direct your questions and eye contact to the leader of the other team, but include the others politely. If you need to disagree with a boss, do it privately or phrase it as a suggestion, such as “我有一个小建议”."
  }
];
