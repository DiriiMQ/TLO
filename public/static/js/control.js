var curmatch;
var curround=-1;
var curcon=-1;
var curques=-1;
var stopTiming=false;
var socket = io.connect("http://"+document.domain+":"+location.port);//"http://127.0.0.1:5000"
var round_name=["Khởi động","Vượt chướng ngại vật","Tăng tốc","Về đích"];
var contestants=[];
$("#submitIndex").on("click",function(){
	curmatch = $("#match-index").val();
	alert((!curmatch)?"Nhập thông số trận đi bạn ei":`Trận ${curmatch} hả? Quẩy luôn :))`)});
socket.on("connect",function(){
	$('#status').html('Connected');
	document.getElementById("status_cir").style.color="#00ff00";
});

function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    function toSolidBytes(match, p1) {
      return String.fromCharCode('0x' + p1);
  }));
}
for (let i=1;i<5;i++)
{
	//16 x 4 câu khởi động
	let t=$("<div></div>")[0];
	t.setAttribute("style","margin-left: 10px;height: 450px;width: 600px;float: left;");
	t.innerHTML=`<div style="width: 100px;margin-right: 20px;float: left;font-size: 20px;font-weight: bold;color: #ffe699;width: 300px;">Thí sinh ${i}</div>`;
	for (let j=1;j<19;j++) t.innerHTML+=`<input id="save_ques1_${i}_${j}" class="form-control" style="float: left; background-color: black;width: 400px;margin-left: 100px;height:25px;" placeholder="Nhập câu hỏi thứ ${j}">
	<input id = "save_ans1_${i}_${j}" class = "form-control" style = "float: left; background-color: black;width: 90px;margin-left: 100px;height:25px;margin-left: 5px" placeholder="Answer">`;
	let u=document.querySelector("#round1");
	u.insertBefore(t,u.lastElementChild);
	// 9 x 4 câu về đích
	let s=$("<div></div>")[0];
	s.setAttribute("style",`margin-left: ${(i%2)?10:50}px;height: 420px;width: 600px;float: left;${(i<3)?"border-bottom: 1px solid #ffbf00":"margin-top: 20px"}`);
	s.innerHTML+=`<div style="width: 100px;margin-right: 20px;float: left;font-size: 20px;font-weight: bold;color: #ffe699;width: 300px;">Thí sinh ${i}</div>`;
	let el;
	for (let j=1;j<4;j++)
	{
		el = $("<div></div>")[0];
		el.setAttribute("style","margin-left: 10px;margin-top: 20px;");
		for (let k = 1; k<4;k++)
		{
			el.innerHTML+=`<div style="width: 100px;margin-right: 20px;float: left;font-size: 20px;font-weight: bold;color: #ffe699;width: 300px;">Gói ${k*10} điểm</div>`;
			for (let l=1;l<4;l++) el.innerHTML+=`<input id="save_ques4_${i}_${k}_${l}" class="form-control" style="background-color: black;width: 500px;margin-left: 120px;height:25px;margin-top: 5px;" placeholder="Nhập câu hỏi thứ ${l}">`;
		}
	}
	s.appendChild(el);
	let td = document.querySelector("#round4");
	td.insertBefore(s,td.lastElementChild);
}
// 18 câu khởi động - Đúng/sai
for (let i=1;i<19;i++) $("#ans_n").append(`<div id="ans${i}" style="float: left;width: 60px;height: 20px;background-color: black;"></div>`);
function b64DecodeUnicode(str) {
  return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))
}
// 13 câu hỏi phụ
let chp = $("<div></div>")[0];
chp.setAttribute("style","margin-left: 10px;margin-bottom:20px;float: left;");
chp.innerHTML+=`<button id="save_ques_5_btn" style="float: right;width: 150px;height: 200px;font-size: 30px;border-width: 0px;margin-right: 200px;background-color: #ffcc00" onmouseover="this.style.background='#ffe066';" onmouseout="this.style.background='#ffcc00';" onclick="round_five.save_question_5();">Lưu</button>`;
for (let i=1;i<14;i++)
{
	let chpn = $("<div></div>")[0];
	chpn.setAttribute("style","margin-top: 10px;width: 900px;float: left;");
	chpn.innerHTML+=`<div style="width: 100px;margin-right: 20px;float: left;font-size: 20px;font-weight: bold;color: #ffe699;width: 200px;">Câu hỏi thứ ${i}</div>
	<input id="save_ques5_${i}" class="form-control" style="background-color: black;width: 400px;margin-left: 20px;height:30px;float: left;" placeholder="Nhập câu hỏi">`;
	chp.appendChild(chpn);
}
$("#round5").append(chp);
function disabled(obj){
	obj.prop("disabled",true);
}

function enabled(obj){
	obj.removeAttr("disabled");
}

socket.on("disconnect",function(){
	document.getElementById("status_cir").style.color="#ff0000";
	socket.connect();
})

function precisionRound(number, precision) {
  var factor = Math.pow(10, precision);
  return Math.round(number * factor) / factor;
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

function check_status(){
	send_mess("controller","contestants","test");
	for(var i=1;i<=4;i++){
		document.getElementById("stt"+i).style.background="#ff0000";
	}
	document.getElementById("sttscr").style.background="#ff0000";
	document.getElementById("sttmc").style.background="#ff0000";
	send_mess("controller","viewer","test");
}

function update_score(id,plus){
	var data,tscore;
	tscore = parseInt(parseInt(contestants[id].score)+parseInt(plus));
	contestants[id].score = (tscore<0)?0:tscore;
	data = JSON.stringify(contestants);
	data = b64EncodeUnicode(data);
	_fetch("/apix/update_file", {
		file: `static/data/${curmatch}_contestants.txt`,
		data: data
	});
}

function update_contestants(){
	return new Promise((resolve) => {
		var data=[];
		for(var i=1;i<5;i++){
			data.push({
				name:$("#name"+i+"_edit").val(),
				score:$("#score"+i+"_edit").val()
			});
		}
		data=JSON.stringify(data);
		data=b64EncodeUnicode(data);
		_fetch("/apix/update_file",{
			file: `static/data/${curmatch}_contestants.txt`,
			data: data
		}).then(function(res){alert("Xong!");$("#loading_con_btn").click();resolve(res)});
	});
}

function reset_contestants(){
	var data=[];
	for(var i=1;i<5;i++){
		data.push({
			name:'',
			score:0
		});
	}
	data=JSON.stringify(data);
	data=b64EncodeUnicode(data);
	_fetch("/apix/update_file",{
		file: `static/data/${curmatch}_contestants.txt`,
		data: data
	}).then(function(callback){
		for(var i=1;i<5;i++){
			$("#name"+i+"_edit").val("");
			$("#score"+i+"_edit").val("");
		}
	});
}

const quest_loader = {
	load_con:function(){
		_fetch("/apix/read_file",{
			file: `static/data/${curmatch}_contestants.txt`
		}).then((callback) => {
			send_mess("controller","contestants","update");
			send_mess("controller","viewer","update");
			console.log(callback);
			callback=b64DecodeUnicode(callback);
			callback=JSON.parse(callback);
			contestants=callback;
			for(i in callback){
				$("#name"+parseInt(parseInt(i)+1)+"_edit").val(callback[i].name);
				$("#score"+parseInt(parseInt(i)+1)+"_edit").val(callback[i].score);
				$("#con"+parseInt(parseInt(i)+1)+"_name").html(callback[i].name+":");
				$("#con"+parseInt(parseInt(i)+1)+"_score").html(callback[i].score);
				//alert(callback[i].name+" "+callback[i].score);
			}
		});
	},

	load_ques1:function(){
		_fetch("/apix/read_file",{
			file: `static/data/${curmatch}_1_question.txt`
		}).then((callback) => {
			callback=b64DecodeUnicode(callback);
			callback=JSON.parse(callback);
			console.log(callback);
			round_one.questions=callback.ques;
			for(i in callback.ques){
				for(j in callback.ques[i]){
					//alert(callback[i][j]+" save_ques1_"+parseInt(parseInt(i)+1)+"_"+parseInt(parseInt(j)+1);
					$("#save_ques1_"+parseInt(parseInt(i)+1)+"_"+parseInt(parseInt(j)+1)).val(callback.ques[i][j]);
				}
			}
			for(i in callback.ans)
				for(j in callback.ans[i])
					$("#save_ans1_"+parseInt(parseInt(i)+1)+"_"+parseInt(parseInt(j)+1)).val(callback.ans[i][j]);
		});
	},

	load_ques2:function(){
		_fetch("/apix/read_file",{
			file: `static/data/${curmatch}_2_question.txt`
		}).then((callback) => {
			console.log(callback);
			callback=b64DecodeUnicode(callback);
			callback=JSON.parse(callback);
			round_two.questions=callback;
			for(i in callback){
				$("#save_ques2_"+parseInt(parseInt(i)+1)).val(callback[i]);
			}
		});
		_fetch("/apix/read_file",{file:`static/data/${curmatch}_ans.txt`}).then((res) => {
			res=b64DecodeUnicode(res);
			res=JSON.parse(res);
			for(i in res){
				$("#save_ques2_"+parseInt(parseInt(i)+1)+"_ans").val(res[i]);
			}
		});
	},

	load_ques3:function(){
		_fetch("/apix/read_file",{
			file: `static/data/${curmatch}_3_question.txt`
		}).then((callback) => {
			console.log(callback);
			callback=b64DecodeUnicode(callback);
			callback=JSON.parse(callback);
			round_three.questions=callback;
			for(i in callback){
				$("#save_ques3_"+parseInt(parseInt(i)+1)).val(callback[i].ques);
				$("#save_ques3_"+parseInt(parseInt(i)+1)+"_type").val(callback[i].type);
			}
		});
	},

	load_ques4:function(){
		_fetch("/apix/read_file",{
			file: `static/data/${curmatch}_4_question.txt`
		}).then((callback) => {
			console.log(callback);
			callback=b64DecodeUnicode(callback);
			callback=JSON.parse(callback);
			round_four.questions=callback;
			for(i in callback){
				for(j in callback[i]){
					for(z in callback[i][j])
					//alert(callback[i][j]+" save_ques1_"+parseInt(parseInt(i)+1)+"_"+parseInt(parseInt(j)+1);
					$("#save_ques4_"+parseInt(parseInt(i)+1)+"_"+parseInt(parseInt(j)+1)+"_"+parseInt(parseInt(z)+1)).val(callback[i][j][z]);
				}
			}
		});
	},
	load_ques5: () => {
		_fetch("/apix/read_file", {file: `static/data/${curmatch}_5_question.txt`}).then((callback) => {
			callback = b64DecodeUnicode(callback);
			callback = JSON.parse(callback);
			round_five.questions = callback;
			for (let i=0;i<14;i++) $(`#save_ques5_${i+1}`).val(callback[i]);
		})
	}
}


function save_status(){
	curround=$("#curround_edit").val();
	curcon=($("#curcon_edit").val() == null) ? (-1) : ($("#curcon_edit").val());
	curques=($("#curques_edit").val() == null) ? (-1) : ($("#curques_edit").val());
	curpack=($("#curpack_edit").val() == null) ? (-1) : ($("#curpack_edit").val());
	$("#curround").html(round_name[curround]);
	// for(var i=0;i<4;i++){
	// 	$("con"+parseInt(parseInt(i)+1)+"_name").html(contestants[i].name);
	// 	$("con"+parseInt(parseInt(i)+1)+"_score").html(contestants[i].score);
	// };
	var data=[];
	data.push({
		curround:curround,
		curcon:curcon,
		curques:curques,
		curpack:curpack
	});
	console.log(data);
	data=JSON.stringify(data);
	data=b64EncodeUnicode(data);
	_fetch("/apix/update_file",{
		file: `static/data/${curmatch}_status.txt`,
		data: data
	}).then(function(){
		alert("Xong!");
		send_mess("controller","contestants","match"+curmatch);
		send_mess("controller","viewer","match"+curmatch);
		send_mess("controller","contestants","update");
		send_mess("controller","viewer","update");
	});
	for(var i=1;i<=4;i++){
		document.getElementById("stt"+i+"_tab").style.background="";
	}
	switch (curround){
		case "0": round_one.update_status();
		break;
		case "1": round_two.update_status();
		break;
		case "2": round_three.update_status();
		break;
		case "3": round_four.update_status();
		break;
		case "4": round_five.update_status();
	}
}

const tick = function(time,obj){
	if(time>-1 && !stopTiming){
		obj.html(time);
		setTimeout(function() {
			tick(parseInt(time)-1,obj);
		}, 1000);
	}
}

const round_one = {
	questions: [],
	tmp: '',
	save_question_1: function(){
		var ques_data=[];
		for(var i=0;i<4;i++){
			var subdata=[];
			for(var j=0;j<18;j++){
				subdata.push($("#save_ques1_"+parseInt(i+1)+"_"+parseInt(j+1)).val());
			};
			ques_data.push(subdata);
		};
		var ans_data = []
		for(var i=0;i<4;i++){
			var subdata=[];
			for(var j=0;j<18;j++){
				subdata.push($("#save_ans1_"+parseInt(i+1)+"_"+parseInt(j+1)).val());
			};
			ans_data.push(subdata);
		};
		var data=JSON.stringify({ques: ques_data, ans: ans_data});
		data=b64EncodeUnicode(data);
		_fetch("/apix/update_file",{
			file: `static/data/${curmatch}_1_question.txt`,
			data: data
		}).then(function(callback){
			//alert("Đề vòng 1 nhiều vler, lưu xong r đó :v");
			$("#load_ques_1_btn").click();
		});
	},
	load_question: function(){
		_fetch("/apix/read_file", {file: `static/data/${curmatch}_1_question.txt`}).then((callback) => {
			callback=b64DecodeUnicode(callback);
			round_one.questions=JSON.parse(callback);
		}).then(function(){alert("Load xong câu hỏi vòng 1 rồi nè");});
		send_mess("controller","contestants","loadques");
		send_mess("controller","viewer","loadques");
	},
	correct: function(){
		update_score(curcon,10)
		$("#con"+parseInt(parseInt(curcon)+1)+"_score").html(contestants[curcon].score);
		document.getElementById("ans"+parseInt(parseInt(curques)+1)).style.background="#00b300";
		round_one.nextques();
		send_mess("controller","contestants","correct");
		send_mess("controller","viewer","correct");
	},
	wrong: function(){
		document.getElementById("ans"+parseInt(parseInt(curques)+1)).style.background="#ff0000";
		round_one.nextques();
		send_mess("controller","contestants","wrong");
		send_mess("controller","viewer","wrong");
	},
	nextques: function(){
		if(curques<17){
			curques=parseInt(parseInt(curques)+1);
			$("#ques_1").html(round_one.questions.ques[curcon][curques] + " - " + round_one.questions.ans[curcon][curques]);
			$("#numques1").html(parseInt(curques)+1);
		}
		else{
			stopTiming=true;
			disabled($("#true_1_btn"));
			disabled($("#false_1_btn"));
			clearTimeout(round_one.tmp);
		}
	},
	// start_all:function(){
	// 	send_mess("contestants","start_all_1");
	// 	curround=0;
	// 	curcon=-1;
	// 	curques=-1;
	// 	//update_sit();

	// }
	update_status: function(){
		$("#ques_1").html("Phần thi khởi động của "+ contestants[curcon].name);
		for(var i=1;i<=16;i++){
			document.getElementById("ans"+i).style.background="black";
		}
		enabled($("#start_1_btn"));
	},
	start: function(){
		//enabled($("#start_1_btn"));
		send_mess("controller","contestants","start");
		send_mess("controller","viewer","start");
		disabled($('#start_1_btn'))
		setTimeout(function() {
			stopTiming=false;
			enabled($("#true_1_btn"));
			enabled($("#false_1_btn"));
			curques=-1;
			tick(60,$("#timer_1"));
			round_one.nextques();
			round_one.tmp=setTimeout(function() {
				//disabled($("#start_1_btn"));
				disabled($("#true_1_btn"));
				disabled($("#false_1_btn"));
			}, 60000);
		}, 8000);
	},
	next: function(){
		enabled($('#start_1_btn'))
		var data=[];
		curcon++;
		curques = 0
		data.push({
			curround:curround,
			curcon:curcon,
			curques:curques,
			curpack:curpack
		});
		data=JSON.stringify(data);
		data=b64EncodeUnicode(data);
		//console.log(data);
		_fetch("/apix/update_file",{
			file: `static/data/${curmatch}_status.txt`,
			data: data
		})
		for(var i=1;i<=18;i++){
			document.getElementById("ans"+i).style.background="black";
		};
		$("#curcon_edit").val(curcon);
		$("#numques1").html(0);
		send_mess("controller","contestants","nextcon");
		send_mess("controller","viewer","nextcon");
		if ($("#curcon_edit option:selected").val() == void 0)
		{
			for (let i=0;i<=5;i++) $(`#stt${i}_cnv`).val("");
			round_two.update_status();
		}
		round_one.update_status();
	}
}

const round_two = {
	questions: [],
	ans: [],
	CNV: [false,false,false,false],
	judgearr: [false,false,false,false],
	count: 0,
	remain: 4,
	scs:[10,20,40,60,80],
	save_question_2: function(){
		var data=[];
		for(var i=0;i<5;i++){
			data.push($("#save_ques2_"+parseInt(parseInt(i)+1)).val());
		};
		data=JSON.stringify(data);
		data=b64EncodeUnicode(data);
		_fetch("/apix/update_file",{
			file: `static/data/${curmatch}_2_question.txt`,
			data: data
		}).then(function(callback){
			//alert("Sao vòng 2 khó vcl ra thế :(((((");
			$("#load_ques_2_btn").click();
		});
		data=[];
		for(var i=1;i<=4;i++){
			data.push($("#save_ques2_"+i+"_ans").val());
		};
		data=JSON.stringify(data);
		data=b64EncodeUnicode(data);
		_fetch("/apix/update_file",{
			file: `static/data/${curmatch}_ans.txt`,
			data:data
		});
	},
	load_question: function(){
		_fetch("/apix/read_file", {file: `static/data/${curmatch}_2_question.txt`}).then((callback) => {
			round_two.questions=b64DecodeUnicode(callback);
			round_two.questions=JSON.parse(round_two.questions);
		}).then(function(){alert("Vòng 2 load xong luôn r đó");});
		send_mess("controller","contestants","loadques");
		send_mess("controller","viewer","loadques");
	},
	correct: function(){
		for(var i=0;i<4;i++){
			if(round_two.judgearr[i]){
				update_score(i,10)
				$("#con"+parseInt(parseInt(i)+1)+"_score").html(contestants[i].score);
				//alert(i+" "+contestants[i].score);
			}
		};
		enabled($("#show_img_btn"));
		send_mess("controller","contestants","correct");
		send_mess("controller","viewer","correct");
		$("#stt"+parseInt(parseInt(curques)+1)+"_cnv").val("correct");
		var data = [];
		for(var i=1;i<=5;i++){
			data.push($("#stt"+i+"_cnv").val());
		};
		data=JSON.stringify(data);
		console.log(data);
		data=b64EncodeUnicode(data);
		_fetch("/apix/update_file",{
			file:`static/data/${curmatch}_stt.txt`,
			data:data
		});
	},
	showques: function(){
		send_mess('controller','viewer','showques');
		send_mess('controller','contestants','showques')
	},
	update_status: function(){
		$("#numques2").html(parseInt(parseInt(curques)+1));
		if(curques === -1){
			$("#ques_2").html("Vòng vượt chướng ngại vật");
			return;
		}
		$("#ques_2").html(round_two.questions[curques]);
		disabled($("#show_ans_2_btn"));disabled($("#true_2_btn"));disabled($("#false_2_btn"));disabled($("#show_img_btn"));
		for(var i = 1; i <= 4; i++){
			$("#cnv_ans" + i).html('')
		}
		round_two.ans = []
		round_two.save_status()
	},
	start: function(){
		stopTiming=false;
		tick(15,$("#timer_2"));
		$("#ques_2").html(round_two.questions[curques]);
		send_mess("controller","contestants","start");
		send_mess("controller","viewer","start");
		setTimeout(function() {enabled($("#show_ans_2_btn"));enabled($("#true_2_btn"));enabled($("#false_2_btn"));}, 15000);
	},
	end: function(){
		send_mess("controller","contestants","end");
		send_mess("controller","viewer","end");
	},
	judge: function(id){
		if(round_two.judgearr[id]){
			round_two.judgearr[id]=false;
			document.getElementById("cnv_ans"+parseInt(parseInt(id)+1)).style.border="1px solid #ff0000";
		}
		else{
			round_two.judgearr[id]=true;
			document.getElementById("cnv_ans"+parseInt(parseInt(id)+1)).style.border="1px solid #00b300";
		}
	},
	correctCNV: function(){
		update_score($("#chooseCNV").val(),round_two.scs[round_two.remain])
		$("#con"+parseInt(parseInt($("#chooseCNV").val())+1)+"_score").html(contestants[$("#chooseCNV").val()].score);
		send_mess("controller","viewer","update");
		send_mess("controller","contestants","update");
	},
	wrong:function(){
		send_mess("controller","viewer","wrong");
		send_mess("controller","contestants","wrong");
		$("#stt"+parseInt(parseInt(curques)+1)+"_cnv").val("wrong");
		var data = [];
		for(var i=1;i<=5;i++){
			data.push($("#stt"+i+"_cnv").val());
		};
		data=JSON.stringify(data);
		console.log(data);
		data=b64EncodeUnicode(data);
		_fetch("/apix/update_file",{
			file:`static/data/${curmatch}_stt.txt`,
			data:data
		});
	},
	wrongCNV:function(){
		send_mess("controller","viewer","wrongCNV");
		send_mess("controller","contestants","wrongCNV");
	},
	showans:function(){
		var data = [];
		data=round_two.ans;
		data=JSON.stringify(data);
		data=b64EncodeUnicode(data);
		_fetch("/apix/update_file",{
			file:`static/data/${curmatch}_ansts.txt`,
			data:data
		}).then(send_mess("controller","viewer","showans"));
	},
	showimg:function(){
		send_mess("controller","viewer","showimg");
		send_mess("controller","contestants","showimg");
	},
	save_status:function(){
		round_two.remain = 4;
		var data = [];
		for(var i=1;i<=5;i++){
			data.push($("#stt"+i+"_cnv").val());
			if($("#stt"+i+"_cnv").val()!=""){
				if(round_two.remain>0){
					round_two.remain--;
				}
			}
		};
		data=JSON.stringify(data);
		console.log(data);
		data=b64EncodeUnicode(data);
		_fetch("/apix/update_file",{
			file:`static/data/${curmatch}_stt.txt`,
			data:data
		}).then(function(){send_mess("controller","viewer","status");
							send_mess("controller", "contestants", "status")});
	},
	full: () => {
		send_mess("controller", "viewer", "full")
		send_mess("controller", "contestants", "full")
	}
}

const round_three = {
	questions: [],
	pos:[0,1,2,3],
	answer:[{ans:"",time:0.00},{ans:"",time:0.00},{ans:"",time:0.00},{ans:"",time:0.00}],
	judgearr:[false,false,false,false],
	remain:3,
	score:[10,20,30,40],
	save_question_3: function(){
		var data=[];
		for(var i=0;i<4;i++){
			data.push({
				ques: $("#save_ques3_"+parseInt(parseInt(i)+1)).val(),
				type: $("#save_ques3_"+parseInt(parseInt(i)+1)+"_type").val()
			});
		}
		data=JSON.stringify(data);
		data=b64EncodeUnicode(data);
		_fetch("/apix/update_file",{
			file: `static/data/${curmatch}_3_question.txt`,
			data: data
		}).then(function(callback){
			//alert("Cái đề này làm ra cho ai thế?? Tấm à ? -_-");
		});
		$("#load_ques_3_btn").click();
	},
	load_question:function(){
		_fetch("/apix/read_file",{
			file: `static/data/${curmatch}_3_question.txt`
		}).then((callback) => {
			console.log(callback);
			callback=b64DecodeUnicode(callback);
			callback=JSON.parse(callback);
			round_three.questions=callback;
		});
	},
	// load_question: function(){
	// 	_fetch("/apix/read_file",{file:`static/data/${curmatch}_3_question.txt`}).then((callback) => {
	// 		round_three.questions=b64DecodeUnicode(callback);
	// 		round_three.questions=JSON.parse(questions);
	// 	}).then(function(){alert("Kay, load xong vòng 3, triển đi");});
	// },
	update_status: function(){
		disabled($("#true_3_btn"));
		disabled($("#false_3_btn"));
		disabled($("#show_ans_3_btn"));
		disabled($("#sort_ans_3_btn"));
		// disabled($("#next_ques_3_btn"));
		$("#ques_3").html(round_three.questions[curques].ques+" ["+round_three.questions[curques].type+"]");
		if(round_three.questions[curques].type == "vid"){
			for(var i=1;i<=6;i++){
				document.getElementById("stt_tt"+i).style.background="#ff0000";
			}
		}
		else{
			for(var i=1;i<=6;i++){
				document.getElementById("stt_tt"+i).style.background="#00ff00";
			}
		}
		round_three.answer = [{ans:"", time:0.00},{ans:"", time:0.00},{ans:"", time:0.00},{ans:"", time:0.00}];
	},
	correct: function(){
		round_three.remain=3;
		for(i in round_three.pos){
			if(round_three.judgearr[round_three.pos[i]]){
				update_score(round_three.pos[i],round_three.score[round_three.remain])
				$("#con"+parseInt(parseInt(round_three.pos[i])+1)+"_score").html(contestants[round_three.pos[i]].score);
				round_three.remain--;
			}
		};
		send_mess("controller","contestants","correct");
		send_mess("controller","viewer","correct");
	},
	judge: function(id){
		if(round_three.judgearr[id]){
			round_three.judgearr[id]=false;
			document.getElementById("tt_ans"+parseInt(parseInt(id)+1)).style.border="1px solid #ff0000";
		}
		else{
			round_three.judgearr[id]=true;
			document.getElementById("tt_ans"+parseInt(parseInt(id)+1)).style.border="1px solid #00b300";
		}
	},
	start: function(){
		send_mess("controller","contestants","start");
		send_mess("controller","viewer","start");
		tick(30,$("#timer_3"));
		setTimeout(function() {
			enabled($("#true_3_btn"));
			enabled($("#false_3_btn"));
			enabled($("#show_ans_3_btn"));
			enabled($("#sort_ans_3_btn"));
			enabled($("#next_ques_3_btn"));
		}, 30000);
	},
	sort:function(){
		for(var i=0;i<3;i++){
			for(var j=parseInt(i)+1;j<4;j++){
				if(round_three.answer[round_three.pos[i]].time>round_three.answer[round_three.pos[j]].time){
					round_three.pos[i]=parseInt(round_three.pos[i])+parseInt(round_three.pos[j]);
					round_three.pos[j]=round_three.pos[i]-round_three.pos[j];
					round_three.pos[i]=round_three.pos[i]-round_three.pos[j];
				}
			}
		}
	},
	wrong: function(){
		send_mess("controller","viewer","wrong");
	},
	showans: function(){
		var data=JSON.stringify(round_three.answer);
		data=b64EncodeUnicode(data);
		console.log(data);
		_fetch("/apix/update_file",{
			file:`static/data/${curmatch}_anstt.txt`,
			data:data
		}).then(function(){
			send_mess("controller","viewer","showans");
		})
	},
	load_question: function(){
		_fetch("/apix/read_file",{file:`static/data/${curmatch}_3_question.txt`}).then((res) => {
			res=b64DecodeUnicode(res);
			round_three.questions=JSON.parse(res);
		}).then(() => {alert("Done")});
		send_mess("controller","contestants","loadques");
		send_mess("controller","viewer","loadques");
	},
	show: function(){
		send_mess("controller","contestants","showques");
		send_mess("controller","viewer","showques");
	},
	nextques: function(){
		curques++;
		$("#curques_edit").val(curques);
		if (curques<4)
		{
			send_mess("controller","contestants","nextques");
			send_mess("controller","viewer","nextques");
		}
		else
		{
			send_mess("controller","contestants","quit");
			send_mess("controller","viewer","quit");
		}
		round_three.update_status();
		round_three.answer = [{ans:"", time:0.00},{ans:"", time:0.00},{ans:"", time:0.00},{ans:"", time:0.00}];
	},
	showVid: function() {
		send_mess("controller","viewer","showVid");
	}
}

const round_four = {
	quesid: 0,
	questions: [],
	// scs:[[10,10,20],[10,20,30],[20,30,30]],
	scs: [10, 20, 30],
	// time:[[10,10,15],[10,15,20],[15,20,20]],
	time: [10, 15, 20],
	taker : -1,
	star : false,
	update_status:function(){
		$("#choosepack").val(curpack);
		$("#numques4").html(parseInt(parseInt(curques)+1));
		for(var i=1;i<=4;i++){
			document.getElementById("stt"+i+"_tab").style.background="";
		}
		try{
			document.getElementById("stt"+parseInt(parseInt(curcon)+1)+"_tab").style.background="#00b300";
			if(curques<3){
				$("#ques_4").html(round_four.questions[curcon][curpack][curques]);
			}
			else{
				$("#ques_4").html("Done");
			}
		}
		catch(err){
			console.log("Error"+err);
		}
	},
	save_question: function(){
		var data=[];
		for(var i=0;i<4;i++){
			var subdata=[];
			for(var j=0;j<3;j++){
				var subsubdata=[];
				for(var z=0;z<3;z++){
					subsubdata.push($("#save_ques4_"+parseInt(parseInt(i)+1)+"_"+parseInt(parseInt(j)+1)+"_"+parseInt(parseInt(z)+1)).val());
				};
				subdata.push(subsubdata);
			};
			data.push(subdata);
		};
		data=JSON.stringify(data);
		data=b64EncodeUnicode(data);
		_fetch("/apix/update_file",{
			file: `static/data/${curmatch}_4_question.txt`,
			data: data
		}).then(function(callback){
			//alert(`Hay đấy :v Kiểu này được coi blitzkrieg rồi <(")`);
		});
		$("#load_ques_4_btn").click();
	},
	load_question:function(){
		_fetch("/apix/read_file", {file: `/static/data/${curmatch}_4_question.txt`}).then((callback) => {
			round_four.questions=b64DecodeUnicode(callback);
			round_four.questions=JSON.parse(round_four.questions);
		}).then(function(){alert("Vòng 4 nè :v");});
		send_mess("controller","contestants","loadques");
		send_mess("controller","viewer","loadques");
	},
	showvid: function() {
		send_mess("controller","viewer","showvid");
	},
	next:function(){
		curcon++;
		curques=-1;
		curpack=0;
		$("#curcon_edit").val(curcon);
		for(var i=1;i<=4;i++){
			document.getElementById("stt"+i+"_tab").style.background="";
		}
		if(curcon<4){
			document.getElementById("stt"+parseInt(parseInt(curcon)+1)+"_tab").style.background="#00b300";
		}
		else{
			$("#ques_4").html("よしししししししし！");
		}
		send_mess("controller","contestants","next");
		send_mess("controller","viewer","next");
		enabled($("#hope_4_btn"));
	},
	showpack:function(){
		send_mess("controller","viewer","showpack");
	},
	choosepack:function(){
		send_mess("controller","contestants","pack"+$("#choosepack").val());
		send_mess("controller","viewer","pack"+$("#choosepack").val());
		curpack=$("#choosepack").val();
		$("#curpack_edit").val(curpack);
		$("#ques_4").html(round_four.questions[curcon][curpack][curques]);
		for (var i = 0; i < 3; i++) {
			$('#vd_ques' + parseInt(i + 1)).html(round_four.questions[curcon][curpack][i])
		}
		// curques=-1;
		$("#curques_edit").val(curques);
	},
	showques:function(){
		send_mess("controller","contestants","showques");
		send_mess("controller","viewer","showques");
		disabled($("#true_4_btn"));disabled($("#false_4_btn"));disabled($("#waitttt_4_btn"));
	},
	start:function(){
		send_mess("controller","contestants","start");
		send_mess("controller","viewer","start");
		tick(round_four.time[curpack],$("#timer_4"));
		setTimeout(function() {
		enabled($("#true_4_btn"));enabled($("#false_4_btn"));enabled($("#waitttt_4_btn"));}, round_four.time[curpack]*1000);
	},
	wait:function(){
		$("#choosevd").empty()
		$("#choosevd").append($('<option',{
			text: '-'
		}))
		send_mess("controller","contestants","wait");
		send_mess("controller","viewer","wait");
	},
	correct:function(){
		let score=round_four.scs[curpack];
		if(round_four.taker==-1){
			if(round_four.star){
				score*=2;
			}
			update_score(curcon,score)
			$("#con"+parseInt(parseInt(curcon)+1)+"_score").html(contestants[curcon].score);
		}
		else{
			// b correct and a wrong, a -= x, b += x, keme sao
			update_score(round_four.taker,score)
			$("#con"+parseInt(parseInt(round_four.taker)+1)+"_score").html(contestants[round_four.taker].score);
			score=-score;
			update_score(curcon,score)
			$("#con"+parseInt(parseInt(curcon)+1)+"_score").html(contestants[curcon].score);
		}
		send_mess("controller","contestants","correct");
		send_mess("controller","viewer","correct");
	},
	wrong:function(){
		let score=0;
		if(round_four.taker==-1){ // click wrong button after 5s waiting 
			if(round_four.star){
				score=parseInt(-round_four.scs[curpack]);
				update_score(curcon,score)
				$("#con"+parseInt(parseInt(curcon)+1)+"_score").html(contestants[curcon].score);
			}
		}
		else{
			score=parseInt(-round_four.scs[curpack]/2);
			update_score(round_four.taker,score)
			$("#con"+parseInt(parseInt(round_four.taker)+1)+"_score").html(contestants[round_four.taker].score);
			if(round_four.star){
				score=parseInt(-round_four.scs[curpack]);
				update_score(curcon, score);
				$("#con"+parseInt(parseInt(curcon)+1)+"_score").html(contestants[curcon].score);
			}
		}
		send_mess("controller","contestants","wrong");
		send_mess("controller","viewer","wrong");
	},
	hope:function(){
		disabled($("#hope_4_btn"));
		round_four.star=true;
		send_mess("controller","contestants","hope");
		send_mess("controller","viewer","hope");
	},
	nextques:function(){
		round_four.star=false;
		curques++;
		$("#curques_edit").val(curques);
		$("#numques4").html(parseInt(parseInt(curques)+1));
		if(curques<3){
			$("#ques_4").html(round_four.questions[curcon][curpack][round_four.quesid]);
		}
		else{
			$("#ques_4").html("Done");
		}
		round_four.taker=-1;
		send_mess("controller","contestants","nextques");
		send_mess("controller","viewer","nextques");
		for(var i=0;i<4;i++){
			if(i!=curcon){
				document.getElementById("stt"+parseInt(parseInt(i)+1)+"_tab").style.background="";
			}
		}
		$("#choosevd").empty()
		$("#choosevd").append($('<option',{
			text: '-'
		}))
	},
	chooseques: function(id){
		send_mess('controller', 'contestants', 'chooseques'+id);
		send_mess('controller', 'mc', 'chooseques'+id);
		send_mess('controller', 'viewer', 'chooseques'+id);
		round_four.quesid = id;
		$("#ques_4").html(round_four.questions[curcon][curpack][round_four.quesid]);
	},
}

const round_five = {
	questions : [],
	clicked: [0, 0, 0, 0],
	save_question_5: () => {
		var data = [];
		for (let i=1;i<14;i++) data.push($(`#save_ques5_${i}`).val()||"");
		data = JSON.stringify(data);
		data = b64EncodeUnicode(data);
		_fetch("/apix/update_file",{
			file: `static/data/${curmatch}_5_question.txt`,
			data: data
		}).then(() => {
			alert(`Hay đấy :v Kiểu này được coi blitzkrieg rồi <(")`);
		});
	},
	load_question: () => {
		_fetch("/apix/read_file", {file: `static/data/${curmatch}_5_question.txt`}).then((callback) => {
			callback = b64DecodeUnicode(callback)
			round_five.questions = JSON.parse(callback)
		}).then(() => {alert("Dăm ba cái câu hỏi phụ load xong r")})
	},
	update_status: () => {
		$("#numques5").html(parseInt(parseInt(curques) + 1))
		$("#ques_5").html(round_five.questions[curques])
		$("#name_5").empty()
		for(var i = 0; i < 4; i++){
			document.getElementById("stt"+parseInt(parseInt(i)+1)+"_tab").style.background="";
		}
		$("#name_5").empty()
		round_five.clicked = [0, 0, 0, 0]
	},
	correct: () => {
		let con=parseInt($("#name_5 option:selected").val());
		update_score(con,10);
		$("#con"+parseInt(con+1)+"_score").html(contestants[con].score);
		send_mess("controller", "viewer", "correct");
		send_mess("controller", "contestants","correct");
	},
	wrong: () => {
		send_mess("controller", "viewer", "wrong");
	},
	start: () => {
		send_mess("controller", "contestants", "start");
		send_mess("controller", "viewer", "start");
	},
	next: () => {
		disabled($("#time_resume"));
		$("#curques_edit").val(parseInt(parseInt(curques) + 1));
		save_status();
		send_mess("controller", "viewer", "next");
		send_mess("controller", "contestants", "next");
	}
}
$("#time_resume").on('click', function(){
	disabled($("#time_resume"));
	send_mess("controller", "viewer", "resume");
	send_mess("controller","contestants","resume");
});
let t;
socket.on("message",function(msg){
	msg=b64DecodeUnicode(msg);
	msg=JSON.parse(msg);
	let receiver=msg[0].receiver;
	let content=msg[0].content;
	let sender = msg[0].sender;
	if(receiver == "controller"){
		switch(content){
			case "CNV":{
				if (round_two.CNV[parseInt(sender)]) return;
				round_two.CNV[parseInt(sender)]=true;
				round_two.count++;
				console.log(sender);

				$("#cnv_"+parseInt(round_two.count)).html(contestants[parseInt(sender)].name);
				document.getElementById("cnv_"+parseInt(round_two.count)).style.display="block";
				$("#chooseCNV").append($(`<option>`,{
					value:sender,
					text:contestants[parseInt(sender)].name
				}));
			};
			break;
			case "ok":{
				if(sender=="viewer"){
					document.getElementById("sttscr").style.background="#00ff00";
				}
				else{
					if(sender == "mc")
						document.getElementById("sttmc").style.background="#00ff00";
					else
						document.getElementById("stt"+parseInt(parseInt(sender)+1)).style.background="#00ff00";
				}
			};
			break;
			case "loaded":{
				if(sender=="viewer"){
					document.getElementById("stt_tt5").style.background="#00ff00";
				}
				else{
					if(sender == "mc"){
						document.getElementById("stt_tt6").style.background="#00ff00";
					}
					else{
						document.getElementById("stt_tt"+parseInt(parseInt(sender)+1)).style.background="#00ff00";
					}
				}
			};
			break;
			case "sound_ok": {
				console.log("SOUND OK")
			}
			break;
			default:
				if (content.startsWith("fu"))
				{
					if(curround == 3){
						if(round_four.taker==-1){
							round_four.taker=parseInt(sender);
							document.getElementById("stt"+parseInt(parseInt(round_four.taker)+1)+"_tab").style.background="#ff8000";
							$("#choosevd").append($(`<option>`,{
								value: round_four.taker,
								text: contestants[round_four.taker].name
							}))
						}
					}
					else{
						console.log(contestants[sender].name);
						if(round_five.clicked[sender]) return;
						round_five.clicked[sender] = 1;
						t=JSON.parse(content.slice(2,content.length));
						if (!t)
						{
							enabled($("#time_resume"));
							send_mess("controller","viewer", "pause");
							send_mess("controller","contestants","pause");
							document.getElementById("stt"+parseInt(parseInt(sender)+1)+"_tab").style.background="#ff8000";
							$("#name_5").append($(`<option>`,{
								value: parseInt(sender),
								text:contestants[sender].name
							}));
						}
						else document.getElementById("stt"+parseInt(parseInt(sender)+1)+"_tab").style.background="#ff0000";
					}
				}
				if (content.startsWith("time") && !t)
				{
					t=!1;
					send_mess("controller","contestants","stime"+JSON.parse(content.slice(-content.length+4)));
					send_mess("controller","viewer","stime"+JSON.parse(content.slice(-content.length+4)));
				}
		}
		if(content.slice(0,6) == "answer"){
			//alert(content);
			let rnd=parseInt(content.slice(6,7));
			if(rnd == 1){
				round_two.ans[parseInt(sender)]=content.slice(7,content.length);
				$("#cnv_ans"+parseInt(parseInt(sender)+1)).html(content.slice(7,content.length));
			}
			else{
				let ans = content.slice(7,content.length);
				ans = b64DecodeUnicode(ans);
				ans = JSON.parse(ans);
				round_three.answer[sender] = ans;
				$("#tt_ans"+parseInt(parseInt(sender)+1)).html(ans.ans);
				$("#tt_time"+parseInt(parseInt(sender)+1)).html(ans.time);
			}
			return;
		}
		if(content.slice(0,7) == "message"){
			let mess = content.slice(7);
			$("#message").html(mess);
			if($("#close2").html() == "&lt;") sidenav(2);
			return;
		}
	}
});

// document.getElementById("mcmessage").keypress((event) => {
// 	let keycode = (event.keyCode ? event.keyCode : event.which);
// 	if(keycode==13){
// 		if(this.val() != ""){
// 			send_mess("controller", "viewer", "message" + this.val())
// 			this.val("");
// 		}
// 	}
// })

const mcmessage = $("#mcmessage")

mcmessage.change(() => {
	send_mess('controller', 'viewer', 'message' + mcmessage.val())
	mcmessage.val('');
	console.log(mcmessage.val());
})

// $(document).ready(function(){
// 	load_contestant().then((list) => {
// 		for(index in list){
// 			contestants.push({
// 				name: list[index].name,
// 				score: list[index].score
// 			});
// 		}
// 	});
// });
