interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = { sm: 'w-6 h-6 text-[10px]', md: 'w-8 h-8 text-xs', lg: 'w-10 h-10 text-sm' };

const colorMap = [
  'bg-accent', 'bg-info', 'bg-success', 'bg-warning',
  'bg-purple-500', 'bg-pink-500', 'bg-teal-500', 'bg-orange-500',
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const color = colorMap[hashString(name) % colorMap.length];

  return (
    <div
      className={`${sizeMap[size]} ${color} rounded-full flex items-center justify-center text-white font-bold ${className}`}
      title={name}
    >
      {initials}
    </div>
  );
}
