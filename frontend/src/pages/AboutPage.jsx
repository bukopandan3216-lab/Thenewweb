export default function AboutPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">About FarmDirect</h1>
        <p className="text-slate-600 mt-2">FarmDirect is a local marketplace connecting Philippine farmers with buyers seeking fresh produce.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-8">
          <h2 className="text-xl font-semibold">Our mission</h2>
          <p className="mt-4 text-slate-700">To make fresh, transparent, and sustainable produce available by cutting out unnecessary middlemen and supporting local farm communities.</p>
        </div>
        <div className="card p-8">
          <h2 className="text-xl font-semibold">What we offer</h2>
          <ul className="mt-4 space-y-3 text-slate-700 list-disc list-inside">
            <li>Verified farmers and trusted stores</li>
            <li>Easy cart and checkout flow</li>
            <li>Seller dashboards and order tracking</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
