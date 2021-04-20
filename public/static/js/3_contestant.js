const anstb=$("#anstb");
const surelb=$("#surelb");
const slider=$("#timer_slider");
var starttime=0;
var time=0;

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

function check(){
	if(document.getElementById("vid").readyState == 4){
		send_mess(boku,"controller","loaded");
	}
	else{
		setTimeout(function() {
			check();
		}, 1000);
	}
}

function nextques(){
	$("#question").hide();
	curques++;
	console.log(curques);
	if(questions[curques].type == "img"){
		$("#img").show();
		$("#vid").hide();
		document.getElementById("img").src="/static/images/"+curmatch+"_"+parseInt(parseInt(curques)+1)+".jpg";
	}
	else{
		$("#img").hide();
		$("#vid").show();
		document.getElementById("vid").src="/static/video/"+curmatch+"_"+parseInt(parseInt(curques)+1)+".mp4";
		check();
	}
	slider.animate({height:"0px",marginTop:"720px",opacity:"1"},0);
}

function update(){
	$("#question").hide();
	(curmatch!= void 0) && _fetch("/apix/read_file",{file:`static/data/${curmatch}_status.txt`}).then((res) => {
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

function loadques(){
	(curmatch!= void 0) && _fetch("/apix/read_file",{file:`static/data/${curmatch}_3_question.txt`}).then((res) => {
		res = b64DecodeUnicode(res);
		questions = JSON.parse(res);
	});
}

socket.on("message",function(msg){
	msg=b64DecodeUnicode(msg);
	msg=JSON.parse(msg);
	let content=msg[0].content;
	let sender=msg[0].sender;
	let receiver=msg[0].receiver;
	if(receiver == "contestants"){
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
