const anstb=$("#anstb");
const surelb=$("#surelb");
const slider=$("#timer_slider");
var starttime=0;
var time=0;
var urlVid = ["", "", "", ""];
var haveLoad = [false, false, false, false];

var questions = [];
var curques=-1;
var socket = io.connect("http://"+document.domain+":"+location.port);
var boku, outofTime = 1;
var curmatch;
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

// function check(){
// 	if(document.getElementById("vid").readyState == 4){
// 		send_mess(boku,"controller","loaded");
// 	}
// 	else{
// 		setTimeout(function() {
// 			check();
// 		}, 1000);
// 	}
// }

function updateData(){
	if(parseInt(curques) < 0){
		return;
	}
	if(questions[curques].type == "img"){
		$("img").show();
		$("vid").hide();
		document.getElementById("img").src="/static/images/"+curmatch+"_"+parseInt(parseInt(curques)+1)+".jpg";
		send_mess(boku,"controller","loaded");
	}
	else{
		$("img").hide();
		$("vid").show();
		if(urlVid[parseInt(curques)].length == 0){
			send_mess(boku, "controller", "loading_vid" + parseInt(parseInt(curques)+1));
			return;
		}
		document.getElementById("vid").src=urlVid[parseInt(curques)];
		send_mess(boku,"controller","loaded");
	}
}

function loadvid(idvid){
	if(haveLoad[idvid]) return;
	haveLoad[idvid] = true;
	console.log('load vid ' + (idvid + 1));
	var url = `/static/video/${curmatch}_${idvid + 1}.mp4`
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, true);
	xhr.responseType = "arraybuffer";
	xhr.onload = function(oEvent) {
		var blob = new Blob([oEvent.target.response], {type: "video/mp4"});
		//video.play()  if you want it to play on load
		urlVid[idvid] = URL.createObjectURL(blob);
		send_mess(boku, "controller", "loaded_vid" + (idvid + 1));
	};
	xhr.send();
}

function nextques(){
	curques++;
	if(questions.length == 0){
		send_mess(boku, "controller", "failed_loadques");
		return;
	}
	$("#question").hide();
	console.log(curques);
	updateData();
	slider.animate({height:"0px",marginTop:"720px",opacity:"1"},0);
}

function update(){
	$("#question").hide();
	if(curmatch == undefined){
		send_mess(boku, "controller", "get_curmatch");
		setTimeout(() => {
			update();
		}, 2000);
		return;
	}
	(curmatch!= void 0) && _fetch("/apix/read_file",{file:`static/data/${curmatch}_status.txt`}).then((res) => {
		res = b64DecodeUnicode(res);
		res = JSON.parse(res);
		// console.log(res);
		curques=res[0].curques-1;
		send_mess(boku, "controller", "confirmed");
		nextques();	
	});
}

const loadq = () => {
	(curmatch!= void 0) && _fetch("/apix/read_file",{file:`static/data/${curmatch}_3_question.txt`}).then((res) => {
		res=b64DecodeUnicode(res);
		questions=JSON.parse(res);
		if(questions.length > 0){
			send_mess(boku, "controller", "loaded_ques");
			for(var i = 0; i < 4; i++){
				if(questions[i].type == "vid") send_mess(boku, "controller", "checkvid" + i);
			}
		} else{
			send_mess(boku, "controller", "failed_loadques");
		}
	});
}

const loadques = () => {
	if(curmatch == undefined){
		send_mess(boku, "controller", "failed_loadques");
		send_mess(boku, "controller", "get_curmatch");
		setTimeout(() => {
			console.log(curmatch);
			update();
		}, 2000);
	} else loadq();
}

socket.on("message",function(msg){
	msg=b64DecodeUnicode(msg);
	msg=JSON.parse(msg);
	let content=msg[0].content;
	let sender=msg[0].sender;
	let receiver=msg[0].receiver;
	if(receiver == "contestants" || receiver == boku){
		switch(content){
			case "update":{
				update()
			};
			break;
			case "loadques":{
				loadques()
			};
			break;
			case "start":{
				start();
			};
			break;
			case "nextques":{
				nextques();
			};
			break;
			case "test":{
				send_mess(boku,"controller","ok");
				if(questions.length == 0) send_mess(boku, "controller", "failed_loadques");
				else send_mess(boku, "controller", "loaded_ques");
				updateData();
			};
			break;
			case "showques":{
				$("#question").show();
			};
			break;
			case "quit":{
				window.open(location.href.replace(/\/\d\//, function(v) {
				return "/"+(Number(v[1])+1).toString()+"/";
				}),"_self");
			};
			break;
			default:
				if(content.startsWith("loadvid")){
					content = content.replace("loadvid", "");
					loadvid(parseInt(content));
				}
				if (content.startsWith("match")) curmatch = content.replace("match","");
		}
	}
});

function start(){
	slider.animate({height:"720px",marginTop:"0px"},30000,"linear",function(){
		slider.animate({opacity:'0'},2000);
	});
	outofTime=false;
	starttime=performance.now();
	setTimeout(function() {outofTime=true;}, 30000);
	if(questions[curques].type=="vid"){
		document.getElementById("vid").play();
	}
}

anstb.keypress((event) => {
	let keycode = (event.keyCode ? event.keyCode : event.which);
	if(keycode==13){
		if(anstb.val() != "" && !outofTime){
			time=performance.now();
			var data={ans:"",time:0.00};
			data.ans=anstb.val().toUpperCase();
			data.time=precisionRound((time-starttime)/1000,2);
			data=JSON.stringify(data);
			data=b64EncodeUnicode(data);
			data="answer2"+data;
			send_mess(boku,"controller",data);
			surelb.html(anstb.val()+" - "+precisionRound((time-starttime)/1000,2));
			anstb.val("");
		}
	}
	else{
		if(outofTime) anstb.val("");
	}
});
