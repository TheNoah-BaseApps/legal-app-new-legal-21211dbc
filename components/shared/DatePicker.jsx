'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DatePicker({
  label,
  value,
  onChange,
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
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        className="mt-1"
      />
    </div>
  );
}