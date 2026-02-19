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
  'usa': 'US', 'us': 'US', 'south-korea': 'KR', 'indonesia': 'ID',
};

const codeToSlug: Record<string, string> = {};
// Build reverse map, preferring shorter/cleaner slugs
for (const [slug, code] of Object.entries(slugToCode)) {
  if (!codeToSlug[code] || slug.length < codeToSlug[code].length) {
    codeToSlug[code] = slug;
  }
}

// Popular "from" countries to generate comparison pages for
const fromCountries = ['united-states', 'uk', 'canada', 'australia', 'ireland', 'germany'];
// Popular "to" countries
const toCountries = [
  'portugal', 'spain', 'mexico', 'thailand', 'costa-rica', 'italy', 'greece',
  'france', 'netherlands', 'japan', 'new-zealand', 'colombia', 'panama',
  'malaysia', 'vietnam', 'switzerland', 'uae', 'singapore', 'south-korea', 'indonesia',
];

function parseComparison(slug: string): { from: string; to: string } | null {
  const match = slug.match(/^(.+)-vs-(.+)$/);
  if (!match) return null;
  const fromSlug = match[1];
  const toSlug = match[2];
  const fromCode = slugToCode[fromSlug];
  const toCode = slugToCode[toSlug];
  if (!fromCode || !toCode || fromCode === toCode) return null;
  if (!countries[fromCode] || !countries[toCode]) return null;
  return { from: fromCode, to: toCode };
}

export async function generateStaticParams() {
  const params: { comparison: string }[] = [];
  for (const from of fromCountries) {
    for (const to of toCountries) {
      const fromCode = slugToCode[from];
      const toCode = slugToCode[to];
      if (fromCode && toCode && fromCode !== toCode) {
        params.push({ comparison: `${from}-vs-${to}` });
      }
    }
  }
  // Also add reverse for top destinations comparing back
  const topTo = ['portugal', 'spain', 'mexico', 'thailand'];
  for (const to of topTo) {
    for (const from of fromCountries) {
      const fromCode = slugToCode[from];
      const toCode = slugToCode[to];
      if (fromCode && toCode && fromCode !== toCode) {
        const reverse = `${to}-vs-${from}`;
        if (!params.find(p => p.comparison === reverse)) {
          params.push({ comparison: reverse });
        }
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }: { params: { comparison: string } }): Promise<Metadata> {
  const parsed = parseComparison(params.comparison);
  if (!parsed) return {};

  const from = countries[parsed.from];
  const to = countries[parsed.to];
  if (!from || !to) return {};

  const title = `${from.name} vs ${to.name} — FIRE & Retirement Comparison`;
  const description = `Compare early retirement in ${from.name} vs ${to.name}. Side-by-side taxes, cost of living, healthcare, and FIRE number comparison. Free calculator.`;

  return {
    title,
    description,
    keywords: [
      `${from.name} vs ${to.name} retirement`,
      `retire ${to.name} from ${from.name}`,
      `${from.name} vs ${to.name} cost of living`,
      `${from.name} vs ${to.name} taxes`,
      `FIRE ${to.name}`,
      `early retirement ${to.name} vs ${from.name}`,
      `expat ${from.name} to ${to.name}`,
      `${to.name} retirement calculator`,
    ],
    openGraph: {
      title,
      description,
      url: `https://wheretofire.com/compare/${params.comparison}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://wheretofire.com/compare/${params.comparison}`,
    },
  };
}

function ComparisonRow({ label, value1, value2, highlight }: { label: string; value1: string; value2: string; highlight?: 'lower' | 'higher' | 'none' }) {
  const v1Num = parseFloat(value1.replace(/[^0-9.-]/g, ''));
  const v2Num = parseFloat(value2.replace(/[^0-9.-]/g, ''));
  const v1Better = highlight === 'lower' ? v1Num < v2Num : v1Num > v2Num;
  const v2Better = highlight === 'lower' ? v2Num < v1Num : v2Num > v1Num;

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4 py-3 border-b border-gray-100 dark:border-slate-700/50 last:border-0">
      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</div>
      <div className={`text-xs sm:text-sm text-center font-semibold ${highlight !== 'none' && v1Better ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
        {value1} {highlight !== 'none' && v1Better && '✓'}
      </div>
      <div className={`text-xs sm:text-sm text-center font-semibold ${highlight !== 'none' && v2Better ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
        {value2} {highlight !== 'none' && v2Better && '✓'}
      </div>
    </div>
  );
}

export default function ComparePage({ params }: { params: { comparison: string } }) {
  const parsed = parseComparison(params.comparison);
  if (!parsed) notFound();

  const from = countries[parsed.from];
  const to = countries[parsed.to];
  if (!from || !to) notFound();

  const fromTopTax = from.incomeTax.brackets[from.incomeTax.brackets.length - 1];
  const toTopTax = to.incomeTax.brackets[to.incomeTax.brackets.length - 1];
  const fromCapGains = from.capitalGains.longTerm[0]?.rate ?? 0;
  const toCapGains = to.capitalGains.longTerm[0]?.rate ?? 0;

  const colDiff = Math.round(((to.costOfLiving.index - from.costOfLiving.index) / from.costOfLiving.index) * 100);
  const colVerdict = colDiff < -20 ? 'significantly cheaper' : colDiff < -5 ? 'somewhat cheaper' : colDiff > 20 ? 'significantly more expensive' : colDiff > 5 ? 'somewhat more expensive' : 'similar in cost';

  // Get other comparison links
  const otherFromSlugs = fromCountries.filter(s => slugToCode[s] !== parsed.from && slugToCode[s] !== parsed.to);
  const otherToSlugs = toCountries.filter(s => slugToCode[s] !== parsed.from && slugToCode[s] !== parsed.to);

  // Structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${from.name} vs ${to.name}: FIRE & Early Retirement Comparison`,
    description: `Detailed comparison of retiring in ${from.name} vs ${to.name} including taxes, cost of living, healthcare, and visa requirements.`,
    author: { '@type': 'Organization', name: 'Where To FIRE' },
    publisher: { '@type': 'Organization', name: 'Where To FIRE' },
    mainEntityOfPage: `https://wheretofire.com/compare/${params.comparison}`,
  };

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Is it cheaper to retire in ${to.name} or ${from.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${to.name} has a cost of living index of ${to.costOfLiving.index} compared to ${from.name}'s ${from.costOfLiving.index} (US = 100). ${to.name} is ${colVerdict} than ${from.name} for retirees.`,
        },
      },
      {
        '@type': 'Question',
        name: `What are the tax differences between ${from.name} and ${to.name} for retirees?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${from.name} has a top income tax rate of ${(fromTopTax?.rate * 100).toFixed(0)}% and ${(fromCapGains * 100).toFixed(0)}% capital gains tax. ${to.name} has a top income tax rate of ${(toTopTax?.rate * 100).toFixed(0)}% and ${(toCapGains * 100).toFixed(0)}% capital gains tax.`,
        },
      },
      {
        '@type': 'Question',
        name: `How much do I need to FIRE in ${to.name} vs ${from.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Your FIRE number depends on your spending, tax situation, and withdrawal strategy. Use the WhereToFIRE calculator to get a personalized comparison between ${from.name} and ${to.name}.`,
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([structuredData, faqData]) }} />

      {/* Hero */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
          <Link href="/" className="text-blue-600 dark:text-blue-400 text-sm hover:underline mb-4 block">
            ← Back to WhereToFIRE Calculator
          </Link>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            {from.flag} {from.name} vs {to.flag} {to.name}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
            Side-by-side early retirement comparison — taxes, cost of living, healthcare, and FIRE number.
          </p>
          <div className="mt-6">
            <Link
              href={`/?from=${parsed.from}&to=${parsed.to}`}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              🔥 Calculate Your FIRE Number — {from.name} vs {to.name}
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">

        {/* Key Verdict */}
        <section className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Key Takeaway</h2>
          <p className="text-gray-700 dark:text-gray-300">
            {to.name} is <strong>{colVerdict}</strong> than {from.name} for retirees.
            {colDiff < -10 && ` With a cost of living index of ${to.costOfLiving.index} vs ${from.costOfLiving.index}, your money goes ${Math.abs(colDiff)}% further in ${to.name}.`}
            {colDiff > 10 && ` With a cost of living index of ${to.costOfLiving.index} vs ${from.costOfLiving.index}, expect to spend about ${colDiff}% more in ${to.name}.`}
            {' '}Capital gains tax is {(toCapGains * 100).toFixed(0)}% in {to.name} vs {(fromCapGains * 100).toFixed(0)}% in {from.name}.
            {' '}Use the calculator to see your personalized FIRE number for both countries.
          </p>
        </section>

        {/* Side by Side Comparison */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Side-by-Side Comparison</h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 px-3 sm:px-6 py-4 bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400"></div>
              <div className="text-center">
                <span className="text-2xl">{from.flag}</span>
                <div className="text-sm font-bold text-gray-900 dark:text-white mt-1">{from.name}</div>
              </div>
              <div className="text-center">
                <span className="text-2xl">{to.flag}</span>
                <div className="text-sm font-bold text-gray-900 dark:text-white mt-1">{to.name}</div>
              </div>
            </div>

            {/* Rows */}
            <div className="px-3 sm:px-6">
              <div className="py-2 mt-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Cost of Living</span>
              </div>
              <ComparisonRow label="Overall Index" value1={`${from.costOfLiving.index}`} value2={`${to.costOfLiving.index}`} highlight="lower" />
              <ComparisonRow label="Rent (City)" value1={`$${from.costOfLiving.monthlyRentCity.toLocaleString()}/mo`} value2={`$${to.costOfLiving.monthlyRentCity.toLocaleString()}/mo`} highlight="lower" />
              <ComparisonRow label="Rent (Suburb)" value1={`$${from.costOfLiving.monthlyRentSuburb.toLocaleString()}/mo`} value2={`$${to.costOfLiving.monthlyRentSuburb.toLocaleString()}/mo`} highlight="lower" />

              <div className="py-2 mt-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Taxes</span>
              </div>
              <ComparisonRow label="Capital Gains (LT)" value1={`${(fromCapGains * 100).toFixed(0)}%`} value2={`${(toCapGains * 100).toFixed(0)}%`} highlight="lower" />
              <ComparisonRow label="Top Income Tax" value1={`${(fromTopTax?.rate * 100).toFixed(0)}%`} value2={`${(toTopTax?.rate * 100).toFixed(0)}%`} highlight="lower" />

              <div className="py-2 mt-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Healthcare</span>
              </div>
              <ComparisonRow
                label="Est. Annual Cost"
                value1={`$${from.healthcare.estimatedAnnualCostPostRetirement.toLocaleString()}`}
                value2={`$${to.healthcare.estimatedAnnualCostPostRetirement.toLocaleString()}`}
                highlight="lower"
              />
              <ComparisonRow
                label="Public Access"
                value1={from.healthcare.publicAccessForResidents ? 'Yes' : 'No'}
                value2={to.healthcare.publicAccessForResidents ? 'Yes' : 'No'}
                highlight="none"
              />

              <div className="py-2 mt-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Other</span>
              </div>
              <ComparisonRow label="Currency" value1={`${from.currencySymbol} ${from.currency}`} value2={`${to.currencySymbol} ${to.currency}`} highlight="none" />
            </div>
          </div>
        </section>

        {/* Tax Details */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tax Comparison for Retirees</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{from.flag} {from.name} Taxes</h3>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {from.incomeTax.brackets.map((b, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{from.currencySymbol}{b.min.toLocaleString()}{b.max ? `–${from.currencySymbol}${b.max.toLocaleString()}` : '+'}</span>
                    <span className="font-medium">{(b.rate * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{to.flag} {to.name} Taxes</h3>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {to.incomeTax.brackets.map((b, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{to.currencySymbol}{b.min.toLocaleString()}{b.max ? `–${to.currencySymbol}${b.max.toLocaleString()}` : '+'}</span>
                    <span className="font-medium">{(b.rate * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Special Regimes */}
        {(from.expatRules?.specialRegimes?.length || to.expatRules?.specialRegimes?.length) && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Special Tax Regimes for Expats</h2>
            <div className="space-y-3">
              {to.expatRules?.specialRegimes?.map((regime, i) => (
                <div key={`to-${i}`} className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-5 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{to.flag}</span>
                    <h3 className="font-bold text-gray-900 dark:text-white">{regime.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{regime.benefits}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>⏱ {regime.duration}</span>
                    <span>📋 {regime.eligibility}</span>
                  </div>
                </div>
              ))}
              {from.expatRules?.specialRegimes?.map((regime, i) => (
                <div key={`from-${i}`} className="bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-1">
                    <span>{from.flag}</span>
                    <h3 className="font-bold text-gray-900 dark:text-white">{regime.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{regime.benefits}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>⏱ {regime.duration}</span>
                    <span>📋 {regime.eligibility}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">Calculate Your Exact FIRE Number</h2>
          <p className="text-blue-100 mb-6 max-w-lg mx-auto">
            Enter your portfolio, spending, and retirement age to see a personalized comparison
            between {from.name} and {to.name} — with Monte Carlo simulations and tax modeling.
          </p>
          <Link
            href={`/?from=${parsed.from}&to=${parsed.to}`}
            className="inline-flex items-center px-6 sm:px-8 py-3 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
          >
            🔥 Open Calculator — {from.name} vs {to.name}
          </Link>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            FAQ: {from.name} vs {to.name} for Retirement
          </h2>
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-slate-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Is it cheaper to retire in {to.name} or {from.name}?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {to.name} has a cost of living index of {to.costOfLiving.index} compared to {from.name}&apos;s {from.costOfLiving.index}
                (where US = 100). {to.name} is {colVerdict} than {from.name} for retirees.
                {colDiff < -10 && ` Your money goes approximately ${Math.abs(colDiff)}% further in ${to.name}.`}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-slate-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                How do taxes compare between {from.name} and {to.name}?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Capital gains tax is {(toCapGains * 100).toFixed(0)}% in {to.name} vs {(fromCapGains * 100).toFixed(0)}% in {from.name}.
                The top income tax rate is {(toTopTax?.rate * 100).toFixed(0)}% in {to.name} vs {(fromTopTax?.rate * 100).toFixed(0)}% in {from.name}.
                For FIRE retirees, the effective tax rate depends on your withdrawal strategy — use our calculator for a personalized estimate.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 sm:p-5 border border-gray-200 dark:border-slate-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                What about healthcare in {to.name} vs {from.name}?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Estimated annual healthcare costs are ${to.healthcare.estimatedAnnualCostPostRetirement.toLocaleString()} in {to.name}
                vs ${from.healthcare.estimatedAnnualCostPostRetirement.toLocaleString()} in {from.name}.
                {to.healthcare.publicAccessForResidents ? ` ${to.name} offers public healthcare access for residents.` : ''}
                {from.healthcare.publicAccessForResidents ? ` ${from.name} offers public healthcare access for residents.` : ''}
              </p>
            </div>
          </div>
        </section>

        {/* Internal links to other comparisons */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            More Comparisons
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                Retire from {from.name} to...
              </h3>
              <div className="space-y-1">
                {otherToSlugs.slice(0, 6).map(slug => {
                  const code = slugToCode[slug];
                  const c = code ? countries[code] : null;
                  if (!c) return null;
                  return (
                    <Link
                      key={slug}
                      href={`/compare/${codeToSlug[parsed.from] || 'us'}-vs-${slug}`}
                      className="block text-sm text-blue-600 dark:text-blue-400 hover:underline py-1"
                    >
                      {c.flag} {from.name} vs {c.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                {to.name} vs other countries
              </h3>
              <div className="space-y-1">
                {otherFromSlugs.slice(0, 6).map(slug => {
                  const code = slugToCode[slug];
                  const c = code ? countries[code] : null;
                  if (!c) return null;
                  return (
                    <Link
                      key={slug}
                      href={`/compare/${slug}-vs-${codeToSlug[parsed.to] || 'portugal'}`}
                      className="block text-sm text-blue-600 dark:text-blue-400 hover:underline py-1"
                    >
                      {c.flag} {c.name} vs {to.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Country pages links */}
        <section className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center justify-center">
          <Link href={`/retire-in/${codeToSlug[parsed.from]}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            More about retiring in {from.name} →
          </Link>
          <span className="hidden sm:inline text-gray-300 dark:text-gray-600">|</span>
          <Link href={`/retire-in/${codeToSlug[parsed.to]}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            More about retiring in {to.name} →
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">WhereToFIRE</Link>
          {' '}— Compare early retirement across countries
        </div>
      </footer>
    </div>
  );
}
