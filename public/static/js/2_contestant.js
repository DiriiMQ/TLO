

var socket = io.connect("http://"+document.domain+":"+location.port);
var contestants=[], questions = [], curques = -1, outoftime = 1, boku, fcku = 0;
var corner=[[1,2,5],[3,4,8],[9,13,14],[12,15,16],[6,7,10,11]];
var ans = []
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

socket.on("disconnect",function(){
	socket.connect();
})

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

function submit(){
	if(!outoftime && !fcku){
		let keycode = (event.keyCode ? event.keyCode : event.which);
		if(keycode == 13){
			if($("#ans").val() != ''){
				$("#mouichidoumiru").html($("#ans").val());
				send_mess(boku,"controller","answer1"+$("#ans").val().toUpperCase());
				$("#ans").val('');
			}
		}
	}
	else{
		$("#ans").val('');
	}
}

function blockCNV(){
	disabled($("#cnv"));
	fcku = 1;
}

function cnv(){
	send_mess(boku,"controller","CNV");
	send_mess(boku,"viewer","CNV");
	blockCNV();
}

function appendhn(){
	$("#hn1").html('');$("#hn2").html('');$("#hn3").html('');$("#hn0").html('');
	for(id=0;id<4;id++){
		let str = ans[id]
		for(index in str){
			$("#hn"+id).append('<div id="hn'+id+'_'+index+'" style="width:50px;height:50px;border-radius:25px;background:#3333ff;color:#3333ff;font-weight:bold;font-size:30px;text-align:center;float:left;font-family:`Arial`;line-height:50px;">'+str[index]+'</div>');
		}
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

const loadans = async () => {
	resetimg();
  if (curmatch!= void 0) {
    $("#cnvimg")[0].src=`/static/images/${curmatch}_CNV.jpg`;
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

const status = async () => {
	appendhn();
	resetimg();
	(curmatch!= void 0) && await _fetch("/apix/read_file",{file:`static/data/${curmatch}_stt.txt`}).then((res) => {
		res = b64DecodeUnicode(res);
		stt = JSON.parse(res);
	});
	console.log(stt);
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

function update(){
	resetimg();
	send_mess(boku, "controller", "checkCNV");
	for(var i=1;i<=4;i++){
		document.getElementById("name"+i).style.background="white";
	}
	if (curmatch!= void 0) {
		_fetch("/apix/read_file",{file:`static/data/${curmatch}_contestants.txt`}).then((res) => {
			res = b64DecodeUnicode(res);
			contestants = JSON.parse(res);
			for(index in contestants){
				$("#name"+parseInt(parseInt(index)+1)).html(contestants[index].name);
				$("#score"+parseInt(parseInt(index)+1)).html(contestants[index].score);
			}
		});
		loadans()
		loadques()
		_fetch("/apix/read_file",{file:`static/data/${curmatch}_status.txt`}).then((res) => {
			res = b64DecodeUnicode(res);
			res = JSON.parse(res);
			curques=res[0].curques;
			send_mess(boku, "controller", "confirmed");
			$('#timer_slider').animate({width:'0px'},0);
			$('#timer_slider').animate({opacity:'1'},0);
			$("#question").html("Câu hỏi thứ "+parseInt(parseInt(curques)+1));
			_fetch("/apix/read_file",{file:`static/data/${curmatch}_2_question.txt`}).then((res) => {
				res = b64DecodeUnicode(res);
				questions = JSON.parse(res);
			});
		});
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

function start() {
	outoftime=false;
	setTimeout(function() {outoftime=true;}, 15000);
	$('#timer_slider').animate({width:'900px'},15000,"linear");
	$('#timer_slider').animate({opacity:'0'},1000);
	$("#question").html(questions[curques]);
}

function loadq(){
	if(curmatch == undefined){
		send_mess(boku, "controller", "failed_loadques");
		return;
	} else{
		(curmatch!= void 0) && _fetch("/apix/read_file",{file:`static/data/${curmatch}_2_question.txt`}).then((res) => {
			res = b64DecodeUnicode(res);
			questions = JSON.parse(res);
			if(questions.length > 0){
				send_mess(boku, "controller", "loaded_ques");
			} else{
				send_mess(boku, "controller", "failed_loadques");
			}
		});
	}
}

function loadques(){
	if(curmatch == undefined){
		send_mess(boku, "controller", "failed_loadques");
		send_mess(boku, "controller", "get_curmatch");
		setTimeout(() => {
			console.log(curmatch);
			update();
		}, 2000);
	} else loadq();
}

function correct(){
	(curmatch!= void 0) && _fetch("/apix/read_file",{file:`static/data/${curmatch}_contestants.txt`}).then((res) => {
		res = b64DecodeUnicode(res);
		contestants = JSON.parse(res);
		for(index in contestants){
			$("#name"+parseInt(parseInt(index)+1)).html(contestants[index].name);
			$("#score"+parseInt(parseInt(index)+1)).html(contestants[index].score);
		}
	});
	if(curques < 4) reveal(curques)
}

socket.on("message",(msg) => {
	msg=b64DecodeUnicode(msg);
	msg=JSON.parse(msg);
	let receiver=msg[0].receiver;
	let content=msg[0].content;
	let sender=msg[0].sender;
	if(receiver=="contestants" || receiver==boku){
		switch(content){
			case "blockCNV":{
				blockCNV();
			};
			break;
			case "test":{
				send_mess(boku,"controller","ok");
				if(questions.length == 0) send_mess(boku, "controller", "failed_loadques");
				else send_mess(boku, "controller", "loaded_ques");
			};
			break;
			case "update":{
				update()
			};
			break;
			case "start":{
				start()
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
			case 'wrong': curques < 4 ? failed(curques) : null;
			break;
			case "CNV":{
				document.getElementById("name"+parseInt(parseInt(sender)+1)).style.background="#ff8000";
			};
			break;
			case "end":
				window.open(location.href.replace(/\/\d\//, function(v) {
				return "/"+(Number(v[1])+1).toString()+"/";
			}),"_self");
			break;
			case 'showques':{
				$("#question").html(questions[curques]);
			}
			break;
			case 'showimg': showimg(curques);
			break;
			case 'status': status();
			break;
			case 'full': full();
			break;
			default:
				if(content.startsWith("match")) curmatch = content.replace("match","");
		}
	}
});

// $(document).ready(() => {
// 	update();
// })
