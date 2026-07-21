import Link from 'next/link'

export default function Page() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      textAlign: 'center',
    }}>
      <h1>M365 light</h1>
      <p>Start by visiting your dashboard.</p>
      <Link
        href="/dashboard"
        style={{
          marginTop: '1rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#0070f3',
          color: '#fff',
          borderRadius: '0.5rem',
          textDecoration: 'none',
        }}>
        Go to Dashboard
      </Link>
    </main>
  )
}
