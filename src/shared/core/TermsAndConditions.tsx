"use client";
import { useEffect } from "react";

const TermsAndConditions = () => {
  useEffect(() => {
    document.title =
      "Terms and Conditions | Responsible Governance AI | Cognitiveview ";

    function setMeta(
      attrType: "name" | "property",
      attr: string,
      content: string
    ) {
      let element = document.head.querySelector(`meta[${attrType}="${attr}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attrType, attr);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    }

    // Set meta tags
    setMeta(
      "name",
      "description",
      "Cognitive View is an AI-powered RegTech platform that automates compliance and conduct risk monitoring by analyzing customer communications across voice, video, and text channels. It helps organizations streamline regulatory compliance, enhance customer experience, and reduce operational costs."
    );
    setMeta(
      "property",
      "og:title",
      "Free Trial | Responsible Governance AI | Cognitiveview "
    );
    setMeta(
      "property",
      "og:description",
      "Cognitive View is an AI-powered RegTech platform that automates compliance and conduct risk monitoring by analyzing customer communications across voice, video, and text channels. It helps organizations streamline regulatory compliance, enhance customer experience, and reduce operational costs."
    );
    setMeta(
      "property",
      "og:image",
      "https://app.cognitiveview.com/images/sideBarLogo.png"
    );
    setMeta("property", "og:url", "https://app.cognitiveview.com");

    setMeta("name", "twitter:card", "summary_large_image");
    setMeta(
      "name",
      "twitter:title",
      "Cognitive View: AI-Driven Compliance & Conduct Risk Automation"
    );
    setMeta(
      "name",
      "twitter:description",
      "Cognitive View is an AI-powered RegTech platform that automates compliance and conduct risk monitoring by analyzing customer communications across voice, video, and text channels. It helps organizations streamline regulatory compliance, enhance customer experience, and reduce operational costs."
    );
    setMeta(
      "name",
      "twitter:image",
      "https://app.cognitiveview.com/images/sideBarLogo.png"
    );
  }, []);
  return (
    <div className="min-h-dvh bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full rounded-lg bg-white p-8 shadow-lg">
        <p className="mb-8 text-sm text-gray-500">
          Last Updated: April 11, 2025
        </p>

        <section className="space-y-6 text-gray-700">
          <div>
            <h2 className="mb-2 text-xl font-semibold">1. Introduction</h2>
            <p>
              {`  Welcome to Cognitiveview Inc. ("Cognitiveview," "we," "our," or
              "us"), a Delaware-registered company headquartered in Austin,
              Texas, USA. We provide an AI Governance and Software-as-a-Service
              (SaaS) platform (collectively, the "Service"). By accessing or
              using our website and the Service, you ("User," "you," or "your")
              agree to comply with and be bound by these Terms & Conditions (the
              "Terms"). If you do not agree, you must immediately discontinue
              use of our website and the Service.`}
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold">2. Eligibility</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Legal Capacity: You represent and warrant that you have the
                legal capacity and authority to enter into these Terms.
              </li>
              <li>
                Age Restriction: You represent that you are at least the age of
                majority in your jurisdiction or, if not, you have obtained
                valid consent from a parent or legal guardian who agrees to be
                bound by these Terms on your behalf.
              </li>
              <li>
                Compliance: You agree your use of the Service complies with all
                applicable laws, regulations, and these Terms.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold">3. Scope of Service</h2>
            <p>
              Description of Service: Cognitiveview offers AI governance
              solutions, including tools for policy management, assessments,
              trust center hosting, and related functionalities.
            </p>
            <p>
              Modifications: We reserve the right to modify, suspend, or
              discontinue any aspect of the Service at any time without prior
              notice, provided such modifications do not materially reduce the
              core functionality of the Service.
            </p>
            <p>
              No Guarantee of Availability: We do not guarantee uninterrupted or
              error-free access to the Service. We may limit or restrict certain
              functionalities for maintenance, upgrades, or other business
              needs.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold">
              4. Account Registration
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Account Creation: To access certain features, you may be
                required to create an account. You agree to provide accurate,
                current, and complete information during registration and update
                such information promptly if it changes.
              </li>
              <li>
                Account Security: You are responsible for maintaining the
                confidentiality of your login credentials. You must notify us
                immediately at support@cognitiveview.com of any unauthorized use
                of your account or any other security breach.
              </li>
              <li>
                Multiple Accounts: You may not create multiple accounts for
                disruptive or abusive purposes. We reserve the right to suspend
                or terminate any duplicate or fraudulent accounts.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold">
              5. Subscription and Fees
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Subscription Plans: Certain features of our Service may be
                available through paid subscription plans. Details (including
                pricing, features, and billing cycles) will be provided at the
                time of purchase or sign-up.
              </li>
              <li>
                Payment Terms: By subscribing, you agree to pay all applicable
                fees in accordance with the billing terms in effect at the time
                the fee or charge becomes payable.
              </li>
              <li>
                Trials and Promotions: Cognitiveview may offer free trials or
                limited-time promotional pricing. At the end of such periods,
                you will be charged the standard fees unless you cancel prior to
                the expiration of the trial or promotional period.
              </li>
              <li>
                Taxes: All fees are exclusive of any taxes, levies, or duties
                imposed by taxing authorities. You are responsible for payment
                of all such taxes, levies, or duties.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold">
              6. Intellectual Property
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                {`  Ownership: Unless otherwise indicated, Cognitiveview owns or has
                validly licensed all content, designs, logos, trademarks, and
                other materials provided through the website and Service (the
                "Cognitiveview Content").`}
              </li>
              <li>
                {`   Limited License: Subject to your compliance with these Terms,
                Cognitiveview grants you a non-exclusive, non-transferable,
                revocable license to access and use the Service for your
                internal business purposes.`}
              </li>
              <li>
                {`   User Content: Any information or content (such as policy
                documents, risk assessments, or other materials) that you
                submit, upload, or otherwise make available on the Service
                remains your property. You grant us a worldwide, non-exclusive,
                royalty-free license to use, reproduce, and display your User
                Content solely as necessary to provide the Service.`}
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold">7. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Use the Service for unlawful, harmful, or fraudulent activities.
              </li>
              <li>
                Upload or transmit viruses, malware, or other harmful code.
              </li>
              <li>
                Engage in activities that could disrupt or damage the Service or
                our network.
              </li>
              <li>
                Attempt to gain unauthorized access to systems, passwords, or
                other user data.
              </li>
              <li>
                Reverse engineer, decompile, or extract source code from any
                part of the Service.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold">
              8. Data Protection and Privacy
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Compliance with Global Standards: We adhere to relevant data
                protection and privacy regulations, such as the EU General Data
                Protection Regulation (GDPR) and the California Consumer Privacy
                Act (CCPA).
              </li>
              <li>
                Data Processing: Any personal data we collect or process is
                handled in accordance with our{" "}
                <span className="text-blue-600 hover:underline">
                  Privacy Policy
                </span>
                , which outlines our data collection, use, and sharing
                practices. By using the Service, you acknowledge and agree to
                the practices described in our Privacy Policy.
              </li>
              <li>
                Cross-Border Data Transfers: Because we operate globally, your
                data may be transferred to and processed in countries outside of
                your location. We take steps to ensure appropriate safeguards
                are in place for these transfers, in accordance with applicable
                law.
              </li>
              <li>
                Data Security: We implement commercially reasonable measures to
                protect your data. However, no security system is impenetrable,
                and we cannot guarantee the absolute security of our systems.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold">9. Confidentiality</h2>
            <p>
              {` Definition: "Confidential Information" means any non-public
              information that is disclosed by one party to the other that is
              designated as confidential or which, under the circumstances,
              should reasonably be understood to be confidential.`}
            </p>
            <p>
              Obligations: Both parties agree to maintain all Confidential
              Information in strict confidence and not disclose or use such
              information for any purpose outside the scope of these Terms
              without prior written consent from the disclosing party.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold">
              10. Third-Party Services and Integrations
            </h2>
            <p>
              Third-Party Services: The Service may contain links or
              integrations to third-party websites, software, or services that
              are not operated by us.
            </p>
            <p>
              Disclaimer: We are not responsible for the content, privacy
              policies, or practices of any third-party services. Your use of
              these services is at your own risk and subject to the terms and
              conditions of those third parties.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold">
              11. Warranties and Disclaimers
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                {`  No Warranty: To the fullest extent permitted by applicable law,
                the Service is provided on an "AS IS" and "AS AVAILABLE" basis.
                We expressly disclaim all warranties, whether express or
                implied, including warranties of merchantability, fitness for a
                particular purpose, and non-infringement.`}
              </li>
              <li>
                {`No Guarantee of Compliance or Accuracy: While Cognitiveview
                provides tools and information to facilitate AI governance and
                risk assessment, we do not guarantee the completeness, accuracy,
                or compliance of such tools or information. You are solely
                responsible for ensuring that your AI and governance practices
                comply with applicable laws and regulations.`}
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold">
              12. Limitation of Liability
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                {` Indirect Damages: To the extent permitted by law, in no event
                shall Cognitiveview (nor its officers, directors, employees, or
                agents) be liable for any indirect, incidental, consequential,
                special, or exemplary damages, including loss of profits,
                revenue, data, or goodwill.`}
              </li>
              <li>
                {`  Aggregate Liability: Our total liability for any claims arising
                out of or related to these Terms or the Service shall not exceed
                the amount you paid to us for the specific Service in question
                during the twelve (12) months preceding the event giving rise to
                liability.`}
              </li>
              <li>
                Jurisdictional Variations: Some jurisdictions do not allow the
                exclusion or limitation of certain damages. In such
                jurisdictions, our liability shall be limited to the maximum
                extent permitted by law.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold">13. Indemnification</h2>
            <p>
              {` You agree to defend, indemnify, and hold harmless Cognitiveview,
              its affiliates, and their respective officers, directors,
              employees, and agents, from and against any claims, actions,
              suits, or damages (including attorneys' fees) arising out of or
              related to:`}
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Your use or misuse of the Service.</li>
              <li>Your breach of these Terms.</li>
              <li>Your violation of any applicable law or regulation.</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold">
              14. Governing Law and Dispute Resolution
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Governing Law: These Terms shall be governed by and construed in
                accordance with the laws of the State of Delaware, USA, without
                regard to conflict-of-laws principles.
              </li>
              <li>
                Venue: Any dispute arising out of or relating to these Terms
                shall be brought exclusively in the federal or state courts
                located in the State of Delaware. You consent to personal
                jurisdiction in such courts and waive any objection based on
                inconvenient forum.
              </li>
              <li>
                Injunctive Relief: Nothing in these Terms shall prevent either
                party from seeking injunctive relief in a court of competent
                jurisdiction to prevent irreparable harm.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold">15. Termination</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Termination by You: You may discontinue your use of the Service
                at any time by deactivating your account and ceasing all use.
              </li>
              <li>
                Termination by Us: We may suspend or terminate your access to
                the Service immediately if we determine, in our sole discretion,
                that you have breached these Terms, engaged in fraudulent or
                illegal activities, or for other justified reasons.
              </li>
              <li>
                Effect of Termination: Upon termination, the license granted to
                you under these Terms will end. We reserve the right to delete
                any of your data in our possession or control after a reasonable
                period, subject to our legal, regulatory, or operational
                obligations.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold">16. Changes to Terms</h2>
            <p>
              {`  We reserve the right to update or modify these Terms at any time.
              If we make material changes, we will provide notice by posting the
              updated Terms on our website and updating the "Last Updated" date
              above. Your continued use of the Service after the effective date
              of any changes constitutes your acceptance of those changes.`}
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold">17. Force Majeure</h2>
            <p>
              We shall not be liable for any delay or failure to perform
              resulting from causes outside our reasonable control, including
              acts of God, natural disasters, terrorism, riots, war, or
              governmental action.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold">
              18. Export Compliance
            </h2>
            <p>
              You may not use, export, import, or transfer the Service except as
              authorized by U.S. law and the laws of the jurisdiction in which
              you access the Service. You agree to comply with all relevant
              export laws and regulations.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold">19. Entire Agreement</h2>
            <p>
              These Terms, together with our{" "}
              <span className="text-blue-600 hover:underline">
                Privacy Policy
              </span>{" "}
              and any additional agreements or policies referred to herein,
              constitute the entire agreement between you and Cognitiveview
              regarding your use of the website and Service. They supersede any
              prior agreements or understandings, whether written or oral.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold">
              20. Severability and Waiver
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Severability: If any provision of these Terms is found to be
                invalid or unenforceable under applicable law, such provision
                will be enforced to the maximum extent possible and the
                remaining provisions will remain in full force and effect.
              </li>
              <li>
                No Waiver: Our failure to enforce any right or provision in
                these Terms shall not constitute a waiver of such right or
                provision.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold">21. Assignment</h2>
            <p>
              You may not assign or transfer these Terms or your rights or
              obligations hereunder, in whole or in part, without our prior
              written consent. We may freely assign or transfer these Terms at
              our sole discretion.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold">22. Contact Us</h2>
            <p>
              If you have any questions or concerns about these Terms, the
              Service, or would like to exercise any of your legal rights,
              please contact us at:
              <br />
              Cognitiveview Inc.
              <br />
              Email: support@cognitiveview.com
              <br />
              Address: Austin, Texas, USA
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold">Disclaimer</h2>
            <p>
              This document is provided for informational purposes only and does
              not constitute legal advice. You should consult a qualified
              attorney to ensure these Terms & Conditions comply with all
              relevant laws and regulations in your jurisdictions of operation.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
export default TermsAndConditions;
