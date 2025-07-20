# Angular Tutorial Migration Cheat Sheet
*For converting older Angular tutorials to Angular 17+ (Standalone Components)*

## 📁 File Location Changes

| **Tutorial Says** | **Your Angular 20 Project** | **Notes** |
|-------------------|------------------------------|-----------|
| `app-routing.module.ts` | `src/app/app.routes.ts` | Route definitions |
| `app.module.ts` | `src/app/app.config.ts` | App configuration |
| `AppRoutingModule` | `routes` array | Export routes array |
| `AppModule` | `appConfig` object | Application config |

## 🛣️ Routing Changes

| **Tutorial Code** | **Your Angular 20 Code** |
|-------------------|---------------------------|
| ```typescript<br>const routes: Routes = [<br>  { path: 'home', component: HomeComponent }<br>];<br>@NgModule({<br>  imports: [RouterModule.forRoot(routes)],<br>  exports: [RouterModule]<br>})<br>export class AppRoutingModule { }``` | ```typescript<br>export const routes: Routes = [<br>  { path: 'home', component: HomeComponent }<br>];``` |

## 📦 Module vs Standalone

| **Tutorial (Module-based)** | **Your Angular 20 (Standalone)** |
|------------------------------|-----------------------------------|
| ```typescript<br>@NgModule({<br>  declarations: [HomeComponent],<br>  imports: [CommonModule]<br>})<br>export class HomeModule { }``` | ```typescript<br>@Component({<br>  standalone: true,<br>  imports: [CommonModule],<br>  // component code<br>})``` |

## 🔧 App Configuration

| **Tutorial Says** | **Your File** | **How to Do It** |
|-------------------|---------------|------------------|
| "Add to imports in AppModule" | `app.config.ts` | Add to `providers` array |
| "Import RouterModule" | `app.config.ts` | Already has `provideRouter(routes)` |
| "Add to declarations" | Component file | Add `standalone: true` and `imports: []` |

## 🏗️ Component Creation

| **Tutorial Command** | **Your Command** | **Result** |
|----------------------|------------------|------------|
| `ng generate component home` | `ng generate component home` | Creates standalone component by default |
| Manual component creation | Use `ng g c componentName` | Auto-generates with `standalone: true` |

## 📝 Common Tutorial Translations

### When tutorial says: "Import in AppModule"
**You do:** Add to component's `imports` array or `app.config.ts` providers

### When tutorial says: "Add to RouterModule.forRoot()"
**You do:** Add to `routes` array in `app.routes.ts`

### When tutorial says: "Declare component in module"
**You do:** Make sure component has `standalone: true` and proper imports

## 🚀 Quick Commands

```bash
# Generate new component (standalone by default)
ng generate component pages/about

# Generate service
ng generate service services/data

# Serve the app
npm start

# Build the app
npm run build
```

## 📍 Current Project Structure Reference

```
src/app/
├── app.config.ts          ← Your "app.module.ts"
├── app.routes.ts          ← Your "app-routing.module.ts"
├── app.html               ← Main template
├── app.ts                 ← Main component
├── pages/                 ← Your page components
├── layout/                ← Header, footer, etc.
└── comments/              ← Feature components
```

---
**💡 Pro Tip:** When the tutorial mentions "module," think "component configuration" in your standalone setup!
