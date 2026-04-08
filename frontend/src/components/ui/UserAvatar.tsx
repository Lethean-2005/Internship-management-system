interface UserAvatarProps {
  name: string;
  avatar?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizes = {
  xs: { box: 'w-5 h-5', text: 'text-[0.55rem]' },
  sm: { box: 'w-8 h-8', text: 'text-[0.7rem]' },
  md: { box: 'w-10 h-10', text: 'text-[0.8rem]' },
  lg: { box: 'w-14 h-14', text: 'text-[1.2rem]' },
  xl: { box: 'w-[90px] h-[90px]', text: 'text-[1.6rem]' },
};

export function UserAvatar({ name, avatar, size = 'sm', className = '' }: UserAvatarProps) {
  const s = sizes[size];
  const initial = name?.charAt(0)?.toUpperCase() || 'U';

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name}
        className={`${s.box} rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }

  return (
    <div className={`${s.box} rounded-full bg-gradient-to-br from-[#48B6E8] to-[#3a9fd4] flex items-center justify-center text-white ${s.text} font-semibold shrink-0 ${className}`}>
      {initial}
    </div>
  );
}
