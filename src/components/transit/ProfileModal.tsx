import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Shield } from 'lucide-react';

interface ProfileModalProps {
  open: boolean;
  onComplete: (profile: { birthYear: number; birthMonth: number; hasDisability: boolean }) => void;
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function ProfileModal({ open, onComplete }: ProfileModalProps) {
  const [birthYear, setBirthYear] = useState<number>(1990);
  const [birthMonth, setBirthMonth] = useState<number>(1);
  const [hasDisability, setHasDisability] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ birthYear, birthMonth, hasDisability });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="transit-panel p-6 w-full max-w-md"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <User className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Welcome to DRT Smart Transit</h2>
              <p className="text-sm text-muted-foreground">Help us personalize your experience</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Birth Year</label>
                <select
                  value={birthYear}
                  onChange={(e) => setBirthYear(Number(e.target.value))}
                  className="transit-search-input"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Birth Month</label>
                <select
                  value={birthMonth}
                  onChange={(e) => setBirthMonth(Number(e.target.value))}
                  className="transit-search-input"
                >
                  {months.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
              <Shield className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Accessibility Features</p>
                <p className="text-xs text-muted-foreground">Enable halt requests & priority boarding</p>
              </div>
              <button
                type="button"
                onClick={() => setHasDisability(!hasDisability)}
                className={`w-12 h-7 rounded-full transition-colors duration-200 ${
                  hasDisability ? 'bg-primary' : 'bg-border'
                } relative`}
              >
                <span className={`absolute top-1 w-5 h-5 rounded-full bg-card shadow transition-transform duration-200 ${
                  hasDisability ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <button type="submit" className="transit-btn-primary w-full">
              Get Started
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
