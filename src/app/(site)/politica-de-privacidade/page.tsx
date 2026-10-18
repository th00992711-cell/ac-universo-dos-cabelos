import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { getSiteSettings } from "@/lib/services/settings";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Política de privacidade",
  alternates: { canonical: "/politica-de-privacidade" },
};

/** Texto-base que descreve o que o site realmente faz. A proprietária pode substituí-lo pelo painel. */
function defaultPolicy(name: string, email: string | null) {
  return `Esta política explica como o site da ${name} trata informações pessoais, de acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).

1. Dados coletados
O catálogo pode ser navegado sem cadastro. O site não pede nome, telefone ou e-mail dos visitantes. Quando você clica em um botão de WhatsApp ou Instagram, a conversa acontece nessas plataformas, conforme as políticas delas.

2. Estatísticas de visualização
Para entender quais produtos despertam mais interesse, o site pode registrar a quantidade de visualizações de cada produto. Essa contagem não identifica quem visitou a página.

3. Cookies
O site público não usa cookies de publicidade. Cookies de sessão são usados somente na área administrativa, para manter o login da equipe.

4. Seus direitos
Você pode solicitar informações, correção ou exclusão de dados pessoais que tenha compartilhado conosco em nossos canais de atendimento${email ? `, inclusive pelo e-mail ${email}` : ""}.

5. Atualizações
Esta política pode ser atualizada. A versão vigente é sempre a publicada nesta página.`;
}

export default async function PrivacyPage() {
  const s = await getSiteSettings();
  return (
    <>
      <PageHero eyebrow="Transparência" title="Política de privacidade" />
      <div className="container-page py-14 sm:py-20">
        <div className="mx-auto max-w-3xl text-[0.98rem] leading-[1.85] whitespace-pre-line text-cocoa">
          {s.privacy_policy || defaultPolicy(s.business_name, s.email)}
        </div>
      </div>
    </>
  );
}
