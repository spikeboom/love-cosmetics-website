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
}

const MaskedInput = React.forwardRef<HTMLElement, TextMaskCustomProps>(
  function MaskedInput(props, ref) {
    const { onChange, name, mask, ...other } = props;
    return (
      <IMaskInput
        {...other}
        mask={mask}
        // Define unmask como true para que o valor retornado seja sem máscara
        unmask={true}
        inputRef={ref as React.Ref<any>}
        // No onAccept, repassa o valor *unmasked* para o onChange
        onAccept={(value, maskRef) =>
          onChange({ target: { name, value: maskRef.unmaskedValue } })
        }
      />
    );
  },
);

export default MaskedInput;
