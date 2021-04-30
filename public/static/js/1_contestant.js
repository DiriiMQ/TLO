const score=$("#score");
const question=$("#question");
var curmatch;
var contestants=[];
var questions=[];
var socket = io.connect("http://"+document.domain+":"+location.port);
var idq=-1;
var ids=0;
var boku

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

socket.on("disconnect",function(){
	socket.connect();
})

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

const nextques=function(){
	//disabled(nextques);
	++ idq;
	if ((idq > 17)) {
		question.html("Done!");
		$('#timer_slider').stop();
	}
	else{
		question.html(questions[ids][idq]);
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

const wrong=function() {
	nextques();
};

const nextcontestant=function(){
	++ ids;
	if(ids<4){
		idq = -1;
		actived(ids + 1);
		$('#timer_slider').animate({width:'0px'},0);
		$('#timer_slider').animate({opacity:'1'},1000);
	}
	else if (ids==4) {
		question.html("Xong vòng khởi động !");
    ids=5;
	}
  else {
    window.open(location.href.replace(/\/\d\//, function(v) {
      return "/"+(Number(v[1])+1).toString()+"/";
    }),"_self");
  }
};

const start = function() {
	setTimeout(function(){
		nextques();
		$('#timer_slider').animate({width:'900px'},60000,"linear");
		$('#timer_slider').animate({opacity:'0'},1000);
	},8000);
};

const update = function(){
	(curmatch!= void 0) && _fetch("/apix/read_file",{
		file: `static/data/${curmatch}_status.txt`
	}).then((res) => {
		res=b64DecodeUnicode(res);
		res=JSON.parse(res);
		console.log(res);
		idq=res[0].curques;
		ids=(res[0].curcon==-1)?(0):(res[0].curcon);
		_fetch("/apix/read_file",{
			file:`static/data/${curmatch}_contestants.txt`
		}).then((res) => {
			res=b64DecodeUnicode(res);
			contestants=JSON.parse(res);
			console.log(contestants);
			score.html(contestants[ids].score);
			question.html("Phần thi khởi động của "+contestants[ids].name);
			for(index in contestants){
				let element=$(`#contestant${parseInt(parseInt(index)+1)}`);
				let contestant=contestants[index];
				element.html(`${contestant.name} (${contestant.score} points)`);
			};
			actived(parseInt(ids)+1);
		});
	});
}

const loadq = function(){
	if(curmatch == undefined){
		send_mess(boku, "controller", "failed_loadques");
		return;
	} else{
		(curmatch!= void 0) && _fetch("/apix/read_file",{file:`static/data/${curmatch}_1_question.txt`}).then((callback) => {
			questions=b64DecodeUnicode(callback);
			questions=JSON.parse(questions);
			questions = questions.ques;
			console.log(questions);
			if(questions.length > 0){
				send_mess(boku, "controller", "loaded_ques");
			} else{
				send_mess(boku, "controller", "failed_loadques");
			}
		});
	}
}

const loadques = function() {
	if(curmatch == undefined){
		send_mess(boku, "controller", "get_curmatch");
		setTimeout(() => {
			console.log(curmatch);
			update();
			send_mess(boku, "controller", "failed_loadques");
		}, 2000);
	} else loadq();
}

const correct = function() {
	(curmatch!= void 0) && _fetch("/apix/read_file",{
		file:`static/data/${curmatch}_contestants.txt`
	}).then((res) => {
		res = b64DecodeUnicode(res);
		contestants = JSON.parse(res);
		console.log(contestants);
		score.html(contestants[ids].score);
		$(`#contestant${parseInt(parseInt(ids) + 1)}`).html(`${contestants[ids].name} (${contestants[ids].score} points)`)
		nextques();
	});
}

$(document).ready(async function(){
	update();
});

socket.on('shit', () => {
	//Diss
})

socket.on('message',function(msg){
	msg=b64DecodeUnicode(msg);
	msg=JSON.parse(msg);
	let receiver=msg[0].receiver;
	let content=msg[0].content;
	//alert(content);
	if(receiver == "contestants" || receiver == boku){
		//alert("got it");
		switch(content){
			case "test":{
				send_mess(boku,"controller","ok");
			};
			break;
			case "update":{
				update()
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
      default:
        if (content.startsWith("match")) curmatch = content.replace("match","");
		}
	}
});
