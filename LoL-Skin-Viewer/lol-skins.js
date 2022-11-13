var ajaxPort = 1679;
var ajaxURL = "http://127.0.0.1:" + ajaxPort + "/";
var version = -1;

function load_champion_list() {
  $("body").css("margin", "8px");
  $("body").append("<text id='txt_version'> 目前版本：</text> &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp");
  $("body").append("<text id='champion_amount'> 英雄總數：</text>");
  $.ajax({
    url: ajaxURL + "load_champion_list",
    data: "load_champion_list",
    type: "POST",

    error: function(data){
      $("#msg").text("網路錯誤，請檢查網路環境是否正常後再重新嘗試");
    },

    success: function(response){
      var data = response.split(",");
      var champion_amount = data.length - 2;
      $("#txt_version").text("目前版本：" + data[0]);
      $("#champion_amount").text("英雄總數：" + champion_amount);
      version = data[0];
      // 列出所有英雄
      var currentChar = '@';  // 用以依英文字母分類
      for(var i=1; i<data.length-1; i++){
        var champion_name = data[i].split("@");
        var champion_name_en = champion_name[0];
        var champion_name_ch = champion_name[1];

        if(currentChar != data[i].charAt(0)){
          currentChar = data[i].charAt(0);
          $("body").append("<br/><text>" + currentChar + "</text><br/>");
        }
        var imgURL = "https://ddragon.leagueoflegends.com/cdn/" + data[0] + "/img/champion/" + champion_name_en + ".png";
        //$("body").append("<img id='" + data[i] + "'title='" + champion_name_en +  + "' src='" + imgURL + "' onclick='get_skin_list(this)'></img>");
        $("body").append(`<img id='${champion_name_en}' title='${champion_name_en}\n${champion_name_ch}' src='${imgURL}' onclick='get_skin_list(this)'> </img>`);
      };
    }
  });
}

function get_skin_list(champion){
  document.body.innerHTML = "";
  $("body").css("margin", "8px");
  $("body").append("<div><button class='reload_btn' onclick='location.reload()'> 回英雄列表 </button></div>");
  $.ajax({
    url: ajaxURL + "get_skin_list",
    data: champion.id,
    type: "POST",
    error: function(data){
      $("#msg").text("嘗試取得" + champion.id + "之造型時發生了錯誤");
    },
    success: function(skin_list){
      var skin_element = skin_list.split(";");
      for(var i=0; i<skin_element.length-1; i++){
        var skin_info = skin_element[i].split("@");
        var skin_num = skin_info[0];
        var skin_name = skin_info[1];
        var skin_name_ch = skin_info[2];

        skin_name = skin_name.replace('\'', ' ');
        var imgURL = "http://ddragon.leagueoflegends.com/cdn/img/champion/loading/" + champion.id + "_" + skin_num + ".jpg";

        $("body").append(`<img onclick='get_skin_spotlight("${champion.id}", "${skin_num}", "${skin_name}")' class='skin_img' id='${skin_num}' title='${skin_name}\n${skin_name_ch}' src='${imgURL}' </img>`);
      }
    }
  })
}

function get_skin_spotlight(champion_name, skin_id, skin_name) {
	var YOUTUBE_API_KEY = "AIzaSyBZvV5Neu_55-5xrMviON5qZzzSq0kw3jY"; // 利用Youtube API搜尋影片
  var champion_skin_full_image_url = "https://ddragon.leagueoflegends.com/cdn/img/champion/splash/"  + champion_name + "_" + skin_id + ".jpg";  // 各英雄造型的完整美術圖之網址
  var Video_Result_URL = "";
  document.body.innerHTML = "";
  /* 將影片網址傳給server端，解析request結果後回傳 */
  $.ajax({
    url: ajaxURL + "skin_spotlight",
    data: champion_name + ";" + skin_id + ";" + skin_name,
    type: "POST",
    error: function(msg){
      $("#msg").text(msg);
    },
    success: function(video_id){
      $("body").css("margin", "0px");
      $("body").append(`<button class='btn_back' id=${champion_name} onclick='get_skin_list(this)'> 回造型列表 </button>`);
      $("body").append(`<div class='bg' style='background-image: url(${champion_skin_full_image_url});'><iframe allowfullscreen src='https://www.youtube.com/embed/${video_id}'> </iframe></div>`);
    }
  });
}
