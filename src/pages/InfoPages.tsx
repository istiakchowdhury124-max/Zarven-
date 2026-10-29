import React, { useState } from 'react';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { Mail, Phone, MapPin, Check, Send } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { settings } = useSiteSettings();

  return (
    <div className="w-full min-h-screen py-16 bg-[#fafafc] text-[#111116]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            <img 
              src={settings.logoUrl || '/assets/aistudio/1792832789266_1792835490423edit_539d88fb.jpg'} 
              alt="Zarven Official Emblem" 
              className="w-24 h-24 rounded-full object-cover border-2 border-[#b8860b]/60 shadow-lg ring-2 ring-[#e5e5eb]"
            />
          </div>
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-[#b8860b] font-medium">
            The Heritage & Maison
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#111116] uppercase tracking-tight">
            The Atelier of Zarven
          </h1>
          <p className="text-xs sm:text-sm font-mono tracking-widest text-[#b8860b] uppercase font-semibold">
            We Believe In Quality
          </p>
          <p className="text-sm sm:text-base text-[#52525b] max-w-2xl mx-auto leading-relaxed font-light">
            Founded with a singular commitment: restoring architectural tailoring and noble natural textiles to the modern luxury lexicon.
          </p>
        </div>

        <div className="relative aspect-16/9 rounded-xs overflow-hidden border border-[#e5e5eb] shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=1600&auto=format&fit=crop"
            alt="Zarven Atelier Workroom"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter contrast-105"
          />
        </div>

        <div className="space-y-8 text-xs sm:text-sm text-[#52525b] leading-relaxed font-light">
          <div>
            <h2 className="font-serif text-lg text-[#111116] font-semibold mb-3">
              Uncompromising Sourcing
            </h2>
            <p>
              We decline synthetic polymers in our primary suiting and outerwear. Every jacket, trouser, and coat is commissioned in direct partnership with venerable mills across Biella, Italy, Yorkshire, and artisan silk weavers in Bengal. We prioritize virgin wools, superfine cashmeres, raw tussar silks, and vegetable-tanned lambskins that develop a sublime patina over decades of wear.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-lg text-[#111116] font-semibold mb-3">
              Structural Anatomy
            </h2>
            <p>
              A Zarven blazer is recognized by its soft shoulder expression, roped sleeve heads, and full canvas chest structure. The internal horsehair canvas breathes and shapes itself to your silhouette through natural body warmth, creating an unparalleled drape that ready-to-wear fast fashion simply cannot replicate.
            </p>
          </div>

          <div className="p-6 bg-[#ffffff] border border-[#e5e5eb] rounded-xs space-y-2 shadow-xs">
            <h3 className="font-serif text-sm text-[#b8860b] font-semibold">Atelier Flagship & Concierge</h3>
            <p className="text-xs text-[#52525b]">{settings.address}</p>
            <p className="text-xs text-[#71717a]">Private fitting sessions available by advance booking.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactPage: React.FC = () => {
  const { settings } = useSiteSettings();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: 'Bespoke Fitting Appointment', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="w-full min-h-screen py-16 bg-[#fafafc] text-[#111116]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#b8860b] font-medium">
            Concierge & Inquiries
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#111116] uppercase">
            Connect With Zarven
          </h1>
          <p className="text-xs sm:text-sm text-[#52525b] max-w-lg mx-auto">
            Our sartorial consultants are available for personal styling, sizing guidance, and private atelier appointments.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 bg-[#ffffff] border border-[#e5e5eb] rounded-xs space-y-6 shadow-xs">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-[#b8860b] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif text-xs uppercase tracking-wider text-[#111116] font-semibold">Atelier Location</h4>
                  <p className="text-xs text-[#52525b] mt-1">{settings.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-[#b8860b] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif text-xs uppercase tracking-wider text-[#111116] font-semibold">Telephone Concierge</h4>
                  <p className="text-xs text-[#52525b] mt-1">{settings.contactPhone}</p>
                  <p className="text-[10px] text-[#71717a] mt-0.5">Saturday – Thursday, 10:00 AM – 8:00 PM</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-[#b8860b] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif text-xs uppercase tracking-wider text-[#111116] font-semibold">Electronic Mail</h4>
                  <p className="text-xs text-[#52525b] mt-1">{settings.contactEmail}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-8 bg-[#ffffff] border border-[#e5e5eb] rounded-xs shadow-xs">
              {submitted ? (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-lg text-[#111116]">Message Transmitted</h3>
                  <p className="text-xs text-[#71717a] max-w-sm mx-auto">
                    Thank you. A Zarven concierge advisor will review your note and respond within twelve business hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="text-[11px] text-[#52525b] uppercase tracking-wider block mb-1">Your Name *</label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        autoComplete="name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-[#f8f8fa] border border-[#d4d4d8] text-xs text-[#111116] px-3.5 py-2.5 rounded-xs focus:outline-hidden focus:border-[#111116]"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="text-[11px] text-[#52525b] uppercase tracking-wider block mb-1">Email Address *</label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-[#f8f8fa] border border-[#d4d4d8] text-xs text-[#111116] px-3.5 py-2.5 rounded-xs focus:outline-hidden focus:border-[#111116]"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="text-[11px] text-[#52525b] uppercase tracking-wider block mb-1">Subject</label>
                    <select
                      id="contact-subject"
                      name="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full bg-[#f8f8fa] border border-[#d4d4d8] text-xs text-[#111116] px-3.5 py-2.5 rounded-xs focus:outline-hidden focus:border-[#111116]"
                    >
                      <option>Bespoke Fitting Appointment</option>
                      <option>Garment Sizing Guidance</option>
                      <option>Order Status Inquiry</option>
                      <option>Private Corporate Gifting</option>
                      <option>Other Matter</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="text-[11px] text-[#52525b] uppercase tracking-wider block mb-1">Message *</label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Share your requirements or preferred fitting schedule..."
                      className="w-full bg-[#f8f8fa] border border-[#d4d4d8] text-xs text-[#111116] px-3.5 py-2.5 rounded-xs focus:outline-hidden focus:border-[#111116]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#111116] hover:bg-[#272732] text-white text-xs uppercase tracking-widest font-semibold rounded-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Message to Concierge</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FAQPage: React.FC = () => {
  const faqs = [
    {
      q: 'How does Zarven garment sizing compare to standard international brands?',
      a: 'Our silhouettes are tailored with classic European drops (Drop 6 and Drop 7). Suits and blazers run true to size with an architectural, clean contour through the waist. Detailed measurements for chest, sleeve pitch, shoulder width, and jacket length are provided on every product page.'
    },
    {
      q: 'What are the delivery timelines across Dhaka and greater Bangladesh?',
      a: 'Within Metropolitan Dhaka, delivery is fulfilled via dedicated courier within 24 to 48 hours. For Chittagong, Sylhet, and other regional divisions, express delivery arrives within 3 to 4 business days.'
    },
    {
      q: 'Is Cash on Delivery (COD) supported?',
      a: 'Yes, Cash on Delivery is gladly accepted across all delivery zones up to ৳50,000 per order. For bespoke orders or custom alterations, prior payment via bKash, Nagad, or credit card is required.'
    },
    {
      q: 'Can I exchange a garment if the fit requires adjustments?',
      a: 'We offer a complimentary 7-day exchange window for unwashed, unworn garments with original tags and atelier garment bags intact.'
    }
  ];

  return (
    <div className="w-full min-h-screen py-16 bg-[#fafafc] text-[#111116]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#b8860b] font-medium">Frequently Asked</span>
          <h1 className="font-serif text-3xl font-bold text-[#111116] uppercase">Client Care & FAQ</h1>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="p-6 bg-[#ffffff] border border-[#e5e5eb] rounded-xs space-y-2 shadow-xs">
              <h3 className="font-serif text-sm font-semibold text-[#111116]">{faq.q}</h3>
              <p className="text-xs text-[#52525b] leading-relaxed font-light">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const PolicyPage: React.FC<{ type: 'privacy' | 'terms' | 'return' }> = ({ type }) => {
  const titles = {
    privacy: 'Privacy & Data Protection Policy',
    terms: 'Terms of Service & Atelier Conditions',
    return: 'Returns, Exchanges & Bespoke Alterations'
  };

  return (
    <div className="w-full min-h-screen py-16 bg-[#fafafc] text-[#111116]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#b8860b] font-medium">Legal Governance</span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#111116] uppercase">{titles[type]}</h1>
        <div className="p-8 bg-[#ffffff] border border-[#e5e5eb] rounded-xs space-y-4 text-xs text-[#52525b] leading-relaxed font-light shadow-xs">
          <p>
            At Zarven, we hold client privacy and transparency with the utmost gravity. All personal identifiers, addresses, and transaction references are safeguarded through Firebase Firestore security rules and server-side encryption.
          </p>
          <p>
            Client records are strictly utilized for order fulfillment, courier transit updates, and invitation dispatches. We never sell, lease, or monetize client records to third-party advertising brokers.
          </p>
          <p>
            Orders can be returned or exchanged within seven days of receipt upon inspection by our atelier quality team. Garments must remain in unblemished, unworn condition with tags intact.
          </p>
        </div>
      </div>
    </div>
  );
};
