import React, { useState, useEffect } from 'react'

interface TaxProfile {
  domain: string
  country_code: string
  currency_preference: string
  tax_id?: string
}

export const GlobalTaxDashboard = () => {
  const [profiles, setProfiles] = useState<TaxProfile[]>([])

  useEffect(() => {
    fetch('/api/v1/global/tax/all-profiles')
      .then(r => r.json())
      .then(d => setProfiles(d.profiles || []))
  }, [])

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">🌍 Global Tax & Currency Profiles</h1>
      
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Domain</th>
              <th className="text-left p-3">Country</th>
              <th className="text-left p-3">Currency</th>
              <th className="text-left p-3">Tax ID / VAT #</th>
              <th className="text-left p-3">Tax Rule</th>
            </tr>
          </thead>
          <tbody>
            {profiles.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-400">
                  No profiles configured yet
                </td>
              </tr>
            ) : (
              profiles.map(p => (
                <tr key={p.domain} className="border-t">
                  <td className="p-3 font-mono">@{p.domain}</td>
                  <td className="p-3 font-medium">{p.country_code}</td>
                  <td className="p-3 font-bold">{p.currency_preference}</td>
                  <td className="p-3 text-xs">
                    {p.tax_id || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="p-3">
                    {p.tax_id && /^(EU|VAT)/i.test(p.tax_id) ? (
                      <span className="text-blue-600">Reverse Charge</span>
                    ) : p.country_code === 'TH' ? (
                      <span className="text-green-600">VAT 7%</span>
                    ) : (
                      <span className="text-gray-500">Standard</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Tax Reference */}
      <div className="mt-8 bg-gray-50 rounded-xl p-5">
        <h2 className="font-semibold mb-3">📋 Supported Tax Jurisdictions</h2>
        <div className="grid grid-cols-4 gap-3 text-xs">
          {[
            {code:'TH',name:'Thailand',rate:'7%'},
            {code:'GB',name:'UK',rate:'20%'},
            {code:'DE',name:'Germany',rate:'19%'},
            {code:'FR',name:'France',rate:'20%'},
            {code:'AU',name:'Australia',rate:'10% GST'},
            {code:'IN',name:'India',rate:'18% GST'},
            {code:'JP',name:'Japan',rate:'10%'},
            {code:'KR',name:'South Korea',rate:'10%'},
          ].map(c => (
            <div key={c.code} className="bg-white p-2 rounded-lg">
              <span className="font-bold">{c.code}</span> — {c.name}<br/>
              <span className="text-green-600">{c.rate}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
