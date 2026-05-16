"""
app.py — AI Flashcard Generator
Flask entry point: routes and request handling.
"""

from flask import Flask, render_template, request, jsonify
from config import Config
from utils.flashcard_generator import generate_flashcards

app = Flask(__name__)
app.config.from_object(Config)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json(silent=True)

    if not data or not data.get("topic", "").strip():
        return jsonify({"error": "Please enter a topic or study notes."}), 400

    topic = data["topic"].strip()
    count = int(data.get("count", 10))
    count = max(5, min(count, 20))  # clamp between 5 and 20

    if len(topic) > 3000:
        return jsonify({"error": "Input is too long. Please keep it under 3000 characters."}), 400

    try:
        cards = generate_flashcards(topic, count)
        return jsonify({"flashcards": cards})
    except ValueError as e:
        return jsonify({"error": f"AI returned an unexpected response: {e}"}), 500
    except Exception as e:
        error_msg = str(e)
        return jsonify({"error": f"Generation failed: {error_msg}"}), 500


if __name__ == "__main__":
    app.run(debug=Config.DEBUG, port=5000)
