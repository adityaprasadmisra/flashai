# ⚡ FlashAI — Local AI Flashcard Generator

> Generate intelligent, adaptive flashcards from any topic — powered entirely by local AI. No API keys. No internet. No subscriptions. Ever.

![FlashAI](https://img.shields.io/badge/Built%20With-Flask-black?style=flat-square)
![Ollama](https://img.shields.io/badge/AI-Ollama%20%2B%20Llama3-white?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-gray?style=flat-square)
![Python](https://img.shields.io/badge/Python-3.10%2B-black?style=flat-square)

---

## 📸 Preview

FlashAI features a cinematic **WebGL plasma shader background** with a clean black & white editorial UI built on `Instrument Serif` + `DM Mono` typography. The flashcards use a smooth 3D CSS flip animation with adaptive difficulty progression.

---

## ✨ Features

- **Local AI Generation** — Runs entirely on your machine using Ollama + Llama 3. Zero cloud calls.
- **Adaptive Difficulty** — Every session is split: 25% Easy → 50% Medium → 25% Advanced cards.
- **Custom Card Count** — Choose 5, 10, 15, or 20 cards per session.
- **3D Flip Animation** — Cinematic CSS perspective flip to reveal answers.
- **Keyboard Navigation** — Use `←` `→` arrow keys and `Space` to navigate and flip.
- **WebGL Background** — Real-time plasma shader animation rendered in WebGL.
- **100% Private** — No data ever leaves your machine.
- **Zero Cost** — No OpenAI, no Gemini, no subscriptions required.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.10+, Flask |
| AI Engine | Ollama + Llama 3 (local) |
| Frontend | HTML5, CSS3, Vanilla JS |
| Background | WebGL (custom GLSL shader) |
| Typography | Instrument Serif + DM Mono |
| Config | python-dotenv |

---

## 📁 Project Structure

```
flashai-final/
│
├── app.py                        # Flask routes (GET /, POST /generate)
├── config.py                     # Config loader from .env
├── requirements.txt              # Python dependencies
├── .env.example                  # Environment variable template
├── README.md                     # You are here
│
├── static/
│   ├── css/
│   │   └── style.css             # Full UI styles (B&W theme, animations)
│   └── js/
│       ├── shader.js             # WebGL plasma background shader
│       └── script.js             # Flashcard logic, flip, navigation
│
├── templates/
│   ├── base.html                 # Base layout (navbar, footer, canvas)
│   └── index.html                # Main page (input, cards, controls)
│
└── utils/
    └── flashcard_generator.py    # Ollama API call + prompt logic
```

---

## ⚙️ Prerequisites

Before running FlashAI, you need:

1. **Python 3.10+** — https://www.python.org/downloads/
2. **Ollama** — https://ollama.com/download
3. **Llama 3 model** pulled via Ollama

---

## 🚀 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/adityaprasadmisra/flashai.git
cd flashai
```

### 2. Create a virtual environment (recommended)

```bash
# macOS / Linux
python -m venv venv
source venv/bin/activate

# Windows (PowerShell)
python -m venv venv
venv\Scripts\activate
```

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
```

### 4. Install Ollama and pull the model

Download Ollama from https://ollama.com/download and install it.

Then pull the AI model:

```bash
# If you have 8+ GB RAM — use Llama 3 (recommended)
ollama pull llama3

# If you have less than 4 GB RAM — use TinyLlama
ollama pull tinyllama
```

> **Note for Windows users:** If models are stored on C: drive and you're low on space, redirect to another drive before pulling:
> ```powershell
> $env:OLLAMA_MODELS="E:\ollama-models"
> ollama pull llama3
> ```

### 5. Configure environment

```bash
cp .env.example .env
```

Open `.env` and set a secret key:

```
SECRET_KEY=your-random-secret-here
DEBUG=True
```

### 6. Run the app

```bash
# Windows (set model path if needed, then run)
$env:OLLAMA_MODELS="E:\ollama-models"
python app.py
```

```bash
# macOS / Linux
python app.py
```

Open your browser at **http://localhost:5000**

---

## 🎮 How to Use

1. **Enter a topic** — Type any subject (e.g. `Python decorators`, `DNA replication`, `Operating Systems`) or paste your own study notes.
2. **Pick card count** — Choose 5 (Quick), 10 (Standard), 15 (Deep), or 20 (Master).
3. **See the difficulty split** — The bar shows exactly how many Easy / Medium / Advanced cards you'll get.
4. **Click Generate** — Ollama runs locally and returns your flashcards in seconds.
5. **Study** — Click any card or press `Space` to flip. Use `←` `→` to navigate. Press `R` to restart.

### Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Flip current card |
| `→` or `↓` | Next card |
| `←` or `↑` | Previous card |

---

## 🧠 How the AI Works

FlashAI sends a structured prompt to Ollama's local API (`http://localhost:11434/api/chat`) with clear difficulty instructions:

```
Create 10 flashcards about: Python decorators
First 3 EASY, next 4 MEDIUM, last 3 ADVANCED.
Return ONLY a JSON array. No markdown.
[{"question":"...","answer":"..."}]
```

The response is parsed, validated, and rendered directly into the UI — no external calls made.

---

## 🖼 WebGL Shader Background

The background is a real-time GLSL fragment shader rendered on a `<canvas>` element. It features:

- **16 plasma lines** with randomized widths, offsets, and amplitudes
- **Warp distortion** — space itself bends over time
- **Floating circles** that travel along each plasma line
- **Pure black base** with white line color at 25% opacity — keeping text readable

The shader runs at 60fps and adapts to any screen size automatically.

---

## 🔧 Troubleshooting

### `HTTP Error 500: Internal Server Error` from Ollama

Your system doesn't have enough free RAM for the model.

**Fix 1** — Free up RAM by closing other apps, then try again.

**Fix 2** — Switch to TinyLlama (needs only ~800 MB RAM):

In `utils/flashcard_generator.py`, change:
```python
"model": "llama3"
```
to:
```python
"model": "tinyllama"
```

**Fix 3** — Reduce context size in the generator options:
```python
"options": {"num_predict": 600, "temperature": 0.3, "num_ctx": 512}
```

### Ollama command not found

Restart your terminal after installing Ollama — it needs a fresh PATH.

### `.env` file not loading

Make sure the file is named exactly `.env` (no `.txt` extension). On Windows, create it via PowerShell:
```powershell
notepad .env
```

---

## 📦 Requirements

```
flask==3.0.0
python-dotenv==1.0.0
```

No OpenAI SDK, no external AI dependencies — everything runs through Ollama's local HTTP API.

---

## 🗺 Roadmap

- [ ] Spaced repetition scheduling
- [ ] Save and export flashcard decks as PDF
- [ ] Support for image-based flashcards
- [ ] Multiple model support (Mistral, Phi-3, Gemma)
- [ ] Dark/light mode toggle
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Pull requests are welcome! For major changes, open an issue first to discuss what you'd like to change.

```bash
git checkout -b feature/your-feature-name
git commit -m "feat: add your feature"
git push origin feature/your-feature-name
```

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 👨‍💻 Author

**Aditya Prasad Misra**
- GitHub: [@adityaprasadmisra](https://github.com/adityaprasadmisra)

---

<p align="center">Built with Flask + Ollama + WebGL · Runs 100% locally · No API keys needed</p>
