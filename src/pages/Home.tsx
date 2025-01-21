import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  BarChart2, 
  Calendar, 
  Trophy,
  Shield,
  Zap,
  ArrowRight
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/0e21bdb0-5451-4dcf-a2ca-a4d572b82e47.png" 
              alt="Puma.AI Logo" 
              className="h-12"
            />
            <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Puma.AI
            </span>
          </div>
          <Link to="/auth">
            <Button variant="outline" className="font-medium">
              Login
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent animate-fade-in">
          Welcome to Puma.AI 
          Grass Roots to Academy - Transform Your Team Management
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto animate-slide-up">
          Elevate your football team's performance with AI-powered analytics, 
          intelligent player development, and seamless management tools.
        </p>
        <div className="flex gap-4 justify-center animate-fade-in">
          <Link to="/auth">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              Get Started <ArrowRight className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
              <Users className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Squad Management</h3>
            <p className="text-gray-600">
              Comprehensive player profiles, performance tracking, and development planning.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-violet-100 rounded-xl flex items-center justify-center mb-6">
              <BarChart2 className="h-6 w-6 text-violet-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Advanced Analytics</h3>
            <p className="text-gray-600">
              Data-driven insights for player performance and team optimization.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
              <Calendar className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Fixture Management</h3>
            <p className="text-gray-600">
              Organize matches, training sessions, and team events effortlessly.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-violet-100 rounded-xl flex items-center justify-center mb-6">
              <Trophy className="h-6 w-6 text-violet-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Tournament Tools</h3>
            <p className="text-gray-600">
              Manage tournaments, track performance, and analyze competition data.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
              <Shield className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Role Suitability</h3>
            <p className="text-gray-600">
              AI-powered position and role recommendations for optimal team setup.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-violet-100 rounded-xl flex items-center justify-center mb-6">
              <Zap className="h-6 w-6 text-violet-600" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Performance Tracking</h3>
            <p className="text-gray-600">
              Monitor progress, set objectives, and track achievements.
            </p>
          </div>
        </div>
      </section>
      
           
      </section>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              © 2024 Puma.AI. All rights reserved.
            </div>
            <Link to="/privacy-policy" className="text-sm text-gray-600 hover:text-gray-900">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
