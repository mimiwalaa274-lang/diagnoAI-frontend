import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function NotFoundPage() {
  return (
    <div className="page-shell">
      <Card>
        <CardContent className="grid gap-4 p-8 text-center">
          <h1 className="text-3xl font-semibold text-slate-950">Page not found</h1>
          <p className="text-muted-foreground">The page you are looking for is not available in this demo.</p>
          <Link to="/" className="justify-self-center">
            <Button>Return Home</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
