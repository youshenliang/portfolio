const electron = require("electron");
const {app, BrowserWindow} = electron;
const request = require('request').defaults({rejectUnauthorized:false});
const http = require("http");

const port = 1679;  // port number must larger then 1024 because of the permission problem


// define version promise
function get_newest_function() {
  var targetURL = "https://ddragon.leagueoflegends.com/api/versions.json";
  return new Promise((resolve, reject) => {
    request.get(targetURL, (err, response, body) => {
      if(response==null || response.statusCode != "200") reject("error getting version");
      else resolve(JSON.parse(body)[0]);
    });
  });
}

/* Define Server and Process POST data */
var server = http.createServer((req, res) => {
  var post_data = '';
  var version = -1;

  if(req.method == "POST"){

    req.on("data", (chunk) => {
      post_data += chunk;
    });

    req.on("end", () => {

      switch(req.url){
        case "/load_champion_list":
          /* get newest version */
          var body = [];
          var targetURL = "https://ddragon.leagueoflegends.com/api/versions.json";


          // define version promise
          var version_promise = get_newest_function();

          // if get version data failed
          version_promise.catch((data) => {
            res.writeHead(400,{'Content-Type':'text/plain'});
            res.write(data);
            res.end();
          })

          // if get version data successfully
          version_promise.then((data) => {
            version = data;
            res.writeHead(200,{'Content-Type':'text/plain'});
            res.write(data + ",");

            /* get champion list */
            var target = "https://ddragon.leagueoflegends.com/cdn/" + version + "/data/en_US/champion.json";  // LOL API提供之所有英雄資訊
            var target_ch = "https://ddragon.leagueoflegends.com/cdn/" + version + "/data/zh_TW/champion.json";  // LOL API提供之所有英雄資訊 (中文版)
            var champion_detail_url = "https://ddragon.leagueoflegends.com/cdn/" + version + "/data/en_US/champion/"; // LOL API提供之各英雄完整資訊
            var champion_sprite_url = "https://ddragon.leagueoflegends.com/cdn/" + version + "/img/champion/";  // 各英雄的小型頭像圖片前置網址

            // define all champion info promise
            const all_champion_info_promise = new Promise((resolve, reject) => {
              request.get(target, (error, response, body) => {
                if(response==null || response.statusCode != "200") reject("獲取英雄列表時發生了錯誤");
                else {
                  resolve(JSON.parse(body)["data"]);
                }
              })
            })

            // define all champion info promise (ch)
            const all_champion_info_promise_ch = new Promise((resolve, reject) => {
              request.get(target_ch, (error, response, body) => {
                if(response==null || response.statusCode != "200") reject("獲取英雄列表時發生了錯誤");
                else {
                  resolve(JSON.parse(body)["data"]);
                }
              })
            })

            // if get all champion info successfully
            all_champion_info_promise.then((data_en) => {
              all_champion_info_promise_ch.then((data_ch) => {
                for(var champion_name in data_ch){
                  res.write(champion_name + "@" + data_ch[champion_name]["name"] + ",");
                }
                res.end();
              })
            })

            // if get all champion info failed
            all_champion_info_promise.catch((data) => {
              res.write(data);
              res.end();
            })
          })


          break;

        /*============================================================*/

        case "/get_skin_list":

          // define version promise
          var version = -1;
          version_promise = get_newest_function();

          version_promise.then((data) => {
            res.writeHead(200,{'Content-Type':'text/plain'});
            version = data;

            var skin_list_url = "https://ddragon.leagueoflegends.com/cdn/" + version + "/data/en_US/champion/" + post_data + ".json";
            var skin_list_url_ch = "https://ddragon.leagueoflegends.com/cdn/" + version + "/data/zh_TW/champion/" + post_data + ".json";
            var skin_data_ch;

            const skin_list_promise = new Promise((resolve, reject) => {
              request.get(skin_list_url, (error, response, body) => {
                if(response==null || response.statusCode != "200") reject("獲取" + data + "的造型時發生了錯誤");
                else{
                  resolve(JSON.parse(body)["data"][post_data]["skins"]);
                }
              });
            });

            const skin_list_promise_ch = new Promise((resolve, reject) => {
              request.get(skin_list_url_ch, (error, response, body) => {
                if(response==null || response.statusCode != "200") reject("獲取" + data + "的造型時發生了錯誤");
                else{
                  skin_data_ch = JSON.parse(body)["data"][post_data]["skins"];
                  resolve("");
                }
              });
            });

            skin_list_promise.then((data) => {
              skin_list_promise_ch.then(() => {
                res.writeHead(200,{'Content-Type':'text/plain'});

                let skin_list = "";
                for(var i=0; i<data.length; i++){
                  if(skin_data_ch[i]["name"] == "default") skin_data_ch[i]["name"] = "經典造型";
                  skin_list += data[i]["num"] + "@" + data[i]["name"] + "@" + skin_data_ch[i]["name"] + ";"
                }
                res.write(skin_list);
                res.end();
                });
            });

            skin_list_promise.catch(() => {
              res.writeHead(400,{'Content-Type':'text/plain'});
              res.write(data);
              res.end();
            });
          });

          version_promise.catch((data) => {
            res.writeHead(400,{'Content-Type':'text/plain'});
            res.write(data);
            res.end();
          });

          break;

        /*============================================================*/

        /* get skin spotlight video */
        case "/skin_spotlight":
          var skin_data = post_data.split(";");
          var champion_name = skin_data[0];
          var skin_id = skin_data[1];
          var skin_name = skin_data[2];
          var YOUTUBE_API_KEY = "AIzaSyBZvV5Neu_55-5xrMviON5qZzzSq0kw3jY"; // 利用Youtube API搜尋影片
          var Video_Result_URL = "";  // encoded url


          if(skin_id == "0"){
            // 如果選擇預設造型則爬取英雄聚光燈
            Video_Result_URL = "https://www.googleapis.com/youtube/v3/search?part=snippet&q=" + champion_name + "%20New%20Champion%20Spotlight&maxResults=1&channelId=UC2t5bjwHdUX4vM2g8TRDq5g&key=" + YOUTUBE_API_KEY;
          }else{
            var encoded_keyword = encodeURI(skin_name);
            Video_Result_URL = "https://www.googleapis.com/youtube/v3/search?part=snippet&q=" + encoded_keyword + "%20Skin%20Spotlight&maxResults=1&channelId=UC0NwzCHb8Fg89eTB5eYX17Q&key=" + YOUTUBE_API_KEY;
          }

          const skin_spotlight_promise = new Promise((resolve, reject) => {
            request.get(Video_Result_URL, (error, response, body) => {
              if(response == null || response.statusCode != "200") reject("取得造型影片時發生了錯誤");
              else{
                resolve(JSON.parse(body)["items"][0]["id"]["videoId"]);  // 提取出影片的ID
              }
            });
          });

          skin_spotlight_promise.then((video_id) => {
            res.writeHead(200,{'Content-Type':'text/plain'});
            res.write(video_id);
            res.end();
          });

          skin_spotlight_promise.catch((msg) => {
            res.writeHead(400,{'Content-Type':'text/plain'});
            res.write(msg);
            res.end();
          });

        break;
      }



    });
  }
})


/* Get Newest Version Number of LOL */
function getNewestVersion() {
  var body = [];
  var targetURL = "https://ddragon.leagueoflegends.com/api/versions.json";

  const version_promise = new Promise((resolve, reject) => {
    request.get(targetURL, (err, response, body) => {
      if(err) return "error";
      else {
        resolve("OK");
      }
    })
  })

  version_promise.then((data) => {
    return data;
  })
}


/* Create Window Form */
function createWindow() {
  const window_size = electron.screen.getPrimaryDisplay().workAreaSize;
  const mainWindow = new BrowserWindow({width: window_size.width/2+200, height: window_size.height/2+200, center: true, title: "LOL造型影片查詢工具 by LYS"});
  mainWindow.setMenu(null);
  mainWindow.loadFile("lol-skins.htm"); // load html file to show
}

app.on('ready', function(){
  createWindow();
  server.listen(port);  // start server and listen to 1679 port
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
})
