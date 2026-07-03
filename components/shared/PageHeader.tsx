import { Separator } from "../ui/separator";

interface PageHeaderProps {
  title: string;
  description?: string;
}

export default function PageHeader({
  title,
  description,
}: PageHeaderProps) {
  return (
    <header className="space-y-2 text-center">
      

      <h1 className="text-4xl font-bold tracking-tight">
        {title}
      </h1>

      {description && (
        <p className="mx-auto max-w-2xl text-slate-600">
          {description}
        </p>
      )}
      <Separator />
    </header>
  );
}