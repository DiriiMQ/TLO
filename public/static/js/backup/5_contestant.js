'use strict'
const question = $("#question")
const fu = $("#fu")
const socket = io.connect("http://"+document.domain+":"+location.port)
var curques = -1, boku, questions = [], contestants = [];
var outoftime = 1, time = 15, timestamp, curmatch;
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
	return new Promise((res) => {
		var data=[];
		data.push({
			sender: sender,
			receiver: receiver,
			content: content
		});
		data=JSON.stringify(data);
		data=b64EncodeUnicode(data);
		socket.send(data);
	});
};

socket.on("disconnect", () => {
	socket.connect()
})

function disabled(obj){
	obj.prop("disabled",true)
}

function enabled(obj){
	obj.removeAttr("disabled")
}

const update = async () => {
  if (curmatch!= void 0) {
  	let res = await _fetch("/apix/read_file", {file: `static/data/${curmatch}_status.txt`});
  	res = b64DecodeUnicode(res); res = JSON.parse(res);
  	console.log(res)
  	curques = res[0].curques;
  	res = await _fetch("/apix/read_file", {file: `static/data/${curmatch}_5_question.txt`});
  	res = b64DecodeUnicode(res);
  	questions = JSON.parse(res);
    $("#fu").prop('disabled',false);
    outoftime = 1;
    time=15;
    clearInterval(timestamp);
  	console.log(questions)
  		if(curques === "-1") question.html("Câu hỏi phụ");
  		else{
  			if(curques === "13") question.html("Kết thúc vòng câu hỏi phụ");
  			else question.html(questions[curques]);
  		}
  	res = await _fetch("/apix/read_file", {file: `static/data/${curmatch}_contestants.txt`});
  	contestants = JSON.parse(b64DecodeUnicode(res));
  }
	console.log(contestants)
	for(let index in contestants){
		let element=$(`#contestant${parseInt(parseInt(index)+1)}`);
		//let element    = $(`#contestant_${parseInt(index) + 1}`);
		let contestant=contestants[index];
		element.html(`${contestant.name} (${contestant.score})`);
		$("#name" + parseInt(parseInt(index) + 1)).html(contestants[index].name);
		$("#score" + parseInt(parseInt(index) + 1)).html(contestants[index].score);
	};
}

const start = () => {
  outoftime = 0;
	// question.html(questions[curques]
  resumetiming();
}
const stoptiming = () => {
  clearInterval(timestamp);
  $('#timer_slider').stop(true);
  $('#timer_slider').animate({opacity:'0'},1000);
}
const resumetiming = () => {
  timestamp=setInterval(function(){if (time>0) time--;if (time == 0) disabled($("#fu"))},1000);
  $('#timer_slider').animate({opacity:'1'},0);
	$('#timer_slider').animate({width:'0px'},0);
	$('#timer_slider').animate({width:'900px'},time*1000,"linear");
	$('#timer_slider').animate({opacity:'0'},1000);
}
const fuck = () => {
		send_mess(boku, "controller", "fu"+(!!outoftime));
		send_mess(boku, "viewer", "fu"+(!!outoftime));
    send_mess(boku, "controller","time"+time);
    $("#fu").prop('disabled',true);
}
function correct(){
	(curmatch!= void 0) && _fetch("/apix/read_file",{file:`static/data/${curmatch}_contestants.txt`}).then((res) => {
		res = b64DecodeUnicode(res);
		contestants = JSON.parse(res);
		for(let index in contestants){
			$("#contestant"+parseInt(parseInt(index)+1)).html(contestants[index].name+" ("+contestants[index].score+" points)");
			$("#name"+parseInt(parseInt(index)+1)).html(contestants[index].name);
			$("#score"+parseInt(parseInt(index)+1)).html(contestants[index].score);
		}
		score.html(contestants[curcon].score);
	});
}
socket.on('message', (msg) => {
	msg = b64DecodeUnicode(msg)
	msg = JSON.parse(msg)
	let sender = msg[0].sender, receiver = msg[0].receiver, content = msg[0].content
	if(receiver == 'contestants'){
		switch(content){
      case "correct": correct();
      break;
			case "update":
      case "next":
        update();
			  break;
			case "start": start();
			break;
			case "test": send_mess(boku, "controller", "ok");
			break;
      case "pause": stoptiming();
      break;
      case "resume": resumetiming();
      break;
      default:
        if (content.startsWith("match")) curmatch = content.replace("match","");
        if (content.startsWith("stime")) time = JSON.parse(content.slice(-content.length+5));
		}
	}
})

$(document).ready(() => {
	(curmatch!= void 0) && update();
})
