interface TitleHeaderProps {
  title: string;
  subtitle: string;
}

export function TitleHeader({ title, subtitle }: TitleHeaderProps) {
  return (
    <div
      className="flex flex-1 flex-col gap-[16px] items-start justify-center min-h-px min-w-px p-[16px] relative"
      data-name="Title header"
    >
      <div className="flex gap-[10px] items-center justify-center relative shrink-0">
        <div className="flex flex-col justify-center leading-[0] relative shrink-0">
          <p className="font-cera-pro font-bold text-[32px] text-black leading-normal">
            {title}
          </p>
        </div>
      </div>
      <p className="font-cera-pro font-light text-[14px] text-black leading-normal min-w-full relative shrink-0 w-min">
        {subtitle}
      </p>
    </div>
  );
}
