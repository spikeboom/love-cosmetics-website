'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cadastroClienteSchema, type CadastroClienteInput, validators } from '@/lib/cliente/validation';
import { IMaskInput } from 'react-imask';

export default function CadastroPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
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