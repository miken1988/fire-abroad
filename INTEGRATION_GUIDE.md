# WhereToFIRE Affiliate Integration Guide

## Files to Add

Copy these files into your project:

### 1. `src/data/affiliates.ts`
The central affiliate configuration. All partner links, descriptions, and tracking live here.

### 2. `src/components/HealthcareAffiliate.tsx`
Inline component for the healthcare section of results cards.

### 3. `src/components/BankingAffiliate.tsx`
Inline component for the Cost of Living section.

### 4. `src/components/NextStepsPanel.tsx`
Full "Plan Your Move" checklist section with all partners.

---

## Where to Integrate

### A. Healthcare Section (in ResultsPanel.tsx)

Find the healthcare display section for each country card (where it shows "~$18,000/yr" or "✓ Public + ~€500/yr"). After the healthcare description, add:

```tsx
import HealthcareAffiliate from './HealthcareAffiliate';

// ... inside the country card, after healthcare info:
<HealthcareAffiliate
  retireCountryName="Portugal"
  retireCountryCode="PT"
/>
```

### B. Cost of Living Section (in ResultsPanel.tsx)

Find the "💰 Cost of Living Comparison" section. After the category breakdown grid, add:

```tsx
import BankingAffiliate from './BankingAffiliate';

// ... after the category comparison grid:
<BankingAffiliate
  fromCurrency="USD"
  toCurrency="EUR"
  retireCountryName="Portugal"
/>
```

### C. Next Steps Panel (in ResultsPanel.tsx)

Add this as a new section AFTER the Journey Timeline and BEFORE the footer. It should be one of the last things users see after reviewing their results:

```tsx
import NextStepsPanel from './NextStepsPanel';

// ... after Journey Timeline section:
<NextStepsPanel
  retireCountryName="Portugal"
  retireCountryCode="PT"
  fromCurrency="USD"
  toCurrency="EUR"
  showDifferentCurrencies={true}
/>
```

---

## Affiliate Signup Links

Sign up for each program and replace the placeholder URLs in `src/data/affiliates.ts`:

1. **Wise**: https://wise.com/gb/affiliate-program/
   - Apply via Partnerize
   - £10 per personal signup, £50 per business
   - 1-year cookie

2. **SafetyWing**: https://safetywing.com/affiliates
   - 10% recurring commission for 1 year
   - 364-day cookie
   - No minimum payout

3. **Cigna Global**: https://www.flexoffers.com (search for Cigna Global)
   - Commission per quote
   - Via FlexOffers affiliate network

4. **NordVPN**: https://nordvpn.com/affiliates/
   - $3-6 per sale depending on plan
   - 30-day cookie

---

## Privacy Policy Update

Add this paragraph to your `/privacy` page:

```
### Affiliate Links

Some links on WhereToFIRE are affiliate links. This means we may earn a 
commission if you click through and make a purchase or sign up for a service. 
This comes at no additional cost to you. We only recommend products and 
services we believe are genuinely useful for people planning early retirement 
abroad. Affiliate partnerships do not influence our calculator results, tax 
rates, or cost of living data.
```

---

## Terms Update

Add to your `/terms` page:

```
### Affiliate Disclosure

WhereToFIRE participates in affiliate programs with select partners including 
Wise, SafetyWing, Cigna Global, and NordVPN. When you click affiliate links 
and complete qualifying actions, we may earn a commission. This does not affect 
the price you pay. Our recommendations are based on our assessment of product 
quality and relevance to expat retirees.
```

---

## Google Analytics Events

The integration automatically sends events to gtag when affiliate links are clicked:

- Event name: `affiliate_click`
- Parameters: `affiliate_section`, `event_label` (partner ID)

You can view these in Google Ads > Conversions to see which partners and placements convert best.

---

## Testing Checklist

- [ ] All affiliate links open in new tabs
- [ ] Links have `rel="noopener noreferrer sponsored"` 
- [ ] Healthcare affiliates show on results with healthcare section
- [ ] Banking affiliate only shows when currencies differ
- [ ] Next Steps panel expands/collapses
- [ ] Checklist items can be checked/unchecked
- [ ] Progress bar updates correctly
- [ ] Affiliate disclosure visible on page
- [ ] Dark mode renders correctly
- [ ] Mobile layout looks good
- [ ] gtag events fire on click (check browser console)
