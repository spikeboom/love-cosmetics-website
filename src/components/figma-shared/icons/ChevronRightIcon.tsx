interface ChevronRightIconProps {
  className?: string;
  /** Variante do icone: 'filled' usa path preenchido, 'stroke' usa linha */
  variant?: "filled" | "stroke";
}

/**
 * Icone de seta para direita (chevron)
 * Usado em: steppers, navegacao, breadcrumbs
 */
export function ChevronRightIcon({ className, variant = "stroke" }: ChevronRightIconProps) {
  if (variant === "filled") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/>
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M9 6L15 12L9 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
