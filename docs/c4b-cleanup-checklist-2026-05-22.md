# C4b 一週後清理清單（執行日：2026-05-22）

> 建立日：2026-05-15
> 觸發日：**2026-05-22**（C4b 上線後 7 天）
> 放這份到行事曆 / 提醒事項

---

## 觸發前提：這一週業主與訪客都沒回報任何破壞

如果這 7 天 prod 出過任何問題，**不要執行下面動作**。先從 Neon Console 走 restore 流程，再評估。

---

## 7 天後要做的 3 件事

### 1. 確認 prod 沒問題（5 分鐘）

開以下 4 個前台頁面，視覺檢查跟一週前一樣：
- https://needfix.com.tw/services/aircon-cleaning
- https://needfix.com.tw/services/home-cleaning
- https://needfix.com.tw/services/anti-haze-screen
- https://needfix.com.tw/works

開後台 `/admin/services`，登入後點任一服務的「頁面區塊管理」，確認列表能載入。

### 2. 刪 Neon backup branch

進 https://console.neon.tech → 這個專案 → Branches → 找到 `pre-c4b-2026-05-15` → 右側選單 → Delete branch。

**確認你想刪**：刪掉後 5/15 那一刻的快照永久消失。如果還在觀察、不放心，可以延後一週再刪。

> Neon 對 storage 收費（branches 數量 × 保留資料量）— 不刪不會立刻產生大費用，但長期可能累積。

### 3. 刪掉這次的 plan 檔

```bash
rm /Users/eric/.claude/plans/typed-rolling-summit.md
rm /Users/eric/Desktop/clean/docs/c4b-cleanup-checklist-2026-05-22.md
```

Plan 檔留著沒用（Phase 2 完工），這份 cleanup 清單跑完也可以丟。

---

## 如果這週業主回報破壞

去 Neon Console → branches → `pre-c4b-2026-05-15` → **Restore** → 把 prod reset 回 5/15 那一刻。

**警告**：restore 會把 5/15 之後業主任何編輯**全部蓋掉**。先評估再做。
