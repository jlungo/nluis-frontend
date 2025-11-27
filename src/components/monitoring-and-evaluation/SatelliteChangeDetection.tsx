import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Map as MapIcon, Layers, RefreshCw } from 'lucide-react';

interface SatelliteImage {
    id: string;
    date: string;
    url: string;
    description: string;
}

// Mock data - in a real app this would come from an API
const MOCK_IMAGES: SatelliteImage[] = [
    {
        id: '1',
        date: '2023-01-15',
        url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop', // Placeholder
        description: 'Baseline Survey'
    },
    {
        id: '2',
        date: '2023-06-20',
        url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop&sat=-100', // Placeholder (black and white for contrast)
        description: 'Mid-term Review'
    },
    {
        id: '3',
        date: '2024-01-10',
        url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop&hue=180', // Placeholder (color shift)
        description: 'Current Status'
    }
];

export default function SatelliteChangeDetection() {
    const [image1Id, setImage1Id] = useState<string>(MOCK_IMAGES[0].id);
    const [image2Id, setImage2Id] = useState<string>(MOCK_IMAGES[2].id);
    const [sliderValue, setSliderValue] = useState([50]);
    const [isComparing, setIsComparing] = useState(false);

    const image1 = MOCK_IMAGES.find(img => img.id === image1Id);
    const image2 = MOCK_IMAGES.find(img => img.id === image2Id);

    const containerRef = useRef<HTMLDivElement>(null);

    const handleCompare = () => {
        setIsComparing(true);
        // Simulate analysis delay
        setTimeout(() => {
            setIsComparing(false);
        }, 1500);
    };

    return (
        <Card className="w-full">
            <CardHeader className="border-b bg-accent/30">
                <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5" />
                    Satellite Change Detection
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-end">
                    <div className="space-y-2 w-full md:w-1/3">
                        <label className="text-sm font-medium">Baseline Image (Before)</label>
                        <Select value={image1Id} onValueChange={setImage1Id}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select image" />
                            </SelectTrigger>
                            <SelectContent>
                                {MOCK_IMAGES.map(img => (
                                    <SelectItem key={img.id} value={img.id}>
                                        {img.date} - {img.description}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 w-full md:w-1/3">
                        <label className="text-sm font-medium">Comparison Image (After)</label>
                        <Select value={image2Id} onValueChange={setImage2Id}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select image" />
                            </SelectTrigger>
                            <SelectContent>
                                {MOCK_IMAGES.map(img => (
                                    <SelectItem key={img.id} value={img.id}>
                                        {img.date} - {img.description}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={handleCompare} disabled={isComparing} className="w-full md:w-auto">
                        {isComparing ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <MapIcon className="mr-2 h-4 w-4" />
                                Analyze Changes
                            </>
                        )}
                    </Button>
                </div>

                <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted" ref={containerRef}>
                    {image1 && image2 ? (
                        <>
                            {/* Image 1 (Before) - Full width, sits behind */}
                            <div
                                className="absolute inset-0 w-full h-full bg-cover bg-center"
                                style={{ backgroundImage: `url(${image1.url})` }}
                            />

                            {/* Image 2 (After) - Clipped by slider */}
                            <div
                                className="absolute inset-0 w-full h-full bg-cover bg-center border-r-2 border-white shadow-xl"
                                style={{
                                    backgroundImage: `url(${image2.url})`,
                                    width: `${sliderValue[0]}%`
                                }}
                            />

                            {/* Slider Control */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                {/* Invisible slider for interaction */}
                                <Slider
                                    defaultValue={[50]}
                                    max={100}
                                    step={1}
                                    value={sliderValue}
                                    onValueChange={setSliderValue}
                                    className="w-full h-full cursor-ew-resize opacity-0 z-10"
                                />
                            </div>

                            {/* Visible Slider Handle Line */}
                            <div
                                className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] pointer-events-none z-0 flex items-center justify-center"
                                style={{ left: `${sliderValue[0]}%` }}
                            >
                                <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center -ml-0.5">
                                    <RefreshCw className="h-4 w-4 text-black" />
                                </div>
                            </div>

                            {/* Labels */}
                            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                                {image2.date} (After)
                            </div>
                            <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                                {image1.date} (Before)
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            Select two images to compare
                        </div>
                    )}
                </div>

                <div className="text-sm text-muted-foreground">
                    <p>
                        <strong>Analysis Result:</strong> {isComparing ? 'Calculating...' : 'No significant structural changes detected in the selected area.'}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
