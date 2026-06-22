# Not Into Finance (NiFi)

A modern, dark-navy fintech landing page for **Not Into Finance (NiFi)** —
democratizing financial research. Built with **Next.js (App Router)**,
**Tailwind CSS**, and **Lucide React**.

## Getting started

> Requires **Node.js 18.18+**. Install from <https://nodejs.org> if you don't
> have it (run `node --version` to check).

```bash
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:3000
```

Then open <http://localhost:3000>.

To build for production:

```bash
npm run build
npm run start
```

## Project structure

```
.
├── app/
│   ├── globals.css        # Tailwind directives + base styles
│   ├── layout.js          # Root layout, fonts, metadata
│   └── page.js            # Homepage — assembles all sections
├── components/            # Reusable, modular UI components
│   ├── Navbar.jsx
│   ├── Hero.jsx
│   ├── About.jsx
│   ├── Services.jsx       ├── ServiceCard.jsx
│   ├── ActionHub.jsx      ├── ActionButton.jsx
│   ├── ResearchLibrary.jsx├── ResearchCard.jsx
│   ├── SectionHeading.jsx
│   └── Footer.jsx
├── data/
│   ├── research-data.js   # ← Add research reports here
│   └── site-config.js     # ← Edit links (community, Arthara, newsletter)
└── public/
    └── research/          # ← Drop PDF files here
```

## Common edits

| I want to…                     | Edit this file                          |
| ------------------------------ | --------------------------------------- |
| Add a research report          | `data/research-data.js` + add PDF to `public/research/` |
| Change the action-hub links    | `data/site-config.js`                   |
| Adjust nav links               | `data/site-config.js`                   |
| Tweak colors / theme           | `tailwind.config.js`                    |
| Edit a section's copy          | the matching component in `components/` |

## Action Hub links

Open [`data/site-config.js`](data/site-config.js) and replace the `#`
placeholders:

```js
links: {
  community: "#",                 // Discord / Telegram invite
  arthara: "https://arthara.id",  // already wired up
  newsletter: "#",                // newsletter signup
}
```

> _Disclaimer: content is for educational purposes only and is not financial
> advice._
