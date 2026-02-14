import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Layout } from "@/components/ui/Layout";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <Layout>
      <div className="min-h-[80vh] w-full flex items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md mx-4 shadow-xl border-slate-100">
          <CardContent className="pt-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-rose-500" />
              <h1 className="text-2xl font-bold text-slate-800">Page Not Found</h1>
            </div>

            <p className="mt-4 text-sm text-slate-600">
              The page you are looking for doesn't exist or has been moved.
            </p>

            <div className="mt-8">
              <Link href="/" className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                Return Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
