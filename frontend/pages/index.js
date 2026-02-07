import { useEffect, useState } from 'react'

function Header() {
  return (
    <header className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold">Listings</h1>
      <p className="text-gray-600 mt-2">Beautiful, shadcn-inspired UI built with Tailwind.</p>
    </header>
  )
}

function ListingCard({ l }) {
  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{l.title}</h2>
        <div className="text-green-600 font-bold">${l.price}</div>
      </div>
      <div className="text-sm text-gray-500 mt-1">{l.location}</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {l.amenities.map((a, i) => (
          <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">{a}</span>
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const [listings, setListings] = useState([])

  useEffect(() => {
    fetch('http://localhost:5000/api/listings')
      .then(r => r.json())
      .then(setListings)
      .catch(console.error)
  }, [])

  return (
    <div>
      <Header />
      <main className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings.length === 0 && (
            <div className="text-gray-500">No listings found.</div>
          )}
          {listings.map((l, i) => (
            <ListingCard key={i} l={l} />
          ))}
        </div>
      </main>
    </div>
  )
}
