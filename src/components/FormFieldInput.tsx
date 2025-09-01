import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { slugify } from '@/lib/utils';
import { MultiSelect } from './multiselect';
import MultiSelectShowListInput, { SelectOption } from './MultiSelectShowListInput';

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
    options: SelectOption[];
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
  const { id, label, required, isLoading } = props;

  return (
    <div className="w-full space-y-2 overflow-hidden">
      <Label htmlFor={id}>{label} {required && '*'}</Label>

      {props.type === 'textarea' && (
        <Textarea
          id={id}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          required={required}
          placeholder={props.placeholder}
        />
      )}

      {['text', 'number', 'date'].includes(props.type) && (
        <Input
          id={id}
          type={props.type}
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          required={required}
          placeholder={props.placeholder}
        />
      )}

      {props.type === 'select' && (
        <>
          {props?.values && props?.onValuesChange ? (
            <MultiSelect
              title={label}
              data={props.options}
              selected={props.values}
              setSelected={props.onValuesChange}
              isLoading={false}
            />
          ) :
            <Select name={slugify(label)} value={props.value} onValueChange={props.onChange}>
              <SelectTrigger
                id={id}
                className='w-full'
              >
                <SelectValue placeholder={props.placeholder} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='i'>Test</SelectItem>
                {props.options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>}
        </>
      )}

      {props.type === 'multiselect' && (
        <>
          {props.values && props.onValuesChange && (
            <MultiSelectShowListInput
              id={id}
              label={label}
              required={required}
              isLoading={isLoading}
              values={props.values}
              options={props.options}
              placeholder={props.placeholder}
              onValuesChange={props.onValuesChange}
              onChange={() => {}}
            />
          )}
        </>
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