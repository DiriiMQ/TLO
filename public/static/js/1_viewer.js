const score=$("#score");
const question=$("#question");
var curmatch;
var contestants=[];
var questions=[];
var socket = io.connect("http://"+document.domain+":"+location.port);
var idq=-1;
var ids=0;

socket.on("disconnect",function(){
	socket.connect();
})

// socket.on("connect",function(){
// 	alert("connected!");
// })

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


var sfx = {	'correct': new Audio('/static/audio/KD_right.wav'),
			'wrong': new Audio('/static/audio/KD_sai.wav'),
			'done': new Audio('/static/audio/KD_VD_sau_phần_thi.wav'),
			'start': new Audio('/static/audio/KD_bắt_đầu.wav'),
			'open': new Audio('/static/audio/KD_start.wav'),
			'60s': new Audio('/static/audio/KD_60s.wav')
		}

const nextques=function(){
	//disabled(nextques);
	++ idq;
	if ((idq > 17)) {
		question.html("Done!");
		$("#timer_slider").stop();
		setTimeout(function(){
			// sfx['done'].pause();
			sfx['done'].currentTime = 0;
			sfx['done'].play()
			.catch(err => {});
		},2000)
		sfx['60s'].pause();
		sfx['60s'].currentTime = 0;
	}
	else{
	// if (ids > 3) {
	// 	disabled(correctb);
	// 	disabled(wrongb);
	// 	// disabled(nextques);
	// 	question.html("Done");
	// }
	console.log({ids: ids, idq: idq});
	question.html(questions[ids][idq]);
};
};

const checksound = () => {
	var ok = 1;
	console.log('check')
	Object.keys(sfx).map(s => {ok = ok && (sfx[s].readyState === 4); console.log(s, sfx[s].readyState)})
	if(ok){
		send_mess("viewer", "controller", "sound_ok")
		console.log('ok')
	}
	else{
		setTimeout(() => {checksound()}, 2000)
	}
}

checksound()

const actived = (index) => {
	if (index < 5)
	{
		for(var i=1;i<=4;i++){
			$(`#contestant${parseInt(i)}`).parent().removeClass("active");
		}
		$(`#contestant${parseInt(index)}`).parent().addClass("active");
		score.html(parseInt(contestants[parseInt(parseInt(index)-1)].score));
		question.html('Vòng thi khởi động của ' + contestants[parseInt(index) - 1].name)
	}
	else if (index == 5) {
		question.html("Vòng thi khởi động kết thúc :3");
		index = 6;
	}
	else window.open(location.href.replace(/\/\d($|\/)/, function(v) {
		return "/"+(Number(v[1])+1).toString();
	}),"_self");
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
		// sfx['60s'].pause()
		sfx['60s'].currentTime = 0
		sfx['60s'].play()
		.catch(err => {})
		$('#timer_slider').animate({width:'900px'},60000,"linear",function(){
			setTimeout(function(){
				// sfx['done'].pause();
				sfx['done'].currentTime = 0
				sfx['done'].play()
				.catch(err => {});
			},2000);
		});
		$('#timer_slider').animate({opacity:'0'},1000);
	},8000);

	//alert('ok');
	//tick(60);
};

async function send_mess(sender,receiver,content){
	var data=[];
	data.push({
		sender: sender,
		receiver: receiver,
		content: content
	});
	data=JSON.stringify(data);
	data=b64EncodeUnicode(data);
	await socket.send(data)
};

const update = async () => {
	if (curmatch!= void 0) {
		await _fetch("/apix/read_file",{file: `static/data/${curmatch}_status.txt`}).then((res) => {
			// console.log(res)
			res = b64DecodeUnicode(res);
			res = JSON.parse(res);
			send_mess("viewer", "controller", "confirmed");
			console.log(res);
			idq=res[0].curques;
			ids=(res[0].curcon==-1)?(0):(res[0].curcon);
		});
		_fetch("/apix/read_file",{file:`static/data/${curmatch}_contestants.txt`}).then((res) => {
			res = b64DecodeUnicode(res);
			contestants = JSON.parse(res);
			console.log(contestants);
			score.html(contestants[ids].score);
			question.html("Phần thi khởi động của " + contestants[ids].name);
			for(index in contestants){
				let element=$(`#contestant${parseInt(parseInt(index)+1)}`);
				//let element    = $(`#contestant_${parseInt(index) + 1}`);
				let contestant=contestants[index];
				element.html(`${contestant.name} (${contestant.score})`);
				$("#name" + parseInt(parseInt(index) + 1)).html(contestants[index].name);
				$("#score" + parseInt(parseInt(index) + 1)).html(contestants[index].score);
			};
			actived(parseInt(ids)+1);
		});
	}
	$('#timer_slider').animate({width:'0px'},0);
	$('#timer_slider').animate({opacity:'1'},0);
}

const loadq = function(){
	if(curmatch == undefined){
		send_mess("viewer", "controller", "failed_loadques");
		return;
	} else{
		(curmatch!= void 0) && _fetch("/apix/read_file",{file:`static/data/${curmatch}_1_question.txt`}).then((callback) => {
			questions=b64DecodeUnicode(callback);
			questions=JSON.parse(questions);
			questions = questions.ques;
			console.log(questions);
			if(questions.length > 0){
				send_mess("viewer", "controller", "loaded_ques");
			} else{
				send_mess("viewer", "controller", "failed_loadques");
			}
		});
	}
}

const loadques = function() {
	if(curmatch == undefined){
		send_mess("viewer", "controller", "failed_loadques");
		send_mess("viewer", "controller", "get_curmatch");
		setTimeout(() => {
			console.log(curmatch);
			update();
		}, 2000);
	} else loadq();
}

const correct = () => {
	(curmatch!= void 0) && _fetch("/apix/read_file",{
		file:`static/data/${curmatch}_contestants.txt`
	}).then((res) => {
		res = b64DecodeUnicode(res);
		contestants= JSON.parse(res);
		console.log(contestants);
		// sfx["correct"].pause();
		sfx['correct'].currentTime = 0;
		sfx["correct"].play()
		.catch(err => {});
		score.html(contestants[ids].score);
		$(`#contestant${parseInt(parseInt(ids) + 1)}`).html(`${contestants[ids].name} (${contestants[ids].score})`)
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
				// sfx['wrong'].pause()
				sfx['wrong'].currentTime = 0
				sfx['wrong'].play()
				.catch(err => {})
			};
			break;
			case "start":{
				// sfx['start'].pause()
				sfx['start'].currentTime = 0
				sfx['start'].play()
				.catch(err => {})
				checksound()
				start();
			};
			break;
			case "nextcon":{
				nextcontestant();
			};
			break;
			case "test":{
				send_mess("viewer","controller","ok");
				if(questions.length == 0) send_mess("viewer", "controller", "failed_loadques");
				else send_mess("viewer", "controller", "loaded_ques");
			};
			break;
			default:
        if (content.startsWith("match")) curmatch = content.replace("match","");
		};
	}
});

if(window.outerWidth < 1200){
	$("#scoretab").hide()
}

$(document).ready(function(){
	update()
});
