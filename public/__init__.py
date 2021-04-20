from flask import Flask, render_template

app = Flask(__name__)
app.config['SECRET_KEY'] = 'vigorous'

################################
# Error handling configuration #
################################

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