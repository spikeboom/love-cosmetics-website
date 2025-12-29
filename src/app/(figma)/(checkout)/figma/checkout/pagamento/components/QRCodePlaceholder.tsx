export function QRCodePlaceholder() {
  return (
    <div className="w-[200px] lg:w-[303px] h-[200px] lg:h-[303px] bg-white border border-gray-200 rounded-lg flex items-center justify-center">
      <svg
        width="180"
        height="180"
        viewBox="0 0 180 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="180" height="180" fill="white" />
        {/* QR Code pattern simplificado */}
        <rect x="10" y="10" width="50" height="50" fill="black" />
        <rect x="20" y="20" width="30" height="30" fill="white" />
        <rect x="25" y="25" width="20" height="20" fill="black" />

        <rect x="120" y="10" width="50" height="50" fill="black" />
        <rect x="130" y="20" width="30" height="30" fill="white" />
        <rect x="135" y="25" width="20" height="20" fill="black" />

        <rect x="10" y="120" width="50" height="50" fill="black" />
        <rect x="20" y="130" width="30" height="30" fill="white" />
        <rect x="25" y="135" width="20" height="20" fill="black" />

        {/* Pattern central */}
        <rect x="70" y="10" width="10" height="10" fill="black" />
        <rect x="90" y="10" width="10" height="10" fill="black" />
        <rect x="80" y="20" width="10" height="10" fill="black" />
        <rect x="70" y="40" width="10" height="10" fill="black" />
        <rect x="90" y="30" width="10" height="10" fill="black" />

        <rect x="70" y="70" width="40" height="40" fill="black" />
        <rect x="80" y="80" width="20" height="20" fill="white" />
        <rect x="85" y="85" width="10" height="10" fill="black" />

        <rect x="10" y="70" width="10" height="10" fill="black" />
        <rect x="30" y="80" width="10" height="10" fill="black" />
        <rect x="40" y="70" width="10" height="10" fill="black" />
        <rect x="20" y="90" width="10" height="10" fill="black" />

        <rect x="120" y="70" width="10" height="10" fill="black" />
        <rect x="140" y="80" width="10" height="10" fill="black" />
        <rect x="160" y="70" width="10" height="10" fill="black" />
        <rect x="130" y="90" width="10" height="10" fill="black" />

        <rect x="70" y="120" width="10" height="10" fill="black" />
        <rect x="90" y="130" width="10" height="10" fill="black" />
        <rect x="80" y="150" width="10" height="10" fill="black" />
        <rect x="100" y="140" width="10" height="10" fill="black" />

        <rect x="120" y="120" width="50" height="50" fill="black" />
        <rect x="130" y="130" width="30" height="30" fill="white" />
        <rect x="140" y="140" width="10" height="10" fill="black" />
      </svg>
    </div>
  );
}
