'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cadastroClienteSchema, type CadastroClienteInput, validators } from '@/lib/cliente/validation';
import { IMaskInput } from 'react-imask';
import { useState as useStateReact } from 'react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

export default function CadastroPage() {
  const router = useRouter();
  const { checkAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);
  const [showAddressFields, setShowAddressFields] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CadastroClienteInput>({
    resolver: zodResolver(cadastroClienteSchema),
    defaultValues: {
      receberWhatsapp: false,
      receberEmail: true,
    }
  });

  const buscarEnderecoPorCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;

    setLoadingCep(true);
    try {
      const { data } = await axios.get(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );
      
      if (!data.erro) {
        setValue('endereco', data.logradouro || '');
        setValue('bairro', data.bairro || '');
        setValue('cidade', data.localidade || '');
        setValue('estado', data.uf || '');
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    } finally {
      setLoadingCep(false);
    }
  };

  const onSubmit = async (data: CadastroClienteInput) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/cliente/auth/cadastrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Cadastro bem-sucedido - já faz login automático
        // Aguardar a atualização do contexto de autenticação
        await checkAuth();
        router.push('/minha-conta');
        router.refresh();
      } else {
        // Erro no cadastro
        setErrorMessage(result.error || 'Erro ao criar conta');
      }
    } catch (error) {
      setErrorMessage('Erro de conexão. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Crie sua conta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <Link
            href="/conta/entrar"
            className="font-medium text-pink-600 hover:text-pink-500"
          >
            entre com uma conta existente
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Nome e Sobrenome */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                  Nome
                </label>
                <input
                  {...register('nome')}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                />
                {errors.nome && (
                  <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="sobrenome" className="block text-sm font-medium text-gray-700">
                  Sobrenome
                </label>
                <input
                  {...register('sobrenome')}
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                />
                {errors.sobrenome && (
                  <p className="mt-1 text-sm text-red-600">{errors.sobrenome.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* CPF (opcional) */}
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
                CPF <span className="text-gray-400">(opcional)</span>
              </label>
              <IMaskInput
                mask="000.000.000-00"
                placeholder="000.000.000-00"
                onAccept={(value) => setValue('cpf', value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              />
              {errors.cpf && (
                <p className="mt-1 text-sm text-red-600">{errors.cpf.message}</p>
              )}
            </div>

            {/* Telefone (opcional) */}
            <div>
              <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
                Telefone <span className="text-gray-400">(opcional)</span>
              </label>
              <IMaskInput
                mask="(00) 00000-0000"
                placeholder="(00) 00000-0000"
                onAccept={(value) => setValue('telefone', value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              />
              {errors.telefone && (
                <p className="mt-1 text-sm text-red-600">{errors.telefone.message}</p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <input
                {...register('password')}
                type="password"
                autoComplete="new-password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                placeholder="Mínimo 6 caracteres"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirmar Senha */}
            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-gray-700">
                Confirmar Senha
              </label>
              <input
                {...register('passwordConfirm')}
                type="password"
                autoComplete="new-password"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                placeholder="Digite a senha novamente"
              />
              {errors.passwordConfirm && (
                <p className="mt-1 text-sm text-red-600">{errors.passwordConfirm.message}</p>
              )}
            </div>

            {/* Data de Nascimento */}
            <div>
              <label htmlFor="data_nascimento" className="block text-sm font-medium text-gray-700">
                Data de Nascimento <span className="text-gray-400">(opcional)</span>
              </label>
              <IMaskInput
                mask="00/00/0000"
                placeholder="DD/MM/AAAA"
                onAccept={(value) => setValue('data_nascimento', value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              />
              {errors.data_nascimento && (
                <p className="mt-1 text-sm text-red-600">{errors.data_nascimento.message}</p>
              )}
            </div>

            {/* Seção de Endereço (Opcional) */}
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">Endereço de Entrega</h3>
                <button
                  type="button"
                  onClick={() => setShowAddressFields(!showAddressFields)}
                  className="text-sm text-pink-600 hover:text-pink-500"
                >
                  {showAddressFields ? 'Ocultar' : 'Adicionar endereço (opcional)'}
                </button>
              </div>

              {showAddressFields && (
                <div className="space-y-4">
                  {/* CEP */}
                  <div>
                    <label htmlFor="cep" className="block text-sm font-medium text-gray-700">
                      CEP
                    </label>
                    <div className="mt-1 flex">
                      <IMaskInput
                        mask="00000-000"
                        placeholder="00000-000"
                        onAccept={(value) => {
                          setValue('cep', value);
                          if (value.replace(/\D/g, '').length === 8) {
                            buscarEnderecoPorCep(value);
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const cepField = document.querySelector('input[placeholder="00000-000"]') as HTMLInputElement;
                          if (cepField?.value) {
                            buscarEnderecoPorCep(cepField.value);
                          }
                        }}
                        className="px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      >
                        {loadingCep ? (
                          <span className="text-gray-400">...</span>
                        ) : (
                          <span>Buscar</span>
                        )}
                      </button>
                    </div>
                    {errors.cep && (
                      <p className="mt-1 text-sm text-red-600">{errors.cep.message}</p>
                    )}
                  </div>

                  {/* Endereço e Número */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label htmlFor="endereco" className="block text-sm font-medium text-gray-700">
                        Endereço
                      </label>
                      <input
                        {...register('endereco')}
                        type="text"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                        placeholder="Rua, Avenida, etc."
                      />
                      {errors.endereco && (
                        <p className="mt-1 text-sm text-red-600">{errors.endereco.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="numero" className="block text-sm font-medium text-gray-700">
                        Número
                      </label>
                      <input
                        {...register('numero')}
                        type="text"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                        placeholder="123"
                      />
                      {errors.numero && (
                        <p className="mt-1 text-sm text-red-600">{errors.numero.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Complemento */}
                  <div>
                    <label htmlFor="complemento" className="block text-sm font-medium text-gray-700">
                      Complemento <span className="text-gray-400">(opcional)</span>
                    </label>
                    <input
                      {...register('complemento')}
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                      placeholder="Apto, Bloco, etc."
                    />
                    {errors.complemento && (
                      <p className="mt-1 text-sm text-red-600">{errors.complemento.message}</p>
                    )}
                  </div>

                  {/* Bairro */}
                  <div>
                    <label htmlFor="bairro" className="block text-sm font-medium text-gray-700">
                      Bairro
                    </label>
                    <input
                      {...register('bairro')}
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                      placeholder="Bairro"
                    />
                    {errors.bairro && (
                      <p className="mt-1 text-sm text-red-600">{errors.bairro.message}</p>
                    )}
                  </div>

                  {/* Cidade e Estado */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="cidade" className="block text-sm font-medium text-gray-700">
                        Cidade
                      </label>
                      <input
                        {...register('cidade')}
                        type="text"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                        placeholder="Cidade"
                      />
                      {errors.cidade && (
                        <p className="mt-1 text-sm text-red-600">{errors.cidade.message}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                        Estado
                      </label>
                      <input
                        {...register('estado')}
                        type="text"
                        maxLength={2}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                        placeholder="UF"
                      />
                      {errors.estado && (
                        <p className="mt-1 text-sm text-red-600">{errors.estado.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preferências de comunicação */}
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  {...register('receberEmail')}
                  type="checkbox"
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label htmlFor="receberEmail" className="ml-2 block text-sm text-gray-900">
                  Quero receber ofertas e novidades por email
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  {...register('receberWhatsapp')}
                  type="checkbox"
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label htmlFor="receberWhatsapp" className="ml-2 block text-sm text-gray-900">
                  Quero receber ofertas por WhatsApp
                </label>
              </div>
            </div>

            {/* Mensagem de erro */}
            {errorMessage && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{errorMessage}</p>
              </div>
            )}

            {/* Termos */}
            <div className="text-xs text-gray-600">
              Ao criar sua conta, você concorda com nossos{' '}
              <Link href="/termos" className="text-pink-600 hover:text-pink-500">
                Termos de Uso
              </Link>{' '}
              e{' '}
              <Link href="/privacidade" className="text-pink-600 hover:text-pink-500">
                Política de Privacidade
              </Link>
              .
            </div>

            {/* Botão de submit */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}