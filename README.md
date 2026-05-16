# Prof. Pip — English Teacher 🦉

An interactive English teacher web app powered by n8n AI agent.

## Stack
- Plain HTML + CSS + Vanilla JS (no framework, no build step)
- n8n webhook as the AI backend

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Leave all settings as default — Vercel auto-detects static HTML
4. Click Deploy

## Files

| File | Purpose |
|------|---------|
| `index.html` | Main page and avatar markup |
| `style.css` | All styles and animations |
| `app.js` | Webhook calls and UI logic |
| `favicon.svg` | Browser tab icon |
| `vercel.json` | Vercel routing config |

## Change the webhook URL

Open `app.js` and update line 6:

```js
const WEBHOOK = 'your-n8n-webhook-url-here';
```

## n8n CORS setup

In your n8n Webhook node → set **Allowed Origins** to your Vercel domain:
```
https://your-project.vercel.app
```
Or use `*` during testing.
