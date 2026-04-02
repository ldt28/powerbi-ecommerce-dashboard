import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, BookOpen, MessageSquare, AlertCircle, CheckCircle2 } from "lucide-react";

/**
 * Help and Documentation Page
 * Comprehensive resource center for users
 */

const helpCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: "🚀",
    description: "Learn the basics and set up your account",
  },
  {
    id: "platform-connections",
    title: "Platform Connections",
    icon: "🔗",
    description: "Connect and manage your analytics platforms",
  },
  {
    id: "dashboard",
    title: "Dashboard & Analytics",
    icon: "📊",
    description: "Understand your analytics dashboard",
  },
  {
    id: "data-export",
    title: "Data & Export",
    icon: "📥",
    description: "Export and manage your data",
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    icon: "🔧",
    description: "Solve common issues",
  },
];

const faqs = [
  {
    category: "getting-started",
    question: "How do I get started with EcomAnalytics?",
    answer:
      "Start by creating an account and completing the onboarding flow. You'll be guided through connecting your first analytics platform and customizing your dashboard.",
  },
  {
    category: "getting-started",
    question: "What platforms does EcomAnalytics support?",
    answer:
      "We currently support Google Analytics 4, Facebook Ads Manager, and YouTube Analytics. More platforms are coming soon!",
  },
  {
    category: "platform-connections",
    question: "How do I connect my Google Analytics account?",
    answer:
      "Go to Settings > Platform Connections, click 'Connect Google Analytics', and follow the OAuth flow. We only request read-only access to your data.",
  },
  {
    category: "platform-connections",
    question: "Is my data secure when connecting platforms?",
    answer:
      "Yes! We use industry-standard OAuth 2.0 and never store your account credentials. You can disconnect any platform at any time.",
  },
  {
    category: "platform-connections",
    question: "How often does data sync?",
    answer:
      "Data syncs automatically every 30 minutes. You can also manually refresh any connection from the Platform Connections page.",
  },
  {
    category: "dashboard",
    question: "How do I customize my dashboard?",
    answer:
      "Click the 'Customize' button on your dashboard to choose which metrics, charts, and platforms to display. Your preferences are saved automatically.",
  },
  {
    category: "dashboard",
    question: "Can I compare data across different time periods?",
    answer:
      "Yes! Use the date range picker at the top of your dashboard to select any time period. You can also use the 'Compare' feature to see year-over-year or month-over-month changes.",
  },
  {
    category: "data-export",
    question: "How do I export my data?",
    answer:
      "Click the 'Export' button on any chart or dashboard view. You can export as CSV or PDF. Reports are also available for scheduled delivery.",
  },
  {
    category: "data-export",
    question: "Can I schedule automated reports?",
    answer:
      "Yes! Go to Settings > Reports to set up automated reports that are delivered to your email on a daily, weekly, or monthly basis.",
  },
  {
    category: "troubleshooting",
    question: "Why is my data not syncing?",
    answer:
      "Check your platform connection status in Settings > Platform Connections. If there's an error, try refreshing the connection. If the issue persists, contact our support team.",
  },
  {
    category: "troubleshooting",
    question: "I'm seeing old data. How do I refresh?",
    answer:
      "Click the 'Refresh' button on your dashboard or go to Platform Connections and click 'Refresh' on the specific platform. Data typically updates within 5 minutes.",
  },
];

const tutorials = [
  {
    id: "setup-ga4",
    title: "Setting Up Google Analytics 4",
    category: "platform-connections",
    duration: "5 min",
    description: "Step-by-step guide to connect your GA4 property",
  },
  {
    id: "setup-facebook",
    title: "Connecting Facebook Ads Manager",
    category: "platform-connections",
    duration: "3 min",
    description: "Connect your Facebook Ads account for ad performance tracking",
  },
  {
    id: "dashboard-overview",
    title: "Dashboard Overview",
    category: "dashboard",
    duration: "4 min",
    description: "Learn about all dashboard features and metrics",
  },
  {
    id: "create-report",
    title: "Creating Custom Reports",
    category: "data-export",
    duration: "6 min",
    description: "Build and schedule custom reports for your team",
  },
  {
    id: "team-collaboration",
    title: "Team Collaboration",
    category: "getting-started",
    duration: "3 min",
    description: "Invite team members and manage permissions",
  },
];

export default function Help() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredTutorials = tutorials.filter((tutorial) => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || tutorial.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Help & Documentation</h1>
          <p className="text-muted-foreground">Find answers and learn how to use EcomAnalytics</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className="justify-start"
          >
            All Topics
          </Button>
          {helpCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="justify-start"
            >
              <span className="mr-2">{category.icon}</span>
              {category.title}
            </Button>
          ))}
        </div>

        {/* Tutorials Section */}
        {filteredTutorials.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold">Video Tutorials</h2>
              <p className="text-muted-foreground">Learn by watching</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTutorials.map((tutorial) => (
                <Card key={tutorial.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                        <CardDescription>{tutorial.description}</CardDescription>
                      </div>
                      <span className="text-2xl ml-2">▶️</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Duration: {tutorial.duration}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* FAQs Section */}
        {filteredFaqs.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
              <p className="text-muted-foreground">Quick answers to common questions</p>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* No Results */}
        {filteredFaqs.length === 0 && filteredTutorials.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No results found</h3>
              <p className="text-muted-foreground mt-2">
                Try adjusting your search or category filters
              </p>
            </CardContent>
          </Card>
        )}

        {/* Support Section */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Still need help?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex gap-3">
              <Button variant="outline">Email Support</Button>
              <Button variant="outline">Chat with Us</Button>
              <Button variant="outline">View Docs</Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>• Use keyboard shortcuts to navigate faster</p>
              <p>• Customize your dashboard for your workflow</p>
              <p>• Set up alerts for important metrics</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>• API Documentation</p>
              <p>• Integration Guides</p>
              <p>• Best Practices</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Updates
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>• New features released weekly</p>
              <p>• Subscribe to our newsletter</p>
              <p>• Follow our blog</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
