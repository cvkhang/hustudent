import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, ChevronDown, Check } from "lucide-react";

/**
 * A searchable dropdown component that mimics a select but with search capabilities
 * and a custom, more user-friendly UI.
 */
const SearchableSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  multiple = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const handleSelect = (val) => {
    if (multiple) {
      // Toggle selection
      const currentValues = Array.isArray(value) ? value : [];
      let newValues;
      if (currentValues.includes(val)) {
        newValues = currentValues.filter(v => v !== val);
      } else {
        newValues = [...currentValues, val];
      }
      onChange(newValues);
      // Keep open for multiple selection
      setSearch("");
    } else {
      onChange(val);
      setIsOpen(false);
      setSearch("");
    }
  };

  const removeValue = (e, valToRemove) => {
    e.stopPropagation();
    const newValues = (Array.isArray(value) ? value : []).filter(v => v !== valToRemove);
    onChange(newValues);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-bold text-slate-700 mb-2">
        {label}
      </label>

      {/* Selected Tags for Multiple Mode */}
      {multiple && Array.isArray(value) && value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map(val => (
            <span key={val} className="px-3 py-1 bg-primary-50 text-primary-600 rounded-lg text-sm font-bold flex items-center gap-1 animate-fade-in-up">
              {val}
              <button
                type="button"
                onClick={(e) => removeValue(e, val)}
                className="hover:bg-primary-100 rounded-full p-0.5 transition-colors"
              >
                <code className="text-xs">✕</code>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 rounded-xl border flex items-center justify-between transition-all bg-white
          ${isOpen ? 'border-primary-400 ring-2 ring-primary-400/20' : 'border-slate-200 hover:border-slate-300'}
        `}
      >
        <span className={(!multiple && value) || (multiple && value?.length > 0) ? "font-bold text-slate-800" : "text-slate-400"}>
          {multiple ? (value?.length > 0 ? "Thêm sở thích..." : placeholder) : (value || placeholder)}
        </span>
        <ChevronDown size={20} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden max-h-60 flex flex-col animate-fade-in-up">
          {/* Search Input */}
          <div className="p-3 border-b border-slate-100 flex items-center gap-2 sticky top-0 bg-white">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm..."
              className="flex-1 outline-none text-sm font-bold text-slate-700 placeholder:text-slate-300"
            />
          </div>

          {/* Options List */}
          <div className="overflow-y-auto flex-1 p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-400">
                Không tìm thấy kết quả
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = multiple ? value?.includes(opt) : value === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`
                      w-full px-3 py-2.5 rounded-lg text-left text-sm font-bold flex items-center justify-between transition-colors
                      ${isSelected ? 'bg-primary-50 text-primary-600' : 'text-slate-600 hover:bg-slate-50'}
                    `}
                  >
                    {opt}
                    {isSelected && <Check size={16} />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableSelect;
