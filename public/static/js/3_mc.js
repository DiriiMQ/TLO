const anstb=$("#anstb");
const surelb=$("#surelb");
const slider=$("#timer_slider");
var starttime=0;
var time=0;

var pos = [0,1,2,3]
var questions = [];
var contestants = [];
var answer = [{ans:"", time:0.00},{ans:"", time:0.00},{ans:"", time:0.00},{ans:"", time:0.00}];
var curques=-1;
var socket = io.connect("http://"+document.domain+":"+location.port);
var curmatch;
const wait = time => new Promise(resolve => setTimeout(resolve, time))

function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    function toSolidBytes(match, p1) {
      return String.fromCharCode('0x' + p1);
  }));
}

function b64DecodeUnicode(str) {
  return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))
}

function disabled(obj){
	obj.prop("disabled",true);
}

function enabled(obj){
	obj.removeAttr("disabled");
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

socket.on("disconnect",function(){
	socket.connect();
})

function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
}

var bgm = new Audio();
bgm.src="/static/audio/TT_30s.wav";
bgm.type="audio/wav";
var sfx = new Audio();
sfx.type="audio/wav";

function playbgm(){
	bgm.play()
}

function playsfx(id){
	switch(id){
		case 'correct':{
			sfx.src = '/static/audio/TT_đúng.wav'
		}
		break;
		case 'showques':{
			sfx.src = '/static/audio/TT_mở_câu_hỏi.wav'
		}
		break;
		case 'showans_pre':{
			sfx.src = '/static/audio/TT_đáp_án.wav'
		}
		break;
		case 'showans':{
			sfx.src = '/static/audio/TT_kết_quả_next.wav'
		}
	}
	sfx.play()
}

function check(){
	if(vid.readyState == 4){
		send_mess("mc","controller","loaded");
	}
	else{
		setTimeout(function() {
			check();
		}, 1000);
	}
}

function nextques(){
	for(var i = 1; i <= 4; i++){
		document.getElementById("nameans" + i).style.background = "white";
		document.getElementById("nameans" + i).style.color = "black";
	}
	$("#question").hide();
	curques++;
	console.log(curques);
	if(questions[curques].type == "img"){
		$("img").show();
		$("vid").hide();
		document.getElementById("img").src="/static/images/"+curmatch+"_"+parseInt(parseInt(curques)+1)+".jpg";
	}
	else{
		$("img").hide();
		$("vid").show();
		document.getElementById("vid").src="/static/video/"+curmatch+"_"+parseInt(parseInt(curques)+1)+".mp4";
		check();
	}
	slider.animate({height:"0px",marginTop:"720px",opacity:"1"},0);
	for(var i = 1; i <= 4; i++)
		$("#ts_"+i).animate({opacity:"0"},0);
}

const showans = () => {
	// playsfx('showans_pre')
	(curmatch!= void 0) && _fetch("/apix/read_file",{file:`static/data/${curmatch}_anstt.txt`}).then((res) => {
		res = b64DecodeUnicode(res);
		answer = JSON.parse(res);
		console.log(answer);
		// console.log(JSON.stringify(answer));
		for(var i=0;i<3;i++){
			for(var j=i+1;j<4;j++){
				if(answer[pos[i]].time>answer[pos[j]].time){
					pos[i] = parseInt(parseInt(pos[i])+parseInt(pos[j]));
					pos[j] = pos[i]-pos[j];
					pos[i] = pos[i]-pos[j];
				}
			}
		};
		(async () => {
			for(var i=0;i<4;i++){
				console.log(i)
				$("#nameans"+parseInt(parseInt(i)+1)).html(contestants[pos[i]].name);
				$("#time"+parseInt(parseInt(i)+1)).html((answer[pos[i]].time).toFixed(2));
				$("#ans"+parseInt(parseInt(i)+1)).html(answer[pos[i]].ans);
				$("#ts_"+parseInt(parseInt(i)+1)).animate({opacity:"1"},2000);
				// playsfx('showans')
				await wait(2000)
			}
		})()
	});
}

const update = () => {
	for(var i = 1; i <= 4; i++){
		document.getElementById("nameans" + i).style.background = "white";
		document.getElementById("nameans" + i).style.color = "black";
	}
	$("#question").hide();
  if (curmatch!= void 0) {
  	_fetch("/apix/read_file",{file:`static/data/${curmatch}_contestants.txt`}).then((res) => {
  		res = b64DecodeUnicode(res);
  		contestants = JSON.parse(res);
  		for(index in contestants){
  			$("#name"+parseInt(parseInt(index)+1)).html(contestants[index].name);
  			$("#score"+parseInt(parseInt(index)+1)).html(contestants[index].score);
  		}
  	});
  	_fetch("/apix/read_file",{file:`static/data/${curmatch}_status.txt`}).then((res) => {
  		res = b64DecodeUnicode(res);
  		res = JSON.parse(res);
  		curques=res[0].curques-1;
  		_fetch("/apix/read_file",{file:`static/data/${curmatch}_3_question.txt`}).then((res) => {
  			res = b64DecodeUnicode(res);
  			questions = JSON.parse(res);
  			nextques();
  		});
  	});
  }
}

socket.on("message",async function(msg){
	msg=b64DecodeUnicode(msg);
	msg=JSON.parse(msg);
	let content=msg[0].content;
	let sender=msg[0].sender;
	let receiver=msg[0].receiver;
	if(receiver == "viewer"){
		switch(content){
			case "update":{
				update()
			};
			break;
			case "loadques":{
				(curmatch!= void 0) && _fetch("/apix/read_file",{file:`static/data/${curmatch}_3_question.txt`}).then((res) => {
					res=b64DecodeUnicode(res);
					questions=JSON.parse(res);
				});
			};
			break;
			case "start":{
				start();
				// playbgm()
			};
			break;
			case "test":{
				send_mess("mc","controller","ok");
			};
			break;
			case "showques":{
				$("#question").show();
				// playsfx('showques')
			};
			break;
			case "showans":{
				showans()
			};
			break;
			case "nextques":{
				nextques();
			};
			break;
			case "correct":{
				(curmatch!= void 0) && _fetch("/apix/read_file",{file:`static/data/${curmatch}_contestants.txt`}).then((res) => {
					res = b64DecodeUnicode(res);
					res = JSON.parse(res);
					console.log(res);
					var cor = [], poss = [];
					for(i in pos) poss[pos[i]] = i;
					for(index in res){
						if(res[index].score != contestants[index].score) cor[poss[index]] = 1;
					}
					for(index in contestants){
						$("#score"+parseInt(parseInt(index)+1)).html(contestants[index].score);
						if(cor[index]){
							document.getElementById("nameans" + parseInt(parseInt(index) + 1)).style.background = "#00ff00";
							document.getElementById("nameans" + parseInt(parseInt(index) + 1)).style.color = "white";
						}
					}
					for(index in res){
						console.log(index)
						$("#name"+parseInt(parseInt(index)+1)).html(res[index].name);
						$("#score"+parseInt(parseInt(index)+1)).html(res[index].score);
					}
					contestants = res;
				});
				// playsfx('correct')
			};
			break;
			case "wrong":{

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
});

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

function start(){
	slider.animate({height:"720px",marginTop:"0px"},30000,"linear",function(){
		slider.animate({opacity:"0"},2000);
	});
	outofTime=false;
	starttime=performance.now();
	setTimeout(function() {outofTime=true;}, 30000);
	if(questions[curques].type=="vid"){
		document.getElementById("vid").play();
	}
}
