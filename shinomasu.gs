// シノマスのブログrss
const BlogspotUrl = "https://shinomas.blogspot.com/feeds/posts/default?alt=rss"

// プロパティ名を指定
const LastPubTimePropertiesName = 'shinomasLastPubTime'
const WebhookIdPropertiesName = "shinomasWebhookId"
const WebhookTokenPropertiesName = "shinomasWebhookToken"
const RoleIdPropertiesName = "shinomasRoleId"

// メイン関数
function shinomasNews() {
  // rss取得
  const xml = UrlFetchApp.fetch(
    url=BlogspotUrl
  ).getContentText();

  // xmlをパース
  const document = XmlService.parse(xml);
  const entries = document.getRootElement().getChildren("channel")
  //console.log(entries[0].getChildren("item")[0].getChildText("title"))

  //スクリプトプロパティ(環境変数)を取得
	const scriptProperties = PropertiesService.getScriptProperties();

  // 最終更新日を取得(ない場合はnullを返す)
  const lastNewsTimeStr = scriptProperties.getProperty(key=LastPubTimePropertiesName)
  const lastNewsTime = setData(lastNewsTimeStr)

  const roleId = scriptProperties.getProperty(key=RoleIdPropertiesName)

  for(let entrie of entries){
    // 各要素を取り出す
    for (let item of entrie.getChildren("item")){
      // 更新日を取得
      let pubDateStr = item.getChildText("pubDate")
      let pubDate = setData(pubDateStr)
      
      // 最新情報がある場合
      if (pubDate > lastNewsTime){
        //console.log(item.getChildText("title"))
        //console.log(item.getChildText("pubDate"))
        //console.log(item.getChildText("description"))
        //console.log(item.getChildText("link"))
        let sendText = `
        <@&${roleId}>
        ${item.getChildText("title")}
        ${item.getChildText("link")}
        `
        send_to_discord(sendText)

        //更新日時の更新
        scriptProperties.setProperty(
          key=LastPubTimePropertiesName,
          value=setData(pubDateStr)
        );
      }
    }
  }
}

function send_to_discord(text){
  //スクリプトプロパティ(環境変数)を取得
	const scriptProperties = PropertiesService.getScriptProperties();

  // プロパティを取得
  const discordWebhookId = scriptProperties.getProperty(key=WebhookIdPropertiesName)
  const discordWebhookToken = scriptProperties.getProperty(key=WebhookTokenPropertiesName)

  //デバック用
  const webhookURL = `https://discord.com/api/webhooks/${discordWebhookId}/${discordWebhookToken}`;
  const options = {
    "content" : text
  };
  // データを作って投げる
  const response = UrlFetchApp.fetch(
    webhookURL,
    {
      method: "POST",
      contentType: "application/json",
      payload: JSON.stringify(options),
      muteHttpExceptions: true,
    }
  );
}

// 文字列の時刻をデータ型に変換
function setData(dateStr){
  //dateStr = 'Thu, 29 Jun 2023 06:55:00 +0000'
  const date = new Date(dateStr);   //monthは0オリジン

  //console.log(date)
  return date
}

// 最終更新日を手動で設定
function resetTime(){
  const timeStr = "Thu, 29 Jun 2023 00:55:00 +0000"

  //スクリプトプロパティ(環境変数)を取得
	const scriptProperties = PropertiesService.getScriptProperties();

  // 最終更新日を取得(ない場合はnullを返す)
  const lastNewsTime = scriptProperties.getProperty(key=LastPubTimePropertiesName)

  console.log(lastNewsTime)

  //日時の初期値をセット
  scriptProperties.setProperty(
    key=LastPubTimePropertiesName,
    value=setData(timeStr)
  );

  // 最終更新日を取得(ない場合はnullを返す)
  const newNewsTime = scriptProperties.getProperty(key=LastPubTimePropertiesName)

  console.log(newNewsTime)
}
