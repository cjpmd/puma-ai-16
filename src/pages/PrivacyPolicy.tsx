import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy & Data Retention</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Collection and Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-lg font-semibold">Information We Collect</h3>
          <p>We collect and process the following types of information:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Player personal information (name, age, date of birth)</li>
            <li>Player performance data and statistics</li>
            <li>Parent/guardian contact information</li>
            <li>Coach information and credentials</li>
            <li>Team and fixture-related data</li>
          </ul>

          <h3 className="text-lg font-semibold mt-6">How We Use Your Data</h3>
          <p>Your data is used for:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Managing player registrations and team assignments</li>
            <li>Tracking player development and performance</li>
            <li>Organizing fixtures and tournaments</li>
            <li>Communication with parents/guardians</li>
            <li>Administrative purposes</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Retention</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <h3 className="text-lg font-semibold">Retention Periods</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Player profiles: Retained for the duration of active participation plus 2 years</li>
            <li>Performance data: Kept for 5 years for historical analysis</li>
            <li>Parent contact information: Maintained while the player is active</li>
            <li>Fixture and tournament records: Archived for 3 years</li>
            <li>Coach information: Retained while actively coaching plus 1 year</li>
          </ul>

          <h3 className="text-lg font-semibold mt-6">Data Deletion</h3>
          <p>You may request deletion of your data by contacting the team administrator. Note that some information may be retained for legal or administrative purposes.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>We implement appropriate security measures to protect your data:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Secure database hosting with encryption at rest</li>
            <li>Access controls and authentication requirements</li>
            <li>Regular security updates and monitoring</li>
            <li>Limited access to personal information</li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Rights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal data</li>
            <li>Request corrections to your data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent for data processing</li>
            <li>Receive a copy of your data</li>
          </ul>
          
          <p className="mt-4">For any privacy-related queries or requests, please contact the team administrator.</p>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground mt-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </div>
  );
};

export default PrivacyPolicy;