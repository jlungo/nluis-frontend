import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LookupForm } from "@/components/lookup";

export default function LookupPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>CCRO Lookup</CardTitle>
          <CardDescription>
            Enter your NIDA number and phone number to look up your CCRO records
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LookupForm />
        </CardContent>
      </Card>
    </div>
  );
}

