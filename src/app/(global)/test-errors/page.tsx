"use client";
export default function TestErrorsPage() {
  return (
    <div style={{ padding: 20 }}>
      <h3>Testes de erro</h3>
      <button
        onClick={() => {
          throw new Error("Erro clássico JS");
        }}
      >
        throw new Error
      </button>
      <br />
      <br />
      <button onClick={() => Promise.reject("Promise rejeitada simples")}>
        Promise.reject (string)
      </button>
      <br />
      <br />
      <button
        onClick={() => Promise.reject(new Error("Promise rejeitada com Error"))}
      >
        Promise.reject (Error)
      </button>
      <br />
      <br />
      <button
        onClick={() => {
          // Simula erro de fetch
          fetch("/rota-inexistente-123")
            .then((res) => res.json())
            .catch((e) => console.log("Erro manual sem rethrow", e));
        }}
      >
        Erro de fetch (não reportado automaticamente)
      </button>
      <br />
      <br />
      <button
        onClick={() => {
          // Simula exceção async não tratada
          (async () => {
            throw new Error("Erro em async function");
          })();
        }}
      >
        throw em função async
      </button>
    </div>
  );
}
