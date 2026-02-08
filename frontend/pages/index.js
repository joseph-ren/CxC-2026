import { useEffect, useState } from 'react'

function Header() {
  return (
    <header className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold">Listings</h1>
      <p className="text-gray-600 mt-2">Search by budget, location, and amenities.</p>
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
        {(l.amenities || []).map((a, i) => (
          <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">{a}</span>
        ))}
      </div>
    </div>
  )
}

const AMENITY_OPTIONS = [
  'wifi',
  'parking',
  'pool',
  'gym',
  'pet-friendly'
]

export default function Home() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(false)

  // form state
  const [budget, setBudget] = useState('')
  const [location, setLocation] = useState('')
  const [amenities, setAmenities] = useState([])

  async function fetchListings(params = {}) {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      if (params.budget) qs.set('budget', params.budget)
      if (params.location) qs.set('location', params.location)
      if (params.amenities && params.amenities.length) qs.set('amenities', params.amenities.join(','))

      // Use direct backend URL during development to avoid proxy issues.
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'
      const direct = `${backendBase}/api/listings${qs.toString() ? `?${qs.toString()}` : ''}`

      const res = await fetch(direct, { headers: { 'Accept': 'application/json' } })
      if (!res.ok) {
        console.warn('Backend fetch failed:', res.status)
        setListings([])
        return
      }

      const data = await res.json()
      setListings(data)
    } catch (err) {
      console.error(err)
      setListings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // initial load: fetch all
    fetchListings()
  }, [])

  function toggleAmenity(a) {
    setAmenities(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

  function onSubmit(e) {
    e.preventDefault()
    const params = {}
    if (budget) params.budget = budget
    if (location) params.location = location
    if (amenities.length) params.amenities = amenities
    fetchListings(params)
  }

  function onReset() {
    setBudget('')
    setLocation('')
    setAmenities([])
    fetchListings()
  }

  return (
    <div>
      <Header />
      <main className="max-w-4xl mx-auto px-4">
        <form onSubmit={onSubmit} className="bg-white p-4 rounded shadow mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Budget (max)</label>
              <input type="number" value={budget} onChange={e => setBudget(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. New York" className="mt-1 block w-full border rounded px-3 py-2" />
            </div>
          </div>

          <div className="mt-3">
            <div className="text-sm font-medium text-gray-700">Amenities</div>
            <div className="flex flex-wrap mt-2 gap-2">
              {AMENITY_OPTIONS.map(a => (
                <label key={a} className={`inline-flex items-center px-2 py-1 border rounded ${amenities.includes(a) ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
                  <input type="checkbox" checked={amenities.includes(a)} onChange={() => toggleAmenity(a)} className="mr-2" />
                  <span className="text-sm">{a}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Search</button>
            <button type="button" onClick={onReset} className="px-4 py-2 border rounded">Reset</button>
          </div>
        </form>

        {loading ? (
          <div className="text-center text-gray-500">Loading…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.length === 0 && (
              <div className="text-gray-500">No listings found.</div>
            )}
            {listings.map((l, i) => (
              <ListingCard key={i} l={l} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
