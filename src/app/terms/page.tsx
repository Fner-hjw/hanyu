import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME, Contact, LegalPage, List, Section } from "@/components/Legal";

export const metadata: Metadata = {
  title: "Terms of Service – Hanyu Easy",
  description: "The terms for using the Hanyu Easy Chinese learning app.",
};

export default function Terms() {
  return (
    <LegalPage title="Terms of Service" other={{ href: "/privacy", label: "Privacy Policy" }}>
      <p>
        These terms govern your use of {APP_NAME} (&ldquo;the app&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), a free Chinese learning web app.
        By using the app you agree to these terms. If you do not agree, please do not use the app.
      </p>

      <Section title="1. The service">
        <p>The app provides vocabulary, flashcards, listening, speaking, writing, grammar, reading and test practice for learning Chinese.
          It is provided free of charge. We may add, change or remove features at any time.</p>
      </Section>

      <Section title="2. Accounts">
        <List>
          <li>An account is optional and is only needed to sync progress between devices.</li>
          <li>You can sign in with Google, GitHub, Microsoft or a passkey. You must provide accurate information and keep your sign-in details secure; you are responsible for activity under your account.</li>
          <li>You must be at least 13 years old (or the minimum age required in your country) to create an account.</li>
          <li>You may stop using the app and delete your account at any time under Account → Delete account.</li>
        </List>
      </Section>

      <Section title="3. Acceptable use">
        <p>You agree not to:</p>
        <List>
          <li>break the law or infringe anyone&apos;s rights while using the app;</li>
          <li>attempt to access other users&apos; data, or probe, disrupt or overload the service or its infrastructure;</li>
          <li>use automated means to scrape or copy the service in a way that harms its availability;</li>
          <li>use the app to send spam or abuse the sign-in features.</li>
        </List>
        <p>We may suspend or delete accounts that break these rules.</p>
      </Section>

      <Section title="4. Your content and data">
        <p>Your notes, saved words and progress belong to you. You give us only the permission needed to store and sync them for you.
          How we handle your data is described in the <Link href="/privacy" className="font-semibold text-accent">Privacy Policy</Link>.</p>
      </Section>

      <Section title="5. Third-party AI providers">
        <p>Some features let you connect your own account with an AI provider using your own API key. Your use of that provider is
          governed by its own terms and pricing, and any costs it charges are your responsibility. AI-generated corrections, explanations
          and scores can be wrong; use them as practice aids, not as authoritative assessments.</p>
      </Section>

      <Section title="6. Learning content and licences">
        <p>Study materials include third-party data used under their licences: the HSK 3.1 syllabus word list (MIT), CC-CEDICT
          (CC BY-SA 4.0), HSK sentences and audio by no7z (CC BY-SA 4.0) and Wikimedia Commons character data. Those materials remain
          under their original licences. The app is not affiliated with or endorsed by Chinese Testing International or the HSK exam
          organisers, and practice tests are not official exams.</p>
      </Section>

      <Section title="7. No warranty">
        <p>The app is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without warranties of any kind. We do not guarantee that it
          will be uninterrupted, error-free, or that content is complete or accurate, or that using it will lead to any exam result.
          Keep your own backup (Account → Backup file) if your progress matters to you.</p>
      </Section>

      <Section title="8. Limitation of liability">
        <p>To the fullest extent permitted by law, we are not liable for any indirect, incidental or consequential damages, or for loss of
          data, arising from your use of the app. Because the app is free, our total liability for any claim is limited to zero, except
          where the law does not allow such a limit. Nothing in these terms limits rights you have as a consumer that cannot be waived.</p>
      </Section>

      <Section title="9. Termination">
        <p>You can stop using the app at any time. We may suspend or end the service, or your access to it, at any time; where reasonable
          we will give notice so you can download a backup of your data.</p>
      </Section>

      <Section title="10. Changes to these terms">
        <p>We may update these terms. The date at the top shows the latest version. Continuing to use the app after a change means you accept the updated terms.</p>
      </Section>

      <Section title="11. Contact">
        <p>Questions about these terms: <Contact /></p>
      </Section>
    </LegalPage>
  );
}
