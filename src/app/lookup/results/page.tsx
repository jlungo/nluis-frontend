import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResultsPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>CCRO Results</CardTitle>
          <CardDescription>
            Your CCRO records information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              Your CCRO records will be processed and displayed here soon.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}