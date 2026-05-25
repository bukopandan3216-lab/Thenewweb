export default function ContactPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contact us</h1>
        <p className="text-slate-600 mt-2">Need support? Send us a message and we’ll reply as soon as possible.</p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-8">
          <h2 className="text-xl font-semibold">Customer support</h2>
          <p className="mt-4 text-slate-700">Email us at <a href="mailto:support@farmdirect.ph" className="text-brand-700">support@farmdirect.ph</a> for account or order questions.</p>
        </div>
        <div className="card p-8">
          <h2 className="text-xl font-semibold">Head office</h2>
          <p className="mt-4 text-slate-700">FarmDirect Marketplace<br />Philippines<br />Open weekdays 08:00 – 18:00</p>
        </div>
      </div>
    </div>
  )
}
