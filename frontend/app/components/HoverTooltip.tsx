'use client';

interface HoverTooltipProps {
  children: React.ReactNode;
  text: string;
}

export default function HoverTooltip({ children, text }: HoverTooltipProps) {
  return (
    <div className="relative group inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap z-50">
        {text}
      </div>
    </div>
  );
}