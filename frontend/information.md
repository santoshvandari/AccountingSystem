
## 🎯 GOAL (Phase 1 Frontend Scope)

You’re building a clean and localized frontend for:

* ✅ **User Authentication**
* ✅ **Transaction Management (Income only)**
* ✅ **Bill Generation & PDF Preview**
* ✅ **User Profile / Session Handling**

---

## 🧩 Pages / Views Structure

### 1. **Login Page**

* Form: email + password
* On success: store JWT tokens (access + refresh) in `localStorage` or `httpOnly` cookie
* Redirect to Dashboard

---

### 2. **Dashboard Page**

* Overview section:

  * Today’s income
  * This month's total
  * Total bills issued
* Shortcut buttons:

  * ➕ Add Transaction
  * 🧾 Generate Bill
  * 📄 View Reports (placeholder for Phase 2)

---

### 3. **Transactions Page**

* List view (table or card):

  * Date, amount, received from, entry person
* Filters:

  * Date range
  * Search `received_from`
* Actions:

  * Edit transaction (opens modal)
  * Delete (confirmation)
* Button: `+ Add Transaction`

---

### 4. **Add/Edit Transaction Modal**

* Form:

  * Received from
  * Amount
  * Date (default: today)
  * Note
* On submit:

  * POST/PUT to backend
  * Show toast + update table

---

### 5. **Billing Page**

* Table of all generated bills:

  * Bill number, billed\_to, amount, issued\_by, issued\_date
* Actions:

  * View PDF (opens PDF preview in new tab or modal)
  * Delete

---

### 6. **Generate Bill Page / Modal**

* Form:

  * Billed To (customer name)
  * Amount
  * Note
* On submit:

  * POST to `/api/bills/`
  * Generate + show PDF
  * Option to download or print

---

### 7. **PDF Preview Page**

* Simple page that fetches `/api/bills/<id>/pdf/`
* Shows preview in browser
* Button: `Download` and `Print`

---

### 8. **Profile Dropdown (Header/Nav)**

* Show logged-in user's:

  * Name
  * Role
* Actions:

  * Logout
  * (Later) Profile settings

---

## 🧱 Reusable Components

| Component           | Description                                 |
| ------------------- | ------------------------------------------- |
| `Sidebar`           | Navigation (Dashboard, Transactions, Bills) |
| `Topbar`            | Title + Profile dropdown                    |
| `AuthWrapper`       | Protects routes with JWT                    |
| `ToastNotification` | For success/error feedback                  |
| `LoadingOverlay`    | While data is loading                       |
| `DateRangePicker`   | Used in filters                             |
| `ModalForm`         | For Add/Edit transaction or bill            |

---

## 🌐 Data Flow & State Management

* Use **React Context** or **Redux** for:

  * Auth tokens
  * Logged-in user
* Use **Axios** for API requests

  * Auto-attach Bearer token using interceptor
* Use **React Query** (optional) for caching API data
* Use **i18next** for Nepali translation

  * Nepali dates via `dayjs` with Nepali calendar plugin

---

## 🪄 UI/UX Design Guidelines

| Area       | Suggestions                                                              |
| ---------- | ------------------------------------------------------------------------ |
| Layout     | Use Material UI’s `Box`, `Grid`, and `Container`                         |
| Fonts      | Use clean Nepali + English font (like "Mukta" or "Noto Sans Devanagari") |
| Buttons    | Use icons (`Add`, `Download`, `Delete`) with tooltips                    |
| Colors     | Teal theme (`#008080`) as primary (Mechi Mavericks standard)             |
| Spacing    | Consistent padding/margin (use `theme.spacing(2)`)                       |
| Responsive | Mobile-friendly — especially for input forms and tables                  |

---

## 🔐 Auth Handling

* Store `access_token` in `localStorage`
* Auto-refresh using `refresh_token` on expiry (optional now)
* Wrap protected routes with `<PrivateRoute>` or similar HOC
* Logout clears both tokens and redirects to login

---

## 🌍 Localization (Phase 1 Ready)

* `react-i18next` for language switch (English ↔ Nepali)
* Date formatting in Nepali:

  * Use `dayjs` + custom formatter for `BS` date (future)
* Currency: `₨ {amount.toLocaleString('ne-NP')}`

---

## 📦 Folder Structure Suggestion

```
src/
│
├── api/              # Axios config + endpoints
├── components/       # Shared UI elements
├── pages/            # Page-level components
├── features/         # Modules: auth, transactions, billing
├── context/          # Auth context, if not using Redux
├── utils/            # Date formatters, PDF helper
├── i18n/             # Language configs
└── App.jsx           # Main router
```

---

## ✅ Frontend Ready to Build

| Feature                                   | Status     |
| ----------------------------------------- | ---------- |
| Auth (Login/Logout)                       | ✅ Ready    |
| Transactions (List/Add/Edit)              | ✅ Designed |
| Billing (Generate/List/PDF)               | ✅ Designed |
| Localization (Nepali language + currency) | ✅ Setup    |
| Layout (Dashboard + Navigation)           | ✅ Defined  |

---

