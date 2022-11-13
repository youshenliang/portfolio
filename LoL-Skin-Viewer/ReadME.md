## LOL 造型檢索工具
可以方便的查詢 LOL(League of Legends) 遊戲中所有角色之造型 <br/>
並檢視所選造型之演示影片的工具 <br/>

使用 Jquery + Node.JS 開發之 WebApp <br/>
串接 LOL API 取得角色、造型之資料 <br/>
串接 Youtube API 搜尋指定造型之展示影片 <br/>
使用 Electron 框架，可打包為 Linux、MacOS 和 Windows 上之可執行檔

### 列出遊戲中所有角色(依照英文名字排序及分類)
<img src="https://github.com/youshenliang/LoL-Skin-Viewer/blob/main/imgs/list_all_champions.png" width="700">

### 列出選定角色之所有造型(依照造型推出時間)
<img src="https://github.com/youshenliang/LoL-Skin-Viewer/blob/main/imgs/list_all_skins.png" width="700">

### 查詢選定造型之演示影片
<img src="https://github.com/youshenliang/LoL-Skin-Viewer/blob/main/imgs/show_skin_video.png" width="700">

## 使用說明
**請先安裝 NodeJS 環境，並確保 npm 工具可以正常運作**
<br/ > 輸入 `npm install` 以安裝所需之模組 <br/>
輸入 `npm run start` 可在 CLI 環境中執行本程式 <br/>
輸入 `npm run dist-win` 以打包為 Windows `exe` 可執行檔 <br/>
輸入 `npm run dist-linux` 以打包為 Linux `AppImage` 可執行檔 <br/>
輸入 `npm run dist-mac` 以打包為 MacOS `dmg` 可執行檔(僅在 MacOS 中可用)
