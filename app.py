from flask import Flask, render_template, request
import sqlite3

app = Flask(__name__)

def get_db():
    return sqlite3.connect("database.db")

def match_score(user_amenities, listing_amenities):
    return len(set(user_amenities) & set(listing_amenities))

@app.route("/", methods=["GET", "POST"])
def home():
    results = []

    if request.method == "POST":
        budget = int(request.form["budget"])
        location = request.form["location"].lower()
        amenities = request.form.getlist("amenities")

        conn = get_db()
        c = conn.cursor()

        c.execute("""
            SELECT title, price, location, amenities
            FROM listings
            WHERE price <= ? AND LOWER(location) = ?
        """, (budget, location))

        rows = c.fetchall()
        conn.close()

        listings = []
        for r in rows:
            listings.append({
                "title": r[0],
                "price": r[1],
                "location": r[2],
                "amenities": r[3].split(",")
            })

        results = sorted(
            listings,
            key=lambda l: match_score(amenities, l["amenities"]),
            reverse=True
        )

    return render_template("index.html", results=results)

if __name__ == "__main__":
    app.run(debug=True)
