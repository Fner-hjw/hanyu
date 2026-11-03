import type { Metadata } from "next";
import { APP_NAME, Contact, LegalPage, List, Section } from "@/components/Legal";

export const metadata: Metadata = {
  title: "Privacy Policy – Hànyǔ",
  description: "How Hànyǔ collects, uses, stores and deletes your information, including data received through Google Sign-In.",
};

export default function Privacy() {
  return (
    <LegalPage title="Privacy Policy" other={{ href: "/terms", label: "Terms of Service" }}>
      <p>
        {APP_NAME} (&ldquo;the app&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is a free Chinese learning web app. This policy explains what
        information the app handles, why, where it is stored, who it is shared with and how you can delete it. You can use the app
        without an account; in that case nothing about you leaves your device except what is described under &ldquo;Third-party services&rdquo;.
      </p>

      <Section title="1. Information we collect">
        <p><b>Without an account.</b> Your learning progress (flashcard schedules, study history, saved words, notes, mistakes and settings)
          is stored only in your browser&apos;s local storage on your device. We do not receive it.</p>
        <p><b>With an account (optional cloud sync).</b> If you sign in, we store:</p>
        <List>
          <li><b>Account information:</b> your email address, a unique user ID, the sign-in method you used and sign-in timestamps. If you sign up with email, your password is stored only as a secure hash by our authentication provider.</li>
          <li><b>Google Sign-In data:</b> if you choose &ldquo;Continue with Google&rdquo;, Google shares your email address, your name, your profile picture URL and your Google account ID with us (the <code>openid</code>, <code>email</code> and <code>profile</code> scopes). We request no other Google data and have no access to your Gmail, Drive, contacts, calendar or any other Google service.</li>
          <li><b>GitHub sign-in data:</b> if you choose &ldquo;Continue with GitHub&rdquo;, GitHub shares your email address, username and avatar URL.</li>
          <li><b>Learning progress:</b> a copy of the progress data described above, so it can be synced between your devices.</li>
        </List>
        <p><b>Technical data.</b> Like any website, our hosting provider automatically processes your IP address, browser type and request logs to serve pages and protect against abuse. We do not use analytics, advertising or tracking cookies.</p>
      </Section>

      <Section title="2. How we use information">
        <List>
          <li>To sign you in and keep you signed in.</li>
          <li>To back up your learning progress and sync it across your devices.</li>
          <li>To send emails you request: account confirmation, sign-in links and password resets.</li>
          <li>To keep the service secure and working.</li>
        </List>
        <p>We do not sell your information, use it for advertising, build profiles about you, or use it to train AI models.</p>
      </Section>

      <Section title="3. Google user data">
        <p>
          Information received from Google is used only to create and identify your {APP_NAME} account and display which account you are
          signed in with. It is not shared with anyone except the service providers listed below that are needed to run sign-in and
          storage, is not used for advertising, and is not transferred or sold to third parties.
        </p>
        <p>
          {APP_NAME}&apos;s use and transfer of information received from Google APIs adheres to the{" "}
          <a href="https://developers.google.com/terms/api-services-user-data-policy" className="font-semibold text-accent">Google API Services User Data Policy</a>,
          including the Limited Use requirements.
        </p>
        <p>You can revoke the app&apos;s access at any time from your Google Account at <a href="https://myaccount.google.com/permissions" className="font-semibold text-accent">myaccount.google.com/permissions</a>.</p>
      </Section>

      <Section title="4. Where data is stored and who processes it">
        <List>
          <li><b>Supabase</b> (authentication and database) stores your account and synced progress. Access is restricted so that each user can only read and write their own data.</li>
          <li><b>Vercel</b> hosts the website.</li>
          <li><b>Google</b> or <b>GitHub</b>, only if you choose to sign in with them.</li>
        </List>
        <p>These providers process data on our behalf and may store it in the United States, the European Union or other countries. Data is encrypted in transit (HTTPS).</p>
      </Section>

      <Section title="5. Third-party services you choose to use">
        <List>
          <li><b>AI features (bring your own key).</b> The conversation partner, writing feedback and speaking-test scoring only work if you add your own API key for an AI provider (for example Google Gemini, Anthropic, OpenAI, DeepSeek, OpenRouter or a local Ollama). Your key is stored only in your browser on that device; it is never synced to your account or sent to us. When you use these features, the text you write or say is sent directly from your browser to the provider you chose and is handled under that provider&apos;s own privacy policy.</li>
          <li><b>Speech recognition.</b> Speaking exercises use your browser&apos;s built-in speech recognition. Depending on your browser, audio may be processed by the browser vendor (for example Google in Chrome). Recordings you make to compare your voice stay on your device.</li>
          <li><b>Fonts.</b> Pages load fonts from Google Fonts, which receives your IP address when the fonts are downloaded.</li>
        </List>
      </Section>

      <Section title="6. Retention and deletion">
        <p>We keep your account and synced progress while your account exists. You can:</p>
        <List>
          <li>Delete everything on a device at any time under <b>Account → Backup file → Reset this device</b>, or by clearing your browser&apos;s site data.</li>
          <li>Download a copy of your data at any time under <b>Account → Backup file → Download backup</b>.</li>
          <li>Delete your account and all synced data yourself under <b>Account → Delete account</b>. Deletion is immediate and permanent.</li>
          <li>Or ask us to delete it by contacting us (see below); we do so within 30 days. Server backups held by our providers expire on their normal schedule.</li>
        </List>
      </Section>

      <Section title="7. Your rights">
        <p>Depending on where you live (for example under the GDPR or CCPA), you may have the right to access, correct, export or delete
          your personal data, to object to or restrict its processing, and to complain to your data protection authority. Our legal basis
          for processing account data is performing the service you asked for (contract) and, for security logs, our legitimate interest
          in keeping the service safe. Contact us to exercise any of these rights.</p>
      </Section>

      <Section title="8. Children">
        <p>The app is not directed at children under 13 and we do not knowingly collect personal data from them. If you believe a child has created an account, contact us and we will delete it.</p>
      </Section>

      <Section title="9. Changes">
        <p>If we change this policy we will update the date at the top of this page. Significant changes will be noted in the app.</p>
      </Section>

      <Section title="10. Contact">
        <p>Questions or deletion requests: <Contact /></p>
      </Section>
    </LegalPage>
  );
}
