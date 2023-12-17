const DolphinWaveJsonUrl = "https://webassets-dolphin-wave.marv.jp/articles.json"
const DolphinWaveNewsBaseUrl = "https://news-dolphin-wave.marv.jp/article/"
const DISCORD_WEBHOOK_BASE = "https://discord.com/api/webhooks/"
const DolphinWaveICONUrl = "https://pbs.twimg.com/profile_images/1547385415518556160/IdbywPcg_400x400.jpg"

const USERNAME = "ドルフィンウェーブ最新情報"

// プロパティ名を指定
const LastPubTimePropertiesName = 'dolphinLastPubTime'
const WebhookIdPropertiesName = "dolphinWebhookId"
const WebhookTokenPropertiesName = "dolphinWebhookToken"
const RoleIdPropertiesName = "dolphinRoleId"

const MentionWord = [
  "メンテナンス","商品化","コラボ"
]

function main(){
  try{
    dosukebeWave()
  }catch(e){
    return
  }
}

function dosukebeWave() {

  //スクリプトプロパティ(環境変数)を取得
	const scriptProperties = PropertiesService.getScriptProperties();

  // webhookのidとtokenを取得
  const webhookId = scriptProperties.getProperty(key=WebhookIdPropertiesName)
  const webhookToken = scriptProperties.getProperty(key=WebhookTokenPropertiesName)

  // 最終更新日を取得(ない場合はnullを返す)
  const lastNewsTime = scriptProperties.getProperty(key=LastPubTimePropertiesName)

  // 通知するロールidを取得
  const roleId = scriptProperties.getProperty(key=RoleIdPropertiesName)

  const fetchJson = UrlFetchApp.fetch(
    url = DolphinWaveJsonUrl,
    params = {
      "method": "get"
    }
  )

  const json = JSON.parse(fetchJson)

  let contentText = ""

  // プロパティが設定されていない場合
  if (lastNewsTime === null){
    //日時の初期値をセット
	  scriptProperties.setProperty(
      key=LastPubTimePropertiesName,
      value=setData(json.articles[0].date)
    );
    return
  }

  for (let i = 5; i >= 0; i--){
    //console.log(json.articles[i])
    // 更新があった場合
    let newsDate = setData(json.articles[i].date)
    
    if (new Date(lastNewsTime) < newsDate){
      const url = DolphinWaveNewsBaseUrl + json.articles[i].id
      const title = json.articles[i].title
      const tags = json.articles[i].tags

      /*
      title
      date
      url
      tags
      imageurl
      */
      contentText = title + '\n' + json.articles[i].date + '\n' + url

      //タグがある場合、追記
      if (tags !== undefined){
        contentText = title + '\nタグ\n'
        for (let tag in tags){
          contentText = contentText + tags[tag].name + ' '
        }
        contentText = contentText + '\n' + json.articles[i].date + '\n' + url
      }

      contentText = contentText + '\n' + json.articles[i].image


      // 更新日を更新
      scriptProperties.setProperty(
        key=LastPubTimePropertiesName,
        value=setData(json.articles[i].date)
      );
      console.log(contentText)

      sendToDiscord(
        content=contentText,
        webhookId=webhookId,
        webhookToken=webhookToken,
        username=USERNAME,
        avater_url=DolphinWaveICONUrl
      )
    }
  }
  //console.log(json)

}

// 文字列の時刻をデータ型に変換
function setData(dateStr){
  //dateStr = '2023/05/02 17:00:00'
  const year = parseInt(dateStr.substring(0, 4));               //2022
  const month = parseInt(dateStr.substring(5, 7));              //2
  const day = parseInt(dateStr.substring(9, 10));                //5
  const hour = parseInt(dateStr.substring(11, 13));              //21
  const min = parseInt(dateStr.substring(17, 19));              //0
  //console.log(year, month - 1, day, hour, min)
  const date = new Date(year, month - 1, day, hour, min);   //monthは0オリジン

  //console.log(date)
  return date
}

//Discordにメッセージを送るための関数
function sendToDiscord(
  content, 
  id, 
  token, 
  username, 
  avatar_url
) {
	
  const url = `${DISCORD_WEBHOOK_BASE}${id}/${token}`
	//Discordに送信する変数
	let payload = {
		'content': content
	};

  if (username !== null){
    payload.username = username
  }
  if (avatar_url !== null){
    payload.avatar_url = avatar_url
  }

  console.log(payload)
  console.log(url)

	const discordWebhook = UrlFetchApp.fetch(
    url, 
    {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
	  }
  );
  console.log(discordWebhook.getContentText())
}


function resetTime(){
  const timeStr = "2023/05/21 10:55:00"

  //スクリプトプロパティ(環境変数)を取得
	const scriptProperties = PropertiesService.getScriptProperties();

  // 最終更新日を取得(ない場合はnullを返す)
  const lastNewsTime = scriptProperties.getProperty(key=LastPubTimePropertiesName)

  console.log(lastNewsTime)

  scriptProperties.setProperty(
    key=LastPubTimePropertiesName,
    value=setData(timeStr)
  );

  // 最終更新日を取得(ない場合はnullを返す)
  const newNewsTime = scriptProperties.getProperty(key=LastPubTimePropertiesName)

  console.log(newNewsTime)
}
