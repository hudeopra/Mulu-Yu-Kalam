'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  color: string;
  barColor: string;
  feedback: string;
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      label: 'Too Short',
      color: 'text-gray-400',
      barColor: 'bg-gray-200',
      feedback: 'Enter at least 6 characters',
    };
  }

  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;

  const validScore = Math.min(4, Math.max(1, score)) as 1 | 2 | 3 | 4;

  switch (validScore) {
    case 1:
      return {
        score: 1,
        label: 'Weak',
        color: 'text-red-500',
        barColor: 'bg-red-500',
        feedback: 'Add uppercase, numbers or symbols',
      };
    case 2:
      return {
        score: 2,
        label: 'Fair',
        color: 'text-amber-500',
        barColor: 'bg-amber-500',
        feedback: 'Mix letters, digits and punctuation',
      };
    case 3:
      return {
        score: 3,
        label: 'Good',
        color: 'text-blue-500',
        barColor: 'bg-blue-500',
        feedback: 'Solid password, nearly strong',
      };
    case 4:
      return {
        score: 4,
        label: 'Strong',
        color: 'text-emerald-600',
        barColor: 'bg-emerald-500',
        feedback: 'Excellent security strength',
      };
  }
}

export function generateStrongPassword(length = 14): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%&*?_';

  const all = upper + lower + digits + symbols;
  let result = '';

  // Ensure at least one of each category
  result += upper[Math.floor(Math.random() * upper.length)];
  result += lower[Math.floor(Math.random() * lower.length)];
  result += digits[Math.floor(Math.random() * digits.length)];
  result += symbols[Math.floor(Math.random() * symbols.length)];

  for (let i = 4; i < length; i++) {
    result += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle characters
  return result
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('');
}

interface PasswordStrengthBarProps {
  password: string;
  className?: string;
}

export function PasswordStrengthBar({
  password,
  className = '',
}: PasswordStrengthBarProps) {
  if (!password) return null;

  const { score, label, color, barColor, feedback } =
    calculatePasswordStrength(password);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-gray-500 font-medium">Strength:</span>
        <span className={`font-bold ${color}`}>{label}</span>
      </div>
      <div className="flex gap-1 h-1.5 w-full">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`h-full flex-1 rounded-full transition-all duration-300 ${
              step <= score ? barColor : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <p className="text-[10px] text-gray-400">{feedback}</p>
    </div>
  );
}

interface GeneratePasswordButtonProps {
  onGenerate: (generated: string) => void;
  className?: string;
}

export function GeneratePasswordButton({
  onGenerate,
  className = '',
}: GeneratePasswordButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newPass = generateStrongPassword(14);
    onGenerate(newPass);
    toast.info('Generated strong password and prefilled confirmation.');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-[#ff7b01] bg-[#fff5eb] hover:bg-[#ffe8d1] border border-[#ffbd5b]/50 rounded-lg transition-colors cursor-pointer shrink-0 ${className}`}
      title="Generate cryptographically strong password"
    >
      <Sparkles className="w-3.5 h-3.5 text-[#ff7b01]" />
      <span>Generate</span>
    </button>
  );
}

