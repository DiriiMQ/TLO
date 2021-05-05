const score=$("#score");
const question=$("#question");
const answer = $("#answer")

var contestants=[];
var info=[];
var socket = io.connect("http://"+document.domain+":"+location.port);
var idq=-1;
var ids=0;
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

socket.on("disconnect",function(){
	socket.connect();
})

// socket.on("connect",function(){
// 	alert("connected!");
// })


const nextques=function(){
	//disabled(nextques);
	++ idq;
	if ((idq > 17)) {
		question.html("Done!");
		$("#timer_slider").stop();
		bgm.pause();
		bgm.load()
	}
	else{
	// if (ids > 3) {
	// 	disabled(correctb);
	// 	disabled(wrongb);
	// 	// disabled(nextques);
	// 	question.html("Done");
	// }
	question.html(info.ques[ids][idq]);
	answer.html(info.ans[ids][idq])
};
};

const actived = (index) => {
	for(var i=1;i<=4;i++){
		$(`#contestant${parseInt(i)}`).parent().removeClass("active");
	}
	$(`#contestant${parseInt(index)}`).parent().addClass("active");
	score.html(parseInt(contestants[parseInt(parseInt(index)-1)].score));
	question.html('Vòng thi khởi động của ' + contestants[parseInt(index) - 1].name)
	if (index > 4) {
		question.html("Vòng thi khởi động kết thúc :3");
		return;
	}
};

const nextcontestant=function(){
	++ ids;
	idq = -1;
	actived(ids + 1);
	///Chưa chọn đc âm thanh
	$('#timer_slider').animate({width:'0px'},0);
	$('#timer_slider').animate({opacity:'1'},0);
};

const start=function() {
	setTimeout(function(){
		nextques();
		// playbgm();
		$('#timer_slider').animate({width:'900px'},60000,"linear");
		$('#timer_slider').animate({opacity:'0'},1000);
	},8000);

	//alert('ok');
	//tick(60);
};

function send_mess(sender,receiver,content){
	var data=[];
	data.push({
		sender: sender,
		receiver: receiver,
		content: content
	});
	data=JSON.stringify(data);
	data=b64EncodeUnicode(data);
	socket.send(data)
};

const update = async () => {
	if (curmatch!= void 0) {
    await _fetch("/apix/read_file",{file: `static/data/${curmatch}_status.txt`}).then((res) => {
  		console.log(res);
  		res=b64DecodeUnicode(res);
  		res=JSON.parse(res);
  		idq=res[0].curques;
  		ids=(res[0].curcon==-1)?(0):(res[0].curcon);
  	});
  	_fetch("/apix/read_file",{file:`static/data/${curmatch}_contestants.txt`}).then((res) => {
  		console.log(res);
  		res=b64DecodeUnicode(res);
  		contestants=JSON.parse(res);
  		score.html(contestants[ids].score);
  		question.html("Phần thi khởi động của " + contestants[ids].name);
  		for(index in contestants){
  			let element=$(`#contestant${parseInt(parseInt(index)+1)}`);
  			//let element    = $(`#contestant_${parseInt(index) + 1}`);
  			let contestant=contestants[index];
  			element.html(`${contestant.name} (${contestant.score} points)`);
  			// $("#name" + parseInt(parseInt(index) + 1)).html(contestants[index].name);
  			// $("#score" + parseInt(parseInt(index) + 1)).html(contestants[index].score);
  		};
  		actived(parseInt(ids)+1);
  	});
  }
	$('#timer_slider').animate({width:'0px'},0);
	$('#timer_slider').animate({opacity:'1'},0);
}

const loadques = () => {
	(curmatch!= void 0) && _fetch("/apix/read_file",{file:`static/data/${curmatch}_1_question.txt`}).then((callback) => {
		console.log(callback);
		info=b64DecodeUnicode(callback);
		info=JSON.parse(info);
	});
}

const correct = () => {
	(curmatch!= void 0) && _fetch("/apix/read_file",{
		file:`static/data/${curmatch}_contestants.txt`
	}).then((res) => {
		console.log(res);
		res=b64DecodeUnicode(res);
		contestants=JSON.parse(res);
		score.html(contestants[ids].score);
		$(`#contestant${parseInt(parseInt(ids) + 1)}`).html(`${contestants[ids].name} (${contestants[ids].score} points)`)
		$("#score" + parseInt(parseInt(ids) + 1)).html(contestants[ids].score);
		nextques();
	});
}

socket.on("message",(msg) => {
	msg=b64DecodeUnicode(msg);
	msg=JSON.parse(msg);
	let content=msg[0].content;
	let sender=msg[0].sender;
	let receiver=msg[0].receiver;
	//alert(content);
	if(receiver=="viewer"){
		switch(content){
			case "update":{
				update();
			};
			break;
			case "loadques":{
				loadques();
			};
			break;
			case "correct":{
				correct();
			};
			break;
			case "wrong":{
				nextques();
			};
			break;
			case "start":{
				start();
			};
			break;
			case "nextcon":{
				nextcontestant();
			};
			break;
			case "test":{
				send_mess("mc","controller","ok");
			};
			break;
		};
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

$(document).ready(() => {
	update();
});
