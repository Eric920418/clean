// 全站靜態資訊（首次部署後可移到 SiteSetting model 由後台管理）

export const siteConfig = {
  brandName: 'invisible care',
  brandTagline: '看不見的守護，才是家最頂級的豪華',
  brandShort: '居家健康空間的修復師',
  description:
    'invisible care 整合防霾紗網、全戶濾水、水塔清洗、冷氣與洗衣機深度拆洗、精緻居家清潔等專業服務，由內而外為您守護家的純淨與健康。',
  contact: {
    phone: '0916-998036',
    /** tel: 連結用（無連字號，便於各平台撥號 app 解析） */
    phoneTel: 'tel:+886916998036',
    email: 'chen0105hc@gmail.com',
    /** LINE 好友 ID，會直接顯示給用戶看 */
    lineId: '',
    /** 加 LINE 好友連結（如 https://line.me/R/ti/p/@xxx） */
    lineFriendUrl: '',
    /** LINE 語音通話連結 */
    lineCallUrl: '',
    serviceArea: '雙北・桃園・新竹',
    hours: '週一至週六 09:00 – 19:00',
  },
  social: {
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
    line: 'https://line.me/',
  },
  promises: [
    { title: '專業技術領先', desc: '師傅皆通過內訓與實戰考核，標準化流程，絕不趕工犧牲品質。' },
    { title: '環保低殘留', desc: '優選歐盟認證、生物可分解洗劑，對小孩、寵物、敏感肌一樣安全。' },
    { title: '透明報價誠信', desc: '官網即可看到計費方式，現場確認後才施作，絕不惡意增項。' },
  ],
  process: [
    { step: '01', title: '諮詢登記', desc: 'Line 或表單填寫需求，30 分鐘內專人聯繫。' },
    { step: '02', title: '現場評估', desc: '到府勘查環境與設備狀況，當場確認施作範圍。' },
    { step: '03', title: '專業施作', desc: '標準化流程拆洗，全程記錄前後對比。' },
    { step: '04', title: '驗收保固', desc: '完工請您驗收，提供 30 天無憂保固。' },
  ],
}

export type SiteConfig = typeof siteConfig
