/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle } from 'lucide-react';

interface ContactPageProps {
  showNotification: (msg: string, type: 'success' | 'error') => void;
}

export default function ContactPage({ showNotification }: ContactPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      showNotification('Please fill in all mandatory fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    // Simulating API call
    setTimeout(() => {
      setIsSubmitting(false);
      showNotification('Thank you! Your message has been received. Our team will read and respond shortly.', 'success');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    }, 1200);
  };

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page title */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Support & Contact</h1>
          <p className="mt-4 text-base text-gray-500">
            Have questions about account configuration, job postings, or RLS databases? Reach out below and our representatives will reach back within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          
          {/* Info cards */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-150">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <HelpCircle className="h-5 w-5 text-blue-600 mr-2" />
                Contact Information
              </h2>
              <p className="text-sm text-gray-500 mb-6 font-sans">
                For rapid enterprise support, API collaborations, or billing inquiries, refer to these direct channels.
              </p>

              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400 shrink-0" />
                  <span>support@jobbridge.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400 shrink-0" />
                  <span>+1 (555) 480-1280</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
                  <span>100 Pine Street, San Francisco, CA 94111</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/50 p-6 rounded-lg border border-blue-100">
              <h3 className="font-bold text-blue-900 text-sm mb-1">Corporate HQ</h3>
              <p className="text-xs text-blue-700 leading-relaxed">
                Our main offices are located in SF Financial District. Visitors must pre-register with our front-desk system at least 24 hours prior to arrival.
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="md:col-span-7 bg-white p-6 sm:p-8 rounded-lg border border-gray-150 shadow-sm" id="contact-form">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Drop Us a Message</h3>
            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 leading-none">Your Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 leading-none">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 leading-none">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Partnership, feedback, support request"
                  className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1 leading-none">Message Body *</label>
                <textarea
                  name="message"
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can our representatives support your pipeline..."
                  className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex justify-center items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-550 transition disabled:opacity-55 cursor-pointer"
                id="contact-submit-btn"
              >
                {isSubmitting ? (
                  <span>Sending Message...</span>
                ) : (
                  <>
                    <span>Send Message</span>
                    <Send className="h-4 w-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
