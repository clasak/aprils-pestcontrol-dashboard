import { ReactNode } from 'react';
import {
  TextField,
  TextFieldProps,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  InputLabel,
  Select,
  MenuItem,
  SelectProps,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  Autocomplete,
  Chip,
  InputAdornment,
  Box,
} from '@mui/material';

// Base props for all form fields
interface BaseFieldProps {
  name: string;
  label: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  fullWidth?: boolean;
}

// Text input field
interface TextFieldComponentProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  inputProps?: TextFieldProps['inputProps'];
}

export const FormTextField = ({
  name,
  label,
  type = 'text',
  value,
  onChange,
  error,
  required,
  disabled,
  helperText,
  fullWidth = true,
  placeholder,
  multiline,
  rows,
  startAdornment,
  endAdornment,
  inputProps,
}: TextFieldComponentProps) => {
  return (
    <TextField
      id={name}
      name={name}
      label={label}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={!!error}
      helperText={error || helperText}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      placeholder={placeholder}
      multiline={multiline}
      rows={rows}
      inputProps={inputProps}
      InputProps={{
        startAdornment: startAdornment ? (
          <InputAdornment position="start">{startAdornment}</InputAdornment>
        ) : undefined,
        endAdornment: endAdornment ? (
          <InputAdornment position="end">{endAdornment}</InputAdornment>
        ) : undefined,
      }}
    />
  );
};

// Currency input field
interface CurrencyFieldProps extends BaseFieldProps {
  value: number | string;
  onChange: (value: number) => void;
  placeholder?: string;
  min?: number;
  max?: number;
}

export const FormCurrencyField = ({
  name,
  label,
  value,
  onChange,
  error,
  required,
  disabled,
  helperText,
  fullWidth = true,
  placeholder,
  min = 0,
  max,
}: CurrencyFieldProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) || 0;
    if (max !== undefined && val > max) return;
    if (val < min) return;
    onChange(val);
  };

  return (
    <TextField
      id={name}
      name={name}
      label={label}
      type="number"
      value={value}
      onChange={handleChange}
      error={!!error}
      helperText={error || helperText}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      placeholder={placeholder}
      inputProps={{ min, max, step: 0.01 }}
      InputProps={{
        startAdornment: <InputAdornment position="start">$</InputAdornment>,
      }}
    />
  );
};

// Select dropdown
interface SelectFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export const FormSelectField = ({
  name,
  label,
  value,
  onChange,
  options,
  error,
  required,
  disabled,
  helperText,
  fullWidth = true,
  placeholder,
}: SelectFieldProps) => {
  return (
    <FormControl fullWidth={fullWidth} error={!!error} required={required} disabled={disabled}>
      <InputLabel id={`${name}-label`}>{label}</InputLabel>
      <Select
        labelId={`${name}-label`}
        id={name}
        name={name}
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value)}
        displayEmpty={!!placeholder}
      >
        {placeholder && (
          <MenuItem value="" disabled>
            <em>{placeholder}</em>
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {(error || helperText) && <FormHelperText>{error || helperText}</FormHelperText>}
    </FormControl>
  );
};

// Multi-select with chips (for tags)
interface MultiSelectFieldProps extends BaseFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  freeSolo?: boolean;
}

export const FormMultiSelectField = ({
  name,
  label,
  value,
  onChange,
  options,
  error,
  required,
  disabled,
  helperText,
  fullWidth = true,
  placeholder,
  freeSolo = false,
}: MultiSelectFieldProps) => {
  return (
    <Autocomplete
      id={name}
      multiple
      freeSolo={freeSolo}
      options={options.map((o) => o.value)}
      value={value}
      onChange={(_, newValue) => onChange(newValue as string[])}
      disabled={disabled}
      renderTags={(tagValue, getTagProps) =>
        tagValue.map((option, index) => (
          <Chip variant="outlined" label={option} {...getTagProps({ index })} size="small" />
        ))
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={!!error}
          helperText={error || helperText}
          required={required}
          fullWidth={fullWidth}
        />
      )}
    />
  );
};

// Radio group
interface RadioGroupFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  row?: boolean;
}

export const FormRadioGroup = ({
  name,
  label,
  value,
  onChange,
  options,
  error,
  required,
  disabled,
  helperText,
  row = false,
}: RadioGroupFieldProps) => {
  return (
    <FormControl error={!!error} required={required} disabled={disabled}>
      <FormLabel id={`${name}-label`}>{label}</FormLabel>
      <RadioGroup
        aria-labelledby={`${name}-label`}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        row={row}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={option.label}
          />
        ))}
      </RadioGroup>
      {(error || helperText) && <FormHelperText>{error || helperText}</FormHelperText>}
    </FormControl>
  );
};

// Checkbox
interface CheckboxFieldProps extends BaseFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const FormCheckbox = ({
  name,
  label,
  checked,
  onChange,
  error,
  disabled,
  helperText,
}: CheckboxFieldProps) => {
  return (
    <FormControl error={!!error} disabled={disabled}>
      <FormControlLabel
        control={
          <Checkbox
            id={name}
            name={name}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
          />
        }
        label={label}
      />
      {(error || helperText) && <FormHelperText>{error || helperText}</FormHelperText>}
    </FormControl>
  );
};

// Switch
interface SwitchFieldProps extends BaseFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const FormSwitch = ({
  name,
  label,
  checked,
  onChange,
  error,
  disabled,
  helperText,
}: SwitchFieldProps) => {
  return (
    <FormControl error={!!error} disabled={disabled}>
      <FormControlLabel
        control={
          <Switch
            id={name}
            name={name}
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
          />
        }
        label={label}
      />
      {(error || helperText) && <FormHelperText>{error || helperText}</FormHelperText>}
    </FormControl>
  );
};

// Date picker (using native input for MVP)
interface DateFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}

export const FormDateField = ({
  name,
  label,
  value,
  onChange,
  error,
  required,
  disabled,
  helperText,
  fullWidth = true,
  min,
  max,
}: DateFieldProps) => {
  return (
    <TextField
      id={name}
      name={name}
      label={label}
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={!!error}
      helperText={error || helperText}
      required={required}
      disabled={disabled}
      fullWidth={fullWidth}
      InputLabelProps={{ shrink: true }}
      inputProps={{ min, max }}
    />
  );
};

// Form section wrapper
interface FormSectionProps {
  title?: string;
  children: ReactNode;
  columns?: 1 | 2 | 3;
}

export const FormSection = ({ title, children, columns = 1 }: FormSectionProps) => {
  return (
    <Box sx={{ mb: 3 }}>
      {title && (
        <FormLabel component="legend" sx={{ mb: 2, fontWeight: 500 }}>
          {title}
        </FormLabel>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: columns === 1 ? '1fr' : `repeat(${Math.min(columns, 2)}, 1fr)`,
            md: `repeat(${columns}, 1fr)`,
          },
          gap: 2,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default {
  TextField: FormTextField,
  CurrencyField: FormCurrencyField,
  SelectField: FormSelectField,
  MultiSelectField: FormMultiSelectField,
  RadioGroup: FormRadioGroup,
  Checkbox: FormCheckbox,
  Switch: FormSwitch,
  DateField: FormDateField,
  Section: FormSection,
};

