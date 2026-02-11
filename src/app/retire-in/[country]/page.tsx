import { Metadata } from 'next';
import { countries } from '@/data/countries';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// Map URL slugs to country codes
const slugToCode: Record<string, string> = {
  'portugal': 'PT', 'spain': 'ES', 'mexico': 'MX', 'thailand': 'TH',
  'costa-rica': 'CR', 'italy': 'IT', 'greece': 'GR', 'france': 'FR',
  'germany': 'DE', 'netherlands': 'NL', 'ireland': 'IE', 'uk': 'UK',
  'united-kingdom': 'UK', 'canada': 'CA', 'australia': 'AU',
  'japan': 'JP', 'new-zealand': 'NZ', 'colombia': 'CO', 'panama': 'PA',
  'malaysia': 'MY', 'vietnam': 'VN', 'switzerland': 'CH',
  'uae': 'AE', 'dubai': 'AE', 'singapore': 'SG', 'united-states': 'US',
  'usa': 'US', 'south-korea': 'KR', 'indonesia': 'ID',
};

const codeToSlug: Record<string, string> = Object.fromEntries(
  Object.entries(slugToCode).map(([slug, code]) => [code, slug])
);

// Country-specific SEO content
function getCountryContent(code: string) {
  const c = countries[code];
  if (!c) return null;

  const taxHighlight = c.capitalGains.longTerm[0]?.rate === 0
    ? 'zero capital gains tax'
    : `${(c.capitalGains.longTerm[0]?.rate * 100).toFixed(0)}% capital gains tax`;

  const colIndex = c.costOfLiving.index;
  const colCompare = colIndex < 40 ? 'very low' : colIndex < 60 ? 'moderate' : colIndex < 80 ? 'relatively high' : 'high';

  const visaInfo = c.expatRules?.specialRegimes?.[0];
  const visaSummary = visaInfo 
    ? `${visaInfo.name} available — ${visaInfo.benefits}`
    : 'Various residency options available';

  const healthcareSummary = c.healthcare.publicAccessForResidents
    ? `Public healthcare available for residents (estimated $${c.healthcare.estimatedAnnualCostPostRetirement.toLocaleString()}/year post-retirement)`
    : `Private healthcare recommended (estimated $${c.healthcare.estimatedAnnualCostPostRetirement.toLocaleString()}/year)`;

  return { c, taxHighlight, colCompare, visaSummary, healthcareSummary, colIndex };
}

export async function generateStaticParams() {
  return Object.keys(slugToCode).map(country => ({ country }));
}

export async function generateMetadata({ params }: { params: { country: string } }): Promise<Metadata> {
  const code = slugToCode[params.country];
  const c = code ? countries[code] : null;
  if (!c) return {};

  const title = `Retire in ${c.name} — FIRE Calculator & Guide`;
  const description = `Calculate your FIRE number for ${c.name}. Compare taxes, cost of living, healthcare, and visa requirements. Free early retirement calculator for ${c.name}.`;

  return {
    title,
    description,
    keywords: [
      `retire in ${c.name}`, `${c.name} FIRE calculator`, `${c.name} retirement`,
      `${c.name} cost of living`, `${c.name} retirement visa`, `early retirement ${c.name}`,
      `${c.name} taxes retirees`, `FIRE ${c.name}`, `expat ${c.name}`,
    ],
    openGraph: {
      title,
      description,
      url: `https://wheretofire.com/retire-in/${params.country}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://wheretofire.com/retire-in/${params.country}`,
    },
  };
}

export default function RetireInCountryPage({ params }: { params: { country: string } }) {
  const code = slugToCode[params.country];
  if (!code) notFound();

  const content = getCountryContent(code);
  if (!content) notFound();

  const { c, taxHighlight, colCompare, visaSummary, healthcareSummary, colIndex } = content;

  // Get related countries for internal linking
  const relatedCountries = Object.entries(slugToCode)
    .filter(([_, relCode]) => relCode !== code && countries[relCode])
    .slice(0, 8)
    .map(([slug, relCode]) => ({ slug, ...countries[relCode] }));

  // Top income tax bracket
  const topBracket = c.incomeTax.brackets[c.incomeTax.brackets.length - 1];
  const topIncomeTax = topBracket ? `${(topBracket.rate * 100).toFixed(0)}%` : 'N/A';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Hero */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
          <Link href="/" className="text-blue-600 dark:text-blue-400 text-sm hover:underline mb-4 block">
            ← Back to WhereToFIRE Calculator
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            {c.flag} Retire in {c.name}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
            Everything you need to know about early retirement in {c.name} — taxes, cost of living,
            healthcare, visa options, and how to calculate your FIRE number.
          </p>
          <div className="mt-6">
            <Link
              href={`/?to=${code}`}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔥 Calculate Your FIRE Number for {c.name}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">
        {/* Quick Facts */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quick Facts</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Currency</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{c.currencySymbol} {c.currency}</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Cost of Living</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{colCompare}</div>
              <div className="text-xs text-gray-400">Index: {colIndex}/100</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Capital Gains</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{taxHighlight}</div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">Top Income Tax</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{topIncomeTax}</div>
            </div>
          </div>
        </section>

        {/* Tax Overview */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Taxes for Retirees in {c.name}
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700 space-y-4">
            <p className="text-gray-700 dark:text-gray-300">
              {c.name} has {taxHighlight} on long-term investments. The income tax system uses progressive
              brackets with a top rate of {topIncomeTax}. For FIRE retirees living off investment income,
              the effective tax rate is typically much lower than the top bracket since most withdrawals
              come from capital gains rather than earned income.
            </p>

            <h3 className="font-semibold text-gray-900 dark:text-white">Income Tax Brackets</h3>
            <div className="space-y-1">
              {c.incomeTax.brackets.map((bracket, i) => (
                <div key={i} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>
                    {c.currencySymbol}{bracket.min.toLocaleString()}
                    {bracket.max ? ` – ${c.currencySymbol}${bracket.max.toLocaleString()}` : '+'}
                  </span>
                  <span className="font-medium">{(bracket.rate * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Cost of Living */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Cost of Living in {c.name}
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
            <p className="text-gray-700 dark:text-gray-300">
              {c.name} has a {colCompare} cost of living with an index of {colIndex} (where New York City = 100).
              {colIndex < 50
                ? ` This means your money goes significantly further here compared to major Western cities. Many FIRE retirees find they can live comfortably on much less than they would spend in the US or Europe.`
                : colIndex < 70
                ? ` While not the cheapest destination, many retirees find the quality of life excellent relative to cost, especially outside major cities.`
                : ` While the cost of living is relatively high, the quality of life, infrastructure, and services are excellent.`
              }
            </p>
          </div>
        </section>

        {/* Healthcare */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Healthcare in {c.name}
          </h2>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-gray-200 dark:border-slate-700">
            <p className="text-gray-700 dark:text-gray-300">{healthcareSummary}.</p>
            {c.healthcare.notes && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{c.healthcare.notes}</p>
            )}
          </div>
        </section>

        {/* Visa Options */}
        {c.expatRules?.specialRegimes && c.expatRules.specialRegimes.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Special Tax Regimes & Visa Options for {c.name}
            </h2>
            <div className="space-y-3">
              {c.expatRules.specialRegimes.map((regime, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-gray-200 dark:border-slate-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{regime.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{regime.benefits}</p>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <span>⏱ Duration: {regime.duration}</span>
                    <span>📋 Eligibility: {regime.eligibility}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Ready to Calculate Your FIRE Number?</h2>
          <p className="text-blue-100 mb-6 max-w-lg mx-auto">
            See exactly how much you need to retire in {c.name}. Compare taxes, cost of living,
            and run Monte Carlo simulations — all free.
          </p>
          <Link
            href={`/?to=${code}`}
            className="inline-flex items-center px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            🔥 Open FIRE Calculator for {c.name}
          </Link>
        </section>

        {/* Related Countries */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Compare Other Retirement Destinations
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {relatedCountries.map(rc => (
              <Link
                key={rc.code}
                href={`/retire-in/${codeToSlug[rc.code] || rc.code.toLowerCase()}`}
                className="bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors text-center"
              >
                <div className="text-2xl">{rc.flag}</div>
                <div className="text-sm font-medium text-gray-900 dark:text-white mt-1">{rc.name}</div>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ Schema Content */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            FAQ: Retiring in {c.name}
          </h2>
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-gray-200 dark:border-slate-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                How much money do I need to retire in {c.name}?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Using the 4% safe withdrawal rate, you need approximately 25x your annual spending.
                With {c.name}&apos;s {colCompare} cost of living (index {colIndex}/100), your FIRE number
                could be significantly {colIndex < 60 ? 'lower' : 'similar to what you\'d need'} compared
                to retiring in the US. Use our free calculator to get your exact number.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-gray-200 dark:border-slate-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                What are the tax implications of retiring in {c.name}?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {c.name} has {taxHighlight} and a top income tax rate of {topIncomeTax}.
                For FIRE retirees primarily living off investment income, the effective tax rate
                depends on your withdrawal strategy and account types. Our calculator models this
                in detail for your specific situation.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-5 border border-gray-200 dark:border-slate-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Can I get a visa to retire in {c.name}?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {visaSummary}. Visa requirements depend on your nationality, income, and assets.
                Check the visa details in our calculator for the most up-to-date information.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            WhereToFIRE
          </Link>
          {' '}— Compare early retirement across countries
        </div>
      </footer>
    </div>
  );
}
