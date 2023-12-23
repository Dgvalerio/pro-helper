'use client';
import React, { useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';

import { NextPage } from 'next';

import { zodResolver } from '@hookform/resolvers/zod';

import { useConfigurationStore } from '@/app/configuration/store';
import { Form } from '@/components/form';
import { Loading } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

import { Key } from 'lucide-react';
import { Octokit } from 'octokit';
import { z } from 'zod';

const configurationSchema = z.object({
  githubToken: z.string({ required_error: 'Você deve informar o token!' }),
});

type Configuration = z.infer<typeof configurationSchema>;

const ConfigurationPage: NextPage = () => {
  const [loading, setLoading] = useState(false);
  const form = useForm<Configuration>({
    resolver: zodResolver(configurationSchema),
  });
  const { token, setToken } = useConfigurationStore();

  const handleSubmit: SubmitHandler<Configuration> = async (data) => {
    try {
      setLoading(true);

      const octokit = new Octokit({ auth: data.githubToken });

      await octokit.rest.users.getAuthenticated();

      setToken(data.githubToken);

      toast({ title: 'Token atualizado com sucesso!' });
    } catch (e) {
      form.setError('githubToken', { message: 'Token inválido!' });
      toast({ title: 'Erro ao atualizar o token!', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    form.setValue('githubToken', token);
  }, [form, token]);

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-2xl">Configurações</h1>
      <Form.Root<Configuration>
        className="flex w-96 flex-col gap-4"
        submitHandler={handleSubmit}
        {...form}
      >
        <Form.Field<Configuration>
          icon={<Key />}
          label="Token do Github"
          name="githubToken"
          placeholder="Digite seu token"
        />
        <div className="mb-8 mt-4 flex flex-col justify-stretch gap-8">
          <Button type="submit">Salvar</Button>
        </div>
        {loading && <Loading />}
      </Form.Root>
    </div>
  );
};

export default ConfigurationPage;
