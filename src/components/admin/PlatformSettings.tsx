
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';

export const PlatformSettings = () => {
  const [activeTab, setActiveTab] = useState("whatsapp");
  const { toast } = useToast();

  const whatsAppForm = useForm({
    defaultValues: {
      whatsappApiKey: "",
      whatsappPhoneNumberId: "",
      whatsappEnabled: false,
    }
  });

  const stripeForm = useForm({
    defaultValues: {
      stripePublicKey: "",
      stripeSecretKey: "",
      stripeWebhookSecret: "",
      stripeEnabled: false
    }
  });

  const emailForm = useForm({
    defaultValues: {
      smtpServer: "",
      smtpPort: "",
      smtpUsername: "",
      smtpPassword: "",
      smtpFromEmail: "",
      emailNotificationsEnabled: false
    }
  });

  const handleWhatsAppSubmit = (data: any) => {
    console.log("WhatsApp settings:", data);
    toast({
      title: "WhatsApp Settings Saved",
      description: "Your WhatsApp integration settings have been updated.",
    });
  };

  const handleStripeSubmit = (data: any) => {
    console.log("Stripe settings:", data);
    toast({
      title: "Stripe Settings Saved",
      description: "Your payment settings have been updated.",
    });
  };

  const handleEmailSubmit = (data: any) => {
    console.log("Email settings:", data);
    toast({
      title: "Email Settings Saved",
      description: "Your email notification settings have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs 
        defaultValue={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="whatsapp">
            WhatsApp Integration
          </TabsTrigger>
          <TabsTrigger value="payments">
            Payment Settings
          </TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>WhatsApp Integration</CardTitle>
                <Badge variant="outline">Status: Not Connected</Badge>
              </div>
              <CardDescription>
                Configure the WhatsApp integration to enable messaging features.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...whatsAppForm}>
                <form onSubmit={whatsAppForm.handleSubmit(handleWhatsAppSubmit)} className="space-y-4">
                  <FormField
                    control={whatsAppForm.control}
                    name="whatsappApiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta API Key</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder="Enter your Meta API key" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={whatsAppForm.control}
                    name="whatsappPhoneNumberId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp Phone Number ID</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your WhatsApp Phone Number ID" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={whatsAppForm.control}
                    name="whatsappEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Enable WhatsApp Integration</FormLabel>
                          <CardDescription>
                            Allow the platform to send notifications via WhatsApp
                          </CardDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button type="submit">Save WhatsApp Settings</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Stripe Payment Settings</CardTitle>
                <Badge variant="outline">Status: Not Connected</Badge>
              </div>
              <CardDescription>
                Configure Stripe payment integration for processing subscriptions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...stripeForm}>
                <form onSubmit={stripeForm.handleSubmit(handleStripeSubmit)} className="space-y-4">
                  <FormField
                    control={stripeForm.control}
                    name="stripePublicKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stripe Public Key</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="pk_..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={stripeForm.control}
                    name="stripeSecretKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stripe Secret Key</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder="sk_..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={stripeForm.control}
                    name="stripeWebhookSecret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stripe Webhook Secret</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder="whsec_..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={stripeForm.control}
                    name="stripeEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Enable Stripe Payments</FormLabel>
                          <CardDescription>
                            Allow the platform to process payments via Stripe
                          </CardDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button type="submit">Save Payment Settings</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Email Notification Settings</CardTitle>
                <Badge variant="outline">Status: Not Configured</Badge>
              </div>
              <CardDescription>
                Configure email settings for platform notifications.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={emailForm.control}
                      name="smtpServer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Server</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="smtp.example.com" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emailForm.control}
                      name="smtpPort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Port</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="587" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={emailForm.control}
                      name="smtpUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Username</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="username" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emailForm.control}
                      name="smtpPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Password</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" placeholder="password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={emailForm.control}
                    name="smtpFromEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>From Email Address</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="noreply@yourplatform.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={emailForm.control}
                    name="emailNotificationsEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Enable Email Notifications</FormLabel>
                          <CardDescription>
                            Allow the platform to send email notifications
                          </CardDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button type="submit">Save Email Settings</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
