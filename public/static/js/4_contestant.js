const takeb = $("#takeb");
const score=$("#score");
const question=$("#question");
const pack=$("#pack");
var curmatch;
var socket = io.connect("http://"+document.domain+":"+location.port);
var hope=false;
var contestants=[];
var questions=[];
var pks=[10,20,30];
var time=[[10,10,15],[10,15,20],[15,20,20]];
var curpack, curcon, curques, quesid;
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
	if (index == 5) {
		question.html("Hoàn thành vòng thi về đích :3<br> ありがとうございました !");
    index=6;
		return;
	}
  if (index == 6) {
    window.open(location.href.replace(/\/\d\//, function(v) {
      return "/"+(Number(v[1])+1).toString()+"/";
    }),"_self");
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


function update(){
	(curmatch!= void 0) && _fetch("/apix/read_file",{file:`static/data/${curmatch}_status.txt`}).then((res) => {
		res = b64DecodeUnicode(res);
		res = JSON.parse(res);
		curcon=res[0].curcon;
		curpack=res[0].curpack;
		curques=res[0].curques;
		console.log(curcon+" "+curpack+" "+curques);
		_fetch("/apix/read_file",{file:`static/data/${curmatch}_4_question.txt`}).then((res) => {
			res = b64DecodeUnicode(res);
			questions = JSON.parse(res);
			_fetch("/apix/read_file",{file:`static/data/${curmatch}_contestants.txt`}).then((res) => {
				res = b64DecodeUnicode(res);
				contestants = JSON.parse(res);
				for(index in contestants){
					$("#contestant"+parseInt(parseInt(index)+1)).html(contestants[index].name+" ("+contestants[index].score+" points)");
					$("#name"+parseInt(parseInt(index)+1)).html(contestants[index].name);
					$("#score"+parseInt(parseInt(index)+1)).html(contestants[index].score);
				}
				actived(parseInt(curcon)+1);
				try{
					question.html(questions[curcon][curpack][curques]);
					score.html(contestants[curcon].score);
					pack.html(pks[curpack] + ' điểm');
				}
				catch(err){
					if(curcon==-1){
						question.html("Vòng về đích bắt đầu!");
					}
				}
			})
		})
	});
}

function loadques(){
	(curmatch!= void 0) && _fetch("/apix/read_file",{file:`static/data/${curmatch}_4_question.txt`}).then((res) => {
		res = b64DecodeUnicode(res);
		questions = JSON.parse(res);
	});
}

function next(){
	curcon++;
	curques = -1
	actived(parseInt(curcon)+1);
}

function showques(){
	question.html(questions[curcon][curpack][quesid]);
}

function start(){
	$("#timer_slider").animate({width:"900px"},time[curpack][curques]*1000,"linear");
	$("#timer_slider").animate({opacity:"0"},1000,"linear");
}

function wait(){
	if(curcon != boku) enabled(takeb);
	setTimeout(function() {disabled(takeb);}, 5000);
}

function wrong(){
	(curmatch!= void 0) && _fetch("/apix/read_file",{file:`static/data/${curmatch}_contestants.txt`}).then((res) => {
		res = b64DecodeUnicode(res);
		contestants = JSON.parse(res);
		for(index in contestants){
			$("#contestant"+parseInt(parseInt(index)+1)).html(contestants[index].name+" ("+contestants[index].score+" points)");
			$("#name"+parseInt(parseInt(index)+1)).html(contestants[index].name);
			$("#score"+parseInt(parseInt(index)+1)).html(contestants[index].score);
		}
		score.html(contestants[curcon].score);
	})
}

function correct(){
	(curmatch!= void 0) && _fetch("/apix/read_file",{file:`static/data/${curmatch}_contestants.txt`}).then((res) => {
		res = b64DecodeUnicode(res);
		contestants = JSON.parse(res);
		for(index in contestants){
			$("#contestant"+parseInt(parseInt(index)+1)).html(contestants[index].name+" ("+contestants[index].score+" points)");
			$("#name"+parseInt(parseInt(index)+1)).html(contestants[index].name);
			$("#score"+parseInt(parseInt(index)+1)).html(contestants[index].score);
		}
		score.html(contestants[curcon].score);
	});
}

function nextques(){
	curques++;
	if(curques<3){
		question.html("Câu hỏi thứ "+parseInt(parseInt(curques)+1));
	}
	else{
		question.html(contestants[curcon].name + " đã hoàn thành phần thi về đích")
	}
	$("#timer_slider").animate({width:"0px",opacity:"1"},0);
}

function fu(){
	send_mess(boku,"controller","fu");
	send_mess(boku,"viewer","fu");
}

socket.on("message",(msg) => {
	msg=b64DecodeUnicode(msg);
	msg=JSON.parse(msg);
	let content=msg[0].content;
	let sender=msg[0].sender;
	let receiver=msg[0].receiver;
	if(receiver=="contestants"){
		//console.log(content+"-"+sender);
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
			case "test":send_mess(boku,"controller","ok");
			break;
      default:
        if (content.startsWith("match")) curmatch = content.replace("match","");
		};
		if(content.slice(0,4)=="pack"){
			curpack=parseInt(content.slice(4,content.length));
			pack.html(pks[curpack] + ' điểm');
		}
    if(content.slice(0,10) == 'chooseques') {
			quesid = parseInt(content.slice(10));
		}
	}
})
