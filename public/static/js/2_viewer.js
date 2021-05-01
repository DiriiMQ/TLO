var socket = io.connect("http://"+document.domain+":"+location.port);

var contestants=[];
var curques=-1;
var questions=[];
var ans=[];
var corner=[[1,2,5],[3,4,8],[9,13,14],[12,15,16],[6,7,10,11]];
var stt=["","","","",""];
var curmatch;
function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    function toSolidBytes(match, p1) {
      return String.fromCharCode('0x' + p1);
  }));
}

send_mess("viewer","controller","ok");

if(window.outerWidth < 1200){
	document.getElementById("timetab").style.position = 'absolute'
	document.getElementById("timetab").style.top = '300px'
	document.getElementById("timetab").style.right = '50px'
}

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

var sfx = {	'cnv': new Audio('/static/audio/VCNV_trả_lời.wav'),
			'correct': new Audio('/static/audio/VCNV_tl_đúng.wav'),
			'showans': new Audio('/static/audio/VCNV_mở_đáp_án.wav'),
			'showimg': new Audio('/static/audio/VCNV_mở_hình_ảnh.wav'),
			'chooseques': new Audio('/static/audio/VCNV_chọn_ô_chữ.wav'),
			'wrong': new Audio('/static/audio/KD_sai.wav'),
			'15s': new Audio('/static/audio/VCNV_15s.wav')
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

const checksound = () => {
	var ok = 0;
	Object.keys(sfx).map(s => ok = ok && (sfx[s].readyState === 4))
	if(ok){
		send_mess("viewer", "controller", "sound_ok")
	}
	else{
		setTimeout(() => {checksound()}, 2000)
	}
}

checksound()

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
		send_mess("viewer", "controller", "confirmed");
  		if(curques != res[0].curques && res[0].curques != "-1"){
  			sfx['chooseques'].pause();
  			sfx['chooseques'].currentTime = 0
  			sfx['chooseques'].play().catch(err => {});
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
}

const loadques = async () => {
	if(curmatch == undefined){
		send_mess("viewer", "controller", "failed_loadques");
		send_mess("viewer", "controller", "get_curmatch");
		setTimeout(() => {
			console.log(curmatch);
			update();
		}, 2000);
		return;
	}
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
		if(questions.length > 0){
			send_mess("viewer", "controller", "loaded_ques");
		} else{
			send_mess("viewer", "controller", "failed_loadques");
		}
		// alert(ans)
		await _fetch("/apix/read_file",{file:`static/data/${curmatch}_stt.txt`}).then((res) => {
			res = b64DecodeUnicode(res);
			stt = JSON.parse(res);
		});
		// alert(stt)
	}
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
	sfx['correct'].pause()
	sfx['correct'].currentTime = 0
	sfx['correct'].play().catch(err => {})
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
	sfx['showans'].pause()
	sfx['showans'].currentTime = 0
	sfx['showans'].play().catch(err => {})
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
				sfx['cnv'].pause()
				sfx['cnv'].currentTime = 0
				sfx['cnv'].play().catch(err => {})
			};
			break;
			case "update":{
				update();
			};
			break;
			case "start":{
				start();
				sfx['15s'].pause()
				sfx['15s'].currentTime = 0
				sfx['15s'].play().catch(err => {})
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
				sfx['wrong'].pause()
				sfx['wrong'].currentTime = 0
				sfx['wrong'].play().catch(err => {})
			};
			break;
			case "showans":{
				showans()
			};
			break;
			case "showimg":{
				showimg(curques);
				sfx['showimg'].pause()
				sfx['showimg'].currentTime = 0
 				sfx['showimg'].play().catch(err => {})
			};
			break;
			case "test":{
				send_mess("viewer","controller","ok");
				if(questions.length == 0) send_mess("viewer", "controller", "failed_loadques");
				else send_mess("viewer", "controller", "loaded_ques");
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
      case "end":
        window.open(location.href.replace(/\/\d($|\/)/, function(v) {
          return "/"+(Number(v[1])+1).toString();
        }),"_self");
        break;
			case 'wrongCNV':{
				sfx['wrong'].pause()
				sfx['wrong'].currentTime = 0
				sfx['wrong'].play().catch(err => {})
				update();
			}
			break;
			case 'full': full()
			break;
      default:
        if (content.startsWith("match")) curmatch = content.replace("match","");
		}
	}
})

$(document).ready(() => {
	update()
})
