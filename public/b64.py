import base64

def inp():

	dat='[{"Thăn lợn":{"e":139,"p":19,"l":7,"c":0},"Đậu cô ve":{"e":73,"p":5,"l":0,"c":1},"Sườn lợn":{"e":187,"p":17.9,"l":12.8,"c":0},"Dứa":{"e":28,"p":0.8,"l":0,"c":0.8},"Cà chua":{"e":20,"p":0.6,"l":0.2,"c":0.8},"Giò lụa":{"e":136,"p":21.5,"l":5.5,"c":0},"Thịt gà":{"e":199,"p":20.3,"l":13.1,"c":0},"Trứng":{"e":166,"p":14.8,"l":11.6,"c":0},"Tôm":{"e":82,"p":17.6,"l":0.9,"c":0},"Tép":{"e":58,"p":11.7,"l":1.2,"c":0},"Cá chép":{"e":96,"p":16,"l":3.6,"c":0},"Mực":{"e":73,"p":16.3,"l":0.9,"c":0},"Cá thu":{"e":166,"p":18.2,"l":10.3,"c":0}}]'
	dat=str(base64.b64encode(dat.encode("UTF-8")))
	print(dat)

def out():

	dat='W3siY3Vycm91bmQiOiIzIiwiY3VyY29uIjoiLTEiLCJjdXJxdWVzIjoiLTEiLCJjdXJwYWNrIjoiMCJ9XQ==';
	# with open("4_tasks.txt","r") as inp:
	# 	dat = inp.read()
	print(dat)
	dat = base64.b64decode(dat).decode("UTF-8")
	print(dat)

out()

