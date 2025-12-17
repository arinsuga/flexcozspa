'use client';

import React from 'react';
import Select, { StylesConfig, GroupBase } from 'react-select';
import { useTheme } from 'next-themes';

export interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectInputProps {
  label?: string;
  options: SelectOption[];
  value?: string | number;
  onChange: (value: string | number | null) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  isDisabled?: boolean;
  isClearable?: boolean;
  className?: string;
  name?: string;
}

export default function SelectInput({
  label,
  options,
  value,
  onChange,
  error,
  required = false,
  placeholder = 'Select...',
  isDisabled = false,
  isClearable = false,
  className = '',
  name,
}: SelectInputProps) {
  const { theme, resolvedTheme } = useTheme();
  const isDark = theme === 'dark' || resolvedTheme === 'dark';

  // Find the selected option
  const selectedOption = options.find(opt => opt.value === value) || null;

  // Handle change
  const handleChange = (option: SelectOption | null) => {
    onChange(option ? option.value : null);
  };

  // Custom styles for react-select to match the app's design
  const customStyles: StylesConfig<SelectOption, false, GroupBase<SelectOption>> = {
    control: (base, state) => ({
      ...base,
      backgroundColor: isDark ? 'rgb(31, 41, 55)' : 'white',
      borderColor: error 
        ? 'rgb(239, 68, 68)' 
        : state.isFocused 
          ? 'rgb(99, 102, 241)' 
          : isDark 
            ? 'rgb(75, 85, 99)' 
            : 'rgb(209, 213, 219)',
      borderRadius: '0.5rem',
      padding: '0.125rem',
      boxShadow: error
        ? '0 0 0 1px rgb(239, 68, 68)'
        : state.isFocused
          ? '0 0 0 1px rgb(99, 102, 241)'
          : 'none',
      '&:hover': {
        borderColor: error 
          ? 'rgb(239, 68, 68)' 
          : state.isFocused 
            ? 'rgb(99, 102, 241)' 
            : isDark 
              ? 'rgb(107, 114, 128)' 
              : 'rgb(156, 163, 175)',
      },
      minHeight: '42px',
      transition: 'all 0.15s ease',
      cursor: 'pointer',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: isDark ? 'rgb(31, 41, 55)' : 'white',
      borderRadius: '0.5rem',
      border: `1px solid ${isDark ? 'rgb(75, 85, 99)' : 'rgb(209, 213, 219)'}`,
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      zIndex: 9999,
    }),
    menuList: (base) => ({
      ...base,
      padding: '0.25rem',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? 'rgb(99, 102, 241)'
        : state.isFocused
          ? isDark
            ? 'rgb(55, 65, 81)'
            : 'rgb(243, 244, 246)'
          : 'transparent',
      color: state.isSelected
        ? 'white'
        : isDark
          ? 'rgb(243, 244, 246)'
          : 'rgb(17, 24, 39)',
      cursor: 'pointer',
      padding: '0.5rem 0.75rem',
      borderRadius: '0.375rem',
      '&:active': {
        backgroundColor: 'rgb(99, 102, 241)',
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: isDark ? 'rgb(243, 244, 246)' : 'rgb(17, 24, 39)',
    }),
    input: (base) => ({
      ...base,
      color: isDark ? 'rgb(243, 244, 246)' : 'rgb(17, 24, 39)',
    }),
    placeholder: (base) => ({
      ...base,
      color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)',
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)',
      cursor: 'pointer',
      '&:hover': {
        color: isDark ? 'rgb(209, 213, 219)' : 'rgb(75, 85, 99)',
      },
    }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: isDark ? 'rgb(75, 85, 99)' : 'rgb(209, 213, 219)',
    }),
    clearIndicator: (base) => ({
      ...base,
      color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)',
      cursor: 'pointer',
      '&:hover': {
        color: isDark ? 'rgb(209, 213, 219)' : 'rgb(75, 85, 99)',
      },
    }),
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Select<SelectOption, false, GroupBase<SelectOption>>
        name={name}
        options={options}
        value={selectedOption}
        onChange={handleChange}
        styles={customStyles}
        placeholder={placeholder}
        isDisabled={isDisabled}
        isClearable={isClearable}
        isSearchable={true}
        className="react-select-container"
        classNamePrefix="react-select"
      />
      {error && (
        <p className="mt-1 text-xs text-error">{error}</p>
      )}
    </div>
  );
}
