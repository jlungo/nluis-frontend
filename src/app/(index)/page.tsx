import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Users, FileText, MapPin, Map, ShoppingBag, Shield, CheckCircle, Globe, Building2, Search } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function Page() {
  const navigate = useNavigate();

  const onLogin = () => {
    navigate('/login');
  };

  const onExplore = () => {
    // Navigate to explore page or scroll to features
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const onEnterMapShop = () => {
    // Navigate to MapShop or implement MapShop functionality
    console.log('Entering MapShop...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10">
      {/* Header with Official Branding */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Tanzania Coat of Arms */}
              <div className="flex items-center gap-3">
                <img 
                  src="/bibi_na_bwana.png" 
                  alt="Tanzania Coat of Arms" 
                  className="h-12 w-12 object-contain"
                />
                <div className="border-l border-border pl-3">
                  <div className="text-sm font-medium text-primary">United Republic of Tanzania</div>
                  <div className="text-xs text-muted-foreground">Ministry of Lands</div>
                </div>
              </div>
              
              {/* NLUPC Logo */}
              <div className="flex items-center gap-3">
                <img 
                  src="/nlus.png" 
                  alt="National Land Use Planning Commission" 
                  className="h-12 w-12 object-contain"
                />
                <div>
                  <div className="text-sm font-medium text-primary">NLUPC</div>
                  <div className="text-xs text-muted-foreground">National Land Use Planning Commission</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onEnterMapShop} className="gap-2">
                <Map className="h-4 w-4" />
                MapShop
              </Button>
              <Button onClick={onLogin} className="gap-2">
                <Shield className="h-4 w-4" />
                Official Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          {/* Official Government Header */}
          <div className="space-y-4">
            <div className="flex justify-center items-center gap-4 mb-6">
              <img 
                src="/nlus.png" 
                alt="NLUPC Logo" 
                className="h-20 w-20 object-contain"
              />
              <div className="h-16 w-px bg-border" />
              <img 
                src="/bibi_na_bwana.png" 
                alt="Tanzania Coat of Arms" 
                className="h-20 w-20 object-contain"
              />
            </div>
            
            <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 px-4 py-2">
              <Shield className="h-4 w-4 mr-2" />
              Official Government System
            </Badge>
            
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              National Land Use Information System
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Tanzania's comprehensive digital platform for land use planning, management, and monitoring. 
              Supporting sustainable development from village to national levels through the official 23-step NLUPC process.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button onClick={onLogin} size="lg" className="gap-3 px-8 py-6 text-lg">
              <Shield className="h-5 w-5" />
              Access NLUIS Platform
              <ArrowRight className="h-5 w-5" />
            </Button>
            
            <Button onClick={onEnterMapShop} variant="outline" size="lg" className="gap-3 px-8 py-6 text-lg">
              <ShoppingBag className="h-5 w-5" />
              Browse MapShop
              <Map className="h-5 w-5" />
            </Button>
          </div>

          {/* Key Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto mt-12">
            <div className="text-center">
              <div className="font-bold text-2xl text-primary">1,200+</div>
              <div className="text-sm text-muted-foreground">Villages Mapped</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl text-primary">31</div>
              <div className="text-sm text-muted-foreground">Regions Covered</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl text-primary">169</div>
              <div className="text-sm text-muted-foreground">Districts Active</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-2xl text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Maps Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Comprehensive Land Use Management</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From village-level planning to national policy implementation, NLUIS supports all levels of Tanzania's land use planning hierarchy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Land Use Planning */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-primary">Land Use Planning</CardTitle>
              <CardDescription>
                Complete 23-step NLUPC process from village to national level planning with official workflows and documentation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Village Land Use Plans</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>District & Regional Planning</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>National Land Use Framework</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Zonal Development Plans</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CCRO Management */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-primary">CCRO Management</CardTitle>
              <CardDescription>
                Streamlined Certificate of Customary Right of Occupancy processing with digital workflows and tracking.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Application Processing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Document Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Status Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Compliance Monitoring</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* MapShop */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-primary">Official MapShop</CardTitle>
              <CardDescription>
                Purchase official land use maps and shapefiles directly from government sources with guaranteed authenticity.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Verified Shapefiles</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Official Land Use Maps</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Multiple Format Options</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Instant Digital Delivery</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organizations */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-primary">Organization Management</CardTitle>
              <CardDescription>
                Register and manage land use planning organizations, consultants, and stakeholder groups.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Organization Registration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Member Management</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Certification Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Performance Monitoring</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-primary">Compliance Monitoring</CardTitle>
              <CardDescription>
                Ensure adherence to land use regulations and policies with automated compliance tracking and reporting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Regulatory Compliance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Automated Monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Violation Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Enforcement Support</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Management & Evaluation */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-primary/10 hover:border-primary/30">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-primary">Management & Evaluation</CardTitle>
              <CardDescription>
                Comprehensive monitoring and evaluation of land use planning outcomes and implementation effectiveness.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Impact Assessment</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Performance Metrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Progress Tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Strategic Planning</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* MapShop CTA Section */}
      <section className="bg-primary/5 border-y border-primary/10">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10 px-4 py-2">
                <Map className="h-4 w-4 mr-2" />
                Tanzania MapShop Portal
              </Badge>
              
              <h2 className="text-3xl font-bold text-foreground">
                Access Official Land Use Maps & Shapefiles
              </h2>
              
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Purchase authenticated, survey-grade land use maps and geospatial data directly from government sources. 
                Available in multiple formats with instant digital delivery and hardcopy options.
              </p>
            </div>

            {/* MapShop Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-background rounded-lg p-6 border border-primary/10">
                <Search className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Search & Filter</h3>
                <p className="text-sm text-muted-foreground">Find maps by village, district, region, or land use type with advanced filtering options.</p>
              </div>
              
              <div className="bg-background rounded-lg p-6 border border-primary/10">
                <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Official & Verified</h3>
                <p className="text-sm text-muted-foreground">All maps are survey-grade and officially verified by Tanzania government agencies.</p>
              </div>
              
              <div className="bg-background rounded-lg p-6 border border-primary/10">
                <FileText className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Multiple Formats</h3>
                <p className="text-sm text-muted-foreground">Download as shapefiles, PDFs, or order professional hardcopy prints.</p>
              </div>
            </div>

            <Button onClick={onEnterMapShop} size="lg" className="gap-3 px-8 py-6 text-lg">
              <ShoppingBag className="h-5 w-5" />
              Enter MapShop Portal
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary/5 border-t border-primary/10">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img 
                  src="/nlus.png" 
                  alt="NLUPC Logo" 
                  className="h-10 w-10 object-contain"
                />
                <div>
                  <div className="font-semibold text-primary">NLUPC</div>
                  <div className="text-xs text-muted-foreground">National Land Use Planning Commission</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Supporting sustainable land use planning across Tanzania through digital innovation and comprehensive policy implementation.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-primary">Government Links</h4>
              <div className="space-y-2 text-sm">
                <div>Ministry of Lands, Housing and Human Settlements Development</div>
                <div>Tanzania Land Information System (TLIS)</div>
                <div>National Bureau of Statistics</div>
                <div>President's Office - Regional Administration and Local Government</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-primary">Contact Information</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>National Land Use Planning Commission</div>
                <div>P.O. Box 2603, Dodoma, Tanzania</div>
                <div>Email: info@nlupc.go.tz</div>
                <div>Phone: +255 26 232 4021</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-primary/10 mt-8 pt-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img 
                src="/bibi_na_bwana.png" 
                alt="Tanzania Coat of Arms" 
                className="h-8 w-8 object-contain"
              />
              <div className="text-xs text-muted-foreground">
                © 2025 United Republic of Tanzania. All rights reserved.
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              Official Government System • NLUIS v2.0
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
