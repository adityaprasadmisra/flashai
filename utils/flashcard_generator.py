import json, os, urllib.request, math

def generate_flashcards(topic, count=10):
    easy   = math.ceil(count * 0.25)
    hard   = math.ceil(count * 0.25)
    medium = count - easy - hard
    prompt = (
        "Create " + str(count) + " flashcards about: " + topic + "\n"
        "First " + str(easy) + " EASY, next " + str(medium) + " MEDIUM, last " + str(hard) + " ADVANCED.\n"
        "IMPORTANT: Return ONLY a JSON array. No markdown. No extra text.\n"
        '[{"question":"...","answer":"..."}]'
    )
    payload = json.dumps({
        "model": "llama3",
        "messages": [{"role": "user", "content": prompt}],
        "stream": False,
        "options": {
            "num_predict": 800,
            "temperature": 0.3,
            "num_ctx": 2048
        }
    }).encode()
    req = urllib.request.Request(
        "http://localhost:11434/api/chat",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=300) as r:
        data = json.loads(r.read().decode())
    raw = data["message"]["content"].strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"): raw = raw[4:]
        raw = raw.strip()
    s = raw.find("["); e = raw.rfind("]") + 1
    if s != -1 and e > s: raw = raw[s:e]
    return json.loads(raw)
