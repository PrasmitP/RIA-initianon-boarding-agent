import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface BasicInformationProps {
  data: any;
  onNext: (data: any) => void;
  onBack: () => void;
}

/**
 * Step 1 — client identity & demographics. First step, so there is no Back
 * button. Local form state seeds from `data.basicInfo` so re-visiting the step
 * preserves what was entered; on submit it bubbles up via `onNext`.
 */
export function BasicInformation({ data, onNext }: BasicInformationProps) {
  // Merge (not `||`): the parent seeds `basicInfo` as `{}`, which is truthy, so a
  // bare `||` fallback would leave every field `undefined` and the inputs
  // uncontrolled. Spreading defaults first guarantees every field is a string.
  const [formData, setFormData] = useState({
    clientName: '',
    age: '',
    email: '',
    phone: '',
    employmentStatus: '',
    maritalStatus: '',
    ...data.basicInfo,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  // Name, age, and email are required to continue; the rest are optional.
  const isValid = formData.clientName && formData.age && formData.email;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="bg-card rounded-lg border border-border p-8 shadow-sm">
        <h2 className="mb-6">Basic Information</h2>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="clientName" className="block mb-2 text-foreground">
                Full Name *
              </label>
              <input
                id="clientName"
                type="text"
                required
                value={formData.clientName}
                onChange={(e) => handleChange('clientName', e.target.value)}
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="John Smith"
              />
            </div>

            <div>
              <label htmlFor="age" className="block mb-2 text-foreground">
                Age *
              </label>
              <input
                id="age"
                type="number"
                required
                min="18"
                max="120"
                value={formData.age}
                onChange={(e) => handleChange('age', e.target.value)}
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="45"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block mb-2 text-foreground">
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="john.smith@example.com"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block mb-2 text-foreground">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="employmentStatus" className="block mb-2 text-foreground">
                Employment Status
              </label>
              <select
                id="employmentStatus"
                value={formData.employmentStatus}
                onChange={(e) => handleChange('employmentStatus', e.target.value)}
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select status</option>
                <option value="employed">Employed</option>
                <option value="self-employed">Self-Employed</option>
                <option value="retired">Retired</option>
                <option value="unemployed">Unemployed</option>
              </select>
            </div>

            <div>
              <label htmlFor="maritalStatus" className="block mb-2 text-foreground">
                Marital Status
              </label>
              <select
                id="maritalStatus"
                value={formData.maritalStatus}
                onChange={(e) => handleChange('maritalStatus', e.target.value)}
                className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!isValid}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          Continue
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
