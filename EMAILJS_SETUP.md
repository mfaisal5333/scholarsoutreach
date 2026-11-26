# EmailJS Setup — 5 minute guide

EmailJS is the **fallback** email method in ProfMatch. The primary method is Gmail OAuth (send from your own Gmail). Use EmailJS if you don't want to connect Gmail or need a quick alternative.

Provider plans and quotas change; check your EmailJS account.

---

## Step 1 — Create an EmailJS account

1. Go to [https://www.emailjs.com](https://www.emailjs.com) and sign up (free)
2. Verify your email

## Step 2 — Connect an email service (this is what actually sends the emails)

1. In the EmailJS dashboard, go to **Email Services** → **Add New Service**
2. Pick the provider for the email account you want to send FROM:
   - **Gmail** — easiest, just OAuth into your Google account
   - **Outlook** — same idea
   - **Yahoo, custom SMTP, etc.** — also supported
3. Follow the connection prompt. EmailJS will get permission to send emails *from* this account on your behalf
4. Once connected, copy the **Service ID** (looks like `service_xyz123`)

## Step 3 — Create an email template

1. Go to **Email Templates** → **Create New Template**
2. Set the template fields:
   - **To Email:** `{{to_email}}`
   - **From Name:** `{{from_name}}`
   - **Reply To:** `{{reply_to}}`
   - **Subject:** `{{subject}}`
3. In the body, put: `{{message}}`
4. Optionally add an attachment field: `{{cv_filename}}`
5. Save and copy the **Template ID** (looks like `template_abc456`)

## Step 4 — Get your Public Key

1. Go to **Account** → **General**
2. Copy your **Public Key** (looks like `user_AbCdEfGhIjKlMnOp`)

## Step 5 — Plug them into ProfMatch

1. Open the prototype, sign in, and click **Email settings** in the bottom-left sidebar
2. Paste the three values: Public Key, Service ID, Template ID
3. **IMPORTANT:** in the **Test recipient** field, enter your own email address
4. Click **Save settings**

## Step 6 — Test it

1. Go through the 6-step flow, approve a couple professors, and hit **Send selected emails**
2. Check your inbox — you should receive copies of the outreach emails (because the test recipient is set to you)
3. Once you're confident the drafts look right, you can clear the test recipient field to send to actual professor addresses

---

## Safety notes

- **Always start with the test recipient set to your own email.** You don't want to accidentally cold-email a real professor with placeholder text.
- The mock professor emails in the prototype (e.g., `professor@example.com`) are likely fake. Replace with your real curated list before going live.
- Check current EmailJS account quotas before sending.

## Primary method: Gmail OAuth

ProfMatch's primary email method is **Gmail OAuth** — emails are sent directly from the student's own Gmail address. This is more authentic for cold outreach and doesn't require any external service setup. Just click "Connect Gmail" in Step 5.

Gmail OAuth also enables:
- **Inbox monitoring** — automatically detects professor replies in Step 6
- **Session persistence** — stays connected across page refreshes

## When to use EmailJS instead

- You don't want to grant Gmail permissions
- You want to send from a non-Gmail address (Outlook, Yahoo, custom domain)
- You need to send on behalf of someone else
- Gmail OAuth consent screen is too complex for your use case
