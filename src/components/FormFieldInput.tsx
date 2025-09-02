import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { slugify } from '@/lib/utils';
import MultiSelectShowListInput, { SelectOption } from './MultiSelectShowListInput';
import DatePicker from './FormDateSelect';

type FormFieldInputProps =
  | {
    type: 'text' | 'number' | 'date';
    id: string;
    label: string;
    value: string;
    isLoading?: boolean;
    onChange: (value: string) => void;
    required?: boolean;
    placeholder?: string
  }
  | {
    type: 'textarea';
    id: string;
    label: string;
    value: string;
    isLoading?: boolean;
    onChange: (value: string) => void;
    required?: boolean;
    placeholder?: string
  }
  | {
    type: 'select';
    id: string;
    label: string;
    value?: string;
    values?: string[];
    isLoading?: boolean;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    onValuesChange?: (values: string[]) => void;
    required?: boolean;
    placeholder?: string
  }
  | {
    type: 'multiselect';
    id: string;
    label: string;
    value?: string;
    values?: string[];
    isLoading?: boolean;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
    onValuesChange?: (values: string[]) => void;
    required?: boolean;
    placeholder?: string
  }
  | {
    type: 'checkbox-group';
    id: string;
    label: string;
    isLoading?: boolean;
    options: { value: string; label: string }[];
    values: string[];
    value?: string[];
    onChange: (value: string, checked?: boolean) => void;
    required?: boolean;
    placeholder?: string
  }

export function FormFieldInput(props: FormFieldInputProps) {
  const { id, type, label, placeholder, required, isLoading, onChange } = props;

  return (
    <div className="w-full space-y-2">
      {type !== 'date' ? <Label htmlFor={id}>{label} {required && '*'}</Label> : null}

      {type === 'textarea' && (
        <Textarea
          id={id}
          value={props.value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
        />
      )}

      {['text', 'number'].includes(type) && (
        <Input
          id={id}
          type={type}
          value={props.value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          placeholder={placeholder}
        />
      )}

      {['date'].includes(type) && (
        <DatePicker
          label={props.label}
          name={slugify(props.label)}
          dateValue={props.value ? new Date(props.value as string) : undefined}
          onDateChange={(e) => onChange(e.toISOString().split("T")[0])}
          required={required}
          placeholder={placeholder}
        />
      )}

      {type === 'select' && (
        <>
          {props.values && props.onValuesChange && (
            <MultiSelectShowListInput
              id={id}
              label={label}
              required={required}
              isLoading={isLoading}
              values={props.values}
              options={props.options}
              placeholder={placeholder}
              onValuesChange={(e) => props.onChange(e[0])}
              isSingle
            />
          )}
        </>
      )}

      {type === 'multiselect' && (
        <>
          {props.values && props.onValuesChange && (
            <MultiSelectShowListInput
              id={id}
              label={label}
              required={required}
              isLoading={isLoading}
              values={props.values}
              options={props.options}
              placeholder={placeholder}
              onValuesChange={props.onValuesChange}
              onChange={() => { }}
            />
          )}
        </>
      )}

      {type === 'checkbox-group' && (
        <div className="grid grid-cols-2 gap-2 mt-2">
          {props.options.map((opt) => (
            <div key={opt.value} className="flex items-center space-x-2">
              <Checkbox
                id={`${id}-${opt.value}`}
                checked={props.values.includes(opt.value)}
                onCheckedChange={(checked) =>
                  onChange(opt.value, checked as boolean)
                }
              />
              <Label
                htmlFor={`${id}-${opt.value}`}
                className="text-sm font-medium leading-none"
              >
                {opt.label}
              </Label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}