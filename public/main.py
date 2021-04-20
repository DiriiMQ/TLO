import json
import os
from flask import render_template, request, Flask
from flask_socketio import SocketIO, send
import base64
# from . import app

app=Flask(__name__)
app.config['SECRET_KEY']='mysecret'
socketio=SocketIO(app) 

@socketio.on("message")
def handle_message(message):
	send(message, broadcast = True)

@app.route("/index")
@app.route("/")
def index():
	return render_template("index.html")

@app.route("/contact")
def contact():
	return "You can't contact me now."

@app.route("/controller")
def control():
	return render_template("control.html")

@app.route("/viewer/rounds/<int:id>")
def viewer(id):
	return render_template("rounds/" + str(id) + "_viewer.html")

@app.route("/contestant/rounds/<int:rnd>/<int:id>")
def contestant(rnd,id):
	return render_template("rounds/" + str(rnd) + "_" + str(id) + "_contestant.html")

@app.route("/summary")
def summary():
	return render_template("rounds/summary.html");

@app.route("/load")
def load():
	return render_template("rounds/load.html");

@app.route("/apix/update_file")
def update_file():
	file = request.args.get("file")
	data = request.args.get("data")
	link = os.path.join(os.path.dirname(__file__),file)

	with open(link, "w") as content:
		content.write(data)

	ret = {
		"success": True
	}
	return str(json.dumps(ret))

@app.route("/apix/read_file")
def read_file():
	file = request.args.get("file")
	link = os.path.join(os.path.dirname(__file__),file)
	print(os.path.dirname(__file__))
	obj=open(link).read()

	return obj

@app.errorhandler(404)
def error_404(e):
	return render_template("error_template.html",
		error_code = 404,
		error_name = ("Page not found"),
		error_message = ("The page you're looking for does not exits."),
		image_caption = ("Here's a cute Hatsune Miku because we like it.<br />Not really related, but whatever."),
		image = "images/error_pages/miku.jpg"), 404

@app.errorhandler(400)
def error_400(e):
	return render_template("error_template.html",
		error_code = 400,
		error_name = ("Bad request"),
		error_message = ("Your request couldn't be understood by the server."),
		image_caption = ("Patchouli Knowledge is not happy that you might be doing nasty things to the server."),
		image = "images/error_pages/patchouli.jpg"), 400

@app.errorhandler(403)
def error_403(e):
	return render_template("error_template.html",
		error_code = 403,
		error_name = ("Forbidden"),
		error_message = ("You just tried to access something which you don't have the required permission to do so."),
		image_caption = ("Patchouli Knowledge is not happy that you might be doing nasty things to the server."),
		image = "images/error_pages/patchouli.jpg"), 403

@app.errorhandler(500)
def error_500(e):
	return render_template("error_template.html",
		error_code = 500,
		error_name = ("Internal Server Error"),
		error_message = ("The server encountered an internal error and was unable to complete your request."),
		image_caption = ("Flandre Scarlet is sad because she couldn't fulfill this request <br />(don't worry though, we have been notified of this issue and will try to fix this issue as soon as possible)"),
		image = "images/error_pages/sad_flandre.jpg"), 500

if __name__=='__main__':
	socketio.run(app,port=9999)

# set FLASK_APP=main.py
# set FLASK_DEBUG=1
# flask run --host=169.254.150.171