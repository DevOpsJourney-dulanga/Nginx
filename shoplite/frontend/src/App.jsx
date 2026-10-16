import { useEffect, useState } from 'react';

export default function App() {
  const [products, setProducts] = useState([]);
  const [servedBy, setServedBy] = useState('');
  const [counts, setCounts] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/products')            // relative URL: same origin, CORS නැහැ
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(d => { setProducts(d.products); setServedBy(d.instance); })
      .catch(e => setError(e.message));
  }, []);

  // Requests 30ක් යවලා එකින් එකට උත්තර දුන් instance එක ගණන් කරනවා
  async function testLoadBalancing() {
    const tally = {};
    for (let i = 0; i < 30; i++) {
      const r = await fetch('/api/health');
      const name = r.headers.get('X-Instance') || 'unknown';
      tally[name] = (tally[name] || 0) + 1;
    }
    setCounts(tally);
  }

  return (
    <main style={{ fontFamily: 'sans-serif', maxWidth: 640, margin: '2rem auto' }}>
      <h1>ShopLite</h1>
      {error && <p style={{ color: 'crimson' }}>API error: {error}</p>}
      <p>Product list served by: <b>{servedBy}</b></p>
      <ul>
        {products.map(p => <li key={p.id}>{p.name} — ${p.price}</li>)}
      </ul>
      <button onClick={testLoadBalancing}>Send 30 requests</button>
      <pre>{JSON.stringify(counts, null, 2)}</pre>
    </main>
  );
}