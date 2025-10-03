export class FreightService {

  static formatCep(cep: string): string {
    const cleaned = cep.replace(/\D/g, "");
    if (cleaned.length === 8) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }
    return cep;
  }

  static isValidCep(cep: string): boolean {
    const cleaned = cep.replace(/\D/g, "");
    return cleaned.length === 8;
  }

  static parseFreightTime(tempo: string): {
    hours: number;
    minutes: number;
    seconds: number;
  } {
    // Formato esperado: "00:32:05"
    const parts = tempo.split(":");
    if (parts.length === 3) {
      return {
        hours: parseInt(parts[0], 10),
        minutes: parseInt(parts[1], 10),
        seconds: parseInt(parts[2], 10),
      };
    }
    return { hours: 0, minutes: 0, seconds: 0 };
  }

  static formatDeliveryTime(tempo: string): string {
    const { hours, minutes } = this.parseFreightTime(tempo);
    const totalMinutes = hours * 60 + minutes;

    // Converter tempo de viagem em dias úteis estimados
    if (totalMinutes <= 60) {
      return "Entrega no mesmo dia";
    } else if (totalMinutes <= 480) {
      // 8 horas
      return "1-2 dias úteis";
    } else if (totalMinutes <= 960) {
      // 16 horas
      return "2-3 dias úteis";
    } else {
      return "3-5 dias úteis";
    }
  }
}
