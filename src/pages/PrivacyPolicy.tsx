import React from "react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy & Data Retention</h1>
        
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">1. Introduction</h2>
          <p>This Privacy Policy explains how we collect, use, and protect your personal information when you use our football management application.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">2. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Player personal information (name, age, date of birth)</li>
            <li>Player performance data and statistics</li>
            <li>Coach and staff information</li>
            <li>Parent/guardian contact details</li>
            <li>Team and fixture information</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">3. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Player development tracking and analysis</li>
            <li>Team management and organization</li>
            <li>Communication with players, coaches, and parents</li>
            <li>Performance analysis and reporting</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">4. Data Protection</h2>
          <p>We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">5. Data Retention</h2>
          <p>We retain personal data for as long as necessary to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Maintain player records and development history</li>
            <li>Comply with legal obligations</li>
            <li>Resolve disputes</li>
            <li>Enforce our agreements</li>
          </ul>
          <p className="mt-4">Player data is retained for the duration of their involvement with the team and for a period of 2 years afterward for historical and analytical purposes.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal data</li>
            <li>Request corrections to your data</li>
            <li>Request deletion of your data</li>
            <li>Object to data processing</li>
          </ul>
        </section>

        <div className="mt-8">
          <Link to="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}