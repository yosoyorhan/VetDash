import React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils'; // Bu yardımcı fonksiyonun zaten var olduğunu varsayıyorum

const Avatar = React.forwardRef(({ className, children, ...props }, ref) => {
  // Renk kodlaması için basit bir hash fonksiyonu
  const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  };

  const intToRGB = (i) => {
    const c = (i & 0x00ffffff).toString(16).toUpperCase();
    return '00000'.substring(0, 6 - c.length) + c;
  };

  const bgColor = `#${intToRGB(hashCode(children || ''))}`;

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    >
      <AvatarPrimitive.Fallback
        className="flex h-full w-full items-center justify-center rounded-full text-white font-bold"
        style={{ backgroundColor: bgColor }}
      >
        {children}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
});
Avatar.displayName = AvatarPrimitive.Root.displayName;

export { Avatar };
