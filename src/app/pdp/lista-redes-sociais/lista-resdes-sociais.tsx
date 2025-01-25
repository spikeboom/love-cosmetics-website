import {
  FaFacebook,
  FaInstagram,
  FaPinterest,
  FaTiktok,
  FaXTwitter,
} from "react-icons/fa6";

export function ListaRedesSociais() {
  return (
    <div className="flex gap-4">
      <FaXTwitter size={24} color="#333" className="opacity-[0.7]" />
      <FaFacebook size={24} color="#333" className="opacity-[0.7]" />
      <FaPinterest size={24} color="#333" className="opacity-[0.7]" />
      <FaInstagram size={24} color="#333" className="opacity-[0.7]" />
      <FaTiktok size={24} color="#333" className="opacity-[0.7]" />
    </div>
  );
}
