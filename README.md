# 🏦 FrontBank — Productos Financieros (Ionic + Angular)

Aplicación CRUD de productos financieros construida con **Ionic 8**, **Angular 20** y **TypeScript**, aplicando principios **SOLID**, gestión de estado centralizado con **BehaviorSubject**, patrón **Facade** y programación reactiva avanzada con **RxJS**.

---

## 🚀 Stack Tecnológico

| Tecnología | Versión |
|------------|---------|
| Angular | 20 (Standalone Components) |
| Ionic Framework | 8 |
| TypeScript | 5.9 |
| RxJS | 7.8 |
| Jasmine + Karma | 5.1 / 6.4 |
| Node.js | 24+ |

---

## 📋 Funcionalidades

| # | Funcionalidad | Descripción |
|---|--------------|-------------|
| F1 | Listar productos | Tabla con nombre, descripción, logo, fecha liberación/revisión |
| F2 | Buscar productos | Filtro reactivo con `debounceTime` + `distinctUntilChanged` |
| F3 | Crear producto | Formulario reactivo con validaciones sync y async |
| F4 | Editar producto | Mismo formulario en modo edición (OCP) |
| F5 | Eliminar producto | Modal de confirmación con doble acción |
| F6 | Verificar ID | Validación asíncrona con `switchMap` contra el backend |

---

## 🏗️ Arquitectura

```
src/app/
├── core/                          ← Lógica de negocio
│   ├── models/                    ← Interfaces de datos (Product, Response types)
│   ├── interfaces/                ← Abstracciones (ProductRepository, NotificationService)
│   ├── services/                  ← Implementaciones (HTTP, Toast)
│   ├── interceptors/              ← Error interceptor global
│   ├── state/                     ← Estado centralizado (BehaviorSubject store)
│   └── facades/                   ← Facade que orquesta state + HTTP + notificaciones
│
├── shared/                        ← Componentes reutilizables
│   └── components/                ← SearchBar, ConfirmModal, SkeletonList
│
├── features/                      ← Páginas (lazy-loaded)
│   ├── product-list/              ← Listado
│   ├── product-detail/            ← Detalle
│   └── product-form/              ← Crear / Editar
│
├── app.routes.ts                  ← Rutas con lazy loading
└── main.ts                        ← Composition Root (DI)
```

### Flujo de datos

```
Componente → Facade → { State + HTTP Repository + Notifications }
     ↑                        │
     └── async pipe ←── BehaviorSubject (estado reactivo)
```

---

## 🔧 Principios SOLID

| Principio | Aplicación |
|-----------|-----------|
| **S** — Single Responsibility | Cada servicio tiene una única responsabilidad (State, HTTP, Facade, UI) |
| **O** — Open/Closed | `ProductFormPage` soporta crear y editar sin modificar lógica interna |
| **L** — Liskov Substitution | `ProductHttpService` extiende `ProductRepository` y es 100% sustituible |
| **I** — Interface Segregation | `ProductRepository` (HTTP) y `NotificationService` (UI) separados |
| **D** — Dependency Inversion | Componentes dependen de abstracciones; DI en `main.ts` resuelve las implementaciones |

---

## 🔄 RxJS Avanzado

| Operador | Uso en el proyecto |
|----------|-------------------|
| `debounceTime(300)` | Búsqueda de productos (espera que deje de escribir) |
| `distinctUntilChanged` | Evita búsquedas duplicadas consecutivas |
| `switchMap` | Validación async de ID (cancela peticiones anteriores) |
| `takeUntil(destroy$)` | Cleanup de suscripciones al destruir componentes |
| `shareReplay(1)` | Multicasting en selectores del estado |
| `tap` / `finalize` | Efectos secundarios y cleanup de loading |
| `catchError` | Manejo de errores en flujos reactivos |
| `async` pipe | Suscripción/desuscripción automática en templates |

---

## 🧪 Testing

**97 tests unitarios** con Jasmine + Karma:

| Archivo | Tests | Cobertura |
|---------|-------|-----------|
| `product-state.service.spec.ts` | 16 | Mutadores, selectores, inmutabilidad, filtrado |
| `product-facade.service.spec.ts` | 13 | CRUD, errores, búsqueda, verifyId |
| `product-http.service.spec.ts` | 10 | HTTP con HttpTestingController, LSP |
| `error.interceptor.spec.ts` | 6 | Códigos 400/404/500, mensajes custom |
| `search-bar.component.spec.ts` | 6 | Emisión, trim, lowercase |
| `confirm-modal.component.spec.ts` | 8 | Open/close, eventos, overlay |
| `product-list.page.spec.ts` | 9 | Init, navegación, delete, debounce |
| `product-detail.page.spec.ts` | 8 | Carga, editar, eliminar, cleanup |
| `product-form.page.spec.ts` | 16 | Create/edit, validaciones sync/async, submit |

```bash
# Ejecutar tests
npx ng test --no-watch --browsers=ChromeHeadless

# Con coverage
npx ng test --no-watch --browsers=ChromeHeadless --code-coverage
```

---

## ⚡ Inicio rápido

### Prerrequisitos

- Node.js 20+
- npm 9+
- Ionic CLI: `npm install -g @ionic/cli`

### Backend (API)

```bash
cd repo-interview-main
npm install
npm start
# Corre en http://localhost:3002
```

### Frontend

```bash
cd financial-products
npm install
ionic serve
# Corre en http://localhost:8100
```

---

## 📍 Rutas

| Ruta | Página | Carga |
|------|--------|-------|
| `/products` | Listado de productos | Lazy |
| `/products/new` | Crear producto | Lazy |
| `/products/:id` | Detalle del producto | Lazy |
| `/products/:id/edit` | Editar producto | Lazy |

---

## 🧩 Patrones de diseño

- **Repository Pattern** — Abstracción de la capa HTTP
- **Facade Pattern** — Orquestación de state + HTTP + notificaciones
- **Store Pattern** — Estado centralizado con BehaviorSubject (selectores + mutadores inmutables)
- **Observer Pattern** — Flujo de datos completamente reactivo via Observables

---

## 👤 Autor

**Edison Reinoso**

