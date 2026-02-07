from flask import Flask, render_template, request
from listings import listings

app = Flask(__name__)

def match_score(user_amenities, listing_amenities):
    return len(set(user_amenities) & set(listing_amenities))

@app.route("/", methods=["GET", "POST"])
def home():
    results = []

    if request.method == "POST":
        budget = int(request.form["budget"])
        location = request.form["location"].lower()
        amenities = request.form.getlist("amenities")

        filtered = [
            l for l in listings
            if l["price"] <= budget and l["location"].lower() == location
        ]

        ranked = sorted(
            filtered,
            key=lambda l: match_score(amenities, l["amenities"]),
            reverse=True
        )

        results = ranked

    return render_template("index.html", results=results)

if __name__ == "__main__":
    app.run(debug=True)
