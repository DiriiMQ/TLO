var socket = io.connect("http://"+document.domain+":"+location.port);

var contestants=[];
var curques=-1;
var questions=[];
var ans=[];
var corner=[[1,2,5],[3,4,8],[9,13,14],[12,15,16],[6,7,10,11]];
var stt=["","","","",""];
var curmatch;
var bgm = new Audio();
bgm.src="/static/audio/VCNV_15s.wav";
bgm.type="audio/wav";
var sfx = new Audio();
sfx.type="audio/wav";

function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    function toSolidBytes(match, p1) {
      return String.fromCharCode('0x' + p1);
  }));
}

send_mess("viewer","controller","ok");

function b64DecodeUnicode(str) {
  return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))
}

socket.on("disconnect",function(){
	socket.connect();
})

var bar = new ProgressBar.Circle(timer, {
  id: "bar",
  strokeWidth: 6,
  easing: 'linear',
  duration: 15000,
  color: '#3333ff',
  trailColor: '#eee',
  trailWidth: 1,
  svgStyle: null
});

function playbgm(){
	bgm.play()
}

function playsfx(id){
	switch(id){
		case 'cnv':{
			sfx.src = '/static/audio/VCNV_trả_lời.wav'
		}
		break;
		case 'correct':{
			sfx.src = '/static/audio/VCNV_tl_đúng.wav'
		}
		break;
		case 'showans':{
			sfx.src = '/static/audio/VCNV_mở_đáp_án.wav'
		}
		break;
		case 'showimg':{
			sfx.src = '/static/audio/VCNV_mở_hình_ảnh.wav'
		}
		break;
		case 'chooseques':{
			sfx.src = '/static/audio/VCNV_chọn_ô_chữ.wav'
		}
		break;
		case 'wrong':{
			sfx.src = '/static/audio/KD_sai.wav'
		}
		break;
	}
	sfx.play()
}

function send_mess(sender,receiver,content){
		var data=[];
		data.push({
			sender: sender,
			receiver: receiver,
			content: content
		});
		data=JSON.stringify(data);
		data=b64EncodeUnicode(data);
		socket.send(data);
};

function appendhn(){
	$("#hn1").html('');$("#hn2").html('');$("#hn3").html('');$("#hn0").html('');
	for(id=0;id<4;id++){
		let str = ans[id]
		for(index in str){
			$("#hn"+id).append('<div id="hn'+id+'_'+index+'" style="width:50px;height:50px;border-radius:25px;background:#3333ff;color:#3333ff;font-weight:bold;font-size:30px;text-align:center;float:left;font-family:`Arial`;line-height:50px;">'+str[index]+'</div>');
		}
	}
}

function reveal(id){
	l=ans[id].length;
	for(var i=0;i<l;i++){
		document.getElementById("hn"+id+"_"+i).style.background="#b3b3ff";
		document.getElementById("hn"+id+"_"+i).style.color="#3333ff";
	}
}

function failed(id){
	l=ans[id].length;
	for(var i=0;i<l;i++){
		document.getElementById("hn"+id+"_"+i).style.background="#999999";
		document.getElementById("hn"+id+"_"+i).style.color="#999999";
	}
}

function tick(time){
	if(time>-1){
		$("#timenum").html(time);
		setTimeout(function() {
			tick(time-1)
		}, 1000);
	}
}

function start(){
	bar.animate(1.0);
	tick(15);
	setTimeout(function() {$("#timer").animate({opacity:"0"},1000)}, 15000);
	for (var i = 1; i <= 4; i++) {
		$("#ans"+i).animate({opacity:"0"},0);
	}
}

function showimg(id){
	stt[id]="correct";
	for(index in corner[id]){
		$("#cnv"+corner[id][index]).hide();
	}
}

function resetimg(){
	for(var i=1;i<=16;i++){
		$("#cnv"+i).show();
	}
}

const update = async () => {
	resetimg();
	for(var i=1;i<=4;i++){
		document.getElementById("name"+i).style.background="#9900cc";
		document.getElementById("nameans"+i).style.background="white";
		document.getElementById("nameans"+i).style.color="black";
	}
	// alert("ahihi");
  if (curmatch!= void 0) {
    $("#cnvimg")[0].src=`/static/images/${curmatch}_CNV.jpg`;
  	await _fetch("/apix/read_file",{file:`static/data/${curmatch}_contestants.txt`}).then((res) => {
  		res = b64DecodeUnicode(res);
  		contestants = JSON.parse(res);
  		for(index in contestants){
  			$("#name"+parseInt(parseInt(index)+1)).html(contestants[index].name);
  			$("#nameans"+parseInt(parseInt(index)+1)).html(contestants[index].name);
  			$("#score"+parseInt(parseInt(index)+1)).html(contestants[index].score);
  		}
  	});
  	// alert("ahihi");
  	await loadques()
  	// alert("ahihi");
  	await _fetch("/apix/read_file",{file:`static/data/${curmatch}_status.txt`}).then((res) => {
  		res = b64DecodeUnicode(res);
  		res = JSON.parse(res);
  		if(curques != res[0].curques){
  			// playsfx('chooseques')
  		}
  		curques=res[0].curques;
  		$("#question").html("Câu hỏi thứ "+parseInt(parseInt(curques)+1));
  	});
  	// alert("ahihi");
  	_fetch("/apix/read_file",{file:`static/data/${curmatch}_stt.txt`}).then((res) => {
  		res = b64DecodeUnicode(res);
  		stt = JSON.parse(res);
  	});
  }
	bar._opts.duration = 0;
	bar._progressPath._opts.duration = 0;
	bar.animate(0.0);
	$("#timer").animate({opacity:"1"},1000);
	bar._opts.duration = 15000;
	bar._progressPath._opts.duration = 15000;
	$("#timenum").html("0");
	for(index in stt){
		switch(stt[index]){
			case "wrong":{
				if(curques<4){
					failed(index);
				}
			};
			break;
			case "correct":{
				if(curques<4){
					reveal(index);
				}
				showimg(index);
			}
		}
	}
}

const loadques = async () => {
	resetimg();
  if (curmatch!= void 0) {
  	_fetch("/apix/read_file",{file:`static/data/${curmatch}_2_question.txt`}).then((res) => {
  		res = b64DecodeUnicode(res);
  		questions = JSON.parse(res);
  	});
  	_fetch("/apix/read_file",{file:`static/data/${curmatch}_ans.txt`}).then((res) => {
  		res = b64DecodeUnicode(res);
  		ans = JSON.parse(res);
  		for(index in ans){
  			ans[index] = ans[index].toUpperCase().split(" ").join("");
  		}
  		appendhn();
  	});
  	// alert(ans)
  	await _fetch("/apix/read_file",{file:`static/data/${curmatch}_stt.txt`}).then((res) => {
  		res = b64DecodeUnicode(res);
  		stt = JSON.parse(res);
  	});
  }
	// alert(stt)
	for(index in stt){
		switch(stt[index]){
			case "wrong":{
				if(index<4){
					failed(index);
				}
			};
			break;
			case "correct":{
				if(index<4){
					reveal(index);
				}
				showimg(index);
			}
		}
	}
}

const correct = async () => {
	var cor = [];
	(curmatch!= void 0) && _fetch("/apix/read_file",{file:`static/data/${curmatch}_contestants.txt`}).then((res) => {
		res = b64DecodeUnicode(res);
		res = JSON.parse(res);
		for(index in res){
			if(res[index].score != contestants[index].score) cor[index] = 1;
		}
		contestants = res;
		for(index in contestants){
			$("#name"+parseInt(parseInt(index)+1)).html(contestants[index].name);
			$("#score"+parseInt(parseInt(index)+1)).html(contestants[index].score);
			if(cor[index]){
				document.getElementById("nameans" + parseInt(parseInt(index) + 1)).style.background = "#00ff00";
				document.getElementById("nameans" + parseInt(parseInt(index) + 1)).style.color = "white";
			}
		}
	});
	if(curques<4){
		reveal(curques);
	}
	// playsfx('correct')
}

const showans = async () => {
	(curmatch!= void 0) && _fetch("/apix/read_file",{file:`static/data/${curmatch}_ansts.txt`}).then((res) => {
		res = b64DecodeUnicode(res);
		res = JSON.parse(res);
		for(index in res){
			$("#ans"+parseInt(parseInt(index)+1)).html(res[index]);
			$("#ans"+parseInt(parseInt(index)+1)).animate({opacity:"1"},2000);
		}
	})
	// playsfx('showans')
}

const status = async () => {
	appendhn();
	resetimg();
	(curmatch!= void 0) && await _fetch("/apix/read_file",{file:`static/data/${curmatch}_stt.txt`}).then((res) => {
		res = b64DecodeUnicode(res);
		stt = JSON.parse(res);
	});
	console.log(stt)
	for(index in stt){
		switch(stt[index]){
			case "wrong":{
				if(index<4){
					failed(index);
				}
			};
			break;
			case "correct":{
				if(index<4){
					reveal(index);
				}
				showimg(index);
			}
		}
	}
}

const full = () => {
	reveal(0);
	reveal(1);
	reveal(2);
	reveal(3);
	showimg(0);
	showimg(1);
	showimg(2);
	showimg(3);
	showimg(4);
}

socket.on("message",async (msg) => {
	msg=b64DecodeUnicode(msg);
	msg=JSON.parse(msg);
	let content=msg[0].content;
	let receiver=msg[0].receiver;
	let sender=msg[0].sender;
	console.log(content);
	if(receiver=="viewer"){
		switch(content){
			case "CNV":{
				document.getElementById("name"+parseInt(parseInt(sender)+1)).style.background="#ff8000";
				// playsfx('cnv')
			};
			break;
			case "update":{
				update();
			};
			break;
			case "start":{
				start();
				// playbgm()
			};
			break;
			case "loadques":{
				loadques()
			};
			break;
			case "correct":{
				correct()
			};
			break;
			case "wrong":{
				if(curques<4){
					failed(curques);
				}
				// playsfx('wrong')
			};
			break;
			case "showans":{
				showans()
			};
			break;
			case "showimg":{
				showimg(curques);
				// playsfx('showimg')
			};
			break;
			case "test":{
				send_mess("mc","controller","ok");
			};
			break;
			case "status":{
				status()
			}
			break;
			case 'showques':{
				$("#question").html(questions[curques]);
			}
			break;
			case 'wrongCNV':{
				// playsfx('wrong');
				update();
			}
			break;
		}
		if(content.slice(0,7) == "message"){
			let mess = content.slice(7);
			$("#message").html(mess);
			if($("#close").html() == "&lt;") sidenav();
			return;
		}
    if (content.startsWith("match")) curmatch = content.replace("match","");
	}
})

function sidenav(){
	if($("#close").html() == "&gt;"){
		document.getElementById("sidenav-content").style.width = "0px";
		document.getElementById("sidenav").style.width = "40px";
		$("#close").html("<")
	}
	else{
		document.getElementById("sidenav").style.width = "400px";
		document.getElementById("sidenav-content").style.width = "360px";
		$("#close").html(">")
	}
}

const mcmessage = $("#mcmessage")

mcmessage.change(() => {
	send_mess('mc', 'controller', 'message' + mcmessage.val())
	mcmessage.val('');
	console.log(mcmessage.val());
})

$(document).ready(() => {
	 update()
})
