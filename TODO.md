# TODO List - SiteTemplate2025

## 🔄 Pending Tasks

### Components
- [ ] **PostCard Component**: Re-add PostCard import to `app.ts` when needed in tutorial
  - Currently removed to fix infinite rebuild loop
  - Location: `src/app/layout/post-card/post-card.ts`
  - Will need to add back to `app.ts` imports and use in template

### Mobile Responsiveness
- [ ] **Category Navbar Mobile Optimization**: Implement better mobile UX for multiple categories
  - Options to consider:
    - Horizontal scroll for 3-5 categories
    - Hamburger menu with dropdown
    - Category filter button with modal/overlay
    - Responsive grid layout
  - Current solution: flex-wrap (categories wrap to multiple lines)
  - Wait until: More content and real categories are added

### Code Cleanup
- [x] ~~Clean up console.log messages~~ ✅ COMPLETED
- [x] ~~Fix CategoryNavbar infinite rebuild issue~~ ✅ COMPLETED

## 📋 Tutorial Progress
- [x] Angular 20 project setup
- [x] Routing configuration
- [x] Component creation (Header, Footer, CategoryNavbar, etc.)
- [x] Bootstrap 4.6 integration
- [x] Firebase/Firestore setup
- [x] Category data loading from Firebase
- [x] CategoryNavbar responsive fixes
- [ ] Continue with next tutorial steps...

## 🐛 Known Issues
- None currently

## 💡 Ideas & Improvements
- [ ] Add proper TypeScript interfaces for category data structure
- [ ] Implement error handling UI for Firebase connection issues
- [ ] Add loading states for better UX
- [ ] **Max Featured Articles Limit**: Implement limit on number of featured articles displayed
- [ ] **Add search function with priority results**: Implement search functionality with weighted/priority result ranking
- [ ] **Make header shrink on scroll**: Implement collapsing header that becomes smaller when user scrolls down

---
*Last Updated: July 24, 2025*
