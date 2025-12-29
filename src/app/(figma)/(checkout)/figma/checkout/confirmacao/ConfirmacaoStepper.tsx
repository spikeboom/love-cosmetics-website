"use client";

type Step = "identificacao" | "entrega" | "pagamento" | "senha" | "verificacao";

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

interface ConfirmacaoStepperProps {
  currentStep: Step;
}

// Steps para fluxo de senha/verificacao (criar conta ou login)
const stepsAutenticacao: { id: Step; label: string; icon: React.ReactNode }[] = [
  {
    id: "senha",
    label: "Senha",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: "verificacao",
    label: "Verificacao",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1ZM10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="currentColor"/>
      </svg>
    ),
  },
];

// Steps para fluxo de checkout (identificacao > entrega > pagamento)
const stepsCheckout: { id: Step; label: string; icon: React.ReactNode }[] = [
  {
    id: "identificacao",
    label: "Identificacao",
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
        <path d="M20 8H17V4H3C1.9 4 1 4.9 1 6V17H3C3 18.66 4.34 20 6 20S9 18.66 9 17H15C15 18.66 16.34 20 18 20S21 18.66 21 17H23V12L20 8ZM6 18.5C5.17 18.5 4.5 17.83 4.5 17S5.17 15.5 6 15.5 7.5 16.17 7.5 17 6.83 18.5 6 18.5ZM19.5 9.5L21.46 12H17V9.5H19.5ZM18 18.5C17.17 18.5 16.5 17.83 16.5 17S17.17 15.5 18 15.5 19.5 16.17 19.5 17 18.83 18.5 18 18.5Z" fill="currentColor"/>
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

export function ConfirmacaoStepper({ currentStep }: ConfirmacaoStepperProps) {
  // Determinar qual conjunto de steps usar baseado no step atual
  const isCheckoutFlow = ["identificacao", "entrega", "pagamento"].includes(currentStep);
  const steps = isCheckoutFlow ? stepsCheckout : stepsAutenticacao;

  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="bg-[#f8f3ed] border-b border-[#ba7900] w-full">
      <div className="flex gap-2 lg:gap-4 items-center justify-center p-3 lg:p-[16px]">
        <div className="flex items-center justify-center gap-4 lg:gap-8">
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

                {/* Chevron separator */}
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
