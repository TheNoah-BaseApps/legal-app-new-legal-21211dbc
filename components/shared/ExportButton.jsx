import { Button } from '@/components/ui/button';

export default function ExportButton({ label, onClick, icon: Icon }) {
  return (
    <Button variant="outline" onClick={onClick} className="w-full justify-start">
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {label}
    </Button>
  );
}