from flask import Flask, request

app = Flask(__name__)


@app.route('/')
def hello_world():  # put application's code here
    return 'Hello World!'

@app.route('/signup/', methods = ['POST'])
def signup():
    form_data = request.form
    return "K"
 

if __name__ == '__main__':
    app.run()
