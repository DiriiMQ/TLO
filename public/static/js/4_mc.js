const takeb = $("#takeb");
const score=$("#score");
const question=$("#question");
const pack=$("#pack");

var socket = io.connect("http://"+document.domain+":"+location.port);
var contestants=[];
var questions=[];
var pks=[40,60,80];
var time=[[10,10,15],[10,15,20],[15,20,20]];
var curcon, curpack, curques, quesid, curmatch;
$("#star").hide();

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

disabled(takeb);

const actived = (index) => {
	console.log(index);
	for(var i=1;i<=4;i++){
		$(`#contestant${parseInt(i)}`).parent().removeClass("active");
	}
	if (index > 4) {
		question.html("Hoàn thành vòng thi về đích :3");
		return;
	}
	else{
		if(index==0){
			question.html("Vòng thi về đích bắt đầu!");
		}
		else{
			question.html("Vòng thi về đích của "+contestants[index-1].name);
			$(`#contestant${parseInt(index)}`).parent().addClass("active");
			score.html(parseInt(contestants[index-1].score));
		}
	}
};


async function update(){
  if (curmatch!= void 0) {
  	await _fetch("/apix/read_file",{file:`static/data/${curmatch}_status.txt`}).then((res) => {
  		res = b64DecodeUnicode(res);
  		res = JSON.parse(res);
  		curcon=res[0].curcon;
  		curpack=res[0].curpack;
  		curques=res[0].curques;
  		console.log(curcon+" "+curpack+" "+curques);
  	})
  	await loadques()
  	await _fetch("/apix/read_file",{file:`static/data/${curmatch}_contestants.txt`}).then((res) => {
  		res = b64DecodeUnicode(res);
  		contestants= JSON.parse(res);
  		for(index in contestants){
  			$("#contestant"+parseInt(parseInt(index)+1)).html(contestants[index].name+" ("+contestants[index].score+")");
  			$("#name"+parseInt(parseInt(index)+1)).html(contestants[index].name);
  			$("#score"+parseInt(parseInt(index)+1)).html(contestants[index].score);
  		}
  		actived(parseInt(curcon)+1);
  		try{
  			question.html(questions[curcon][curpack][curques]);
  			score.html(contestants[curcon].score);
  			pack.html("Gói "+pks[curpack]);
  		}
  		catch(err){}
  	})
  }
}

function loadques(){
	(curmatch!= void 0) && _fetch("/apix/read_file",{file:`static/data/${curmatch}_4_question.txt`}).then((res) => {
		res = b64DecodeUnicode(res);
		questions= JSON.parse(res);
	});
}

function next(){
	curques = -1
	curcon++;
	actived(parseInt(curcon)+1);
}

function showques(){
	question.html(questions[curcon][curpack][quesid]);
}

function start(){
	var timetmp = time[curpack][curques]
	$("#timer_slider").animate({width:"900px"},timetmp*1000,"linear");
	$("#timer_slider").animate({opacity:"0"},1000,"linear");
	console.log(timetmp)
	// playsfx(parseInt(timetmp))
}

function wait(){
	// playsfx('wait')
}

function wrong(){
	// playsfx('wrong')
	(curmatch!= void 0) && _fetch("/apix/read_file",{file:`static/data/${curmatch}_contestants.txt`}).then((res) => {
		res = b64DecodeUnicode(res);
		contestants= JSON.parse(res);
		for(index in contestants){
			$("#contestant"+parseInt(parseInt(index)+1)).html(contestants[index].name+" ("+contestants[index].score+")");
			$("#name"+parseInt(parseInt(index)+1)).html(contestants[index].name);
			$("#score"+parseInt(parseInt(index)+1)).html(contestants[index].score);
		}
		score.html(contestants[curcon].score);
	})
}

function correct(){
	// playsfx('correct')
	(curmatch!= void 0) && _fetch("/apix/read_file",{file:`static/data/${curmatch}_contestants.txt`}).then((res) => {
		res = b64DecodeUnicode(res);
		contestants= JSON.parse(res);
		for(index in contestants){
			$("#contestant"+parseInt(parseInt(index)+1)).html(contestants[index].name+" ("+contestants[index].score+")");
			$("#name"+parseInt(parseInt(index)+1)).html(contestants[index].name);
			$("#score"+parseInt(parseInt(index)+1)).html(contestants[index].score);
		}
		score.html(contestants[curcon].score);
	});
}

function nextques(){
	curques++;
	fuck = 0;
	if(curques<3){
		question.html("Câu hỏi thứ "+parseInt(parseInt(curques)+1));
	}
	else{
		question.html(contestants[curcon].name + " đã hoàn thành phần thi về đích")
		// playsfx('done')
	}
	$("#timer_slider").animate({width:"0px",opacity:"1"},0,);
	$("#star").hide();
	for(var i = 1; i <= 4; i++){
		document.getElementById("contestant"+i).style.background="white";
	}
}

function fu(index){
	if(fuck) return;
	// playsfx('fu')
	document.getElementById("contestant"+parseInt(parseInt(index)+1)).style.background="#ff8000"
	fuck = 1
}

function hope(){
	// playsfx('star')
	$("#star").show();
}

function showpack(){
	// playsfx('showpack_pre')
	$("#pack40").animate({width:"100px"},10);
	$("#pack60").animate({width:"100px"},10);
	$("#pack80").animate({width:"100px"},10);
	$("#pack40").html("40");
	$("#pack60").html("60");
	$("#pack80").html("80");
	setTimeout(function(){
	$("#packs").animate({marginLeft:"-=250px"},3000);
	// playsfx('showpack')
	},5000);
}

socket.on("message",(msg) => {
	msg=b64DecodeUnicode(msg);
	msg=JSON.parse(msg);
	let content=msg[0].content;
	let sender=msg[0].sender;
	let receiver=msg[0].receiver;
	if(receiver=="viewer"){
		switch(content){
			case "update":update();
			break;
			case "loadques":loadques();
			break;
			case "next":next();
			break;
			case "showques":showques();
			break;
			case "start": start();
			break;
			case "wait": wait();
			break;
			case "wrong": wrong();
			break;
			case "correct": correct();
			break;
			case "nextques": nextques();
			break;
			case "hope":hope();
			break;
			case "fu":fu(sender);
			break;
			case "test":send_mess("mc","controller","ok");
			break;
			case "showpack":showpack()
			break;
		};
		if(content.slice(0,4)=="pack"){
			curpack=parseInt(content.slice(4,content.length));
			switch(curpack){
				case '40':{
					$("#pack60").html("0");
					$("#pack80").html("0");
				}
				break;
				case '60':{
					$("#pack40").html("0");
					$("#pack80").html("0");
				}
				break;
				case '80':{
					$("#pack60").html("0");
					$("#pack40").html("0");
				}
				break;
			}
			$("#packs").animate({marginLeft:"+=250px"},3000);
			pack.html("Gói "+pks[curpack]);
			// playsfx('start')
		}
		if(content.slice(0,7) == "message"){
			let mess = content.slice(7);
			$("#message").html(mess);
			if($("#close").html() == "&lt;") sidenav();
			return;
		}
    if(content.slice(0,4)=="pack"){
			curpack=parseInt(content.slice(4,content.length));
			pack.html('Gói ' + pks[curpack])
		}
    if(content.slice(0,10) == 'chooseques') {
			quesid = parseInt(content.slice(10));
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
	(curmatch!= void 0) && update();
})
