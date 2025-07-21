# Project Notes & Ideas

## 📝 General Notes
- Following YouTube tutorial: https://www.youtube.com/watch?v=6zv1PTuqIIc
- Using Angular 20 with standalone components (newer than tutorial)
- Using Bootstrap 4.6 for styling

## 🔧 Technical Reminders
- **Component Import Rule**: Every time I use `<app-something>` in HTML, I must:
  1. Import component: `import { Something } from 'path';`
  2. Add to imports array: `imports: [Something]`
- **Git Commands**: `git add .` → `git commit -m "message"` → `git push`
- **Angular vs Tutorial**: Tutorial uses modules, I use standalone components

## 💡 Future Ideas
- [ ] Add more post categories
- [ ] Implement search functionality
- [ ] Add user authentication
- [ ] Create admin panel for posts
- [ ] Add commenting system
- [ ] Implement dark/light theme toggle

## 🐛 Issues to Remember
- **Import errors**: Always check if component is imported when using in template
- **Bootstrap syntax**: Use Bootstrap 4.6 syntax, not latest version
- **File naming**: My files are `component.ts`, tutorial shows `component.component.ts`

## 📚 Learning Progress
- [x] Basic Angular setup
- [x] Routing configuration
- [x] Component creation and imports
- [x] Bootstrap integration
- [x] Git workflow
- [ ] Data binding
- [ ] Services
- [ ] HTTP requests

## 🎯 Current Goals
- Complete tutorial step by step
- Understand standalone components fully
- Build a functional blog template

## 📖 Useful Shortcuts
- **Duplicate line**: `Shift + Alt + ↓`
- **Move line**: `Alt + ↑/↓`
- **Lorem text**: `lorem10` + `Tab`
- **Delete line**: `Ctrl + Shift + K`

## 📖 Future Possibilities
- Only allow one authors to post once within a 24 hour period.

##

---
*Updated: July 20, 2025*
