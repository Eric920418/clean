// Mock data — 結構嚴格對應 prisma/schema.prisma 的 model 形狀
// 待後台 CRUD 串接後，這個檔案會被資料庫查詢取代，但元件接口無需改

export type MockBeforeAfter = {
  id: number
  beforeUrl: string
  afterUrl: string
  caption: string
  location: string | null
  takenAt: string | null
  isFeatured: boolean
}

export type MockServiceFeature = { id: number; text: string; order: number }
export type MockServiceFaq = { id: number; question: string; answer: string; order: number }
export type MockGalleryImage = { id: number; url: string; alt: string }

export type MockService = {
  id: number
  slug: string
  name: string
  shortDesc: string
  longDesc: string
  icon: string
  heroImage: string
  cardImage: string
  order: number
  isActive: boolean
  isFeatured: boolean
  features: MockServiceFeature[]
  faqs: MockServiceFaq[]
  beforeAfters: MockBeforeAfter[]
  galleryImgs: MockGalleryImage[]
}

export type MockTestimonial = {
  id: number
  authorName: string
  authorMeta: string
  rating: number
  content: string
}

// 圖庫使用 Unsplash 高品質清潔/家居圖（生產環境會被 R2 真實照片取代）
const u = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const mockServices: MockService[] = [
  {
    id: 1,
    slug: 'aircon-cleaning',
    name: '冷氣機深度清洗',
    shortDesc: '拆洗風輪與蒸發器，清除黴菌與過敏原，讓冷氣回到出廠水準。',
    longDesc:
      '冷氣不冷、滴水、噴黑點，都是機器發出的求救信號。我們堅持「全拆解」工法，將風輪、蒸發鋁片、排水盤拆下後以專業洗劑徹底清洗，徹底瓦解長年累積的黴菌與灰塵，恢復新機般的冷房效率與寧靜運轉。',
    icon: 'Wind',
    heroImage: u('photo-1582719471384-894fbb16e074'),
    cardImage: u('photo-1585320806297-9794b3e4eeae', 800),
    order: 1,
    isActive: true,
    isFeatured: true,
    features: [
      { id: 1, text: '全拆解清洗：風輪、鋁片、排水盤一次到位', order: 0 },
      { id: 2, text: '冷房效能提升 20%~30%，省電有感', order: 1 },
      { id: 3, text: '使用歐盟認證環保洗劑，無刺鼻殘留', order: 2 },
      { id: 4, text: '完工提供 30 天無憂保固', order: 3 },
    ],
    faqs: [
      {
        id: 1,
        question: '多久應該洗一次冷氣？',
        answer:
          '一般家庭建議每年清洗一次，重度使用（每天超過 8 小時）或家中有過敏成員，建議半年一次。',
        order: 0,
      },
      {
        id: 2,
        question: '清洗後可以馬上開機嗎？',
        answer: '可以，我們會在現場通電測試，確認運轉正常後再離開。',
        order: 1,
      },
      {
        id: 3,
        question: '需要自備工具或場地嗎？',
        answer: '完全不需要，我們會帶齊所有設備，並鋪設工作區避免家中地板與牆面受損。',
        order: 2,
      },
    ],
    beforeAfters: [
      {
        id: 1,
        beforeUrl: u('photo-1585421514738-01798e348b17'),
        afterUrl: u('photo-1585320806297-9794b3e4eeae'),
        caption: '使用 8 年未深度清洗的分離式冷氣風輪',
        location: '台北市信義區',
        takenAt: '2026-03-12',
        isFeatured: true,
      },
      {
        id: 2,
        beforeUrl: u('photo-1558618666-fcd25c85cd64'),
        afterUrl: u('photo-1581578731548-c64695cc6952'),
        caption: '老舊辦公室窗型冷氣鋁片厚塵',
        location: '新北市板橋區',
        takenAt: '2026-03-20',
        isFeatured: true,
      },
      {
        id: 3,
        beforeUrl: u('photo-1527515637462-cff94eecc1ac'),
        afterUrl: u('photo-1556909114-f6e7ad7d3136'),
        caption: '住家排水盤霉漬清理',
        location: '桃園市中壢區',
        takenAt: '2026-04-02',
        isFeatured: false,
      },
    ],
    galleryImgs: [
      { id: 1, url: u('photo-1581578731548-c64695cc6952', 800), alt: '師傅拆解冷氣外殼' },
      { id: 2, url: u('photo-1556909114-f6e7ad7d3136', 800), alt: '高壓沖洗鋁片' },
    ],
  },
  {
    id: 2,
    slug: 'washer-deep-clean',
    name: '洗衣機拆解清潔',
    shortDesc: '完全拆解內桶，徹底清除黑黴與棉絮殘留，告別越洗越髒的困擾。',
    longDesc:
      '洗衣機內槽與外桶之間的夾層，長年積累皮屑、棉絮與洗劑殘留，髒汙程度往往高出馬桶數倍。我們提供直立式與滾筒式洗衣機的完全拆解清洗，讓您親眼見證清潔前後的巨大反差，從根本解決衣物洗後發臭與皮膚搔癢的問題。',
    icon: 'WashingMachine',
    heroImage: u('photo-1545173168-9f1947eebb7f'),
    cardImage: u('photo-1626806787461-102c1bfaaea1', 800),
    order: 2,
    isActive: true,
    isFeatured: true,
    features: [
      { id: 1, text: '完全拆解內桶，深入夾層清洗', order: 0 },
      { id: 2, text: '直立式 / 滾筒式 / 變頻款皆可施作', order: 1 },
      { id: 3, text: '防黴抑菌處理，保護敏感肌與嬰幼兒', order: 2 },
      { id: 4, text: '不破壞原廠保固，安心施工', order: 3 },
    ],
    faqs: [
      { id: 1, question: '清洗時間多久？', answer: '直立式約 1.5~2 小時，滾筒式約 2~3 小時。', order: 0 },
      { id: 2, question: '為什麼一定要拆解？', answer: '市售清潔錠只能處理表面，無法清潔內外桶夾層，那才是黑黴的溫床。', order: 1 },
    ],
    beforeAfters: [
      {
        id: 4,
        beforeUrl: u('photo-1620626011761-996317b8d101'),
        afterUrl: u('photo-1545173168-9f1947eebb7f'),
        caption: '5 年未拆洗的滾筒洗衣機內桶',
        location: '台北市大安區',
        takenAt: '2026-02-18',
        isFeatured: true,
      },
      {
        id: 5,
        beforeUrl: u('photo-1626806787461-102c1bfaaea1'),
        afterUrl: u('photo-1545173168-9f1947eebb7f'),
        caption: '直立式洗衣機底盤毛屑',
        location: '新北市三重區',
        takenAt: '2026-03-05',
        isFeatured: false,
      },
    ],
    galleryImgs: [
      { id: 3, url: u('photo-1620626011761-996317b8d101', 800), alt: '拆解後的洗衣槽' },
    ],
  },
  {
    id: 3,
    slug: 'water-tank-cleaning',
    name: '水塔清洗與養護',
    shortDesc: '高壓沖刷塔底淤泥與壁面生物膜，搭配食品級洗劑，守護全家用水。',
    longDesc:
      '即便有了過濾系統，若貯水的水塔長年未清，底部積累的淤泥、藻類與生物膜將成為細菌溫床。我們的師傅深入水塔內部，以物理刷洗配合高壓水噴射，徹底瓦解附著於壁面的生物膜，並同步檢查浮球開關與結構完整性。',
    icon: 'Droplets',
    heroImage: u('photo-1581094794329-c8112a89af12'),
    cardImage: u('photo-1581094794329-c8112a89af12', 800),
    order: 3,
    isActive: true,
    isFeatured: false,
    features: [
      { id: 1, text: '高壓清洗 + 食品級洗劑徹底除垢', order: 0 },
      { id: 2, text: '完工後同步消毒並檢測 pH 值', order: 1 },
      { id: 3, text: '附浮球開關與止水閥健檢', order: 2 },
    ],
    faqs: [
      { id: 1, question: '一般水塔多久清洗一次？', answer: '建議每 6 個月至 1 年一次，公寓共用水塔尤其應定期清洗。', order: 0 },
    ],
    beforeAfters: [
      {
        id: 6,
        beforeUrl: u('photo-1582408921715-18e7806365c1'),
        afterUrl: u('photo-1581094794329-c8112a89af12'),
        caption: '頂樓不鏽鋼水塔深度清洗',
        location: '台北市文山區',
        takenAt: '2026-01-22',
        isFeatured: true,
      },
    ],
    galleryImgs: [],
  },
  {
    id: 4,
    slug: 'anti-haze-screen',
    name: '防霾紗網更換與維修',
    shortDesc: '靜電濾淨技術，阻隔率 80% 以上，依然敢開窗呼吸。',
    longDesc:
      '隨著 PM2.5 與細懸浮微粒問題日益嚴重，傳統紗網已無法阻擋微細粉塵與過敏原進入室內。我們採用先進的防霾紗網，利用靜電原理有效攔截微米級灰塵，阻隔率高達 80% 以上，同時保持優異的透氣度與透光率。',
    icon: 'ShieldCheck',
    heroImage: u('photo-1556909114-f6e7ad7d3136'),
    cardImage: u('photo-1556909114-f6e7ad7d3136', 800),
    order: 4,
    isActive: true,
    isFeatured: false,
    features: [
      { id: 1, text: '靜電濾淨技術，阻隔率 80% 以上', order: 0 },
      { id: 2, text: '保持透氣與透光，不影響採光', order: 1 },
      { id: 3, text: '紗窗框架變形、滾輪卡頓也可維修', order: 2 },
    ],
    faqs: [],
    beforeAfters: [
      {
        id: 7,
        beforeUrl: u('photo-1581578731548-c64695cc6952'),
        afterUrl: u('photo-1556909114-f6e7ad7d3136'),
        caption: '老舊紗窗破損更換',
        location: '新北市永和區',
        takenAt: '2026-03-30',
        isFeatured: false,
      },
    ],
    galleryImgs: [],
  },
  {
    id: 5,
    slug: 'whole-house-filter',
    name: '全戶大胖過濾系統',
    shortDesc: '生活用水的源頭把關，濾除餘氯、重金屬與泥沙。',
    longDesc:
      '飲用水可以買，但洗澡、刷牙、洗臉的「生活用水」卻無法迴避。我們安裝的全戶大胖過濾系統，能有效濾除自來水中的餘氯、重金屬、農藥殘留與泥沙，不僅保護您的肌膚與髮質不再受化學物質侵擾，更能防止管路結垢，延長家中熱水器、洗衣機等用水設備的壽命。',
    icon: 'Filter',
    heroImage: u('photo-1581922814484-0b48460b7010'),
    cardImage: u('photo-1581922814484-0b48460b7010', 800),
    order: 5,
    isActive: true,
    isFeatured: false,
    features: [
      { id: 1, text: '濾除餘氯、重金屬、農藥殘留', order: 0 },
      { id: 2, text: '保護肌膚、髮質與家用水設備', order: 1 },
      { id: 3, text: '提供定期換濾芯到府服務', order: 2 },
    ],
    faqs: [],
    beforeAfters: [],
    galleryImgs: [],
  },
  {
    id: 6,
    slug: 'home-cleaning',
    name: '精緻居家清潔',
    shortDesc: '針對廚房油汙、衛浴水垢、窗框縫隙的職人級深度清潔。',
    longDesc:
      '清潔不應只是打掃，更是一場關於細節的藝術。針對廚房油汙、衛浴水垢、窗框縫隙，我們使用環保且不傷建材的專業藥劑，進行針對性的深度清潔。無論是入厝前的大掃除、年終掃除，或是定期的環境維護，我們都能根據您的需求規劃最高效率的清掃流程。',
    icon: 'Sparkles',
    heroImage: u('photo-1527515637462-cff94eecc1ac'),
    cardImage: u('photo-1527515637462-cff94eecc1ac', 800),
    order: 6,
    isActive: true,
    isFeatured: true,
    features: [
      { id: 1, text: '針對材質選擇對應藥劑，不傷建材', order: 0 },
      { id: 2, text: '門把縫隙、踢腳板、窗溝細節處理', order: 1 },
      { id: 3, text: '可客製入厝、年終、月度方案', order: 2 },
    ],
    faqs: [],
    beforeAfters: [
      {
        id: 8,
        beforeUrl: u('photo-1527515637462-cff94eecc1ac'),
        afterUrl: u('photo-1556909114-f6e7ad7d3136'),
        caption: '廚房瓦斯爐重油汙處理',
        location: '台北市內湖區',
        takenAt: '2026-04-10',
        isFeatured: true,
      },
    ],
    galleryImgs: [],
  },
]

export const mockTestimonials: MockTestimonial[] = [
  {
    id: 1,
    authorName: '林小姐',
    authorMeta: '台北・洗冷氣 + 洗衣機',
    rating: 5,
    content: '師傅準時到、用塑膠膜把家具完整包好，拆下風輪後的黑水真的嚇到我，洗完當天晚上家裡空氣都不一樣了。',
  },
  {
    id: 2,
    authorName: 'Wang 先生',
    authorMeta: '新北・水塔清洗',
    rating: 5,
    content: '十年沒清的水塔，底部一層紅色泥膜，師傅還拍照給我看。清洗完後水流量明顯變大，洗澡也不再有怪味。',
  },
  {
    id: 3,
    authorName: '陳先生',
    authorMeta: '桃園・防霾紗網',
    rating: 5,
    content: '原本怕換新紗網會擋光，結果完全不會，反而通風更好。空品差的時候敢開窗，過敏症狀有明顯改善。',
  },
]

// 取出所有「精選」對比圖（首頁作品牆用）
export const featuredBeforeAfters = mockServices.flatMap((s) =>
  s.beforeAfters
    .filter((p) => p.isFeatured)
    .map((p) => ({ ...p, serviceName: s.name, serviceSlug: s.slug }))
)

// 取出所有對比圖（/works 頁用）
export const allBeforeAfters = mockServices.flatMap((s) =>
  s.beforeAfters.map((p) => ({ ...p, serviceName: s.name, serviceSlug: s.slug }))
)

export function getServiceBySlug(slug: string): MockService | undefined {
  return mockServices.find((s) => s.slug === slug)
}
