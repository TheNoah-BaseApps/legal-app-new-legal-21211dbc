import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  required = false,
  disabled = false,
  className = '',
}) {
  return (
    <div className={className}>
      <Label>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="mt-1"
      />
    </div>
  );
}