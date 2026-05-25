import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4">
      <h1 className="text-5xl font-bold">404</h1>
      <p className="text-slate-600 max-w-xl">Sorry, we couldn't find the page you were looking for. Check the URL or go back to the homepage.</p>
      <Link to="/" className="btn-primary">Return Home</Link>
    </div>
  )
}
