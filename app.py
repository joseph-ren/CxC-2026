from flask import Flask, render_template, request, jsonify
import sqlite3
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

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


@app.route("/api/listings", methods=["GET"])
def api_listings():
    # optional query params: budget, location, amenities (comma-separated)
    budget = request.args.get("budget", type=int)
    location = request.args.get("location", default=None, type=str)
    amenities_q = request.args.get("amenities", default=None, type=str)

    params = []
    where = []

    if budget is not None:
        where.append("price <= ?")
        params.append(budget)
    if location:
        where.append("LOWER(location) = ?")
        params.append(location.lower())

    q = "SELECT title, price, location, amenities FROM listings"
    if where:
        q += " WHERE " + " AND ".join(where)

    conn = get_db()
    c = conn.cursor()
    c.execute(q, tuple(params))
    rows = c.fetchall()
    conn.close()

    listings = []
    for r in rows:
        listings.append({
            "title": r[0],
            "price": r[1],
            "location": r[2],
            "amenities": r[3].split(",") if r[3] else []
        })

    # If amenities query present, sort by match score
    if amenities_q:
        wanted = [a.strip() for a in amenities_q.split(",") if a.strip()]
        listings = sorted(listings, key=lambda l: match_score(wanted, l["amenities"]), reverse=True)

    return jsonify(listings)

if __name__ == "__main__":
    app.run(debug=True)
