import React from "react";
import { X, Shield, FileText, Cookie } from "lucide-react";

export type LegalPolicyType = "terms" | "privacy" | "cookies";

interface LegalModalProps {
  policy: LegalPolicyType | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ policy, onClose }) => {
  if (!policy) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="bg-white rounded-xl shadow-2xl border border-stone-200 max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-[#1c1917] text-white px-6 py-4 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            {policy === "terms" && <FileText className="w-5 h-5 text-amber-400" />}
            {policy === "privacy" && <Shield className="w-5 h-5 text-emerald-400" />}
            {policy === "cookies" && <Cookie className="w-5 h-5 text-amber-400" />}
            <div>
              <h3 className="font-serif text-base font-bold tracking-wide uppercase">
                {policy === "terms" && "Terms & Conditions"}
                {policy === "privacy" && "Privacy Policy"}
                {policy === "cookies" && "Cookie Policy"}
              </h3>
              <p className="text-[11px] text-stone-400">STYLE AND CLASS London &middot; Official Policy Documentation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-stone-400 hover:text-white hover:bg-stone-800 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed font-light">
          {policy === "terms" && (
            <div className="space-y-4">
              <p className="font-medium text-stone-900">
                These are our terms and conditions for the use of our website STYLE AND CLASS and the purchase of products through the website.
              </p>
              <p>
                If you have any queries about these terms, please contact us using our concierge or support channels.
              </p>
              <p>
                The terms and conditions herein together with any notices or conditions on other areas of this website will all together govern use by customers of this website. You should note that Style and Class may at any time make changes to or remove part of this website without any liability to customers for such changes. Style and Class reserves the right to change these terms and conditions in the future without specifically notifying customers and continued use of the website or placing of orders after such changes shall be deemed to be acknowledgement and acceptance thereof.
              </p>
              <p className="font-medium text-stone-900">
                A contract will only come into existence between you the customer and us once your order has been processed and dispatched.
              </p>
              <p>When you as a customer place an order via this website, you warrant by placing the order that:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
                <li>You are not a minor or otherwise legally incapable of entering into a binding contract.</li>
                <li>The personal details which you give us on registration are fully complete and accurate.</li>
                <li>You are not using a false name or the name of any other person or body which you are not authorised to use.</li>
              </ul>
              <div className="space-y-2 pt-2">
                <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-xs">Placement of an order</h4>
                <p>When you place your order you are doing so in acceptance of these terms and conditions and it is important that you have read them before you go ahead and order.</p>
              </div>
              <div className="space-y-2 pt-2">
                <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-xs">Cancelling an order</h4>
                <p>As a customer, you are free to cancel an order within 7 days and will be refunded the amount of your order to the account the order originally was paid from.</p>
              </div>
              <div className="space-y-2 pt-2">
                <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-xs">Acceptance of an order</h4>
                <p>When an order is placed you will get an order confirmation sent to the email address you provided during checkout, containing information about order content and prices.</p>
              </div>
              <div className="space-y-2 pt-2">
                <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-xs">Delivery</h4>
                <p>You as a buyer are free to choose from mentioned and at the time relevant delivery option(s). Style and Class assumes no responsibility for damages during transport or damages caused from any delays beyond its control.</p>
              </div>
              <div className="space-y-2 pt-2">
                <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-xs">Returns Policy</h4>
                <p>Style and Class accepts returns within 7 days if products are not used, changed, washed or otherwise manipulated. Products need to be returned in original packaging. No products may be returned to Style and Class without the prior written consent of Style And Class Fashion and are subject to a return charge.</p>
              </div>
              <div className="space-y-2 pt-2">
                <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-xs">Liability</h4>
                <p>We try to have the information on this website as accurate as possible but we make no warranties, whether express or implied, regarding its accuracy. We also do not make any warranties regarding any matters relating to the use of this website and it is a matter for you to ensure that your own equipment is protected from viruses or other external factors.</p>
              </div>
              <p>
                Your rights are protected by the Sale of Goods and Supply of Services Act, 1980, and also the Consumer Protection Act, 2007, where you are a consumer. Nothing in this website shall affect your rights under the applicable law.
              </p>
              <div className="space-y-2 pt-2">
                <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-xs">Severance</h4>
                <p>If any of these terms and conditions shall prove to be void, unlawful, or unenforceable for any reason then such term or condition shall be deemed to be severed from the remaining terms and conditions which shall remain valid and enforceable.</p>
              </div>
            </div>
          )}

          {policy === "privacy" && (
            <div className="space-y-4">
              <p className="font-medium text-stone-900">
                This Privacy Policy describes how STYLE AND CLASS collects, uses, and protects your personal information when you visit or make a purchase from our website.
              </p>
              <div className="space-y-2 pt-2">
                <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-xs">How do we use your personal information?</h4>
                <p>We use the Order Information that we collect generally to fulfill any orders placed through and with the Site (including processing your payment information, arrangements for shipping, and providing you with invoices and/or order confirmations). Additionally, we use this Order Information to:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-stone-600">
                  <li>Communicate with you;</li>
                  <li>Screen orders for potential risk or fraud; and</li>
                  <li>When in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services.</li>
                </ul>
                <p className="pt-1">We are processing your information in order to fulfill contracts we might have with you (for example if you make an order through the Site), or otherwise to pursue our legitimate business interests listed above.</p>
              </div>
              <div className="space-y-2 pt-2">
                <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-xs">Data retention</h4>
                <p>When you place an order through the Site, we will maintain your Order Information for as long as necessary to carry out our services to you or for as long as we are required by relevant laws. After this period, your personal data will be deleted.</p>
              </div>
              <div className="space-y-2 pt-2">
                <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-xs">Changes</h4>
                <p>We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal or regulatory reasons.</p>
              </div>
              <div className="space-y-2 pt-2">
                <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-xs">Contact us</h4>
                <p>For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us via our WhatsApp concierge (+44 7591 878215) or email at support@styleandclass.co.uk.</p>
              </div>
            </div>
          )}

          {policy === "cookies" && (
            <div className="space-y-4">
              <p className="font-mono text-xs text-stone-500">This policy was last updated on 09/04/2024.</p>
              <p>
                When you visit or interact with our sites, we or our authorised service providers may use cookies, web beacons, and other similar technologies for storing information to help provide you with a better, faster, and safer experience and for advertising purposes.
              </p>
              <p>
                This page is designed to help you understand more about these technologies and our use of them on our sites. Below is a summary of a few key things you should know about our use of such technologies.
              </p>
              <div className="space-y-2 pt-2">
                <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-xs">What are cookies, web beacons, and similar technologies?</h4>
                <p>Like most sites, we use technologies that are essentially small data files placed on your computer, tablet, mobile phone, or other devices (referred to collectively as a &quot;device&quot;) that allow us to record certain pieces of information whenever you visit or interact with our sites, services, applications, messaging, and tools.</p>
                <p>The specific names and types of the cookies, web beacons, and other similar technologies we use may change from time to time. In order to help you better understand this Policy and our use of such technologies we have provided the following limited terminology and definitions:</p>
                <ul className="list-disc pl-5 space-y-1 text-stone-600">
                  <li><strong>Cookies:</strong> Small text files (typically made up of letters and numbers) placed in the memory of your browser or device when you visit a website or view a message. Cookies allow a website to recognise a particular device or browser.</li>
                  <li><strong>Session cookies:</strong> Expire at the end of your browser session and allow us to link your actions during that browser session.</li>
                  <li><strong>Persistent cookies:</strong> Stored on your device in between browser sessions, allowing us to remember your preferences or actions across multiple sites.</li>
                  <li><strong>First-party cookies:</strong> Set by the site you are visiting.</li>
                  <li><strong>Third-party cookies:</strong> Set by a third-party site separate from the site you are visiting.</li>
                </ul>
                <p className="pt-1">Cookies can be disabled or removed by tools that are available in most commercial browsers. The preferences for each browser you use will need to be set separately and different browsers offer different functionality and options.</p>
                <p><strong>Web beacons:</strong> Small graphic images (also known as &quot;pixel tags&quot; or &quot;clear GIFs&quot;) that may be included on our sites, services, applications, messaging, and tools, that typically work in conjunction with cookies to identify our users and user behaviour.</p>
                <p><strong>Other similar technologies:</strong> Technologies that store information in your browser or device utilising local shared objects or local storage, such as flash cookies, HTML 5 cookies, and other web application software methods.</p>
              </div>
              <div className="space-y-2 pt-2">
                <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-xs">Cookies used on this website</h4>
                <p>This website uses performance cookies. For more information on the performance cookies used on this website, please refer below.</p>
                <p><strong>Performance Cookies:</strong> These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site. All information these cookies collect is aggregated and therefore anonymous. If you do not allow these cookies we will not know when you have visited our site, and will not be able to monitor its performance.</p>
              </div>
              <div className="space-y-2 pt-2">
                <h4 className="font-semibold text-stone-900 uppercase tracking-wider text-xs">About this policy</h4>
                <p>We may amend the Cookie policy from time to time, in whole or in part, at our discretion. The latest version of this document will always be available at our website and will take effect on the date that it is updated.</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 px-6 py-3 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 text-white rounded text-xs font-semibold hover:bg-stone-800 transition"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
