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

      setToken(data.githubToken);

      toast({ title: 'Token atualizado com sucesso!' });
    } catch (e) {
      form.setError('githubToken', { message: JSON.stringify(e) });
      toast({ title: 'Erro ao atualizar o token!', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    form.setValue('githubToken', token);
  }, [form, token]);

  return (
    <div className="flex flex-col items-center justify-center gap-8 p-24">
      <h1 className="text-2xl">Configurações</h1>
      <Form.Root<Configuration>
        className="flex w-96 flex-col gap-4"
        submitHandler={handleSubmit}
        {...form}
      >
        <Form.Field<Configuration>
          name="githubToken"
          label="Token do Github"
          placeholder="Digite seu token"
          icon={<Key />}
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
