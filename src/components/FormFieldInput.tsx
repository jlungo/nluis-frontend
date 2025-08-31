import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type FormFieldInputProps =
  | {
      type: 'text' | 'number' | 'date';
      id: string;
      label: string;
      value: string;
      onChange: (value: string) => void;
      required?: boolean;
    }
  | {
      type: 'textarea';
      id: string;
      label: string;
      value: string;
      onChange: (value: string) => void;
      required?: boolean;
    }
  | {
      type: 'select';
      id: string;
      label: string;
      value: string;
      options: { value: string; label: string }[];
      onChange: (value: string) => void;
      required?: boolean;
    }
  | {
      type: 'checkbox-group';
      id: string;
      label: string;
      options: { value: string; label: string }[];
      values: string[];
      value?: string[];
      onChange: (value: string, checked?: boolean) => void;
      required?: boolean;
    };

export function FormFieldInput(props: FormFieldInputProps) {
  const { id, label, required } = props;

  return (
    <div className="w-[100%] space-y-2">
      <Label htmlFor={id}>{label} {required && '*'}</Label>

      {props.type === 'textarea' && (
        <Textarea
          id={id}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          required={required}
        />
      )}

      {['text', 'number', 'date'].includes(props.type) && (
        <Input
          id={id}
          type={props.type}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          required={required}
        />
      )}

      {props.type === 'select' && (
        <Select value={props.value} onValueChange={props.onChange}>
          <SelectTrigger id={id} className='w-full'>
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {props.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {props.type === 'checkbox-group' && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {props.options.map((opt) => (
            <div key={opt.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${id}-${opt.value}`}
                checked={props.values.includes(opt.value)}
                onCheckedChange={(checked) =>
                  props.onChange(opt.value, checked as boolean)
                }
              />
              <label
                htmlFor={`${id}-${opt.value}`}
                className="text-sm font-medium leading-none"
              >
                {opt.label}
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
