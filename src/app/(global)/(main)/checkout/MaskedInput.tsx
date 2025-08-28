import React from "react";
import { IMaskInput, IMaskInputProps } from "react-imask";

interface TextMaskCustomProps
  // @ts-ignore
  extends Omit<IMaskInputProps, "mask" | "onAccept"> {
  /**
   * Pode ser uma string ou um objeto com múltiplas máscaras.
   */
  mask:
    | string
    | {
        mask: Array<string | object>;
        /**
         * Função que escolhe a máscara adequada com base no valor atual.
         */
        dispatch: (appended: string, dynamicMasked: any) => any;
      };
  /**
   * Função chamada quando o valor muda.
   * O valor passado já é o unmasked.
   */
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
  value?: string | number | null; // adiciona isso aqui também
}

const MaskedInput = React.forwardRef<HTMLElement, TextMaskCustomProps>(
  function MaskedInput(props, ref) {
    const { onChange, name, mask, value, ...other } = props;

    return (
      <IMaskInput
        {...other}
        value={String(value ?? "")} // ← aqui está o truque!
        mask={mask}
        unmask={true}
        inputRef={ref as React.Ref<any>}
        onAccept={(value, maskRef) =>
          onChange({ target: { name, value: maskRef.unmaskedValue } })
        }
      />
    );
  },
);

export default MaskedInput;
