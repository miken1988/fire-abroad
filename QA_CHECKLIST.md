# WhereToFIRE QA Checklist

Run through this entire checklist in **incognito mode** before any release.

## 1. Initial Load (New User)
- [ ] Site loads without errors
- [ ] "What is FIRE?" explainer banner shows
- [ ] Quick Calculator shows (not advanced mode)
- [ ] Default values are sensible (US, Portugal, age 35, etc.)
- [ ] Results panel shows on right (desktop) or in Results tab (mobile)
- [ ] No console errors

## 2. Input Fields - CRITICAL
Test EVERY input by:
1. Clicking into field
2. Selecting all text (Cmd+A or triple-click)
3. Typing a new value
4. Clicking away (blur)
5. Verify value saved correctly

### Quick Calculator Inputs
- [ ] Current age: Type "25" → shows 25
- [ ] Current age: Type "65" → shows 65
- [ ] Current age: Clear and blur → resets to default (30)
- [ ] Target retirement age: Type "40" → shows 40
- [ ] Target retirement age: Type "70" → shows 70
- [ ] Total savings: Type "500000" → shows 500,000
- [ ] Total savings: Type "1500000" → shows 1,500,000
- [ ] Annual spending: Type "60000" → shows 60,000
- [ ] Country dropdowns: Change both, verify results update

### Advanced Mode Inputs
- [ ] Click "Customize account types, pensions, tax details..."
- [ ] All account type fields accept input
- [ ] Pension toggle works
- [ ] Pension amount/age fields accept input
- [ ] Expected return slider works
- [ ] Inflation rate slider works
- [ ] SWR slider works
- [ ] "Simplified view" link returns to quick mode

## 3. Country Combinations
Test these specific combinations:
- [ ] US → Portugal (common case)
- [ ] US → US (same country)
- [ ] US → UAE (0% tax)
- [ ] US → Switzerland (high COL)
- [ ] US → Mexico (low COL)
- [ ] Ireland → Portugal
- [ ] UK → Spain
- [ ] Canada → Thailand

For each, verify:
- FIRE numbers make sense (cheaper country = lower number)
- Winner banner matches badge on cards
- Tax rates shown are reasonable
- No NaN or undefined values anywhere

## 4. Winner/Badge Logic
- [ ] When years are equal, lower FIRE number country gets "Best Option"
- [ ] When years differ, earlier retirement gets "Best Option"
- [ ] "Portugal wins!" banner matches Portugal having "Best Option" badge
- [ ] "On Target" badge shows for non-winner when hitting target age
- [ ] "X yrs behind" badge shows when missing target

## 5. Results Panel
- [ ] FIRE Number displays with correct currency symbol
- [ ] Years to FIRE is reasonable
- [ ] Effective Tax Rate is between 0-60%
- [ ] Healthcare info shows
- [ ] "If You Retired Today" section shows/calculates

## 6. FIRE Journey Chart
- [ ] Chart renders without errors
- [ ] Hover shows portfolio value
- [ ] Hover shows "≈ $X today" (inflation-adjusted)
- [ ] Both country lines visible in comparison mode
- [ ] Retirement age marker shows
- [ ] Chart extends to age 100

## 7. Monte Carlo Simulation
- [ ] Expand the Monte Carlo section
- [ ] Success rate percentage shows
- [ ] Chart renders
- [ ] Hover on chart shows values
- [ ] No NaN values

## 8. Share Functionality
- [ ] Click Share button
- [ ] Toast notification appears
- [ ] Copy the URL
- [ ] Open in new incognito tab
- [ ] All values match original

## 9. Mobile Testing (resize browser or use device)
- [ ] Tab navigation works (Your Details / Results)
- [ ] All inputs work on mobile
- [ ] Sticky comparison bar appears when scrolling results
- [ ] No horizontal scrolling
- [ ] Text is readable
- [ ] Buttons are tappable

## 10. Dark/Light Mode
- [ ] Toggle works
- [ ] All text readable in both modes
- [ ] Cards have proper contrast
- [ ] No "washed out" colors

## 11. Edge Cases
- [ ] Age 18, retirement 30 → should work
- [ ] Age 60, retirement 60 (already at target) → should show "Already FI" or handle gracefully
- [ ] Age 70, retirement 50 (past target) → should handle gracefully
- [ ] $0 portfolio → should show "Cannot FIRE" or similar
- [ ] $100,000,000 portfolio → should handle large numbers
- [ ] $0 spending → should show $0 FIRE number
- [ ] Very high spending ($500k) → should show "Cannot FIRE"

## 12. Legal Pages
- [ ] /terms loads
- [ ] /privacy loads
- [ ] Footer links work
- [ ] Back to calculator link works

## 13. Performance
- [ ] Initial load < 3 seconds
- [ ] Input changes reflect in < 500ms
- [ ] No janky scrolling
- [ ] No memory leaks (check after 5 minutes of use)

## 14. Console Check
- [ ] No errors in console
- [ ] No warnings about React keys
- [ ] No unhandled promise rejections

---

## Sign-off

Date: ___________
Tested by: ___________
Browser: ___________
Device: ___________

All items passed: [ ] YES / [ ] NO

Notes:
