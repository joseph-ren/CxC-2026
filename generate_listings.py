import sqlite3
import json
from dotenv import load_dotenv
import os
import google.genai as genai

# --- Load API key ---
load_dotenv()
API_KEY = os.getenv("API_KEY")

if not API_KEY:
    raise Exception("API_KEY not found in .env")

# --- Configure Gemini ---
client = genai.Client(api_key=API_KEY)

PROMPT = """
Generate 15 realistic student sublet listings in Waterloo and Kitchener.

Rules:
- price between 500 and 1200
- realistic student style titles
- amenities chosen from: wifi, laundry, furnished, gym, parking

Return ONLY valid JSON in this exact format:

[
  {
    "title": "Furnished room near UW",
    "price": 700,
    "location": "Waterloo",
    "amenities": ["wifi", "laundry", "furnished"]
  }
]
"""

print("Calling Gemini...")

# response = model.generate_content(PROMPT)


response = client.models.generate_content(
    model="gemini-3-flash-preview", contents=PROMPT
)

ai_text = response.text.strip()
print("AI Response:")
print(ai_text)

# --- Convert AI output to Python list ---
try:
    listings = json.loads(ai_text)
except json.JSONDecodeError:
    print("Gemini returned bad JSON:")
    print(ai_text)
    exit()

# --- Insert into SQLite DB ---
conn = sqlite3.connect("database.db")
c = conn.cursor()

for l in listings:
    amenities_str = ",".join(l["amenities"])
    c.execute(
        "INSERT INTO listings (title, price, location, amenities) VALUES (?, ?, ?, ?)",
        (l["title"], l["price"], l["location"], amenities_str)
    )

conn.commit()
conn.close()

print(f"Inserted {len(listings)} AI-generated listings!")
