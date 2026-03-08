
interface MeasurementInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function MeasurementInput({ value, onChange }: MeasurementInputProps) {
  return (
    <input
      type="text"
      inputMode="decimal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter measurement in cm"
      className="w-full h-12 px-3 py-2 text-base border border-gray-200 rounded-md bg-white focus:outline-none focus:border-teal-500"
    />
  );
} 