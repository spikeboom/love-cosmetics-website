import Image from "next/image";

interface NavigationArrowsProps {
  onPrevious: () => void;
  onNext: () => void;
  position?: "top-1/2" | "center";
  containerWidth?: string;
  arrowSize?: number;
  leftIcon?: string;
  rightIcon?: string;
}

export function NavigationArrows({
  onPrevious,
  onNext,
  position = "top-1/2",
  containerWidth = "w-[1440px]",
  arrowSize = 56,
  leftIcon = "/new-home/icons/arrow-left.svg",
  rightIcon = "/new-home/icons/arrow-right.svg",
}: NavigationArrowsProps) {
  const positionClass =
    position === "top-1/2" ? "top-1/2 -translate-y-1/2" : "top-1/2 translate-y-[-50%]";

  return (
    <div
      className={`absolute ${positionClass} left-0 right-0 ${containerWidth} mx-auto px-[12px] flex items-center justify-between pointer-events-none`}
    >
      {/* Previous Button */}
      <button
        onClick={onPrevious}
        className="relative flex-shrink-0 pointer-events-auto cursor-pointer hover:opacity-80 transition-opacity"
        style={{ width: `${arrowSize}px`, height: `${arrowSize}px` }}
        aria-label="Anterior"
      >
        <Image src={leftIcon} alt="" fill className="object-contain" />
      </button>

      {/* Next Button */}
      <button
        onClick={onNext}
        className="relative flex-shrink-0 pointer-events-auto cursor-pointer hover:opacity-80 transition-opacity"
        style={{ width: `${arrowSize}px`, height: `${arrowSize}px` }}
        aria-label="Próximo"
      >
        <Image src={rightIcon} alt="" fill className="object-contain" />
      </button>
    </div>
  );
}
