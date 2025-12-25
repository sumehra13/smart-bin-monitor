import { Recycle, Users, Building2, ArrowRight, Trash2, Bell, TrendingUp, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="relative container py-24 lg:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/10 backdrop-blur-sm rounded-full text-primary-foreground/90 text-sm font-medium">
              <Recycle className="w-4 h-4" />
              AI-Powered Smart City Solution
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight animate-fade-in">
              Fix My City
            </h1>
            <p className="text-xl md:text-2xl text-primary-foreground/80 font-medium">
              Smart Garbage Overflow Prediction System
            </p>
            <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto">
              Using machine learning to predict garbage overflow, notify authorities automatically, 
              and empower citizens to monitor cleanliness in real-time.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/auth/citizen">
                <Button variant="hero" size="xl" className="w-full sm:w-auto group">
                  <Users className="w-5 h-5 mr-2" />
                  Citizen Login
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/auth/bbmp">
                <Button variant="heroOutline" size="xl" className="w-full sm:w-auto group">
                  <Building2 className="w-5 h-5 mr-2" />
                  BBMP Login
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our intelligent system combines real-time monitoring with predictive analytics
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
                  <Trash2 className="w-7 h-7 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">Monitor Bins</h3>
                <p className="text-sm text-muted-foreground">
                  Real-time tracking of garbage levels across all bins in the city
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-accent flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7 text-accent-foreground" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">ML Prediction</h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered overflow prediction based on historical data and patterns
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-warning flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Bell className="w-7 h-7 text-warning-foreground" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">Auto Alerts</h3>
                <p className="text-sm text-muted-foreground">
                  Automatic notifications to BBMP when overflow is predicted
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="pt-6 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-success flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MapPin className="w-7 h-7 text-success-foreground" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">Quick Response</h3>
                <p className="text-sm text-muted-foreground">
                  Efficient collection scheduling and resolution tracking
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t bg-muted/30">
        <div className="container text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Recycle className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Fix My City</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Smart Garbage Overflow Prediction System • Powered by AI/ML
          </p>
        </div>
      </footer>
    </div>
  );
}
