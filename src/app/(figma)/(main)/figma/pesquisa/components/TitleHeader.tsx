"use client";

interface TitleHeaderProps {
  title: string;
  description: string;
}

export function TitleHeader({ title, description }: TitleHeaderProps) {
  return (
    <div className="flex items-start w-full">
      <div className="flex flex-col flex-1 gap-[16px] items-start justify-center p-[16px]">
        <div className="flex gap-[10px] items-center justify-center">
          <h1 className="font-cera-pro font-bold text-[32px] text-black leading-normal">
            {title}
          </h1>
        </div>
        <p className="font-cera-pro font-light text-[14px] text-black leading-normal w-full">
          {description}
        </p>
      </div>
    </div>
  );
}
