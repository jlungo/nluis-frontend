import { Map, BarChart3, Download, } from "lucide-react";
// Replace with your actual background image if needed
const exampleMapBackground = '';

const KeyFeatures = () => {
  const features = [
    {
      icon: Map,
      title: "Interactive Land Use Maps",
      color: "bg-chart-1/10 border-chart-1/20",
      iconColor: "text-chart-1"
    },
    {
      icon: BarChart3,
      title: "Real-time Statistics & Analytics", 
      color: "bg-chart-2/10 border-chart-2/20",
      iconColor: "text-chart-2"
    },
    // {
    //   icon: FileText,
    //   title: "Land Use Planning Tools",
    //   color: "bg-primary/10 border-primary/20",
    //   iconColor: "text-primary"
    // },
    // {
    //   icon: Award,
    //   title: "CCRO Certificate Management",
    //   color: "bg-chart-3/10 border-chart-3/20",
    //   iconColor: "text-chart-3"
    // },
    // {
    //   icon: Search,
    //   title: "Advanced Search & Filtering",
    //   color: "bg-chart-4/10 border-chart-4/20", 
    //   iconColor: "text-chart-4"
    // },
    {
      icon: Download,
      title: "Detailed Land Use Plans",
      color: "bg-destructive/10 border-destructive/20",
      iconColor: "text-destructive"
    }
  ];

  return (
    <div 
      className="relative w-full py-12 flex justify-center overflow-hidden"
      style={{
        backgroundImage: exampleMapBackground ? `url(${exampleMapBackground})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Faded overlay to make background image subtle */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm"></div>
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto p-6">
        <h2 className="text-4xl font-bold text-center mb-16 text-foreground">
          Key Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            
            return (
              <div
                key={index}
                className={`
                  ${feature.color} 
                  border-2 rounded-xl p-8 lg:p-10
                  hover:shadow-xl hover:scale-105 
                  transition-all duration-300 ease-in-out
                  cursor-pointer group
                  min-h-[220px] md:min-h-[260px] flex flex-col items-center justify-center
                  backdrop-blur-sm bg-opacity-95
                `}
              >
                <div className={`
                  ${feature.iconColor} 
                  mb-6 group-hover:scale-110 transition-transform duration-300
                `}>
                  <IconComponent size={72} strokeWidth={1.5} className="md:w-20 md:h-20" />
                </div>
                
                <h3 className="text-base md:text-lg font-semibold text-foreground text-center leading-tight">
                  {feature.title}
                </h3>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default KeyFeatures;
