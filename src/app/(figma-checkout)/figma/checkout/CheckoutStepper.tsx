"use client";

type Step = "identificacao" | "entrega" | "pagamento";

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
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

interface CheckoutStepperProps {
  currentStep: Step;
}

const steps: { id: Step; label: string; icon: React.ReactNode }[] = [
  {
    id: "identificacao",
    label: "Identificação",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: "entrega",
    label: "Entrega",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 8H17V4H3C1.9 4 1 4.9 1 6V17H3C3 18.66 4.34 20 6 20C7.66 20 9 18.66 9 17H15C15 18.66 16.34 20 18 20C19.66 20 21 18.66 21 17H23V12L20 8ZM19.5 9.5L21.46 12H17V9.5H19.5ZM6 18C5.45 18 5 17.55 5 17C5 16.45 5.45 16 6 16C6.55 16 7 16.45 7 17C7 17.55 6.55 18 6 18ZM18 18C17.45 18 17 17.55 17 17C17 16.45 17.45 16 18 16C18.55 16 19 16.45 19 17C19 17.55 18.55 18 18 18Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: "pagamento",
    label: "Pagamento",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" fill="currentColor"/>
      </svg>
    ),
  },
];

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="bg-[#f8f3ed] border-b border-[#ba7900] w-full">
      <div className="flex gap-2 lg:gap-4 items-center lg:justify-center p-3 lg:p-[16px] overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex items-center justify-between w-full max-w-[684px] min-w-max lg:min-w-0">
          {steps.map((step, index) => {
            const isActive = index === currentIndex;
            const isPast = index < currentIndex;

            return (
              <div key={step.id} className="flex items-center">
                {/* Step item */}
                <div className="flex gap-[8px] items-center">
                  <div
                    className={`w-[24px] h-[24px] ${
                      isActive || isPast ? "text-[#e7a63a]" : "text-[#8e8e93]"
                    }`}
                  >
                    {step.icon}
                  </div>
                  <p
                    className={`font-cera-pro font-light text-[14px] lg:text-[20px] whitespace-nowrap leading-[normal] ${
                      isActive || isPast ? "text-black" : "text-[#8e8e93]"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>

                {/* Chevron separator (não mostrar após o último) */}
                {index < steps.length - 1 && (
                  <ChevronRightIcon className="w-6 h-6 lg:w-12 lg:h-12 text-[#8e8e93] mx-2 lg:mx-4" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
