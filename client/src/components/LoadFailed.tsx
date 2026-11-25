import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LoadFailed({ onRetry = () => window.location.reload() }: { onRetry?: () => void }) {
    return (
        <Card role="alert" className="p-12 text-center">
            <p className="mb-4 text-slate-600 dark:text-slate-300">We could not load this. Check your internet connection.</p>
            <Button variant="outline" onClick={onRetry}>Try again</Button>
        </Card>
    );
}
