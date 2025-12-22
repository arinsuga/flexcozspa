Act as Senior Frontend Developer build using latest Next.js version 16.
Use this skills refference as a guide to build the app @docs/skills/frontend-design-skill.md.
Create Nextjs 16 app base on this specification:

### App Name
App Name is Flexcoz
Flexcoz is a web application that allows users to manage their contracts and work orders.

### Overview
- Use folder appnextjs as root project directory structure.
- Put all static asset in public folder inside appnextjs folder.
- Put all environment variable in .env.local file inside appnextjs folder.
- Put all source code in src folder inside appnextjs folder.
- Put all test code in test folder inside appnextjs folder.
- Contract and Contract Sheet is Parent and Child relationship make very user friendly and excel spreadsheet like UIUX.
- Order and Order Sheet is Parent and Child relationship make very user friendly and excel spreadsheet like UIUX.

### Features
A. Authentication
   - User Authentication
   - User Access Management

B. Data Management
 1. Project Management
   1. Vendor Management
   2. Contract Management
   3. Order Management
   4. System Data
      - Vendor Type Management
      - Reff Type Management
      - UOM Management
      - Sheet Group Management

### Tech Stack
- Next.js
- React
- Tailwind CSS
- TypeScript
- axios
- jspreadsheet
- React Query
- Zustand

### Authentication API
Root URL : http://authapi.localhost/
| Method   | Full URI |
|----------|----------|
| DELETE   | http://authapi.localhost/auth/blacklist |
| POST     | http://authapi.localhost/auth/login |
| POST     | http://authapi.localhost/auth/logout |
| GET/HEAD | http://authapi.localhost/auth/me |
| POST     | http://authapi.localhost/auth/refresh |
| POST     | http://authapi.localhost/auth/register |
| GET/HEAD | http://authapi.localhost/auth/status |

### Backend Application API
| Method | URI |
|---|---|
| GET/HEAD | http://appapi.localhost/contracts |
| POST | http://appapi.localhost/contracts |
| GET/HEAD | http://appapi.localhost/contracts/{contractId}/sheets |
| GET/HEAD | http://appapi.localhost/contracts/{contract} |
| DELETE | http://appapi.localhost/contracts/{contract} |
| PUT/PATCH | http://appapi.localhost/contracts/{contract} |
| GET/HEAD | http://appapi.localhost/contractsheets |
| POST | http://appapi.localhost/contractsheets |
| PUT/PATCH | http://appapi.localhost/contractsheets/{contractsheet} |
| GET/HEAD | http://appapi.localhost/contractsheets/{contractsheet} |
| DELETE | http://appapi.localhost/contractsheets/{contractsheet} |
| GET/HEAD | http://appapi.localhost/orders |
| POST | http://appapi.localhost/orders |
| GET/HEAD | http://appapi.localhost/orders/contract/{contractId} |
| GET/HEAD | http://appapi.localhost/orders/project/{projectId} |
| GET/HEAD | http://appapi.localhost/orders/{order} |
| PUT/PATCH | http://appapi.localhost/orders/{order} |
| DELETE | http://appapi.localhost/orders/{order} |
| POST | http://appapi.localhost/ordersheets |
| GET/HEAD | http://appapi.localhost/ordersheets |
| GET/HEAD | http://appapi.localhost/ordersheets/contract/{contractId} |
| GET/HEAD | http://appapi.localhost/ordersheets/order/{orderId} |
| GET/HEAD | http://appapi.localhost/ordersheets/project/{projectId} |
| PUT/PATCH | http://appapi.localhost/ordersheets/{ordersheet} |
| GET/HEAD | http://appapi.localhost/ordersheets/{ordersheet} |
| DELETE | http://appapi.localhost/ordersheets/{ordersheet} |
| POST | http://appapi.localhost/projects |
| GET/HEAD | http://appapi.localhost/projects |
| DELETE | http://appapi.localhost/projects/{project} |
| PUT/PATCH | http://appapi.localhost/projects/{project} |
| GET/HEAD | http://appapi.localhost/projects/{project} |
| POST | http://appapi.localhost/refftypes |
| GET/HEAD | http://appapi.localhost/refftypes |
| PUT/PATCH | http://appapi.localhost/refftypes/{refftype} |
| GET/HEAD | http://appapi.localhost/refftypes/{refftype} |
| DELETE | http://appapi.localhost/refftypes/{refftype} |
| GET/HEAD | http://appapi.localhost/sheetgroups |
| POST | http://appapi.localhost/sheetgroups |
| GET/HEAD | http://appapi.localhost/sheetgroups/type/{type} |
| DELETE | http://appapi.localhost/sheetgroups/{sheetgroup} |
| GET/HEAD | http://appapi.localhost/sheetgroups/{sheetgroup} |
| PUT/PATCH | http://appapi.localhost/sheetgroups/{sheetgroup} |
| POST | http://appapi.localhost/uoms |
| GET/HEAD | http://appapi.localhost/uoms |
| DELETE | http://appapi.localhost/uoms/{uom} |
| PUT/PATCH | http://appapi.localhost/uoms/{uom} |
| GET/HEAD | http://appapi.localhost/uoms/{uom} |
| POST | http://appapi.localhost/vendors |
| GET/HEAD | http://appapi.localhost/vendors |
| GET/HEAD | http://appapi.localhost/vendors/{vendor} |
| PUT/PATCH | http://appapi.localhost/vendors/{vendor} |
| DELETE | http://appapi.localhost/vendors/{vendor} |
| POST | http://appapi.localhost/vendortypes |
| GET/HEAD | http://appapi.localhost/vendortypes |
| GET/HEAD | http://appapi.localhost/vendortypes/{vendorTypeId}/vendors |
| PUT/PATCH | http://appapi.localhost/vendortypes/{vendortype} |
| GET/HEAD | http://appapi.localhost/vendortypes/{vendortype} |
| DELETE | http://appapi.localhost/vendortypes/{vendortype} |

### Requirements
**Features Requirements**
- Create route for every #Features
- Create page for every #Features
- Create component for every #Features
- Create crud operation for every #Features
- Create services for every #Authentication API
- Create services for every #Backend Application API

**Tech Requirements**
- Use axios for every API call
- Use TypeScript for type safety
- Use jspreadsheet for contract sheet and order sheet
- Use React Query to manage server state such as fetching, caching, and syncing JWT-protected API data.
- Use Zustand for client-side UI state like modals, toggles, and form inputs related to authentication status (e.g., whether the user is logged in).

**Autoupdate Requirements**
Use auto update for every new version release. user Service Worker to cache and update the app.
1. Service Worker Registration
   - Your app registers a service worker that caches assets (JS, CSS, HTML).
   - When you deploy a new build, the service worker detects updated files.

2. Update Detection
   - The service worker sees a new version of cached assets.
   - It downloads the new files in the background.

3. Prompt User to Update
   - Once the new service worker is ready, you can show a banner/modal:
     “A new version of Flexcoz is available. Refresh to update.”
   - User clicks → app reloads with the latest version.


**Testing Requirement**
- Use Jest + React Testing Library for unit testing
- Use Jest + React Testing Library for integration testing
- Use Storybook for component testing
- Use Chromatic + Storybook for visual testing and ensure UI consistency across different devices and browsers.
- Use Playwright for end-to-end testing

**Design Requirements (UI)**
- Use Material Design Concept
- Use Tailwind CSS for styling
- Make responsive design
- Use @flexcoz image for logo and put the logo file as static asset in public folder
- Convert @flexcoz image to favicon and put the favicon file as static asset in public folder
- Use this color theme : #5A9CB5 #FACE68 #FAAC68 #FA6868
- Use Nano Banana for every static asset needed
- Use google font montserrat
- Use google icon font material icons
- add dark mode base on user preference
- Add responsive Navigation:
  - For mobile, tablet, and desktop.
  - Add burger menu for mobile and tablet.
  - Add sidebar for desktop.

**User Experience Requirements (UX)**
- add loading state for every API call
- add error state for every API call
- add success state for every API call
- add pagination for every list
- add search for every list
- add filter for every list
- add sorting for every list
- add modal for every form
- add confirmation for every delete
- add confirmation for every logout
