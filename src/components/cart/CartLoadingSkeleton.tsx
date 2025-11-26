'use client';

interface CartLoadingSkeletonProps {
  isMobile?: boolean;
}

export function CartLoadingSkeleton({ isMobile = false }: CartLoadingSkeletonProps) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-white">
      <div className="w-full flex flex-col items-center">
        <div className="max-w-[1440px] w-full px-4 md:px-6 py-6 md:py-12">
          {/* Header skeleton */}
          <div className="h-8 md:h-10 w-48 bg-gray-200 rounded animate-pulse mb-6 md:mb-8" />

          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Produtos skeleton */}
            <div className="flex-1 flex flex-col gap-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 rounded-lg bg-white shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15)]"
                >
                  {/* Imagem */}
                  <div className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse flex-shrink-0" />

                  {/* Info */}
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
                    <div className="flex items-center justify-between mt-auto">
                      <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse" />
                      <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}

              {/* Frete skeleton */}
              <div className="h-14 w-full md:max-w-[447px] bg-gray-200 rounded-lg animate-pulse mt-4" />

              {/* Cupom skeleton */}
              <div className="h-14 w-full md:max-w-[447px] bg-gray-200 rounded-lg animate-pulse" />
            </div>

            {/* Resumo skeleton - Desktop */}
            <div className="hidden md:block md:w-[30%] md:max-w-[447px]">
              <div className="p-4 rounded-lg bg-white shadow-[0px_1px_3px_1px_rgba(0,0,0,0.15)] flex flex-col gap-4">
                <div className="h-7 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="flex justify-between">
                  <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="flex justify-between">
                  <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 w-28 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-12 w-full bg-gray-300 rounded-lg animate-pulse mt-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resumo skeleton - Mobile (bottom sheet) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40">
        <div className="bg-white rounded-t-2xl px-6 py-4 shadow-[0px_0px_3px_0px_rgba(0,0,0,0.3)]">
          <div className="flex flex-col gap-3">
            <div className="flex justify-between">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex justify-between">
              <div className="h-5 w-16 bg-gray-200 rounded animate-pulse" />
              <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-11 w-full bg-gray-300 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
