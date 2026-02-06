import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | WhereToFIRE',
  description: 'Privacy Policy for WhereToFIRE.com',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>
        
        <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
          <p className="text-sm text-gray-500 dark:text-gray-400">Last updated: February 2026</p>
          
          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Overview</h2>
            <p>
              WhereToFIRE.com ("the Site") is committed to protecting your privacy. This Privacy Policy 
              explains what information we collect and how we use it.
            </p>
            <p className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <strong>The short version:</strong> We don't collect your personal financial data. 
              All calculations happen in your browser. We only use basic analytics to understand how the site is used.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Information We Do NOT Collect</h2>
            <p>We want to be clear about what we don't do:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>No account required</strong> - You don't need to sign up or log in</li>
              <li><strong>No financial data stored</strong> - Your portfolio values, spending, and other inputs are processed entirely in your browser and are never sent to our servers</li>
              <li><strong>No personal information collected</strong> - We don't ask for your name, email, or any identifying information</li>
              <li><strong>No data sold</strong> - We never sell any data to third parties</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Information We DO Collect</h2>
            
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-2">Analytics Data</h3>
            <p>
              We use Vercel Analytics to understand how visitors use the Site. This service collects:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Pages visited</li>
              <li>Approximate geographic location (country/region level)</li>
              <li>Device type and browser</li>
              <li>Referral source (how you found us)</li>
              <li>Time spent on site</li>
            </ul>
            <p className="mt-2">
              This data is aggregated and anonymized. We cannot identify individual users from this data.
            </p>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-2">Local Storage</h3>
            <p>
              The Site may store preferences (like dark/light mode) in your browser's local storage. 
              This data stays on your device and is not transmitted to us.
            </p>

            <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-6 mb-2">URL Parameters</h3>
            <p>
              When you use the "Share" feature, your calculator inputs are encoded in the URL. 
              This allows you to bookmark or share specific scenarios. This data is:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Stored only in the URL you create</li>
              <li>Not logged or stored on our servers</li>
              <li>Only visible to people you share the URL with</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li><strong>Vercel</strong> - Hosting and analytics (<a href="https://vercel.com/legal/privacy-policy" className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</a>)</li>
              <li><strong>Exchange Rate API</strong> - For currency conversion (no personal data shared)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Cookies</h2>
            <p>
              The Site uses minimal cookies, primarily for:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Analytics (Vercel Analytics)</li>
              <li>Essential site functionality</li>
            </ul>
            <p className="mt-2">
              We do not use advertising cookies or tracking cookies from third-party advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Data Security</h2>
            <p>
              Since we don't collect personal financial data, there's minimal risk of sensitive data exposure. 
              The Site is served over HTTPS to ensure secure connections.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Children's Privacy</h2>
            <p>
              The Site is not intended for children under 18. We do not knowingly collect any information 
              from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Your Rights</h2>
            <p>
              Since we don't collect personal data, there's nothing to access, correct, or delete. 
              If you have concerns, please contact us.
            </p>
            <p className="mt-2">
              For EU/EEA residents: This Site processes minimal data and relies on legitimate interests 
              for analytics purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page 
              with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">Contact</h2>
            <p>
              For privacy-related questions, please contact us through the Site.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-700">
          <a href="/" className="text-blue-600 dark:text-blue-400 hover:underline">← Back to Calculator</a>
        </div>
      </div>
    </div>
  );
}
